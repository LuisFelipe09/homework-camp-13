"use client";

import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";

export const CounterDisplay = () => {
    const { data: counterValue, isLoading, error } = useScaffoldReadContract({
        contractName: "CounterContract",
        functionName: "get_count",
    });

    if (error) {
        return <span className="text-error font-medium">Error loading counter</span>;
    }

    if (isLoading) {
        return <span className="loading loading-spinner loading-md"></span>;
    }

    return (
        <span className="text-4xl font-bold text-primary-content bg-primary px-4 py-2 rounded-lg shadow-lg">
            {counterValue?.toString() || "0"}
        </span>
    );
};
