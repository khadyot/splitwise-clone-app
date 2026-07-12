'use server'

import { readData, writeData, Group, Expense, generateId, User } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function createGroup(formData: FormData): Promise<{ success?: boolean; groupId?: string; joinCode?: string; sessionToken?: string; name?: string; error?: string }> {
    const name = (formData.get('name') as string)?.trim();
    const yourName = (formData.get('yourName') as string)?.trim() || 'Organizer';
    if (!name) return { error: 'Group name is required.' };

    const currency = (formData.get('currency') as string) || 'INR';
    const validCurrencies = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'JPY', 'CNY', 'AED'];
    const safeCurrency = validCurrencies.includes(currency) ? currency : 'INR';

    const id = generateId();
    const join_code = await (async () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        while (true) {
            let code = '';
            for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
            const { data } = await supabase.from('groups').select('id').eq('join_code', code).maybeSingle();
            if (!data) return code;
        }
    })();

    const { error } = await supabase.from('groups').insert({
        id,
        name,
        join_code,
        currency: safeCurrency,
        created_at: new Date().toISOString(),
    });

    if (error) {
        console.error('Error creating group:', error);
        return { error: 'Failed to create group. Please try again.' };
    }

    const { data: inserted, error: insertErr } = await supabase.from('participants').insert({
        id: generateId(),
        group_id: id,
        name: yourName,
    }).select('session_token').single();

    let sessionToken = inserted?.session_token;

    revalidatePath(`/groups/${id}`);
    revalidatePath('/dashboard');
    revalidatePath('/');

    return { success: true, groupId: id, joinCode: join_code, sessionToken, name: yourName };
}

export async function joinGroup(formData: FormData): Promise<{ success?: boolean; groupId?: string; sessionToken?: string; error?: string }> {
    const joinCode = (formData.get('joinCode') as string)?.toUpperCase().trim();
    const name = (formData.get('name') as string)?.trim();

    if (!joinCode || !name) {
        return { error: 'Please enter both a join code and your name.' };
    }

    const { data: group, error: groupErr } = await supabase
        .from('groups')
        .select('id, name')
        .eq('join_code', joinCode)
        .maybeSingle();

    if (groupErr || !group) {
        return { error: 'Invalid join code. Double-check the 6-character code from your group leader.' };
    }

    // Check if participant with this name already exists in this group
    const { data: existing } = await supabase
        .from('participants')
        .select('id, session_token')
        .eq('group_id', group.id)
        .ilike('name', name)
        .maybeSingle();

    let sessionToken = existing?.session_token;

    if (!existing) {
        const { data: inserted, error: insertErr } = await supabase.from('participants').insert({
            id: generateId(), // note: if schema requires uuid for id, this must be a uuid. Our migration says `id uuid primary key default gen_random_uuid()`. Let's let DB generate it.
            group_id: group.id,
            name: name,
        }).select('session_token').single();

        if (insertErr || !inserted) {
            return { error: 'Failed to join group. Please try again.' };
        }
        sessionToken = inserted.session_token;
    }

    revalidatePath(`/groups/${group.id}`);
    revalidatePath('/');
    return { success: true, groupId: group.id, sessionToken };
}

export async function verifySession(groupId: string, sessionToken: string): Promise<boolean> {
    if (!groupId || !sessionToken) return false;
    try {
        const { data, error } = await supabase
            .from('participants')
            .select('id')
            .eq('group_id', groupId)
            .eq('session_token', sessionToken)
            .maybeSingle();
        if (error || !data) return false;
        return true;
    } catch (err) {
        console.error('verifySession error:', err);
        return false;
    }
}

