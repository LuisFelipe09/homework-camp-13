"use client";

import React from "react";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-stark/useScaffoldEventHistory"; // import directo
import { Address } from "~~/components/scaffold-stark";

// Tipos derivados del contrato Cairo (CounterChanged + ChangeReason)
type ChangeReason = "Increase" | "Decrease" | "Reset" | "Set" | string; // fallback string por seguridad
interface RawEventArgs {
    caller?: string;
    old_value?: number | string;
    new_value?: number | string;
    reason?: any; // enum serializado -> puede venir como string u objeto { variant: string }
}

interface HistoryItem {
    args?: RawEventArgs;
    parsedArgs?: RawEventArgs;
    log?: { block_number?: number; transaction_hash?: string };
    block?: { timestamp?: number };
}

// Componente muy simple: lista de últimos eventos CounterChanged
export const EventReader = () => {
    // 1) Siempre llamar hooks en el mismo orden (evitamos early returns antes de useState)
    const { data, isLoading, error } = useScaffoldEventHistory({
        contractName: "CounterContract",
        eventName: "CounterChanged",
        fromBlock: 1n,
        watch: true,
        blockData: true,
        transactionData: false,
        receiptData: false,
    });
    // 2) Declarar useState inmediatamente después del custom hook
    const [showAll, setShowAll] = React.useState(false);

    // Normaliza reason (enum cairo) -> string siempre.
    // Casos considerados:
    // 1. "Increase" directamente (string)
    // 2. { variant: "Increase" }
    // 3. { Increase: null } ó { Increase: {} }
    // 4. Objeto con todas las variantes { Increase: {}, Decrease: {}, ... } -> imposible saber la activa, devolvemos "Unknown"
    const reasonToString = (r: any): ChangeReason => {
        if (!r) return "?";
        if (typeof r === "string") return r as ChangeReason;
        if (typeof r === "object") {
            if (r.variant && typeof r.variant === "string") return r.variant as ChangeReason;
            const keys = Object.keys(r);
            if (keys.length === 1) return keys[0] as ChangeReason; // {Increase: {...}}
            if (keys.length > 1) return "Unknown"; // objeto con todas las variantes embebidas
        }
        return String(r) as ChangeReason;
    };

    // 3) Derivar datos DESPUÉS de todos los hooks
    const events: HistoryItem[] = (data || []) as HistoryItem[];
    const sorted = [...events].sort((a, b) => (b.log?.block_number || 0) - (a.log?.block_number || 0));
    const BASE_LIMIT = 20;
    const visible = showAll ? sorted : sorted.slice(0, BASE_LIMIT);

    // 4) Ahora sí early returns (no afectan orden de hooks)
    if (isLoading) {
        return (
            <div className="flex items-center gap-2 p-4">
                <span className="loading loading-spinner loading-sm" />
                <span className="text-sm">Cargando eventos...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error text-sm">
                <span>Error leyendo eventos: {String(error)}</span>
            </div>
        );
    }

    if (!visible.length) {
        return (
            <div className="p-4 text-sm text-base-content/60 border border-base-300 rounded-lg">
                No hay eventos todavía. Interactúa con el contador.
            </div>
        );
    }

    return (
        <div className="p-4 border border-base-300 rounded-lg bg-base-200 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold">Historial CounterChanged</h3>
                <div className="flex items-center gap-2">
                    <span className="badge badge-neutral badge-sm">{visible.length}</span>
                    {sorted.length > BASE_LIMIT && (
                        <button
                            onClick={() => setShowAll((p) => !p)}
                            className="btn btn-ghost btn-xs"
                        >
                            {showAll ? "Ver menos" : `Ver todos (${sorted.length})`}
                        </button>
                    )}
                </div>
            </div>
            <ul className="flex flex-col gap-2 max-h-96 overflow-auto pr-1">
                {visible.map((ev, i) => {
                    const args = ev.parsedArgs || ev.args || {};
                    const oldValNum = Number(args.old_value ?? NaN);
                    const newValNum = Number(args.new_value ?? NaN);
                    const delta =
                        !isNaN(oldValNum) && !isNaN(newValNum)
                            ? newValNum - oldValNum
                            : undefined;
                    const deltaSign = delta === undefined ? "" : delta > 0 ? "+" : "";
                    const caller = (args.caller || "0x0") as `0x${string}`;
                    const reason = reasonToString(args.reason);
                    const safeReason = typeof reason === "string" ? reason : String(reason);
                    const ts = ev.block?.timestamp
                        ? new Date(Number(ev.block.timestamp) * 1000).toLocaleTimeString()
                        : undefined;
                    const deltaColor =
                        delta === undefined
                            ? ""
                            : delta > 0
                                ? "text-success"
                                : delta < 0
                                    ? "text-warning"
                                    : "text-info";
                    return (
                        <li
                            key={`${ev.log?.transaction_hash || i}-${i}`}
                            className="text-xs flex flex-col gap-1 bg-base-100/60 rounded-md p-2 border border-base-300"
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono opacity-70">#{ev.log?.block_number ?? "-"}</span>
                                {ts && <span className="opacity-50 font-mono">{ts}</span>}
                                <span className={`font-mono ${deltaColor}`}>
                                    {args.old_value ?? "?"} → {args.new_value ?? "?"}
                                    {delta !== undefined && (
                                        <span className="ml-1 opacity-70">({deltaSign}{delta})</span>
                                    )}
                                </span>
                                <span className="badge badge-outline badge-xs">{safeReason}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Address address={caller} size="xs" />
                                {ev.log?.transaction_hash && (
                                    <a
                                        href={`/blockexplorer/tx/${ev.log.transaction_hash}`}
                                        className="link link-primary truncate max-w-[160px] font-mono"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {ev.log.transaction_hash.slice(0, 10)}…
                                    </a>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
            <p className="text-[10px] opacity-60 mt-1">
                Watch activo. {showAll ? "Lista completa" : `Mostrando ${visible.length}/${sorted.length}`}
            </p>
        </div>
    );
};