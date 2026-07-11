"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { settleUp } from "@/app/actions";
import { Debt } from "@/lib/logic";
import { formatCurrency } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface User {
    id: string;
    name: string;
}

interface SettleUpUIProps {
    groupId: string;
    debts: Debt[];
    users: User[];
    currency: string;
    isOpenByDefault?: boolean;
}

export function SettleUpUI({ groupId, debts, users, currency, isOpenByDefault = false }: SettleUpUIProps) {
    const [isOpen, setIsOpen] = useState(isOpenByDefault);
    const [activeDebt, setActiveDebt] = useState<Debt | null>(null);
    const [amount, setAmount] = useState<string>("");
    const [method, setMethod] = useState<"cash" | "transfer" | "other">("cash");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && window.location.hash === "#settle-up") {
            setIsOpen(true);
        }
    }, []);

    const handleOpenDebt = (debt: Debt) => {
        setActiveDebt(debt);
        setAmount(debt.amount.toString());
        setMethod("cash");
        setIsOpen(true);
    };

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeDebt || !amount || Number(amount) <= 0 || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await settleUp(groupId, {
                fromParticipant: activeDebt.from,
                toParticipant: activeDebt.to,
                amount: Number(amount),
                method,
            });
            setActiveDebt(null);
            setAmount("");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getUserName = (userId: string) =>
        users.find((u) => u.id === userId)?.name || "Unknown";

    if (!isOpen) {
        return (
            <div id="settle-up" className="mt-6 pt-6 border-t border-gray-200/80">
                <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-200/80">
                    <div>
                        <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Settle Up Debts</h2>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Record payments to clear group balances.</p>
                    </div>
                    <Button onClick={() => setIsOpen(true)} variant="outline" className="rounded-full shadow-sm bg-white">
                        View & Settle
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div id="settle-up" className="mt-6 pt-6 border-t border-gray-200/80">
            <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Settle Up Debts</h2>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Select a debt to pre-fill and record a payment.</p>
                    </div>
                    <Button onClick={() => { setIsOpen(false); setActiveDebt(null); }} variant="secondary" size="icon" className="rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {debts.length === 0 ? (
                    <div className="text-center py-8 bg-pastel-green/30 rounded-2xl border border-dashed border-pastel-greenText/30 text-emerald-700 text-sm font-semibold flex flex-col items-center gap-2 shadow-inner">
                        <div className="w-10 h-10 bg-pastel-green rounded-full flex items-center justify-center text-pastel-greenText shadow-sm">
                            <Check className="w-5 h-5" />
                        </div>
                        All balances are currently settled!
                    </div>
                ) : (
                    <div className="space-y-3">
                        {debts.map((debt, index) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-2xl border border-gray-200/80 hover:shadow-md transition-all gap-4">
                                <div className="flex items-center space-x-2">
                                    <span className="font-extrabold text-gray-900">{getUserName(debt.from)}</span>
                                    <span className="text-gray-400 text-sm font-semibold px-1">owes</span>
                                    <span className="font-extrabold text-gray-900">{getUserName(debt.to)}</span>
                                    <span className="font-black text-brand-red ml-2 text-lg tracking-tight">{formatCurrency(debt.amount, currency)}</span>
                                </div>
                                <Button
                                    onClick={() => handleOpenDebt(debt)}
                                    size="sm"
                                    variant={activeDebt?.from === debt.from && activeDebt?.to === debt.to ? "primary" : "outline"}
                                    className="sm:w-auto w-full text-xs rounded-xl"
                                >
                                    Settle
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {activeDebt && (
                    <form onSubmit={handleConfirm} className="mt-6 p-6 bg-gray-50/80 border border-gray-200/80 rounded-2xl shadow-inner space-y-4">
                        <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wide">Record Payment</h3>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Payer</label>
                                <Input value={getUserName(activeDebt.from)} disabled className="bg-gray-100 text-sm font-bold text-gray-500 h-11 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Recipient</label>
                                <Input value={getUserName(activeDebt.to)} disabled className="bg-gray-100 text-sm font-bold text-gray-500 h-11 rounded-xl" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Amount ({currency})</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="text-base h-11 font-extrabold bg-white rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 gap-4">
                            <div className="flex gap-2 w-full sm:w-auto bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                                {(["cash", "transfer", "other"] as const).map((m) => (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setMethod(m)}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all flex-1 sm:flex-none ${
                                            method === m ? "bg-black text-white shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                                        }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button type="button" variant="secondary" className="flex-1 sm:flex-none rounded-xl" onClick={() => setActiveDebt(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none rounded-xl shadow-md">
                                    {isSubmitting ? "Saving..." : "Confirm"}
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
