"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CreateGroupForm } from "@/components/CreateGroupForm";
import { getDashboardData } from "@/app/actions";
import { formatCurrency } from "@/lib/utils";

type ActiveGroup = {
    id: string;
    name: string;
    currency: string;
    memberCount: number;
    participantName: string;
    participantId: string;
};

type DashboardData = {
    groups: ActiveGroup[];
    totalOwe: number;
    totalOwed: number;
};

export function DashboardClient() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            const keys = Object.keys(localStorage);
            const sessionTokens: string[] = [];

            for (const key of keys) {
                if (key.startsWith("splitit_session_")) {
                    const token = localStorage.getItem(key);
                    if (token && !sessionTokens.includes(token)) sessionTokens.push(token);
                } else if (key.startsWith("splitwise_session_")) {
                    const token = localStorage.getItem(key);
                    if (token) {
                        if (!sessionTokens.includes(token)) sessionTokens.push(token);
                        const groupId = key.replace("splitwise_session_", "");
                        localStorage.setItem(`splitit_session_${groupId}`, token);
                        localStorage.removeItem(key);
                        const oldName = localStorage.getItem(`splitwise_name_${groupId}`);
                        if (oldName) {
                            localStorage.setItem(`splitit_name_${groupId}`, oldName);
                            localStorage.removeItem(`splitwise_name_${groupId}`);
                        }
                    }
                }
            }

            if (sessionTokens.length === 0) {
                setData({ groups: [], totalOwe: 0, totalOwed: 0 });
                setIsLoading(false);
                return;
            }

            try {
                const result = await getDashboardData(sessionTokens);
                setData(result);
            } catch (err) {
                console.error("Failed to load dashboard data:", err);
                setData({ groups: [], totalOwe: 0, totalOwed: 0 });
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48">
                <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-black animate-spin" />
            </div>
        );
    }

    const { groups, totalOwe, totalOwed } = data!;

    return (
        <div className="flex flex-col space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200/80 pb-6 bg-white rounded-3xl p-6 shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your active expense groups</p>
                </div>
                <div className="flex space-x-2 mt-4 md:mt-0">
                    {groups.length > 0 ? (
                        <Link href={`/groups/${groups[0].id}#settle-up`}>
                            <Button variant="outline">Settle up</Button>
                        </Link>
                    ) : (
                        <Button variant="outline" disabled>Settle up</Button>
                    )}
                </div>
            </div>

            {groups.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-3">
                            <ArrowUpRight className="w-6 h-6" />
                        </div>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">You Owe</h2>
                        <p className="text-3xl font-black text-brand-red mt-1">
                            {/* We format purely as a number since it's aggregated across potentially different currencies.
                                For a v1 without FX conversion, showing a raw number or an approximate is tricky if currencies mix.
                                Let's just use the first group's currency or a generic format. */}
                            {totalOwe > 0 ? formatCurrency(totalOwe, groups[0]?.currency || 'INR') : '$0.00'}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                            <ArrowDownRight className="w-6 h-6" />
                        </div>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">You are Owed</h2>
                        <p className="text-3xl font-black text-emerald-600 mt-1">
                            {totalOwed > 0 ? formatCurrency(totalOwed, groups[0]?.currency || 'INR') : '$0.00'}
                        </p>
                    </div>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 items-start">
                <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Active Groups</h2>
                        <span className="text-xs font-semibold text-gray-500">{groups.length} active</span>
                    </div>
                    
                    {groups.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-500 mb-2 font-medium">No groups joined yet.</p>
                            <p className="text-xs text-gray-400 mb-4">Create a new group or join with a code.</p>
                            <Link href="/join">
                                <Button size="sm">Join with Code</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {groups.map((group) => (
                                <Link href={`/groups/${group.id}`} key={group.id} className="block group">
                                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200/80 hover:shadow-md transition-all">
                                        <div className="flex items-center space-x-3.5 min-w-0">
                                            <div className="h-12 w-12 rounded-2xl flex flex-shrink-0 items-center justify-center bg-pastel-purple text-pastel-purpleText font-extrabold shadow-xs text-lg">
                                                {group.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-gray-900 truncate group-hover:text-pastel-purpleText transition-colors">{group.name}</h3>
                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <Users className="w-3 h-3" />
                                                    {group.memberCount} participants
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 pl-2">
                                            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg uppercase border border-gray-200">
                                                {group.currency}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div id="create-group" className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm scroll-mt-24">
                    <CreateGroupForm />
                </div>
            </div>
        </div>
    );
}
