import { readData } from "@/lib/storage";
import { Layout } from "@/components/ui/Layout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { addMember } from "@/app/actions";
import { AddExpenseForm } from "@/components/AddExpenseForm";
import { SettleUpUI } from "@/components/SettleUpUI";
import { calculateBalances } from "@/lib/logic";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Users, KeyRound, Utensils, Plane, Hotel, Gamepad2, ShoppingBag, Receipt } from "lucide-react";
import { GroupIdentityGuard } from "@/components/GroupIdentityGuard";
import { CopyJoinLink } from "@/components/CopyJoinLink";
import { GroupInviteHeader } from "@/components/GroupInviteHeader";
import { ExpenseItem } from "@/components/ExpenseItem";
import { ParticipantRow } from "@/components/ParticipantRow";
import { GroupSettings } from "@/components/GroupSettings";

interface PageProps {
    params: Promise<{ id: string }>;
}

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

export default async function GroupPage(props: PageProps) {
    const params = await props.params;
    const { id } = params;
    const data = await readData();
    const group = data.groups.find((g) => g.id === id);

    if (!group) {
        notFound();
    }

    const groupExpenses = data.expenses.filter((e) => e.groupId === id);
    const groupSettlements = data.settlements.filter((s) => s.groupId === id);
    const { balances, debts } = calculateBalances(group, groupExpenses, data.users, groupSettlements);

    const getUserName = (userId: string) =>
        data.users.find((u) => u.id === userId)?.name || "Unknown";

    return (
        <Layout>
            <GroupIdentityGuard groupId={group.id} joinCode={group.join_code || ''} />
            <div className="flex flex-col space-y-6">
                {/* Header */}
                <div className="flex flex-col border-b border-gray-200/80 pb-6 bg-white rounded-3xl p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="h-14 w-14 bg-pastel-purple text-pastel-purpleText rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-xs shrink-0">
                                {group.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">{group.name}</h1>
                                    <span className="font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg text-xs uppercase tracking-wide border">
                                        {group.currency}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs font-medium text-gray-500 mt-1">
                                    <span>{group.members.length} participants</span>
                                    <span>•</span>
                                    <span>Created {new Date(group.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-2 shrink-0">
                            <a href="#quick-add">
                                <Button className="bg-black text-white hover:bg-gray-800 shadow-sm">Add an expense</Button>
                            </a>
                            <a href="#settle-up">
                                <Button variant="outline">Settle up</Button>
                            </a>
                        </div>
                    </div>

                    {group.join_code && (
                        <GroupInviteHeader joinCode={group.join_code} />
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content: Expenses */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Inline Add Expense for ease of use */}
                        <div id="quick-add" className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Quick Add Expense</h3>
                            <AddExpenseForm
                                groupId={group.id}
                                members={group.members.map(id => ({
                                    id,
                                    name: getUserName(id)
                                }))}
                                currency={group.currency}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Group Expenses</h2>
                                <span className="text-xs font-semibold text-gray-500">{groupExpenses.length} total</span>
                            </div>

                            {groupExpenses.length === 0 ? (
                                <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center shadow-sm">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-pastel-blue text-pastel-blueText mb-4">
                                        <Receipt className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900">No expenses recorded yet</h3>
                                    <p className="mt-1 text-sm text-gray-500">Add an expense above to start splitting with the group.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {groupExpenses.slice().reverse().map((expense) => (
                                        <ExpenseItem 
                                            key={expense.id} 
                                            expense={{
                                                id: expense.id,
                                                description: expense.description,
                                                amount: expense.amount,
                                                paidBy: expense.paidBy,
                                                date: expense.date,
                                                type: expense.type,
                                                splits: expense.splits
                                            }} 
                                            groupId={group.id}
                                            currency={group.currency}
                                            payerName={getUserName(expense.paidBy)}
                                            members={group.members.map(id => ({ id, name: getUserName(id) }))}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <SettleUpUI groupId={group.id} debts={debts} users={data.users} currency={group.currency} />
                    </div>

                    {/* Sidebar: Balances & Members */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Group Balances</h2>
                            <div className="space-y-3">
                                {balances.map((b) => (
                                    <div key={b.userId} className="flex items-center space-x-3 py-1.5">
                                        <div className="h-9 w-9 rounded-2xl bg-gray-100 flex items-center justify-center text-xs font-extrabold text-gray-700 flex-shrink-0">
                                            {getUserName(b.userId).charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{getUserName(b.userId)}</p>
                                            <p className={`text-xs font-semibold ${b.amount >= 0 ? "text-emerald-600" : "text-brand-red"}`}>
                                                {b.amount >= 0 ? "gets back" : "owes"} {formatCurrency(Math.abs(b.amount), group.currency)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm">
                            <div className="flex flex-col gap-3 mb-4 pb-3 border-b border-gray-100/60 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Participants</h2>
                                {(group as any).join_code && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[11px] font-mono font-bold bg-pastel-yellow text-pastel-yellowText px-2.5 py-1.5 rounded-xl border border-pastel-yellowText/10">
                                            Code: {(group as any).join_code}
                                        </span>
                                        <CopyJoinLink joinCode={(group as any).join_code} />
                                    </div>
                                )}
                            </div>
                            <ul className="space-y-2.5 mb-4">
                                {group.members.map((memberId) => (
                                    <ParticipantRow 
                                        key={memberId} 
                                        groupId={group.id} 
                                        participantId={memberId} 
                                        name={getUserName(memberId)} 
                                    />
                                ))}
                            </ul>
                            <form action={addMember.bind(null, group.id)} className="flex gap-2 pt-3 border-t border-gray-100">
                                <Input name="email" type="text" placeholder="Add participant name..." className="h-9 text-xs flex-1 rounded-full" required />
                                <Button type="submit" size="sm" className="h-9 px-3.5 rounded-full">
                                    + Add
                                </Button>
                            </form>
                        </div>

                        <GroupSettings groupId={group.id} />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
