"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Utensils, Plane, Hotel, Gamepad2, ShoppingBag, Receipt, Pencil, Trash2 } from "lucide-react";
import { AddExpenseForm } from "@/components/AddExpenseForm";
import { deleteExpense } from "@/app/actions";
import { Button } from "@/components/ui/Button";

function getCategoryInfo(description: string): { icon: React.ReactNode; bg: string; text: string } {
    const desc = description.toLowerCase();
    if (desc.includes('food') || desc.includes('lunch') || desc.includes('dinner') || desc.includes('breakfast') || desc.includes('restaurant') || desc.includes('groceries') || desc.includes('coffee') || desc.includes('beer') || desc.includes('drink')) {
        return { icon: <Utensils className="h-5 w-5" />, bg: "bg-pastel-orange", text: "text-pastel-orangeText" };
    }
    if (desc.includes('flight') || desc.includes('plane') || desc.includes('taxi') || desc.includes('cab') || desc.includes('uber') || desc.includes('train') || desc.includes('bus') || desc.includes('travel') || desc.includes('gas')) {
        return { icon: <Plane className="h-5 w-5" />, bg: "bg-pastel-blue", text: "text-pastel-blueText" };
    }
    if (desc.includes('hotel') || desc.includes('airbnb') || desc.includes('stay') || desc.includes('resort') || desc.includes('room')) {
        return { icon: <Hotel className="h-5 w-5" />, bg: "bg-pastel-purple", text: "text-pastel-purpleText" };
    }
    if (desc.includes('game') || desc.includes('movie') || desc.includes('show') || desc.includes('concert') || desc.includes('fun') || desc.includes('ticket')) {
        return { icon: <Gamepad2 className="h-5 w-5" />, bg: "bg-pastel-pink", text: "text-pastel-pinkText" };
    }
    if (desc.includes('shop') || desc.includes('store') || desc.includes('buy') || desc.includes('gift') || desc.includes('market')) {
        return { icon: <ShoppingBag className="h-5 w-5" />, bg: "bg-pastel-green", text: "text-pastel-greenText" };
    }
    return { icon: <Receipt className="h-5 w-5" />, bg: "bg-pastel-purple", text: "text-pastel-purpleText" };
}

interface ExpenseItemProps {
    expense: {
        id: string;
        description: string;
        amount: number;
        paidBy: string;
        date: string;
        type?: 'EQUAL' | 'EXACT' | 'PERCENTAGE';
        splits?: { userId: string; amount: number }[];
    };
    groupId: string;
    currency: string;
    payerName: string;
    members: { id: string; name: string }[];
}

export function ExpenseItem({ expense, groupId, currency, payerName, members }: ExpenseItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const cat = getCategoryInfo(expense.description);
    const perPersonShare = expense.amount / (members.length || 1);

    const handleDelete = async () => {
        setIsDeleting(true);
        await deleteExpense(groupId, expense.id);
        setIsDeleting(false);
    };

    if (isEditing) {
        return (
            <div className="p-5 bg-white rounded-2xl border border-gray-200/80 shadow-sm transition-all mb-3 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Edit Expense</h3>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="h-8 px-3 text-xs">
                        Cancel
                    </Button>
                </div>
                <AddExpenseForm 
                    groupId={groupId} 
                    members={members} 
                    currency={currency} 
                    expense={expense}
                    onSuccess={() => setIsEditing(false)}
                />
            </div>
        );
    }

    return (
        <div className="group flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200/80 hover:shadow-md transition-all gap-4 relative overflow-hidden">
            <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                <div className={`h-11 w-11 rounded-2xl flex flex-shrink-0 items-center justify-center ${cat.bg} ${cat.text} shadow-xs`}>
                    {cat.icon}
                </div>
                <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{expense.description}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                        {`${payerName} paid `}
                        <span className="font-semibold text-gray-700">{formatCurrency(expense.amount, currency)}</span>
                        {` • ${new Date(expense.date).toLocaleDateString()}`}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                {/* Actions (visible on hover) */}
                <div className="hidden group-hover:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isConfirmingDelete ? (
                        <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-100">
                            <span className="text-[10px] font-bold text-red-600 px-1 uppercase tracking-wide">Sure?</span>
                            <button 
                                onClick={handleDelete} 
                                disabled={isDeleting}
                                className="h-7 px-2 bg-red-600 text-white rounded text-[11px] font-bold hover:bg-red-700"
                            >
                                {isDeleting ? '...' : 'Yes'}
                            </button>
                            <button 
                                onClick={() => setIsConfirmingDelete(false)} 
                                className="h-7 px-2 bg-white text-gray-600 rounded text-[11px] font-bold border border-gray-200 hover:bg-gray-50"
                            >
                                No
                            </button>
                        </div>
                    ) : (
                        <>
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                title="Edit Expense"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setIsConfirmingDelete(true)}
                                className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete Expense"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>

                <div className="text-right flex-shrink-0 pl-2">
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                        {expense.type || 'EQUAL'} split
                    </p>
                    <p className="font-extrabold text-gray-900 text-base">
                        {formatCurrency(expense.amount, currency)}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                        ({formatCurrency(perPersonShare, currency)}/person)
                    </p>
                </div>
            </div>
        </div>
    );
}
