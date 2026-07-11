'use server'

import { generateId, User } from '@/lib/storage';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { calculateBalances } from '@/lib/logic';

export async function createGroup(formData: FormData) {
    const name = formData.get('name') as string;
    if (!name) return;

    const currency = (formData.get('currency') as string) || 'INR';
    const validCurrencies = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'JPY', 'CNY', 'AED'];
    const safeCurrency = validCurrencies.includes(currency) ? currency : 'INR';

    const id = generateId();
    const join_code = await (async () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        while (true) {
            let code = '';
            for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
            const { rows } = await sql`SELECT id FROM groups WHERE join_code = ${code} LIMIT 1`;
            if (rows.length === 0) return code;
        }
    })();

    try {
        await sql`
            INSERT INTO groups (id, name, join_code, currency, created_at)
            VALUES (${id}, ${name}, ${join_code}, ${safeCurrency}, ${new Date().toISOString()})
        `;
    } catch (error) {
        console.error('Error creating group:', error);
        return;
    }

    revalidatePath('/');
}

export async function joinGroup(formData: FormData): Promise<{ success?: boolean; groupId?: string; sessionToken?: string; error?: string }> {
    const joinCode = (formData.get('joinCode') as string)?.toUpperCase().trim();
    const name = (formData.get('name') as string)?.trim();

    if (!joinCode || !name) {
        return { error: 'Please enter both a join code and your name.' };
    }

    const { rows: groupRows } = await sql`SELECT id, name FROM groups WHERE join_code = ${joinCode} LIMIT 1`;
    const group = groupRows[0];

    if (!group) {
        return { error: 'Invalid join code. Double-check the 6-character code from your group leader.' };
    }

    // Check if participant with this name already exists in this group
    const { rows: existingRows } = await sql`
        SELECT id, session_token FROM participants 
        WHERE group_id = ${group.id} AND name ILIKE ${name} LIMIT 1
    `;
    const existing = existingRows[0];

    let sessionToken = existing?.session_token;

    if (!existing) {
        const newId = generateId();
        try {
            const { rows: insertedRows } = await sql`
                INSERT INTO participants (id, group_id, name)
                VALUES (${newId}, ${group.id}, ${name})
                RETURNING session_token
            `;
            sessionToken = insertedRows[0].session_token;
        } catch (insertErr) {
            return { error: 'Failed to join group. Please try again.' };
        }
    }

    revalidatePath(`/groups/${group.id}`);
    revalidatePath('/');
    return { success: true, groupId: group.id, sessionToken };
}

export async function verifySession(groupId: string, sessionToken: string): Promise<boolean> {
    if (!groupId || !sessionToken) return false;
    const { rows } = await sql`
        SELECT id FROM participants 
        WHERE group_id = ${groupId} AND session_token = ${sessionToken} 
        LIMIT 1
    `;
    return rows.length > 0;
}

