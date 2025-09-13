"use client";

import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { useAccount } from "@starknet-react/core";

export const CounterDecrease = () => {
    const { isConnected } = useAccount();
    const { sendAsync, status } = useScaffoldWriteContract({
        contractName: "CounterContract",
        functionName: "decrease_counter",
        args: [],
    });

    const handleDecrease = async () => {
        if (!isConnected) return;
        try {
            await sendAsync();
        } catch (error) {
            console.error("Failed to decrease:", error);
        }
    };

    const isLoading = status === "pending";

    if (!isConnected) {
        return <span className="text-warning text-sm font-medium">Connect wallet</span>;
    }

    return (
        <button
            className="btn btn-primary btn-sm"
            onClick={handleDecrease}
            disabled={isLoading}
        >
            {isLoading ? (
                <>
                    <span className="loading loading-spinner loading-xs"></span>
                    -1...
                </>
            ) : (
                "-1"
            )}
        </button>
    );
};
