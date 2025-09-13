"use client";

import { useState, useMemo } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { useAccount } from "@starknet-react/core";

export const CounterSet = () => {
    const [newValue, setNewValue] = useState("");
    const { isConnected, address } = useAccount();

    // Read the owner from the contract
    const { data: contractOwner, isLoading: isLoadingOwner } = useScaffoldReadContract({
        contractName: "CounterContract",
        functionName: "owner"
    });

    const { sendAsync, status } = useScaffoldWriteContract({
        contractName: "CounterContract",
        functionName: "set_counter",
        args: [newValue ? parseInt(newValue) : 0],
    });

    // Memoized owner validation to handle data loading delays
    const isOwner = useMemo(() => {
        if (!address || !contractOwner || isLoadingOwner) return false;

        try {
            // Convert both addresses to BigInt for direct comparison
            const userAddressBigInt = BigInt(address);
            const ownerAddressBigInt = BigInt(contractOwner.toString());

            console.log('BigInt comparison:', {
                userAddress: address,
                userBigInt: userAddressBigInt.toString(),
                ownerBigInt: ownerAddressBigInt.toString(),
                areEqual: userAddressBigInt === ownerAddressBigInt
            }); // Debug log

            return userAddressBigInt === ownerAddressBigInt;
        } catch (error) {
            console.error('Error comparing addresses:', error);
            return false;
        }
    }, [address, contractOwner, isLoadingOwner]);

    const handleSet = async () => {
        if (!isConnected || !newValue) return;
        try {
            await sendAsync();
            setNewValue(""); // Clear input after successful transaction
        } catch (error) {
            console.error("Failed to set counter:", error);
        }
    };

    const isLoading = status === "pending";

    if (!isConnected) {
        return (
            <div className="alert alert-warning">
                <span>Connect your wallet to set the counter</span>
            </div>
        );
    }

    if (isLoadingOwner) {
        return (
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body items-center text-center">
                    <span className="loading loading-spinner loading-lg"></span>
                    <span>Checking owner permissions...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
                <h2 className="card-title">Set Counter</h2>
                <div className="form-control w-full max-w-xs">
                    <input
                        type="number"
                        placeholder="Enter new value"
                        className="input input-bordered w-full"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        min="0"
                    />
                </div>
                <button
                    className="btn btn-accent"
                    onClick={handleSet}
                    disabled={isLoading || !newValue || !isOwner}
                    title={!isOwner ? "Only contract owner can set counter" : ""}
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Processing...
                        </>
                    ) : (
                        "Set Value"
                    )}
                </button>
                {!isOwner && (
                    <div className="text-xs text-warning mt-2">
                        Only owner can use this function
                    </div>
                )}
            </div>
        </div>
    );
};
