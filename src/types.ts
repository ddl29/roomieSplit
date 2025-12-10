export interface Roomie {
    id: string;
    name: string;
    color: string; // Hex color
    avatar?: string; // URL or placeholder
}

export interface Split {
    roomieId: string;
    amount: number;
    percentage: number; // 0-100
}

export interface Expense {
    id: string;
    title: string;
    amount: number;
    description: string;
    payerId: string;
    date: string;
    splits: Split[];
    receiptUrl?: string;
    type: 'expense' | 'settlement';
}

export interface Debt {
    fromId: string;
    toId: string;
    amount: number;
}
