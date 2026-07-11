module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/supabase.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_role_key';
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/lib/storage.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateId",
    ()=>generateId,
    "readData",
    ()=>readData,
    "writeData",
    ()=>writeData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
;
function generateId() {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomUUID();
}
async function getUniqueJoinCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    while(true){
        let code = '';
        for(let i = 0; i < 6; i++){
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('groups').select('id').eq('join_code', code).maybeSingle();
        if (!data) return code;
    }
}
async function readData() {
    const [groupsRes, participantsRes, expensesRes, splitsRes, settlementsRes] = await Promise.all([
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('groups').select('*'),
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('participants').select('*'),
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('expenses').select('*'),
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('expense_splits').select('*'),
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('settlements').select('*')
    ]);
    const rawGroups = groupsRes.data || [];
    const rawParticipants = participantsRes.data || [];
    const rawExpenses = expensesRes.data || [];
    const rawSplits = splitsRes.data || [];
    const rawSettlements = settlementsRes.data || [];
    // Map participants -> users
    const users = rawParticipants.map((p)=>({
            id: p.id,
            name: p.name,
            email: `${p.name}@guest.local`
        }));
    // Map groups
    const groups = rawGroups.map((g)=>({
            id: g.id,
            name: g.name,
            members: rawParticipants.filter((p)=>p.group_id === g.id).map((p)=>p.id),
            currency: g.currency || 'INR',
            created_at: g.created_at
        }));
    // Map expenses
    const expenses = rawExpenses.map((e)=>{
        const expenseSplits = rawSplits.filter((s)=>s.expense_id === e.id);
        const amount = Number(e.amount);
        return {
            id: e.id,
            groupId: e.group_id,
            description: e.description,
            amount,
            paidBy: e.paid_by,
            date: e.created_at,
            type: e.split_type || 'EQUAL',
            splits: expenseSplits.map((s)=>({
                    userId: s.participant_id,
                    amount: Number(s.amount)
                }))
        };
    });
    const settlements = rawSettlements.map((s)=>({
            id: s.id,
            groupId: s.group_id,
            fromParticipant: s.from_participant,
            toParticipant: s.to_participant,
            amount: Number(s.amount),
            method: s.method || 'other',
            created_at: s.created_at
        }));
    return {
        users,
        groups,
        expenses,
        settlements
    };
}
async function writeData(data) {
    // 1. Sync groups
    const { data: existingGroups } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('groups').select('id');
    const existingGroupIds = new Set((existingGroups || []).map((g)=>g.id));
    for (const g of data.groups){
        if (!existingGroupIds.has(g.id)) {
            const join_code = await getUniqueJoinCode();
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('groups').insert({
                id: g.id,
                name: g.name,
                join_code,
                currency: g.currency || 'INR',
                created_at: g.created_at || new Date().toISOString()
            });
            existingGroupIds.add(g.id);
        } else {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('groups').update({
                name: g.name
            }).eq('id', g.id);
        }
    }
    // 2. Sync participants
    const { data: existingParticipants } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('participants').select('id');
    const existingParticipantIds = new Set((existingParticipants || []).map((p)=>p.id));
    const ensureParticipantExists = async (participantId, groupId)=>{
        if (!existingParticipantIds.has(participantId)) {
            const user = data.users.find((u)=>u.id === participantId);
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('participants').insert({
                id: participantId,
                group_id: groupId,
                name: user ? user.name : 'Participant',
                session_token: __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomUUID()
            });
            existingParticipantIds.add(participantId);
        }
    };
    for (const g of data.groups){
        for (const memberId of g.members){
            await ensureParticipantExists(memberId, g.id);
        }
    }
    // 3. Sync expenses and splits
    const { data: existingExpenses } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('expenses').select('id');
    const existingExpenseIds = new Set((existingExpenses || []).map((e)=>e.id));
    for (const e of data.expenses){
        if (!existingExpenseIds.has(e.id)) {
            const paidById = typeof e.paidBy === 'string' ? e.paidBy : e.paidBy?.[0]?.userId || e.groupId;
            await ensureParticipantExists(paidById, e.groupId);
            const split_type = e.type && [
                'EQUAL',
                'EXACT',
                'PERCENTAGE'
            ].includes(e.type) ? e.type : 'EQUAL';
            const amount = Number(e.amount) || 0;
            const { error: insertErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('expenses').insert({
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
                const group = data.groups.find((g)=>g.id === e.groupId);
                const members = group ? group.members : [];
                if (split_type === 'EXACT' && e.splits && e.splits.length > 0) {
                    for (const s of e.splits){
                        await ensureParticipantExists(s.userId, e.groupId);
                    }
                    const splitsToInsert = e.splits.map((s)=>({
                            expense_id: e.id,
                            participant_id: s.userId,
                            amount: Number(s.amount) || 0
                        }));
                    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('expense_splits').insert(splitsToInsert);
                } else if (split_type === 'PERCENTAGE' && e.splits && e.splits.length > 0) {
                    for (const s of e.splits){
                        await ensureParticipantExists(s.userId, e.groupId);
                    }
                    const splitsToInsert = e.splits.map((s)=>({
                            expense_id: e.id,
                            participant_id: s.userId,
                            amount: Number((amount * (Number(s.amount) || 0) / 100).toFixed(2))
                        }));
                    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('expense_splits').insert(splitsToInsert);
                } else {
                    if (members.length > 0) {
                        for (const mId of members){
                            await ensureParticipantExists(mId, e.groupId);
                        }
                        const equalShare = Number((amount / members.length).toFixed(2));
                        const splitsToInsert = members.map((mId)=>({
                                expense_id: e.id,
                                participant_id: mId,
                                amount: equalShare
                            }));
                        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('expense_splits').insert(splitsToInsert);
                    }
                }
            }
        }
    }
}
}),
"[project]/app/actions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"403c76abb0b0909a0cec80f72efe89fb5754ec0301":"joinGroup","407d5ec04db8a8a486e20c14c9695c0ab7253bc893":"createGroup","40a4110c77a87fc11967998d5663aa5f6f06cf1913":"getDashboardData","6006b3fa0d4feb6de874fbac4a3bb5e7f3d7e10278":"verifySession","601e3b70f23f4abd0e954a6cdce2c18d0712c98ccf":"addMember","60db5038172c18083fea9d65b065b42518a3401642":"createExpense","60e98734fc70d1ff386b379ee56d1bfe9efd9240c7":"settleUp"},"",""] */ __turbopack_context__.s([
    "addMember",
    ()=>addMember,
    "createExpense",
    ()=>createExpense,
    "createGroup",
    ()=>createGroup,
    "getDashboardData",
    ()=>getDashboardData,
    "joinGroup",
    ()=>joinGroup,
    "settleUp",
    ()=>settleUp,
    "verifySession",
    ()=>verifySession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/storage.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-route] (ecmascript)");