export async function getDashboardData(sessionTokens: string[]) {
    if (!sessionTokens || sessionTokens.length === 0) {
        return { groups: [], totalOwe: 0, totalOwed: 0 };
    }

    // Since sql tagged template doesn't easily support dynamic IN arrays with Vercel Postgres securely without ANY(),
    // we use a parameter array:
    const { rows: participants } = await sql`
        SELECT p.id as participant_id, p.group_id, p.name as participant_name, p.session_token,
               g.name as group_name, g.currency
        FROM participants p
        JOIN groups g ON p.group_id = g.id
        WHERE p.session_token = ANY(${sessionTokens as any}::uuid[])
    `;

    if (!participants || participants.length === 0) {
        return { groups: [], totalOwe: 0, totalOwed: 0 };
    }

    let totalOwe = 0;
    let totalOwed = 0;
    const activeGroups = [];

    for (const p of participants) {
        const groupId = p.group_id;
        
        // Count members
        const { rows: memberRows } = await sql`SELECT id, name FROM participants WHERE group_id = ${groupId}`;
        const users: User[] = memberRows.map(r => ({ id: r.id, name: r.name, email: '' }));

        activeGroups.push({
            id: groupId,
            name: p.group_name,
            currency: p.currency,
            memberCount: users.length,
            participantName: p.participant_name,
            participantId: p.participant_id
        });

        // Get expenses for this group
        const { rows: expenseRows } = await sql`SELECT * FROM expenses WHERE group_id = ${groupId}`;
        const expenses = [];
        
        for (const eRow of expenseRows) {
            const { rows: splitRows } = await sql`SELECT * FROM expense_splits WHERE expense_id = ${eRow.id}`;
            const splits = splitRows.map(sr => ({
                userId: sr.participant_id,
                amount: Number(sr.amount)
            }));
            
            expenses.push({
                id: eRow.id,
                groupId: eRow.group_id,
                description: eRow.description,
                amount: Number(eRow.amount),
                paidBy: eRow.paid_by,
                category: eRow.category,
                splitType: eRow.split_type,
                splits,
                createdAt: eRow.created_at
            });
        }

        // Get settlements for this group
        const { rows: settlementRows } = await sql`SELECT * FROM settlements WHERE group_id = ${groupId}`;
        const settlements = settlementRows.map(sr => ({
            id: sr.id,
            groupId: sr.group_id,
            fromParticipant: sr.from_participant,
            toParticipant: sr.to_participant,
            amount: Number(sr.amount),
            method: sr.method,
            created_at: sr.created_at
        }));
        
        const groupMock = {
            id: groupId,
            name: p.group_name,
            join_code: '',
            currency: p.currency,
            members: users.map(u => u.id),
            created_at: ''
        };

        const { balances } = calculateBalances(groupMock, expenses, users, settlements);
        
        const myBalance = balances.find(b => b.userId === p.participant_id);
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

    // This function was an old fallback for data.json logic.
    // In our no-account DB, we only add participants via joinGroup (by providing a name and joinCode).
    // Let's just no-op or gracefully exit if someone hits this.
    return;
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

    const { rows: participantsRes } = await sql`SELECT id FROM participants WHERE group_id = ${groupId}`;
    let participantIds = participantsRes.map(p => p.id);

    if (participantIds.length === 0) return;

    const expenseId = generateId();
    const createdAt = new Date().toISOString();

    try {
        await sql`
            INSERT INTO expenses (id, group_id, description, amount, paid_by, category, split_type, created_at)
            VALUES (${expenseId}, ${groupId}, ${description}, ${amount}, ${paidBy}, 'general', ${splitType}, ${createdAt})
        `;
    } catch (expenseErr) {
        console.error('Error inserting expense:', expenseErr);
        return;
    }

    let parsedSplits: Record<string, string> = {};
    const splitsJson = formData.get('splitsJson') as string;
    if (splitsJson) {
        try { parsedSplits = JSON.parse(splitsJson); } catch {}
    }

    const count = participantIds.length;
    
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
            await sql`INSERT INTO expense_splits (expense_id, participant_id, amount) VALUES (${expenseId}, ${pid}, ${share})`;
        }
    } else if (splitType === 'EXACT') {
        for (const pid of participantIds) {
            const valStr = (formData.get(`split_${pid}`) as string) || parsedSplits[pid] || '0';
            const share = Number(Number(valStr).toFixed(2)) || 0;
            await sql`INSERT INTO expense_splits (expense_id, participant_id, amount) VALUES (${expenseId}, ${pid}, ${share})`;
        }
    } else if (splitType === 'PERCENTAGE') {
        for (const pid of participantIds) {
            const valStr = (formData.get(`split_${pid}`) as string) || parsedSplits[pid] || '0';
            const pct = Number(valStr) || 0;
            const share = Number(((amount * pct) / 100).toFixed(2)) || 0;
            await sql`INSERT INTO expense_splits (expense_id, participant_id, amount) VALUES (${expenseId}, ${pid}, ${share})`;
        }
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

    try {
        await sql`
            INSERT INTO settlements (id, group_id, from_participant, to_participant, amount, method, created_at)
            VALUES (${settlementId}, ${groupId}, ${fromParticipant}, ${toParticipant}, ${amount}, ${method}, ${createdAt})
        `;
    } catch (insertErr) {
        console.error('Error inserting settlement:', insertErr);
        return;
    }

    revalidatePath(`/groups/${groupId}`);
    revalidatePath('/');
}
