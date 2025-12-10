import React, { useState } from 'react';
import { useApp } from '../context/AppProvider';
import { Card, Input } from '../components/ui';
import { ArrowRight, Receipt, Search } from 'lucide-react';
import clsx from 'clsx';

export const DashboardPage: React.FC = () => {
    const { expenses, balances, simplifiedDebts, getRoomieName, roomies } = useApp();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'expense' | 'settlement'>('all');

    const totalExpenses = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const myId = roomies[0]?.id;
    const myBalance = balances[myId] || 0;

    const filteredActivity = expenses
        .filter(e => {
            if (filter === 'all') return true;
            return e.type === filter;
        })
        .filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || getRoomieName(e.payerId).toLowerCase().includes(search.toLowerCase()))
        .slice().reverse();

    const currentDate = new Date();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary-600 to-secondary-700 rounded-3xl p-6 text-white shadow-xl shadow-primary-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10 blur-xl"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-white/90">My Household</h2>
                            <p className="text-sm text-primary-200">{monthName} {year}</p>
                        </div>
                    </div>

                    <p className="text-primary-100 font-medium mb-1">Total Expenses</p>
                    <h1 className="text-4xl font-bold mb-6">${totalExpenses.toFixed(2)}</h1>

                    <div className="flex gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex-1 border border-white/10">
                            <p className="text-xs text-primary-100 mb-1">Your Balance</p>
                            <p className={clsx("text-xl font-bold", myBalance >= 0 ? "text-emerald-300" : "text-red-300")}>
                                {myBalance >= 0 ? '+' : ''}{myBalance.toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex-1 border border-white/10">
                            <p className="text-xs text-primary-100 mb-1">Active Debts</p>
                            <p className="text-xl font-bold">{simplifiedDebts.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simplified Debts */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 px-1">Who owes who?</h3>
                {simplifiedDebts.length === 0 ? (
                    <Card className="text-center py-8 text-gray-400">
                        <p>All settled up! No debts.</p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {simplifiedDebts.map((debt, idx) => (
                            <Card key={idx} className="flex items-center justify-between p-4 border-l-4 border-l-secondary-500">
                                <div className="flex items-center gap-3">
                                    <div className="font-medium text-gray-600">{getRoomieName(debt.fromId)}</div>
                                    <ArrowRight size={16} className="text-gray-300" />
                                    <div className="font-medium text-gray-900">{getRoomieName(debt.toId)}</div>
                                </div>
                                <div className="font-bold text-secondary-600 bg-secondary-50 px-3 py-1 rounded-full text-sm">
                                    ${debt.amount.toFixed(2)}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Activity */}
            <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                </div>

                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                    <button
                        onClick={() => setFilter('all')}
                        className={clsx("px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap", filter === 'all' ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('expense')}
                        className={clsx("px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap", filter === 'expense' ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
                    >
                        Expenses
                    </button>
                    <button
                        onClick={() => setFilter('settlement')}
                        className={clsx("px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap", filter === 'settlement' ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
                    >
                        Payments
                    </button>
                </div>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10 py-2 text-sm"
                    />
                </div>

                <div className="space-y-3">
                    {filteredActivity.map(expense => (
                        <Card key={expense.id} className="flex items-center gap-4 py-3">
                            <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center", expense.type === 'settlement' ? "bg-green-100 text-green-600" : "bg-primary-50 text-primary-600")}>
                                <Receipt size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">{expense.title}</h4>
                                <p className="text-xs text-gray-500">{getRoomieName(expense.payerId)} paid ${expense.amount.toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                                <span className={clsx("font-bold text-sm", expense.type === 'settlement' ? "text-green-600" : "text-gray-900")}>
                                    ${expense.amount.toFixed(2)}
                                </span>
                            </div>
                        </Card>
                    ))}
                    {filteredActivity.length === 0 && (
                        <p className="text-center text-gray-400 py-4 text-sm">No activity found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
