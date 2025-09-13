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
        return (
            <div className="alert alert-warning">
                <span>Connect your wallet to decrease the counter</span>
            </div>
        );
    }

    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
                <h2 className="card-title">Decrease Counter</h2>
                <button
                    className="btn btn-primary"
                    onClick={handleDecrease}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Processing...
                        </>
                    ) : (
                        "Decrease -1"
                    )}
                </button>
            </div>
        </div>
    );
};
