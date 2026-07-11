import assert from 'assert';

async function runTest() {
    console.log("Starting Identity System Integration Test...");
    const API_URL = 'http://localhost:3000/api/test_identity';

    const sendRequest = async (action: string, payload: any) => {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, payload })
        });
        const json = await res.json();
        if (json.error) {
            console.error(`API Error on ${action}:`, json.error);
        }
        return json;
    };

    let groupId = '';

    try {
        console.log("\\n1. Creating test group...");
        const groupRes = await sendRequest('create_group', { name: 'Test Trip', currency: 'USD' });
        assert(groupRes.success, "Group creation failed");
        groupId = groupRes.data.id;
        const joinCode = groupRes.data.join_code;
        console.log(`✓ Group created. ID: ${groupId}, Code: ${joinCode}`);

        console.log("\\n2. Participant A (Alice) joins...");
        const joinA = await sendRequest('join_group', { joinCode, name: 'Alice' });
        assert(joinA.success, "Alice failed to join");
        const tokenA = joinA.sessionToken;
        assert(tokenA, "No session token returned for Alice");
        console.log(`✓ Alice joined. Session Token: ${tokenA}`);

        console.log("\\n3. Participant B (Bob) joins the same group...");
        const joinB = await sendRequest('join_group', { joinCode, name: 'Bob' });
        assert(joinB.success, "Bob failed to join");
        const tokenB = joinB.sessionToken;
        assert(tokenB, "No session token returned for Bob");
        console.log(`✓ Bob joined. Session Token: ${tokenB}`);

        assert(tokenA !== tokenB, "CRITICAL ERROR: Alice and Bob received the same session token!");
        console.log(`✓ Verified tokens are distinct.`);

        console.log("\\n4. Verifying valid & invalid tokens via verifySession...");
        const verifyA = await sendRequest('verify_session', { groupId, sessionToken: tokenA });
        assert(verifyA.isValid, "Alice's valid token was rejected!");
        const verifyFake = await sendRequest('verify_session', { groupId, sessionToken: '00000000-0000-0000-0000-000000000000' });
        assert(!verifyFake.isValid, "Fake token was accepted!");
        console.log(`✓ Token validation works properly.`);

        console.log("\\n5. Adding a shared expense (Alice pays $100 for Alice and Bob)...");
        // We need to fetch participants to get their IDs. We can do it by using getDashboardData!
        const dashAInitial = await sendRequest('get_dashboard', { sessionTokens: [tokenA] });
        const aliceId = dashAInitial.data.groups[0].participantId;
        const dashBInitial = await sendRequest('get_dashboard', { sessionTokens: [tokenB] });
        const bobId = dashBInitial.data.groups[0].participantId;

        await sendRequest('add_expense', {
            groupId,
            description: 'Dinner',
            amount: 100,
            paidBy: aliceId,
            category: 'general',
            splitType: 'EQUAL',
            splits: [
                { participantId: aliceId, amount: 50 },
                { participantId: bobId, amount: 50 }
            ]
        });
        console.log(`✓ Expense added.`);

        console.log("\\n6. Verifying dashboard isolation...");
        const dashA = await sendRequest('get_dashboard', { sessionTokens: [tokenA] });
        const dashB = await sendRequest('get_dashboard', { sessionTokens: [tokenB] });
        
        console.log(`Alice Dashboard: Owe=${dashA.data.totalOwe}, Owed=${dashA.data.totalOwed}`);
        console.log(`Bob Dashboard: Owe=${dashB.data.totalOwe}, Owed=${dashB.data.totalOwed}`);

        assert(dashA.data.totalOwed === 50, "Alice should be owed $50");
        assert(dashA.data.totalOwe === 0, "Alice should owe $0");
        
        assert(dashB.data.totalOwe === 50, "Bob should owe $50");
        assert(dashB.data.totalOwed === 0, "Bob should be owed $0");
        console.log(`✓ Data isolation and shared expense visibility verified successfully!`);

        console.log("\\n✅ All integration tests passed successfully.");

    } catch (e: any) {
        console.error("\\n❌ Test failed:", e.message);
        process.exit(1);
    } finally {
        if (groupId) {
            console.log(`\\nCleaning up test group ${groupId}...`);
            await sendRequest('cleanup', { groupId });
        }
    }
}

runTest();