;
;
;
;
async function createGroup(formData) {
    const name = formData.get('name');
    if (!name) return;
    const currency = formData.get('currency') || 'INR';
    const validCurrencies = [
        'INR',
        'USD',
        'EUR',
        'GBP',
        'AUD',
        'CAD',
        'SGD',
        'JPY',
        'CNY',
        'AED'
    ];
    const safeCurrency = validCurrencies.includes(currency) ? currency : 'INR';
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateId"])();
    const join_code = await (async ()=>{
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        while(true){
            let code = '';
            for(let i = 0; i < 6; i++)code += chars.charAt(Math.floor(Math.random() * chars.length));
            const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('groups').select('id').eq('join_code', code).maybeSingle();
            if (!data) return code;
        }
    })();
    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('groups').insert({
        id,
        name,
        join_code,
        currency: safeCurrency,
        created_at: new Date().toISOString()
    });
    if (error) {
        console.error('Error creating group:', error);
        return;
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["revalidatePath"])('/');
}
async function joinGroup(formData) {
    const joinCode = formData.get('joinCode')?.toUpperCase().trim();
    const name = formData.get('name')?.trim();
    if (!joinCode || !name) {
        return {
            error: 'Please enter both a join code and your name.'
        };
    }
    const { data: group, error: groupErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('groups').select('id, name').eq('join_code', joinCode).maybeSingle();
    if (groupErr || !group) {
        return {
            error: 'Invalid join code. Double-check the 6-character code from your group leader.'
        };
    }
    // Check if participant with this name already exists in this group
    const { data: existing } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('participants').select('id, session_token').eq('group_id', group.id).ilike('name', name).maybeSingle();
    let sessionToken = existing?.session_token;
    if (!existing) {
        const { data: inserted, error: insertErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('participants').insert({
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateId"])(),
            group_id: group.id,
            name: name
        }).select('session_token').single();
        if (insertErr || !inserted) {
            return {
                error: 'Failed to join group. Please try again.'
            };
        }
        sessionToken = inserted.session_token;
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["revalidatePath"])(`/groups/${group.id}`);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["revalidatePath"])('/');
    return {
        success: true,
        groupId: group.id,
        sessionToken
    };
}
async function verifySession(groupId, sessionToken) {
    if (!groupId || !sessionToken) return false;
    const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('participants').select('id').eq('group_id', groupId).eq('session_token', sessionToken).maybeSingle();
    return !!data;
}
async function getDashboardData(sessionTokens) {
    if (!sessionTokens || sessionTokens.length === 0) {
        return {
            groups: [],
            totalOwe: 0,
            totalOwed: 0
        };
    }
    // 1. Fetch participants matching these tokens
    const { data: participants } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('participants').select('id, group_id, name, session_token, groups ( id, name, currency, members:participants ( id ) )').in('session_token', sessionTokens);
    if (!participants || participants.length === 0) {
        return {
            groups: [],
            totalOwe: 0,
            totalOwed: 0
        };
    }
    // Since our original codebase uses lib/storage and calculateBalances, and our DB holds real data,
    // let's fetch everything needed to run calculateBalances from the DB, or just use readData() for now
    // and filter it. The instructions say "computed from calculateBalances()".
    // Our DB and data.json are somewhat diverged if we rely strictly on data.json for calculateBalances.
    // Wait, the prompt says "computed from calculateBalances() for the currently recognized participant... across all groups".
    // Let's use `readData()` to get the groups/expenses/settlements/users since calculateBalances expects that structure.
    const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readData"])();
    let totalOwe = 0;
    let totalOwed = 0;
    const activeGroups = [];
    for (const p of participants){
        const group = data.groups.find((g)=>g.id === p.group_id);
        if (!group) continue;
        activeGroups.push({
            id: group.id,
            name: group.name,
            currency: group.currency,
            memberCount: group.members.length,
            participantName: p.name,
            participantId: p.id
        });
        const groupExpenses = data.expenses.filter((e)=>e.groupId === group.id);
        const groupSettlements = data.settlements.filter((s)=>s.groupId === group.id);
        // Use our existing logic
        const { balances } = await __turbopack_context__.A("[project]/lib/logic.ts [app-route] (ecmascript, async loader)").then((m)=>m.calculateBalances(group, groupExpenses, data.users, groupSettlements));
        // Find this participant's balance
        const myBalance = balances.find((b)=>b.userId === p.id);
        if (myBalance) {
            if (myBalance.amount < 0) {
                totalOwe += Math.abs(myBalance.amount);
            } else if (myBalance.amount > 0) {
                totalOwed += myBalance.amount;
            }
        }
    }
    return {
        groups: activeGroups,
        totalOwe,
        totalOwed
    };
}
async function addMember(groupId, formData) {
    const email = formData.get('email');
    if (!email) return;
    const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readData"])();
    const group = data.groups.find((g)=>g.id === groupId);
    if (!group) return;
    // Simple logic: If user exists, add ID. If not, create user.
    let user = data.users.find((u)=>u.email === email);
    if (!user) {
        user = {
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateId"])(),
            name: email.split('@')[0],
            email
        };
        data.users.push(user);
    }
    if (!group.members.includes(user.id)) {
        group.members.push(user.id);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["writeData"])(data);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["revalidatePath"])(`/groups/${groupId}`);
    }
}
async function createExpense(groupId, formData) {
    const description = formData.get('description');
    const amount = Number(formData.get('amount'));
    const paidBy = formData.get('paidBy');
    const splitTypeRaw = formData.get('splitType');
    const splitType = splitTypeRaw && [
        'EQUAL',
        'EXACT',
        'PERCENTAGE'
    ].includes(splitTypeRaw) ? splitTypeRaw : 'EQUAL';
    if (!description || !amount || !paidBy) return;
    // Get group participant IDs
    const { data: participantsRes } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('participants').select('id').eq('group_id', groupId);
    let participantIds = (participantsRes || []).map((p)=>p.id);
    // Fallback if participants table wasn't queried or empty
    if (participantIds.length === 0) {
        const membersJson = formData.get('membersJson');
        if (membersJson) {
            try {
                participantIds = JSON.parse(membersJson);
            } catch  {}
        }
        if (participantIds.length === 0) {
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["readData"])();
            const group = data.groups.find((g)=>g.id === groupId);
            participantIds = group?.members || [
                paidBy
            ];
        }
    }
    const expenseId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateId"])();
    const createdAt = new Date().toISOString();
    const { error: expenseErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('expenses').insert({
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
    let parsedSplits = {};
    const splitsJson = formData.get('splitsJson');
    if (splitsJson) {
        try {
            parsedSplits = JSON.parse(splitsJson);
        } catch  {}
    }
    const count = participantIds.length;
    const splitsToInsert = [];
    if (splitType === 'EQUAL') {
        const baseShare = Math.floor(amount * 100 / count) / 100;
        let remaining = Number(amount.toFixed(2));
        for(let i = 0; i < count; i++){
            const pid = participantIds[i];
            let share;
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
        for (const pid of participantIds){
            const valStr = formData.get(`split_${pid}`) || parsedSplits[pid] || '0';
            const share = Number(Number(valStr).toFixed(2)) || 0;
            splitsToInsert.push({
                expense_id: expenseId,
                participant_id: pid,
                amount: share
            });
        }
    } else if (splitType === 'PERCENTAGE') {
        for (const pid of participantIds){
            const valStr = formData.get(`split_${pid}`) || parsedSplits[pid] || '0';
            const pct = Number(valStr) || 0;
            const share = Number((amount * pct / 100).toFixed(2)) || 0;
            splitsToInsert.push({
                expense_id: expenseId,
                participant_id: pid,
                amount: share
            });
        }
    }
    if (splitsToInsert.length > 0) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('expense_splits').insert(splitsToInsert);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["revalidatePath"])(`/groups/${groupId}`);
}
async function settleUp(groupId, payloadOrFormData) {
    let fromParticipant;
    let toParticipant;
    let amount;
    let method = 'other';
    if (payloadOrFormData instanceof FormData) {
        fromParticipant = payloadOrFormData.get('fromParticipant');
        toParticipant = payloadOrFormData.get('toParticipant');
        amount = Number(payloadOrFormData.get('amount'));
        const m = payloadOrFormData.get('method');
        if (m && [
            'cash',
            'transfer',
            'other'
        ].includes(m)) method = m;
    } else {
        fromParticipant = payloadOrFormData.fromParticipant;
        toParticipant = payloadOrFormData.toParticipant;
        amount = Number(payloadOrFormData.amount);
        if (payloadOrFormData.method && [
            'cash',
            'transfer',
            'other'
        ].includes(payloadOrFormData.method)) {
            method = payloadOrFormData.method;
        }
    }
    if (!fromParticipant || !toParticipant || !amount || amount <= 0) return;
    const settlementId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateId"])();
    const createdAt = new Date().toISOString();
    const { error: insertErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('settlements').insert({
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["revalidatePath"])(`/groups/${groupId}`);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["revalidatePath"])('/');
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    createGroup,
    joinGroup,
    verifySession,
    getDashboardData,
    addMember,
    createExpense,
    settleUp
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(createGroup, "407d5ec04db8a8a486e20c14c9695c0ab7253bc893", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(joinGroup, "403c76abb0b0909a0cec80f72efe89fb5754ec0301", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(verifySession, "6006b3fa0d4feb6de874fbac4a3bb5e7f3d7e10278", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(getDashboardData, "40a4110c77a87fc11967998d5663aa5f6f06cf1913", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(addMember, "601e3b70f23f4abd0e954a6cdce2c18d0712c98ccf", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(createExpense, "60db5038172c18083fea9d65b065b42518a3401642", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(settleUp, "60e98734fc70d1ff386b379ee56d1bfe9efd9240c7", null);
}),
"[project]/app/api/test_identity/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-route] (ecmascript)");
;
;
;
async function POST(req) {
    try {
        const body = await req.json();
        const { action, payload } = body;
        switch(action){
            case 'create_group':
                {
                    const { name, currency } = payload;
                    // create group directly to get a join code for testing
                    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('groups').insert({
                        name,
                        currency,
                        join_code: joinCode
                    }).select('id, join_code').single();
                    if (error) throw error;
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        success: true,
                        data
                    });
                }
            case 'join_group':
                {
                    const { joinCode, name } = payload;
                    const formData = new FormData();
                    formData.append('joinCode', joinCode);
                    formData.append('name', name);
                    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["joinGroup"])(formData);
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(res);
                }
            case 'verify_session':
                {
                    const { groupId, sessionToken } = payload;
                    const isValid = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifySession"])(groupId, sessionToken);
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        isValid
                    });
                }
            case 'get_dashboard':
                {
                    const { sessionTokens } = payload;
                    const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDashboardData"])(sessionTokens);
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        data
                    });
                }
            case 'add_expense':
                {
                    // To test shared expense, we need to add an expense using supabase directly 
                    // since addExpense uses FormData which might be tricky to test with nested split logic.
                    const { groupId, description, amount, paidBy, category, splitType, splits } = payload;
                    // Add expense
                    const { data: expense, error: expErr } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('expenses').insert({
                        group_id: groupId,
                        description,
                        amount,
                        paid_by: paidBy,
                        category,
                        split_type: splitType
                    }).select('id').single();
                    if (expErr) throw expErr;
                    // Add splits
                    for (const split of splits){
                        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('expense_splits').insert({
                            expense_id: expense.id,
                            participant_id: split.participantId,
                            amount: split.amount
                        });
                    }
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        success: true,
                        expenseId: expense.id
                    });
                }
            case 'cleanup':
                {
                    const { groupId } = payload;
                    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('groups').delete().eq('id', groupId);
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        success: true
                    });
                }
            default:
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'Unknown action'
                }, {
                    status: 400
                });
        }
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: e.message || String(e)
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__80d7d6f6._.js.map