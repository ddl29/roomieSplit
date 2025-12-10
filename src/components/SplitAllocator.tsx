import React, { useEffect, useState } from 'react';
import { Roomie, Split } from '../types';
import { Trash2 } from 'lucide-react';
import clsx from 'clsx';

interface SplitAllocatorProps {
    roomies: Roomie[];
    totalAmount: number;
    splits: Split[];
    onChange: (splits: Split[]) => void;
}

export const SplitAllocator: React.FC<SplitAllocatorProps> = ({ roomies, totalAmount, splits, onChange }) => {
    // Track which roomies are included in the split
    // We use a local state for this to allow removing people
    const [activeRoomieIds, setActiveRoomieIds] = useState<string[]>([]);

    // Track which inputs are "locked" (user manually edited them)
    const [lockedIds, setLockedIds] = useState<Set<string>>(new Set());

    // Local state for inputs to allow free typing without immediate re-calc
    const [inputValues, setInputValues] = useState<Record<string, string>>({});

    // Initialize active roomies
    useEffect(() => {
        if (activeRoomieIds.length === 0 && roomies.length > 0) {
            setActiveRoomieIds(roomies.map(r => r.id));
        }
    }, [roomies.length]);

    // Initialize splits when active roomies change or total amount changes
    // But ONLY if we haven't set them up yet or if the structure changes significantly
    useEffect(() => {
        if (activeRoomieIds.length === 0) return;

        // If splits don't match active roomies, re-initialize
        const currentSplitIds = splits.map(s => s.roomieId).sort().join(',');
        const activeIdsStr = [...activeRoomieIds].sort().join(',');

        if (currentSplitIds !== activeIdsStr) {
            distributeEvenly(activeRoomieIds);
        }
    }, [activeRoomieIds, totalAmount]);

    // Sync input values from splits when splits change externally (e.g. total amount change)
    useEffect(() => {
        const newInputs: Record<string, string> = {};
        splits.forEach(s => {
            // Only update input if it's not currently focused? 
            // Actually, we want to update it if the calculated value changed.
            // But we store strings in inputValues.
            newInputs[s.roomieId] = s.percentage.toString();
        });
        setInputValues(newInputs);
    }, [splits]);


    const distributeEvenly = (ids: string[]) => {
        if (ids.length === 0) {
            onChange([]);
            return;
        }
        const evenSplit = 100 / ids.length;
        const newSplits = ids.map(id => ({
            roomieId: id,
            percentage: Number(evenSplit.toFixed(2)),
            amount: Number((totalAmount * evenSplit / 100).toFixed(2))
        }));
        onChange(newSplits);
        setLockedIds(new Set()); // Reset locks on full redistribute
    };

    const handleRemove = (id: string) => {
        const newActive = activeRoomieIds.filter(rid => rid !== id);
        setActiveRoomieIds(newActive);
        // Effect will trigger redistribute
    };

    const handlePercentageChange = (id: string, value: string) => {
        // Allow empty string or numbers
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setInputValues(prev => ({ ...prev, [id]: value }));
        }
    };

    const handleBlur = (id: string) => {
        let val = parseFloat(inputValues[id]);
        if (isNaN(val)) val = 0;
        if (val > 100) val = 100;
        if (val < 0) val = 0;

        // Update this specific split
        const newLocked = new Set(lockedIds);
        newLocked.add(id);
        setLockedIds(newLocked);

        recalculateSplits(id, val, newLocked);
    };

    const recalculateSplits = (changedId: string, newVal: number, locks: Set<string>) => {
        const otherIds = activeRoomieIds.filter(rid => rid !== changedId);

        // Calculate remaining percentage to distribute
        let remaining = 100 - newVal;

        // Check locked sums
        let lockedSum = 0;
        const lockedOthers = otherIds.filter(rid => locks.has(rid));
        const unlockedOthers = otherIds.filter(rid => !locks.has(rid));

        lockedOthers.forEach(rid => {
            const split = splits.find(s => s.roomieId === rid);
            if (split) lockedSum += split.percentage;
        });

        // If we don't have enough space because of locks
        if (remaining < lockedSum) {
            // This is a conflict. For simplicity, we might have to unlock others or clamp the new value.
            // Let's clamp the new value to max available.
            const maxAvailable = 100 - lockedSum;
            newVal = maxAvailable;
            remaining = lockedSum; // The rest is exactly what's locked
            // But wait, if unlockedOthers exist, they get 0.
        } else {
            remaining -= lockedSum;
        }

        // Distribute remaining among unlocked
        const share = unlockedOthers.length > 0 ? remaining / unlockedOthers.length : 0;

        const newSplits = activeRoomieIds.map(rid => {
            let pct = 0;
            if (rid === changedId) {
                pct = newVal;
            } else if (locks.has(rid)) {
                const split = splits.find(s => s.roomieId === rid);
                pct = split ? split.percentage : 0;
            } else {
                pct = share;
            }

            return {
                roomieId: rid,
                percentage: Number(pct.toFixed(2)),
                amount: Number((totalAmount * pct / 100).toFixed(2))
            };
        });

        onChange(newSplits);
    };

    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 ml-1">Split Details</label>
            <div className="space-y-2">
                {activeRoomieIds.map(id => {
                    const roomie = roomies.find(r => r.id === id);
                    if (!roomie) return null;

                    const split = splits.find(s => s.roomieId === id);
                    const amount = split ? split.amount : 0;
                    const isLocked = lockedIds.has(id);

                    return (
                        <div key={id} className={clsx(
                            "flex items-center gap-3 p-3 rounded-xl border shadow-sm transition-colors",
                            isLocked ? "bg-yellow-50 border-yellow-200" : "bg-white border-gray-100"
                        )}>
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                style={{ backgroundColor: roomie.color }}
                            >
                                {roomie.name.charAt(0)}
                            </div>
                            <div className="flex-1 font-medium text-sm">{roomie.name}</div>

                            <div className="flex items-center gap-2">
                                <div className="relative w-20">
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={inputValues[id] ?? ''}
                                        onChange={(e) => handlePercentageChange(id, e.target.value)}
                                        onBlur={() => handleBlur(id)}
                                        className={clsx(
                                            "w-full pl-2 pr-6 py-1.5 text-right rounded-lg border text-sm outline-none transition-all",
                                            isLocked ? "bg-white border-yellow-300 focus:ring-2 focus:ring-yellow-200" : "border-gray-200 focus:ring-2 focus:ring-primary-200"
                                        )}
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                </div>
                                <div className="w-20 text-right font-semibold text-gray-900 text-sm">
                                    ${amount.toFixed(2)}
                                </div>
                                {activeRoomieIds.length > 1 && (
                                    <button
                                        onClick={() => handleRemove(id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {activeRoomieIds.length < roomies.length && (
                <button
                    type="button"
                    onClick={() => {
                        // Add back the first missing one
                        const missing = roomies.find(r => !activeRoomieIds.includes(r.id));
                        if (missing) {
                            setActiveRoomieIds([...activeRoomieIds, missing.id]);
                        }
                    }}
                    className="text-sm text-primary-600 font-medium hover:underline ml-1"
                >
                    + Add person back
                </button>
            )}
        </div>
    );
};
