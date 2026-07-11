import { NextResponse } from 'next/server';
import { joinGroup, verifySession, getDashboardData } from '@/app/actions';
import { sql } from '@vercel/postgres';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, payload } = body;

        switch (action) {
            case 'create_group': {
                const { name, currency } = payload;
                const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                const { rows } = await sql`
                    INSERT INTO groups (name, currency, join_code) 
                    VALUES (${name}, ${currency}, ${joinCode}) 
                    RETURNING id, join_code
                `;
                return NextResponse.json({ success: true, data: rows[0] });
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
                
                const { rows } = await sql`
                    INSERT INTO expenses (group_id, description, amount, paid_by, category, split_type)
                    VALUES (${groupId}, ${description}, ${amount}, ${paidBy}, ${category}, ${splitType})
                    RETURNING id
                `;
                const expenseId = rows[0].id;

                for (const split of splits) {
                    await sql`
                        INSERT INTO expense_splits (expense_id, participant_id, amount)
                        VALUES (${expenseId}, ${split.participantId}, ${split.amount})
                    `;
                }
                
                return NextResponse.json({ success: true, expenseId });
            }
            case 'cleanup': {
                const { groupId } = payload;
                await sql`DELETE FROM groups WHERE id = ${groupId}`;
                return NextResponse.json({ success: true });
            }
            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }
    } catch (e: any) {
        return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
    }
}
