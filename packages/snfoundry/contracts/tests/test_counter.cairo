use snforge_std::EventSpyAssertionsTrait;
use starknet::ContractAddress;
use snforge_std::DeclareResultTrait;
use snforge_std::{declare, ContractClassTrait, spy_events, start_cheat_caller_address,
    stop_cheat_caller_address, set_balance, Token};
use contracts::CounterContract::ICounterDispatcherTrait;
use contracts::CounterContract::ICounterDispatcher;
use contracts::CounterContract::CounterContract::{CounterChange, ChangeReason, Event};
use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

fn owner() -> ContractAddress {
    0x1234.try_into().unwrap()
}

fn user() -> ContractAddress {
    0x5678.try_into().unwrap()
}

fn deploy_counter(initial_value: u32) -> ICounterDispatcher {
    let owner = owner();
    let contract = declare("CounterContract").unwrap().contract_class();

    let mut constructor_args = array![];
    initial_value.serialize(ref constructor_args);
    owner.serialize(ref constructor_args);

    let (contract_address, _) = contract.deploy(@constructor_args).unwrap();
    ICounterDispatcher { contract_address }
}

#[test]
fn test_contract_initialization() {
    let init_value: u32 = 10;

    let dispatcher = deploy_counter(init_value);

    let current_counter = dispatcher.get_count();
    let expected_counter: u32 = 10;
    assert!(current_counter == expected_counter, "Should have the right initial counter value");
}

#[test]
fn test_increase_counter() {
    let init_value: u32 = 0;
    let mut spy = spy_events();

    let dispatcher = deploy_counter(init_value);

    start_cheat_caller_address(dispatcher.contract_address, user());
    dispatcher.increase_counter();
    stop_cheat_caller_address(dispatcher.contract_address);
    let current_counter = dispatcher.get_count();
    let expected_counter: u32 = 1;
    assert!(current_counter == expected_counter, "Counter should be increased by 1");

    let expected_event = CounterChange {
        caller: user(),
        old_value: 0,
        new_value: 1,
        reason: ChangeReason::Increase,
    };
    spy.assert_emitted(@array![(
        dispatcher.contract_address,
        Event::CounterChanged(expected_event)
    )]);

}

#[test]
fn test_decrease_counter() {
    let init_value: u32 = 5;
    let dispatcher = deploy_counter(init_value);
    let mut spy = spy_events();

    start_cheat_caller_address(dispatcher.contract_address, user());
    dispatcher.decrease_counter();
    stop_cheat_caller_address(dispatcher.contract_address);
    let current_counter = dispatcher.get_count();
    let expected_counter: u32 = 4;
    assert!(current_counter == expected_counter, "Counter should be decreased by 1");

    let expected_event = CounterChange {
        caller: user(),
        old_value: 5,
        new_value: 4,
        reason: ChangeReason::Decrease,
    };
    spy.assert_emitted(@array![(
        dispatcher.contract_address,
        Event::CounterChanged(expected_event)
    )]);
}

#[test]
#[should_panic(expected: "The counter can't be negative")]
fn test_decrease_counter_below_zero() {
    let init_value: u32 = 0;

    let dispatcher = deploy_counter(init_value);
    dispatcher.decrease_counter();
}

#[test]
fn test_set_counter_by_owner() {
    let init_value: u32 = 3;
    let mut spy = spy_events();

    let dispatcher = deploy_counter(init_value);
    start_cheat_caller_address(dispatcher.contract_address, owner());
    dispatcher.set_counter(5);
    stop_cheat_caller_address(dispatcher.contract_address);

    let current_counter = dispatcher.get_count();
    let expected_counter: u32 = 5;
    assert!(current_counter == expected_counter, "Counter should be set to 5");

    let expected_event = CounterChange {
        caller: owner(),
        old_value: 3,
        new_value: 5,
        reason: ChangeReason::Set,
    };
    spy.assert_emitted(@array![(
        dispatcher.contract_address,
        Event::CounterChanged(expected_event)
    )]);
}

#[test]
#[should_panic]
fn test_set_counter_by_non_owner() {
    let init_value: u32 = 3;
    let dispatcher = deploy_counter(init_value);
    start_cheat_caller_address(dispatcher.contract_address, user());
    dispatcher.set_counter(5);
    stop_cheat_caller_address(dispatcher.contract_address);
}

#[test]
#[should_panic(expected: "Insufficient token balance to set counter")]
fn test_reset_counter_insufficient_balance() {
    let init_value: u32 = 10;
    let dispatcher = deploy_counter(init_value);
    start_cheat_caller_address(dispatcher.contract_address, user());
    dispatcher.reset_counter();
}

#[test]
#[should_panic(expected: "Insufficient allowance to set counter")]
fn test_reset_counter_insufficient_balance_owner() {
    let init_value: u32 = 10;

    let dispatcher = deploy_counter(init_value);
    let user = user();
    set_balance(user, 50000000000000000000, Token::STRK); // 50 token with 18 decimals
    start_cheat_caller_address(dispatcher.contract_address, user);
    dispatcher.reset_counter();
}

#[test]
fn test_reset_counter_success() {   
    let init_value: u32 = 10;
    let mut spy = spy_events();

    let dispatcher_counter = deploy_counter(init_value);
    let user = user();
    set_balance(user, 50000000000000000000, Token::STRK); // 50 token with 18 decimals

    // Approve the contract to spend 1 STRK on behalf of the user
    let starknet_token_address: ContractAddress = 0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d.try_into().unwrap();
    let token_dispatcher = IERC20Dispatcher {
        contract_address: starknet_token_address,
    };

    start_cheat_caller_address(token_dispatcher.contract_address, user);
    let approve_success = token_dispatcher.approve(dispatcher_counter.contract_address, 1000000000000000000); // Approve 1 STRK
    stop_cheat_caller_address(token_dispatcher.contract_address);
    assert!(approve_success, "Approval failed");

    start_cheat_caller_address(dispatcher_counter.contract_address, user);
    dispatcher_counter.reset_counter();
    stop_cheat_caller_address(dispatcher_counter.contract_address);

    let current_counter = dispatcher_counter.get_count();
    let expected_counter: u32 = 0;
    assert!(current_counter == expected_counter, "Counter should be reset to 0");

    let expected_event = CounterChange {
        caller: user,
        old_value: 10,
        new_value: 0,
        reason: ChangeReason::Reset,
    };
    spy.assert_emitted(@array![(
        dispatcher_counter.contract_address,
        Event::CounterChanged(expected_event)
    )]);

    assert!(token_dispatcher.balance_of(user) == 49000000000000000000, "Token balance should match the STRK balance");
    assert!(token_dispatcher.balance_of(owner()) == 1000000000000000000, "Owner should receive the STRK payment");
}