import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppProvider';
import { Button, Input, Card } from '../components/ui';
import { SplitAllocator } from '../components/SplitAllocator';
import { Split } from '../types';
import { Camera, Upload, AlertTriangle } from 'lucide-react';
import { UserSelect } from '../components/UserSelect';

export const AddExpensePage: React.FC = () => {
    const navigate = useNavigate();
    const { roomies, addExpense } = useApp();

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState<string>('');
    const [description, setDescription] = useState('');
    const [payerId, setPayerId] = useState(roomies[0]?.id || '');
    const [splits, setSplits] = useState<Split[]>([]);
    const [receipt, setReceipt] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !amount || !payerId) return;

        const numAmount = parseFloat(amount);

        addExpense({
            title,
            amount: numAmount,
            description,
            payerId,
            splits,
            receiptUrl: receipt ? URL.createObjectURL(receipt) : undefined // Simple local URL for demo
        });

        navigate('/');
    };

    if (roomies.length < 2) {
        return (
            <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mx-auto">
                    <AlertTriangle size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">No Roomies Yet</h2>
                <p className="text-gray-500 max-w-xs mx-auto">You need to add at least one roomie before you can add expenses.</p>
                <Button onClick={() => navigate('/roomies')}>Go to Roomies</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Add Expense</h2>
                <p className="text-gray-500">Record a new shared payment.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="space-y-4">
                    <Input
                        label="What was it for?"
                        placeholder="e.g. Groceries, Rent"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />

                    <Input
                        label="Amount"
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        required
                        step="0.01"
                        className="text-lg font-semibold"
                    />

                    <UserSelect
                        label="Paid by"
                        roomies={roomies}
                        value={payerId}
                        onChange={setPayerId}
                    />

                    <Input
                        label="Description (Optional)"
                        placeholder="More details..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700 ml-1">Receipt</label>
                        <div className="flex gap-2">
                            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 cursor-pointer hover:border-primary-400 hover:text-primary-600 transition-colors">
                                <Camera size={20} />
                                <span>Take Photo</span>
                                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => setReceipt(e.target.files?.[0] || null)} />
                            </label>
                            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 cursor-pointer hover:border-primary-400 hover:text-primary-600 transition-colors">
                                <Upload size={20} />
                                <span>Upload</span>
                                <input type="file" accept="image/*" className="hidden" onChange={e => setReceipt(e.target.files?.[0] || null)} />
                            </label>
                        </div>
                        {receipt && <p className="text-xs text-green-600 mt-1">Receipt attached: {receipt.name}</p>}
                    </div>
                </Card>

                <SplitAllocator
                    roomies={roomies}
                    totalAmount={parseFloat(amount) || 0}
                    splits={splits}
                    onChange={setSplits}
                />

                <Button type="submit" className="w-full text-lg py-4 shadow-xl shadow-primary-500/20">
                    Save Expense
                </Button>
            </form>
        </div>
    );
};