export async function getDashboardData(sessionTokens: string[]) {
    if (!sessionTokens || sessionTokens.length === 0) {
        return { groups: [], totalOwe: 0, totalOwed: 0 };
    }

    // 1. Fetch participants matching these tokens
    const { data: participants } = await supabase
        .from('participants')
        .select('id, group_id, name, session_token, groups ( id, name, currency, members:participants ( id ) )')
        .in('session_token', sessionTokens);

    if (!participants || participants.length === 0) {
        return { groups: [], totalOwe: 0, totalOwed: 0 };
    }

    // Since our original codebase uses lib/storage and calculateBalances, and our DB holds real data,
    // let's fetch everything needed to run calculateBalances from the DB, or just use readData() for now
    // and filter it. The instructions say "computed from calculateBalances()".
    // Our DB and data.json are somewhat diverged if we rely strictly on data.json for calculateBalances.
    // Wait, the prompt says "computed from calculateBalances() for the currently recognized participant... across all groups".
    // Let's use `readData()` to get the groups/expenses/settlements/users since calculateBalances expects that structure.

    const data = await readData();
    let totalOwe = 0;
    let totalOwed = 0;
    const activeGroups = [];

    for (const p of participants) {
        const group = data.groups.find(g => g.id === p.group_id);
        if (!group) continue;
        
        activeGroups.push({
            id: group.id,
            name: group.name,
            currency: group.currency,
            memberCount: group.members.length,
            participantName: p.name,
            participantId: p.id
        });

        const groupExpenses = data.expenses.filter(e => e.groupId === group.id);
        const groupSettlements = data.settlements.filter(s => s.groupId === group.id);
        
        // Use our existing logic
        const { balances } = await import('@/lib/logic').then(m => m.calculateBalances(group, groupExpenses, data.users, groupSettlements));
        
        // Find this participant's balance
        const myBalance = balances.find(b => b.userId === p.id);
        if (myBalance) {
            if (myBalance.amount < 0) {
                totalOwe += Math.abs(myBalance.amount);
            } else if (myBalance.amount > 0) {
                totalOwed += myBalance.amount;
            }
        }
    }

    return { groups: activeGroups, totalOwe, totalOwed };
}

export async function addMember(groupId: string, formData: FormData) {
    const email = formData.get('email') as string;
    if (!email) return;

    const data = await readData();
    const group = data.groups.find(g => g.id === groupId);
    if (!group) return;

    // Simple logic: If user exists, add ID. If not, create user.
    let user = data.users.find(u => u.email === email);
    if (!user) {
        user = {
            id: generateId(),
            name: email.split('@')[0], // Simple name derivation
            email,
        };
        data.users.push(user);
    }

    if (!group.members.includes(user.id)) {
        group.members.push(user.id);
        await writeData(data);
        revalidatePath(`/groups/${groupId}`);
    }
}

export async function createExpense(groupId: string, formData: FormData) {
    const description = formData.get('description') as string;
    const amount = Number(formData.get('amount'));
    const paidBy = formData.get('paidBy') as string;
    const splitTypeRaw = formData.get('splitType') as string;
    const splitType = (splitTypeRaw && ['EQUAL', 'EXACT', 'PERCENTAGE'].includes(splitTypeRaw))
        ? (splitTypeRaw as 'EQUAL' | 'EXACT' | 'PERCENTAGE')
        : 'EQUAL';

    if (!description || !amount || !paidBy) return;

    // Get group participant IDs
    const { data: participantsRes } = await supabase.from('participants').select('id').eq('group_id', groupId);
    let participantIds = (participantsRes || []).map(p => p.id);

    // Fallback if participants table wasn't queried or empty
    if (participantIds.length === 0) {
        const membersJson = formData.get('membersJson') as string;
        if (membersJson) {
            try { participantIds = JSON.parse(membersJson); } catch {}
        }
        if (participantIds.length === 0) {
            const data = await readData();
            const group = data.groups.find(g => g.id === groupId);
            participantIds = group?.members || [paidBy];
        }
    }

    const expenseId = generateId();
    const createdAt = new Date().toISOString();

    const { error: expenseErr } = await supabase.from('expenses').insert({
        id: expenseId,
        group_id: groupId,
        description,
        amount,
        paid_by: paidBy,
        category: 'general',
        split_type: splitType,
        created_at: createdAt
    });

    if (expenseErr) {
        console.error('Error inserting expense:', expenseErr);
        return;
    }

    // Parse submitted splits if EXACT or PERCENTAGE
    let parsedSplits: Record<string, string> = {};
    const splitsJson = formData.get('splitsJson') as string;
    if (splitsJson) {
        try { parsedSplits = JSON.parse(splitsJson); } catch {}
    }

    const count = participantIds.length;
    const splitsToInsert: { expense_id: string; participant_id: string; amount: number }[] = [];

    if (splitType === 'EQUAL') {
        const baseShare = Math.floor((amount * 100) / count) / 100;
        let remaining = Number(amount.toFixed(2));
        for (let i = 0; i < count; i++) {
            const pid = participantIds[i];
            let share: number;
            if (i === count - 1) {
                share = Number(remaining.toFixed(2));
            } else {
                share = baseShare;
                remaining = Number((remaining - share).toFixed(2));
            }
            splitsToInsert.push({
                expense_id: expenseId,
                participant_id: pid,
                amount: share
            });
        }
    } else if (splitType === 'EXACT') {
        for (const pid of participantIds) {
            const valStr = (formData.get(`split_${pid}`) as string) || parsedSplits[pid] || '0';
            const share = Number(Number(valStr).toFixed(2)) || 0;
            splitsToInsert.push({
                expense_id: expenseId,
                participant_id: pid,
                amount: share
            });
        }
    } else if (splitType === 'PERCENTAGE') {
        for (const pid of participantIds) {
            const valStr = (formData.get(`split_${pid}`) as string) || parsedSplits[pid] || '0';
            const pct = Number(valStr) || 0;
            const share = Number(((amount * pct) / 100).toFixed(2)) || 0;
            splitsToInsert.push({
                expense_id: expenseId,
                participant_id: pid,
                amount: share
            });
        }
    }

    if (splitsToInsert.length > 0) {
        await supabase.from('expense_splits').insert(splitsToInsert);
    }

    revalidatePath(`/groups/${groupId}`);
}

