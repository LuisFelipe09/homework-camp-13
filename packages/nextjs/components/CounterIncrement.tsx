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
        return (
            <div className="alert alert-warning">
                <span>Connect your wallet to increment the counter</span>
            </div>
        );
    }

    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
                <h2 className="card-title">Increment Counter</h2>
                <button
                    className="btn btn-primary"
                    onClick={handleIncrement}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Processing...
                        </>
                    ) : (
                        "Increment +1"
                    )}
                </button>
            </div>
        </div>
    );
};