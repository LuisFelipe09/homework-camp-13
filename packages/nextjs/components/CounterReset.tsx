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
        return (
            <div className="alert alert-warning">
                <span>Connect your wallet to reset the counter</span>
            </div>
        );
    }

    if (!COUNTER_CONTRACT_ADDRESS) {
        return (
            <div className="alert alert-info">
                <span>Loading counter contract information...</span>
            </div>
        );
    }

    if (!hasBalance) {
        return (
            <div className="alert alert-error">
                <div className="flex flex-col">
                    <span>Insufficient STRK balance</span>
                    <div className="text-xs mt-1">
                        Reset requires 1 STRK token. Balance: {balance?.toString() || "0"}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
                <h2 className="card-title text-warning">Reset Counter</h2>
                <div className="text-sm text-base-content/70 mb-4">
                    <div>Cost: 1 STRK token</div>
                    <div>Balance: {balance?.toString() || "0"} STRK</div>
                    {!hasAllowance && (
                        <div className="text-info text-xs">
                            Will approve + reset in one transaction
                        </div>
                    )}
                </div>
                <button
                    className="btn btn-warning"
                    onClick={handleReset}
                    disabled={isLoading || !hasBalance || !COUNTER_CONTRACT_ADDRESS}
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            {!hasAllowance ? "Approving & Resetting..." : "Resetting..."}
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reset to 0 (1 STRK)
                        </>
                    )}
                </button>
                {status === "success" && (
                    <div className="badge badge-success">Counter reset successfully!</div>
                )}
            </div>
        </div>
    );
};