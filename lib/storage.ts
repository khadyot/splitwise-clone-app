import { supabase } from './supabase';
import crypto from 'crypto';

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Group {
    id: string;
    name: string;
    members: string[]; // User IDs
    currency: string;  // ISO 4217 code, e.g. 'INR', 'USD'
    created_at: string;
    join_code?: string;
}

export interface Split {
    userId: string;
    amount: number; // Exact amount owed or percentage value
}

export interface Expense {
    id: string;
    groupId: string;
    description: string;
    amount: number;
    paidBy: string; // The participant ID who paid (single payer for v1)
    date: string;
    type?: 'EQUAL' | 'EXACT' | 'PERCENTAGE';
    splits?: Split[];
}

export interface Settlement {
    id: string;
    groupId: string;
    fromParticipant: string;
    toParticipant: string;
    amount: number;
    method: 'cash' | 'transfer' | 'other';
    created_at: string;
}

export interface Data {
    users: User[];
    groups: Group[];
    expenses: Expense[];
    settlements: Settlement[];
}

export function generateId(): string {
    return crypto.randomUUID();
}

async function getUniqueJoinCode(): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    while (true) {
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const { data } = await supabase.from('groups').select('id').eq('join_code', code).maybeSingle();
        if (!data) return code;
    }
}

export async function readData(): Promise<Data> {
    const [groupsRes, participantsRes, expensesRes, splitsRes, settlementsRes] = await Promise.all([
        supabase.from('groups').select('*'),
        supabase.from('participants').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('expense_splits').select('*'),
        supabase.from('settlements').select('*')
    ]);

    const rawGroups = groupsRes.data || [];
    const rawParticipants = participantsRes.data || [];
    const rawExpenses = expensesRes.data || [];
    const rawSplits = splitsRes.data || [];
    const rawSettlements = settlementsRes.data || [];

    // Map participants -> users
    const users: User[] = rawParticipants.map(p => ({
        id: p.id,
        name: p.name,
        email: `${p.name}@guest.local`
    }));

    // Map groups
    const groups: Group[] = rawGroups.map(g => ({
        id: g.id,
        name: g.name,
        members: rawParticipants.filter(p => p.group_id === g.id).map(p => p.id),
        currency: g.currency || 'INR',
        created_at: g.created_at,
        join_code: g.join_code
    }));

    // Map expenses
    const expenses: Expense[] = rawExpenses.map(e => {
        const expenseSplits = rawSplits.filter(s => s.expense_id === e.id);
        const amount = Number(e.amount);
        return {
            id: e.id,
            groupId: e.group_id,
            description: e.description,
            amount,
            paidBy: e.paid_by,
            date: e.created_at,
            type: (e.split_type as any) || 'EQUAL',
            splits: expenseSplits.map(s => ({
                userId: s.participant_id,
                amount: Number(s.amount)
            }))
        };
    });

    const settlements: Settlement[] = rawSettlements.map(s => ({
        id: s.id,
        groupId: s.group_id,
        fromParticipant: s.from_participant,
        toParticipant: s.to_participant,
        amount: Number(s.amount),
        method: (s.method as any) || 'other',
        created_at: s.created_at
    }));

    return { users, groups, expenses, settlements };
}

export async function writeData(data: Data): Promise<void> {
    // 1. Sync groups
    const { data: existingGroups } = await supabase.from('groups').select('id');
    const existingGroupIds = new Set((existingGroups || []).map(g => g.id));

    for (const g of data.groups) {
        if (!existingGroupIds.has(g.id)) {
            const join_code = await getUniqueJoinCode();
            await supabase.from('groups').insert({
                id: g.id,
                name: g.name,
                join_code,
                currency: (g as any).currency || 'INR',
                created_at: g.created_at || new Date().toISOString()
            });
            existingGroupIds.add(g.id);
        } else {
            await supabase.from('groups').update({ name: g.name }).eq('id', g.id);
        }
    }

    // 2. Sync participants
    const { data: existingParticipants } = await supabase.from('participants').select('id');
    const existingParticipantIds = new Set((existingParticipants || []).map(p => p.id));

    const ensureParticipantExists = async (participantId: string, groupId: string) => {
        if (!existingParticipantIds.has(participantId)) {
            const user = data.users.find(u => u.id === participantId);
            await supabase.from('participants').insert({
                id: participantId,
                group_id: groupId,
                name: user ? user.name : 'Participant',
                session_token: crypto.randomUUID()
            });
            existingParticipantIds.add(participantId);
        }
    };

    for (const g of data.groups) {
        for (const memberId of g.members) {
            await ensureParticipantExists(memberId, g.id);
        }
    }

    // 3. Sync expenses and splits
    const { data: existingExpenses } = await supabase.from('expenses').select('id');
    const existingExpenseIds = new Set((existingExpenses || []).map(e => e.id));

    for (const e of data.expenses) {
        if (!existingExpenseIds.has(e.id)) {
            const paidById = typeof e.paidBy === 'string' ? e.paidBy : ((e.paidBy as any)?.[0]?.userId || e.groupId);

            await ensureParticipantExists(paidById, e.groupId);

            const split_type = (e.type && ['EQUAL', 'EXACT', 'PERCENTAGE'].includes(e.type)) ? e.type : 'EQUAL';
            const amount = Number(e.amount) || 0;

            const { error: insertErr } = await supabase.from('expenses').insert({
                id: e.id,
                group_id: e.groupId,
                description: e.description || 'Expense',
                amount,
                paid_by: paidById,
                category: 'general',
                split_type,
                created_at: e.date || new Date().toISOString()
            });

            if (!insertErr) {
                existingExpenseIds.add(e.id);

                const group = data.groups.find(g => g.id === e.groupId);
                const members = group ? group.members : [];

                if (split_type === 'EXACT' && e.splits && e.splits.length > 0) {
                    for (const s of e.splits) {
                        await ensureParticipantExists(s.userId, e.groupId);
                    }
                    const splitsToInsert = e.splits.map(s => ({
                        expense_id: e.id,
                        participant_id: s.userId,
                        amount: Number(s.amount) || 0
                    }));
                    await supabase.from('expense_splits').insert(splitsToInsert);
                } else if (split_type === 'PERCENTAGE' && e.splits && e.splits.length > 0) {
                    for (const s of e.splits) {
                        await ensureParticipantExists(s.userId, e.groupId);
                    }
                    const splitsToInsert = e.splits.map(s => ({
                        expense_id: e.id,
                        participant_id: s.userId,
                        amount: Number(((amount * (Number(s.amount) || 0)) / 100).toFixed(2))
                    }));
                    await supabase.from('expense_splits').insert(splitsToInsert);
                } else {
                    if (members.length > 0) {
                        for (const mId of members) {
                            await ensureParticipantExists(mId, e.groupId);
                        }
                        const equalShare = Number((amount / members.length).toFixed(2));
                        const splitsToInsert = members.map(mId => ({
                            expense_id: e.id,
                            participant_id: mId,
                            amount: equalShare
                        }));
                        await supabase.from('expense_splits').insert(splitsToInsert);
                    }
                }
            }
        }
    }
}
