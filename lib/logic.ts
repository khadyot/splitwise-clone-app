import { Group, Expense, User, Settlement } from "./storage";

export interface Balance {
    userId: string;
    amount: number; // Positive = owed to them, Negative = they owe
}

export interface Debt {
    from: string;
    to: string;
    amount: number;
    text: string;
}

export function calculateBalances(
    group: Group,
    expenses: Expense[],
    users: User[],
    settlements: Settlement[] = []
): { balances: Balance[]; debts: Debt[] } {
    const memberIds = group.members;
    if (memberIds.length === 0) return { balances: [], debts: [] };

    const balances: Record<string, number> = {};
    memberIds.forEach((id) => (balances[id] = 0));

    expenses.forEach((expense) => {
        // Credit the single payer (`paidBy` participant ID)
        const payerId = typeof expense.paidBy === 'string' ? expense.paidBy : (expense.paidBy as any)?.[0]?.userId;
        if (payerId && balances[payerId] !== undefined) {
            balances[payerId] += expense.amount;
        }

        // Debit each participant's share exclusively from expense_splits (`expense.splits`)
        if (expense.splits && expense.splits.length > 0) {
            expense.splits.forEach((split) => {
                if (balances[split.userId] !== undefined) {
                    balances[split.userId] -= split.amount;
                }
            });
        }
    });

    settlements.forEach((settlement) => {
        if (balances[settlement.fromParticipant] !== undefined) {
            balances[settlement.fromParticipant] += settlement.amount;
        }
        if (balances[settlement.toParticipant] !== undefined) {
            balances[settlement.toParticipant] -= settlement.amount;
        }
    });

    const netBalances = Object.entries(balances)
        .map(([userId, amount]) => ({ userId, amount: Number(amount.toFixed(2)) }))
        .sort((a, b) => b.amount - a.amount);

    // Simplify debts (who owes whom) using copies so returned netBalances remain intact
    const debts: Debt[] = [];
    const workingBalances = netBalances.map(b => ({ ...b }));
    const debtors = workingBalances.filter((b) => b.amount < -0.01);
    const creditors = workingBalances.filter((b) => b.amount > 0.01);

    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        const amount = Number(Math.min(Math.abs(debtor.amount), creditor.amount).toFixed(2));

        // Find user names
        const debtorName = users.find(u => u.id === debtor.userId)?.name || 'Unknown';
        const creditorName = users.find(u => u.id === creditor.userId)?.name || 'Unknown';

        debts.push({
            from: debtor.userId,
            to: creditor.userId,
            amount,
            text: `${debtorName} owes ${creditorName} $${amount.toFixed(2)}`
        });

        debtor.amount += amount;
        creditor.amount -= amount;

        if (Math.abs(debtor.amount) < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return { balances: netBalances, debts };
}
