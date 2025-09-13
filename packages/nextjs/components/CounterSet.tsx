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
        return <span className="text-warning text-sm font-medium">Connect wallet</span>;
    }

    if (isLoadingOwner) {
        return <span className="text-info text-sm font-medium">Checking permissions...</span>;
    }

    if (!isOwner) {
        return <span className="text-warning text-sm font-medium">Owner only</span>;
    }

    return (
        <div className="flex gap-2 items-center">
            <input
                type="number"
                placeholder="New value"
                className="input input-bordered input-sm w-20 bg-base-200 text-base-content"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                min="0"
            />
            <button
                className="btn btn-primary btn-sm"
                onClick={handleSet}
                disabled={isLoading || !newValue}
            >
                {isLoading ? (
                    <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Set...
                    </>
                ) : (
                    "Set"
                )}
            </button>
        </div>
    );
};