export async function settleUp(
    groupId: string,
    payloadOrFormData: FormData | { fromParticipant: string; toParticipant: string; amount: number; method?: 'cash' | 'transfer' | 'other' }
) {
    let fromParticipant: string;
    let toParticipant: string;
    let amount: number;
    let method: 'cash' | 'transfer' | 'other' = 'other';

    if (payloadOrFormData instanceof FormData) {
        fromParticipant = payloadOrFormData.get('fromParticipant') as string;
        toParticipant = payloadOrFormData.get('toParticipant') as string;
        amount = Number(payloadOrFormData.get('amount'));
        const m = payloadOrFormData.get('method') as string;
        if (m && ['cash', 'transfer', 'other'].includes(m)) method = m as any;
    } else {
        fromParticipant = payloadOrFormData.fromParticipant;
        toParticipant = payloadOrFormData.toParticipant;
        amount = Number(payloadOrFormData.amount);
        if (payloadOrFormData.method && ['cash', 'transfer', 'other'].includes(payloadOrFormData.method)) {
            method = payloadOrFormData.method;
        }
    }

    if (!fromParticipant || !toParticipant || !amount || amount <= 0) return;

    const settlementId = generateId();
    const createdAt = new Date().toISOString();

    const { error: insertErr } = await supabase.from('settlements').insert({
        id: settlementId,
        group_id: groupId,
        from_participant: fromParticipant,
        to_participant: toParticipant,
        amount,
        method,
        created_at: createdAt
    });

    if (insertErr) {
        console.error('Error inserting settlement:', insertErr);
        return;
    }

    revalidatePath(`/groups/${groupId}`);
    revalidatePath('/');
}

export async function deleteGroup(groupId: string) {
    if (!groupId) return { error: 'Group ID is required.' };
    const { error } = await supabase.from('groups').delete().eq('id', groupId);
    if (error) {
        console.error('Error deleting group:', error);
        return { error: 'Failed to delete group.' };
    }
    revalidatePath('/dashboard');
    revalidatePath('/');
    return { success: true };
}

export async function deleteExpense(groupId: string, expenseId: string) {
    if (!expenseId) return { error: 'Expense ID is required.' };
    const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
    if (error) {
        console.error('Error deleting expense:', error);
        return { error: 'Failed to delete expense.' };
    }
    revalidatePath(`/groups/${groupId}`);
    return { success: true };
}

