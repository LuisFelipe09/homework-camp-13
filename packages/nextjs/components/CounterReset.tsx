"use client";

import { useState, useMemo } from "react";
import { useScaffoldMultiWriteContract } from "~~/hooks/scaffold-stark/useScaffoldMultiWriteContract";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { useDeployedContractInfo } from "~~/hooks/scaffold-stark/useDeployedContractInfo";
import { useAccount } from "@starknet-react/core";

export const CounterReset = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const { isConnected, address } = useAccount();

    // ✅ Get counter contract address dynamically
    const { data: counterContract } = useDeployedContractInfo("CounterContract");
    const COUNTER_CONTRACT_ADDRESS = counterContract?.address;
    const PAYMENT_AMOUNT = "1000000000000000000"; // 1 STRK with 18 decimals

    // ✅ Using predeployed STRK contract - Read user's balance
    const { data: balance } = useScaffoldReadContract({
        contractName: "Strk",
        functionName: "balanceOf",
        args: [address],
    });

    // ✅ Using predeployed STRK contract - Read allowance
    const { data: allowance } = useScaffoldReadContract({
        contractName: "Strk",
        functionName: "allowance",
        args: [address, COUNTER_CONTRACT_ADDRESS],
        enabled: !!COUNTER_CONTRACT_ADDRESS && !!address,
    });

    // Check if user has sufficient balance and allowance
    const hasBalance = useMemo(() => {
        if (!balance) return false;
        return BigInt(balance.toString()) >= BigInt(PAYMENT_AMOUNT);
    }, [balance]);

    const hasAllowance = useMemo(() => {
        if (!allowance) return false;
        return BigInt(allowance.toString()) >= BigInt(PAYMENT_AMOUNT);
    }, [allowance]);

    // Multi-write contract calls
    const calls = useMemo(() => {
        if (!COUNTER_CONTRACT_ADDRESS) return [];

        const callsArray = [];

        // If no allowance, add approve call using predeployed contract
        if (!hasAllowance) {
            callsArray.push({
                contractName: "Strk" as const,
                functionName: "approve" as const,
                args: [COUNTER_CONTRACT_ADDRESS, BigInt(PAYMENT_AMOUNT)],
            });
        }

        // Add reset counter call
        callsArray.push({
            contractName: "CounterContract" as const,
            functionName: "reset_counter" as const,
            args: [],
        });

        return callsArray;
    }, [hasAllowance, COUNTER_CONTRACT_ADDRESS, PAYMENT_AMOUNT]);

    const { sendAsync, status } = useScaffoldMultiWriteContract({
        calls,
    });

    const handleReset = async () => {
        if (!isConnected || !hasBalance || !COUNTER_CONTRACT_ADDRESS) return;

        setIsProcessing(true);
        try {
            await sendAsync();
        } catch (error) {
            console.error("Failed to reset counter:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const isLoading = isProcessing || status === "pending";

    if (!isConnected) {
        return <span className="text-warning text-sm font-medium">Connect wallet to reset</span>;
    }

    if (!COUNTER_CONTRACT_ADDRESS) {
        return <span className="text-info text-sm font-medium">Loading contract...</span>;
    }

    if (!hasBalance) {
        return <span className="text-error text-sm font-medium">Need 1 STRK to reset</span>;
    }

    return (
        <button
            className="btn btn-primary btn-sm"
            onClick={handleReset}
            disabled={isLoading || !hasBalance || !COUNTER_CONTRACT_ADDRESS}
        >
            {isLoading ? (
                <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Reset...
                </>
            ) : (
                "Reset (1 STRK)"
            )}
        </button>
    );
};