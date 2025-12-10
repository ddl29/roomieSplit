import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Roomie, Expense, Debt } from '../types';
import { calculateBalances, simplifyDebts } from '../utils/calculations';
import { v4 as uuidv4 } from 'uuid';

interface AppContextType {
    roomies: Roomie[];
    expenses: Expense[];
    addRoomie: (name: string, color: string) => void;
    updateRoomie: (id: string, name: string, color: string) => void;
    deleteRoomie: (id: string) => { success: boolean; error?: string };
    addExpense: (expense: Omit<Expense, 'id' | 'date' | 'type'>) => void;
    deleteExpense: (id: string) => void;
    settleDebt: (fromId: string, toId: string, amount: number, voucherUrl?: string) => void;
    balances: Record<string, number>;
    simplifiedDebts: Debt[];
    getRoomieName: (id: string) => string;
    getRoomieColor: (id: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initial dummy data for testing/demo
    const [roomies, setRoomies] = useState<Roomie[]>([
        { id: '1', name: 'Me', color: '#0ea5e9' }, // Default user
    ]);

    const [expenses, setExpenses] = useState<Expense[]>([]);

    const addRoomie = (name: string, color: string) => {
        const newRoomie: Roomie = {
            id: uuidv4(),
            name,
            color,
            avatar: `https://ui-avatars.com/api/?name=${name}&background=${color.replace('#', '')}&color=fff`
        };
        setRoomies([...roomies, newRoomie]);
    };

    const updateRoomie = (id: string, name: string, color: string) => {
        setRoomies(roomies.map(r => r.id === id ? { ...r, name, color, avatar: `https://ui-avatars.com/api/?name=${name}&background=${color.replace('#', '')}&color=fff` } : r));
    };

    const deleteRoomie = (id: string) => {
        const balance = balances[id] || 0;
        if (Math.abs(balance) > 0.01) {
            return { success: false, error: 'Cannot delete roomie with non-zero balance. Please settle debts first.' };
        }

        // Check if involved in any expenses (even if balance is zero, might be good to keep history, but for now just check balance)
        // Actually, if we delete the roomie, we might break historical expenses display.
        // For this simple app, we will allow deletion if balance is 0, but ideally we should soft-delete.
        // Let's just remove them from the list.
        setRoomies(roomies.filter(r => r.id !== id));
        return { success: true };
    };

    const addExpense = (expenseData: Omit<Expense, 'id' | 'date' | 'type'>) => {
        const newExpense: Expense = {
            ...expenseData,
            id: uuidv4(),
            date: new Date().toISOString(),
            type: 'expense'
        };
        setExpenses([...expenses, newExpense]);
    };

    const deleteExpense = (id: string) => {
        setExpenses(expenses.filter(e => e.id !== id));
    };

    // Settle debt is essentially adding a payment expense
    const settleDebt = (fromId: string, toId: string, amount: number, voucherUrl?: string) => {
        const payerName = getRoomieName(fromId);
        const receiverName = getRoomieName(toId);

        const paymentExpense: Expense = {
            id: uuidv4(),
            title: `Payment: ${payerName} -> ${receiverName}`,
            amount: amount,
            description: 'Debt settlement',
            payerId: fromId,
            date: new Date().toISOString(),
            type: 'settlement',
            receiptUrl: voucherUrl,
            splits: [
                {
                    roomieId: toId,
                    amount: amount,
                    percentage: 100
                }
            ]
        };
        setExpenses([...expenses, paymentExpense]);
    };

    const getRoomieName = (id: string) => roomies.find(r => r.id === id)?.name || 'Unknown';
    const getRoomieColor = (id: string) => roomies.find(r => r.id === id)?.color || '#9ca3af';

    const balances = calculateBalances(roomies, expenses);
    const simplifiedDebts = simplifyDebts(balances);

    return (
        <AppContext.Provider value={{
            roomies,
            expenses,
            addRoomie,
            updateRoomie,
            deleteRoomie,
            addExpense,
            deleteExpense,
            settleDebt,
            balances,
            simplifiedDebts,
            getRoomieName,
            getRoomieColor
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
