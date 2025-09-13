"use client";

import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";

export const CounterDisplay = () => {
    const { data: counterValue, isLoading, error, refetch } = useScaffoldReadContract({
        contractName: "CounterContract",
        functionName: "get_count",
    });

    if (error) {
        return (
            <div className="alert alert-error">
                <span>Error loading counter</span>
                <button className="btn btn-sm" onClick={() => refetch()}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
                <h2 className="card-title">Counter Value</h2>
                {isLoading ? (
                    <span className="loading loading-spinner loading-lg"></span>
                ) : (
                    <div className="stat">
                        <div className="stat-value text-secondary">
                            {counterValue?.toString() || "0"}
                        </div>
                        <div className="stat-desc">Current count</div>
                    </div>
                )}
            </div>
        </div>
    );
};
