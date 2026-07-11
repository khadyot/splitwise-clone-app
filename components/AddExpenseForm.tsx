"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createExpense } from "@/app/actions";
import { SplitSquareHorizontal, Percent, Equal } from "lucide-react";

interface Member {
    id: string;
    name: string;
}

interface AddExpenseFormProps {
    groupId: string;
    members: Member[];
    currency: string;
}

export function AddExpenseForm({ groupId, members, currency }: AddExpenseFormProps) {
    const [amount, setAmount] = useState<number | "">("");
    const [splitType, setSplitType] = useState<"EQUAL" | "EXACT" | "PERCENTAGE">("EQUAL");
    const [splits, setSplits] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSplitChange = (memberId: string, value: string) => {
        setSplits((prev) => ({ ...prev, [memberId]: value }));
    };

    const handleSubmit = async (formData: FormData) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await createExpense(groupId, formData);
            setAmount("");
            setSplitType("EQUAL");
            setSplits({});
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form action={handleSubmit} className="grid gap-5">
            <input type="hidden" name="splitType" value={splitType} />
            <input type="hidden" name="splitsJson" value={JSON.stringify(splits)} />
            <input type="hidden" name="membersJson" value={JSON.stringify(members.map(m => m.id))} />

            <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
                    <Input name="description" placeholder="e.g. Dinner, Taxi..." required className="font-semibold text-gray-900" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Amount ({currency})</label>
                    <Input
                        name="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        required
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="font-bold text-gray-900"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Paid By</label>
                <select
                    name="paidBy"
                    className="flex h-11 w-full rounded-xl border border-gray-200/80 bg-white px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black shadow-sm transition-all"
                    required
                    defaultValue=""
                >
                    <option value="" disabled>Select Participant...</option>
                    {members.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Split Type</label>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant={splitType === "EQUAL" ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setSplitType("EQUAL")}
                        className="flex-1 rounded-xl h-10 gap-2"
                    >
                        <Equal className="w-4 h-4" />
                        Equally
                    </Button>
                    <Button
                        type="button"
                        variant={splitType === "EXACT" ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setSplitType("EXACT")}
                        className="flex-1 rounded-xl h-10 gap-2"
                    >
                        <SplitSquareHorizontal className="w-4 h-4" />
                        Exact
                    </Button>
                    <Button
                        type="button"
                        variant={splitType === "PERCENTAGE" ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setSplitType("PERCENTAGE")}
                        className="flex-1 rounded-xl h-10 gap-2"
                    >
                        <Percent className="w-4 h-4" />
                        Percentage
                    </Button>
                </div>

                {splitType === "EQUAL" && (
                    <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 text-center">
                        <p className="text-sm font-medium text-gray-500">Split equally between {members.length} participants.</p>
                    </div>
                )}

                {splitType === "EXACT" && (
                    <div className="space-y-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                        {members.map((m) => (
                            <div key={m.id} className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-gray-700 flex-1">{m.name}</span>
                                <Input
                                    name={`split_${m.id}`}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-28 text-right font-bold"
                                    value={splits[m.id] || ""}
                                    onChange={(e) => handleSplitChange(m.id, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {splitType === "PERCENTAGE" && (
                    <div className="space-y-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                        {members.map((m) => (
                            <div key={m.id} className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-gray-700 flex-1">{m.name}</span>
                                <div className="relative w-28">
                                    <Input
                                        name={`split_${m.id}`}
                                        type="number"
                                        step="1"
                                        placeholder="0"
                                        className="w-full text-right font-bold pr-8"
                                        value={splits[m.id] || ""}
                                        onChange={(e) => handleSplitChange(m.id, e.target.value)}
                                    />
                                    <span className="absolute right-3 top-2.5 text-sm font-bold text-gray-400">%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full h-12 mt-2 text-base shadow-sm">
                {isSubmitting ? "Adding..." : "Add Expense"}
            </Button>
        </form>
    );
}
