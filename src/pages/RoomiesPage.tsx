import React, { useState } from 'react';
import { useApp } from '../context/AppProvider';
import { Button, Input, Card } from '../components/ui';
import { UserPlus, Trash2, AlertCircle, Edit2, X, Check } from 'lucide-react';
import clsx from 'clsx';

const COLORS = [
    '#0ea5e9', // Sky
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#f43f5e', // Rose
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#6366f1', // Indigo
    '#84cc16', // Lime
];

export const RoomiesPage: React.FC = () => {
    const { roomies, addRoomie, updateRoomie, deleteRoomie, balances } = useApp();
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            if (editingId) {
                updateRoomie(editingId, name.trim(), selectedColor);
                setEditingId(null);
            } else {
                addRoomie(name.trim(), selectedColor);
            }
            setName('');
            setSelectedColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
        }
    };

    const handleEdit = (roomie: any) => {
        setEditingId(roomie.id);
        setName(roomie.name);
        setSelectedColor(roomie.color);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setName('');
        setSelectedColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this roomie?')) {
            const result = deleteRoomie(id);
            if (!result.success) {
                setError(result.error || 'Failed to delete');
                setTimeout(() => setError(null), 3000);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Roomies</h2>
                <p className="text-gray-500">Manage who you split expenses with.</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm font-medium animate-pulse">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <Card>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder={editingId ? "Edit name..." : "Enter name..."}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="flex-1"
                        />
                        {editingId ? (
                            <>
                                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                                    <X size={20} />
                                </Button>
                                <Button type="submit" disabled={!name.trim()} className="bg-green-600 hover:bg-green-700">
                                    <Check size={20} />
                                </Button>
                            </>
                        ) : (
                            <Button type="submit" disabled={!name.trim()}>
                                <UserPlus size={20} />
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 px-1 pt-1">
                        {COLORS.map(color => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setSelectedColor(color)}
                                className={clsx(
                                    "w-8 h-8 rounded-full border-2 transition-all flex-shrink-0",
                                    selectedColor === color ? "border-gray-900 scale-110 ring-2 ring-offset-2 ring-gray-200" : "border-transparent hover:scale-105"
                                )}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </form>
            </Card>

            <div className="grid gap-3">
                {roomies.map((roomie) => (
                    <Card key={roomie.id} className={clsx("flex items-center justify-between py-3 transition-colors", editingId === roomie.id && "ring-2 ring-primary-500 bg-primary-50")}>
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0"
                                style={{ backgroundColor: roomie.color }}
                            >
                                {roomie.avatar && !roomie.avatar.includes('ui-avatars') ? (
                                    <img src={roomie.avatar} alt={roomie.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    roomie.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <div className="font-medium text-gray-900">{roomie.name}</div>
                                <div className={clsx("text-xs font-medium", balances[roomie.id] > 0 ? "text-green-600" : balances[roomie.id] < 0 ? "text-red-500" : "text-gray-400")}>
                                    {balances[roomie.id] > 0 ? `Owed $${balances[roomie.id].toFixed(2)}` : balances[roomie.id] < 0 ? `Owes $${Math.abs(balances[roomie.id]).toFixed(2)}` : 'Settled'}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-1">
                            <button
                                onClick={() => handleEdit(roomie)}
                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            >
                                <Edit2 size={18} />
                            </button>
                            {roomie.id !== '1' && (
                                <button
                                    onClick={() => handleDelete(roomie.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
