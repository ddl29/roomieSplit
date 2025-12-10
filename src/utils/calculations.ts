import { Debt, Expense, Roomie } from '../types';

export const calculateBalances = (roomies: Roomie[], expenses: Expense[]): Record<string, number> => {
    const balances: Record<string, number> = {};

    roomies.forEach(r => balances[r.id] = 0);

    expenses.forEach(expense => {
        const payerId = expense.payerId;
        const amount = expense.amount;

        // Payer paid the full amount, so they are "owed" this amount initially
        if (balances[payerId] !== undefined) {
            balances[payerId] += amount;
        }

        // Subtract the split amount from each person involved
        expense.splits.forEach(split => {
            if (balances[split.roomieId] !== undefined) {
                balances[split.roomieId] -= split.amount;
            }
        });
    });

    return balances;
};

export const simplifyDebts = (balances: Record<string, number>): Debt[] => {
    const debtors: { id: string; amount: number }[] = [];
    const creditors: { id: string; amount: number }[] = [];

    Object.entries(balances).forEach(([id, amount]) => {
        // Round to 2 decimal places to avoid floating point errors
        const val = Math.round(amount * 100) / 100;
        if (val < -0.01) debtors.push({ id, amount: -val }); // Store positive debt amount
        if (val > 0.01) creditors.push({ id, amount: val });
    });

    // Sort by amount (descending) to optimize matching
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const debts: Debt[] = [];
    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        const amount = Math.min(debtor.amount, creditor.amount);

        if (amount > 0) {
            debts.push({
                fromId: debtor.id,
                toId: creditor.id,
                amount: Math.round(amount * 100) / 100
            });
        }

        debtor.amount -= amount;
        creditor.amount -= amount;

        if (debtor.amount < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    return debts;
};
