"use client";

import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { useAccount } from "@starknet-react/core";

export const CounterIncrement = () => {
    const { isConnected } = useAccount();
    const { sendAsync, status } = useScaffoldWriteContract({
        contractName: "CounterContract",
        functionName: "increase_counter",
        args: [],
    });

    const handleIncrement = async () => {
        if (!isConnected) return;
        try {
            await sendAsync();
        } catch (error) {
            console.error("Failed to increment:", error);
        }
    };

    const isLoading = status === "pending";

    if (!isConnected) {
        return <span className="text-warning text-sm font-medium">Connect wallet</span>;
    }

    return (
        <button
            className="btn btn-primary btn-sm"
            onClick={handleIncrement}
            disabled={isLoading}
        >
            {isLoading ? (
                <>
                    <span className="loading loading-spinner loading-xs"></span>
                    +1...
                </>
            ) : (
                "+1"
            )}
        </button>
    );
};