export async function editExpense(groupId: string, expenseId: string, formData: FormData) {
    const description = formData.get('description') as string;
    const amount = Number(formData.get('amount'));
    const paidBy = formData.get('paidBy') as string;
    const splitTypeRaw = formData.get('splitType') as string;
    const splitType = (splitTypeRaw && ['EQUAL', 'EXACT', 'PERCENTAGE'].includes(splitTypeRaw))
        ? (splitTypeRaw as 'EQUAL' | 'EXACT' | 'PERCENTAGE')
        : 'EQUAL';

    if (!description || !amount || !paidBy || !expenseId) return { error: 'Missing required fields.' };

    const { data: participantsRes } = await supabase.from('participants').select('id').eq('group_id', groupId);
    let participantIds = (participantsRes || []).map(p => p.id);
    if (participantIds.length === 0) {
        const membersJson = formData.get('membersJson') as string;
        if (membersJson) {
            try { participantIds = JSON.parse(membersJson); } catch {}
        }
    }

    const { error: updateErr } = await supabase.from('expenses').update({
        description,
        amount,
        paid_by: paidBy,
        split_type: splitType,
    }).eq('id', expenseId);

    if (updateErr) {
        console.error('Error updating expense:', updateErr);
        return { error: 'Failed to update expense.' };
    }

    let parsedSplits: Record<string, string> = {};
    const splitsJson = formData.get('splitsJson') as string;
    if (splitsJson) {
        try { parsedSplits = JSON.parse(splitsJson); } catch {}
    }

    const count = participantIds.length;
    const splitsToInsert: { expense_id: string; participant_id: string; amount: number }[] = [];

    if (splitType === 'EQUAL') {
        const baseShare = Math.floor((amount * 100) / count) / 100;
        let remaining = Number(amount.toFixed(2));
        for (let i = 0; i < count; i++) {
            const pid = participantIds[i];
            let share: number;
            if (i === count - 1) {
                share = Number(remaining.toFixed(2));
            } else {
                share = baseShare;
                remaining = Number((remaining - share).toFixed(2));
            }
            splitsToInsert.push({ expense_id: expenseId, participant_id: pid, amount: share });
        }
    } else if (splitType === 'EXACT') {
        for (const pid of participantIds) {
            const valStr = (formData.get(`split_${pid}`) as string) || parsedSplits[pid] || '0';
            const share = Number(Number(valStr).toFixed(2)) || 0;
            splitsToInsert.push({ expense_id: expenseId, participant_id: pid, amount: share });
        }
    } else if (splitType === 'PERCENTAGE') {
        for (const pid of participantIds) {
            const valStr = (formData.get(`split_${pid}`) as string) || parsedSplits[pid] || '0';
            const pct = Number(valStr) || 0;
            const share = Number(((amount * pct) / 100).toFixed(2)) || 0;
            splitsToInsert.push({ expense_id: expenseId, participant_id: pid, amount: share });
        }
    }

    // Insert new splits first, then delete old ones to prevent orphaned expenses on failure
    if (splitsToInsert.length > 0) {
        const { data: insertedSplits, error: insertErr } = await supabase.from('expense_splits').insert(splitsToInsert).select('id');
        if (insertErr || !insertedSplits) {
            console.error('Error inserting new splits:', insertErr);
            return { error: 'Failed to insert new splits.' };
        }
        
        const insertedIds = insertedSplits.map(s => s.id);
        
        // Delete all old splits for this expense that are NOT the ones we just inserted
        await supabase.from('expense_splits').delete()
            .eq('expense_id', expenseId)
            .not('id', 'in', `(${insertedIds.join(',')})`);
    } else {
        // If there are no splits to insert (which shouldn't happen, but just in case)
        await supabase.from('expense_splits').delete().eq('expense_id', expenseId);
    }

    revalidatePath(`/groups/${groupId}`);
    return { success: true };
}

export async function removeParticipant(groupId: string, participantId: string) {
    if (!groupId || !participantId) return { error: 'Missing required fields.' };
    
    // We need to calculate balances for this group to ensure the participant's balance is exactly 0.
    const data = await readData();
    const group = data.groups.find(g => g.id === groupId);
    if (!group) return { error: 'Group not found.' };

    const groupExpenses = data.expenses.filter(e => e.groupId === groupId);
    const groupSettlements = data.settlements.filter(s => s.groupId === groupId);
    
    const { balances } = await import('@/lib/logic').then(m => m.calculateBalances(group, groupExpenses, data.users, groupSettlements));
    
    const pBalance = balances.find(b => b.userId === participantId);
    if (pBalance && pBalance.amount !== 0) {
        return { error: 'Participant must settle all debts (balance must be zero) before they can be removed.' };
    }

    const { error } = await supabase.from('participants').delete().eq('id', participantId);
    if (error) {
        console.error('Error removing participant:', error);
        return { error: 'Failed to remove participant.' };
    }

    revalidatePath(`/groups/${groupId}`);
    return { success: true };
}

export async function leaveGroup(groupId: string, sessionToken: string) {
    if (!groupId || !sessionToken) return { error: 'Missing required fields.' };

    const { data: participant, error: fetchErr } = await supabase
        .from('participants')
        .select('id')
        .eq('group_id', groupId)
        .eq('session_token', sessionToken)
        .maybeSingle();

    if (fetchErr || !participant) {
        return { error: 'Participant session not found.' };
    }

    // Use removeParticipant to safely remove with 0 balance check
    const result = await removeParticipant(groupId, participant.id);
    if (result.error) {
        return result;
    }

    revalidatePath('/dashboard');
    return { success: true };
}
