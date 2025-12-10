import React, { useState } from 'react';
import { useApp } from '../context/AppProvider';
import { Card, Input } from '../components/ui';
import { CheckCircle2, FileText, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const HistoryPage: React.FC = () => {
    const { expenses, getRoomieName } = useApp();
    const [search, setSearch] = useState('');
    const [selectedSettlement, setSelectedSettlement] = useState<any>(null);

    const settlements = expenses
        .filter(e => e.type === 'settlement')
        .filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || getRoomieName(e.payerId).toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">History</h2>
                <p className="text-gray-500">Past settlements and payments.</p>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input
                    placeholder="Search payments..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="space-y-3">
                {settlements.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p>No matching history found.</p>
                    </div>
                ) : (
                    settlements.map(settlement => (
                        <div
                            key={settlement.id}
                            onClick={() => setSelectedSettlement(settlement)}
                            className="cursor-pointer transition-transform active:scale-[0.99]"
                        >
                            <Card className="p-4 flex flex-col gap-3 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{settlement.title}</h4>
                                        <p className="text-xs text-gray-500">{new Date(settlement.date).toLocaleDateString()} • {new Date(settlement.date).toLocaleTimeString()}</p>
                                    </div>
                                    <div className="font-bold text-gray-900">
                                        ${settlement.amount.toFixed(2)}
                                    </div>
                                </div>

                                {settlement.receiptUrl && (
                                    <div className="bg-white rounded-lg p-2 flex items-center gap-2 border border-gray-100 text-xs text-gray-500">
                                        <FileText size={14} />
                                        <span>Voucher attached</span>
                                    </div>
                                )}
                            </Card>
                        </div>
                    ))
                )}
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedSettlement && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedSettlement(null)}>
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-6 max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Payment Details</h3>
                                    <p className="text-sm text-gray-500">{new Date(selectedSettlement.date).toLocaleString()}</p>
                                </div>
                                <button onClick={() => setSelectedSettlement(null)} className="p-1 bg-gray-100 rounded-full text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Amount</span>
                                        <span className="font-bold text-gray-900 text-lg">${selectedSettlement.amount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">From</span>
                                        <span className="font-medium text-gray-900">{getRoomieName(selectedSettlement.payerId)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">To</span>
                                        <span className="font-medium text-gray-900">{getRoomieName(selectedSettlement.splits[0].roomieId)}</span>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Voucher</h4>
                                    {selectedSettlement.receiptUrl ? (
                                        <div className="rounded-xl overflow-hidden border border-gray-200">
                                            <img src={selectedSettlement.receiptUrl} alt="Voucher" className="w-full h-auto" />
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-gray-400 text-sm">
                                            No voucher attached
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
