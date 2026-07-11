import { NextResponse } from 'next/server';
import { joinGroup, verifySession, getDashboardData } from '@/app/actions';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, payload } = body;

        switch (action) {
            case 'create_group': {
                const { name, currency } = payload;
                const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                const { data, error } = await supabase.from('groups').insert({
                    name,
                    currency,
                    join_code: joinCode,
                    created_at: new Date().toISOString()
                }).select('id, join_code').single();
                if (error) throw error;
                return NextResponse.json({ success: true, data });
            }
            case 'join_group': {
                const { joinCode, name } = payload;
                const formData = new FormData();
                formData.append('joinCode', joinCode);
                formData.append('name', name);
                const res = await joinGroup(formData);
                return NextResponse.json(res);
            }
            case 'verify_session': {
                const { groupId, sessionToken } = payload;
                const isValid = await verifySession(groupId, sessionToken);
                return NextResponse.json({ isValid });
            }
            case 'get_dashboard': {
                const { sessionTokens } = payload;
                const data = await getDashboardData(sessionTokens);
                return NextResponse.json({ data });
            }
            case 'add_expense': {
                const { groupId, description, amount, paidBy, category, splitType, splits } = payload;
                
                const { data: expenseData, error: expenseError } = await supabase.from('expenses').insert({
                    group_id: groupId,
                    description,
                    amount,
                    paid_by: paidBy,
                    category,
                    split_type: splitType,
                    created_at: new Date().toISOString()
                }).select('id').single();
                if (expenseError) throw expenseError;
                
                const expenseId = expenseData.id;

                const splitsToInsert = splits.map((s: any) => ({
                    expense_id: expenseId,
                    participant_id: s.participantId,
                    amount: s.amount
                }));
                const { error: splitsError } = await supabase.from('expense_splits').insert(splitsToInsert);
                if (splitsError) throw splitsError;
                
                return NextResponse.json({ success: true, expenseId });
            }
            case 'cleanup': {
                const { groupId } = payload;
                await supabase.from('groups').delete().eq('id', groupId);
                return NextResponse.json({ success: true });
            }
            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }
    } catch (e: any) {
        return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
    }
}
