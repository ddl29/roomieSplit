import React, { useState, useRef, useEffect } from 'react';
import { Roomie } from '../types';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface UserSelectProps {
    roomies: Roomie[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
}

export const UserSelect: React.FC<UserSelectProps> = ({ roomies, value, onChange, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedRoomie = roomies.find(r => r.id === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col gap-1.5" ref={containerRef}>
            {label && <label className="text-sm font-medium text-gray-700 ml-1">{label}</label>}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-500 outline-none flex items-center justify-between transition-all"
                >
                    {selectedRoomie ? (
                        <div className="flex items-center gap-3">
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ backgroundColor: selectedRoomie.color }}
                            >
                                {selectedRoomie.name.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-900">{selectedRoomie.name}</span>
                        </div>
                    ) : (
                        <span className="text-gray-400">Select...</span>
                    )}
                    <ChevronDown size={20} className={clsx("text-gray-400 transition-transform", isOpen && "rotate-180")} />
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden max-h-60 overflow-y-auto">
                        {roomies.map(roomie => (
                            <button
                                key={roomie.id}
                                type="button"
                                onClick={() => {
                                    onChange(roomie.id);
                                    setIsOpen(false);
                                }}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                            >
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                    style={{ backgroundColor: roomie.color }}
                                >
                                    {roomie.name.charAt(0)}
                                </div>
                                <span className="font-medium text-gray-900">{roomie.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
