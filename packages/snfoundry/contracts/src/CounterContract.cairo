#[starknet::interface]
pub trait ICounter<T> {
    fn get_count(self: @T) -> u32;
    fn increase_counter(ref self: T);
    fn decrease_counter(ref self: T);
    fn set_counter(ref self: T, new_value: u32);
    fn reset_counter(ref self: T);
}

#[starknet::contract]
pub mod CounterContract {
    use super::ICounter;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use starknet::{ContractAddress , get_caller_address, get_contract_address};
    use openzeppelin_access::ownable::OwnableComponent;
    use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

     #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl InternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        CounterChanged: CounterChange,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
    }

    #[derive(Drop, starknet::Event)]
    pub struct CounterChange {
        #[key]
        pub caller: ContractAddress,
        pub old_value: u32,
        pub new_value: u32,
        pub reason: ChangeReason,
    }

    #[derive(Drop, Copy, Serde)]
    pub enum ChangeReason {
        Increase,
        Decrease,
        Reset,
        Set,
    }

    #[storage]
    struct Storage {
        counter: u32,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

    #[constructor]
    fn constructor(ref self: ContractState, init_value: u32, owner: ContractAddress) {
        self.counter.write(init_value);
        self.ownable.initializer(owner);
    }


    #[abi(embed_v0)]
    impl ImplCounter of ICounter<ContractState> {
        fn get_count(self: @ContractState) -> u32 {
            self.counter.read()
        }

        fn increase_counter(ref self: ContractState) {
            let current_value = self.counter.read();
            let new_value = current_value + 1;
            self.counter.write(new_value);

            let event = Event::CounterChanged(CounterChange {
                caller: get_caller_address(),
                old_value: current_value,
                new_value: new_value,
                reason: ChangeReason::Increase,
            });

            self.emit(event);
        }

        fn decrease_counter(ref self: ContractState) {
            let current_value = self.counter.read();
            assert!(current_value > 0, "The counter can't be negative");
            let new_value = current_value - 1;
            self.counter.write(new_value);

            let event = Event::CounterChanged(CounterChange {
                caller: get_caller_address(),
                old_value: current_value,
                new_value: new_value,
                reason: ChangeReason::Decrease,
            });
            self.emit(event);
        }

        fn set_counter(ref self: ContractState, new_value: u32) {
            self.ownable.assert_only_owner();

            let current_value = self.counter.read();
            self.counter.write(new_value);

            let event = Event::CounterChanged(CounterChange {
                caller: get_caller_address(),
                old_value: current_value,
                new_value: new_value,
                reason: ChangeReason::Set,
            });
            self.emit(event);
        }

        fn reset_counter(ref self: ContractState) {
            let payment_amount : u256 = 1000000000000000000; // 1 token with 18 decimals
            let starknet_token_address : ContractAddress = 0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d.try_into().unwrap(); // Replace with actual token address
            let caller_address = get_caller_address();

            let token_dispatcher = IERC20Dispatcher {
                contract_address: starknet_token_address,
            };

            let balance = token_dispatcher.balance_of(caller_address);
            assert!(balance >= payment_amount, "Insufficient token balance to set counter");

            let contract_address = get_contract_address();
            let allowance = token_dispatcher.allowance(caller_address, contract_address);
            assert!(allowance >= payment_amount, "Insufficient allowance to set counter");

            let owner = self.ownable.owner();
            let success = token_dispatcher.transfer_from(caller_address, owner, payment_amount);
            assert!(success, "STRK transfer failed");

            let current_value = self.counter.read();
            self.counter.write(0);

            let event = Event::CounterChanged(CounterChange {
                caller: get_caller_address(),
                old_value: current_value,
                new_value: 0,
                reason: ChangeReason::Reset,
            });
            self.emit(event);
        }
    }
}