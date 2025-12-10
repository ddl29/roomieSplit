import React, { useState } from 'react';
import { useApp } from '../context/AppProvider';
import { Button, Card } from '../components/ui';
import { Check, X, ArrowRight, PartyPopper, Camera, Upload, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SettleUpPage: React.FC = () => {
    const { simplifiedDebts, settleDebt, getRoomieName } = useApp();
    const [currentStep, setCurrentStep] = useState(0);
    const [voucher, setVoucher] = useState<File | null>(null);
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const [showNoVoucherConfirm, setShowNoVoucherConfirm] = useState(false);

    const currentDebt = simplifiedDebts[currentStep];

    const handlePaidClick = () => {
        setShowVoucherModal(true);
    };

    const handleConfirmWithVoucher = () => {
        if (currentDebt && voucher) {
            settleDebt(currentDebt.fromId, currentDebt.toId, currentDebt.amount, URL.createObjectURL(voucher));
            resetState();
        }
    };

    const handleConfirmWithoutVoucher = () => {
        if (currentDebt) {
            settleDebt(currentDebt.fromId, currentDebt.toId, currentDebt.amount);
            resetState();
        }
    };

    const resetState = () => {
        setVoucher(null);
        setShowVoucherModal(false);
        setShowNoVoucherConfirm(false);
        setCurrentStep(0);
    };

    const handleSkip = () => {
        if (currentStep < simplifiedDebts.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setCurrentStep(0);
        }
    };

    if (simplifiedDebts.length === 0) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce">
                    <PartyPopper size={48} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">All Settled Up!</h2>
                <p className="text-gray-500">No one owes anything. Great job!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col relative">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Settle Up</h2>
                <p className="text-gray-500">Confirm payments to clear debts.</p>
            </div>

            <div className="flex-1 flex items-center justify-center">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentDebt ? `${currentDebt.fromId}-${currentDebt.toId}` : 'empty'}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full"
                    >
                        <Card className="p-8 flex flex-col items-center text-center gap-6 border-2 border-primary-100 shadow-xl shadow-primary-500/10">
                            <div className="text-sm font-medium text-gray-400 uppercase tracking-wider">Debt {currentStep + 1} of {simplifiedDebts.length}</div>

                            <div className="space-y-4 w-full">
                                <div className="text-2xl font-medium text-gray-700">Has</div>
                                <div className="text-4xl font-bold text-primary-600">{getRoomieName(currentDebt.fromId)}</div>
                                <div className="text-gray-400 flex justify-center"><ArrowRight size={32} /></div>
                                <div className="text-2xl font-medium text-gray-700">paid</div>
                                <div className="text-4xl font-bold text-primary-600">{getRoomieName(currentDebt.toId)}</div>
                                <div className="text-5xl font-black text-gray-900 mt-4">${currentDebt.amount.toFixed(2)}?</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full mt-8">
                                <Button variant="outline" onClick={handleSkip} className="py-4">
                                    <X size={20} /> No, Skip
                                </Button>
                                <Button variant="primary" onClick={handlePaidClick} className="py-4 bg-green-600 hover:bg-green-700 shadow-green-500/30">
                                    <Check size={20} /> Yes, Paid
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Voucher Modal */}
            {showVoucherModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-6"
                    >
                        {!showNoVoucherConfirm ? (
                            <>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-gray-900">Upload Voucher</h3>
                                    <p className="text-gray-500 text-sm mt-1">Proof of payment is required.</p>
                                </div>

                                <div className="flex gap-2">
                                    <label className="flex-1 flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 cursor-pointer hover:border-primary-400 hover:text-primary-600 transition-colors bg-gray-50">
                                        <Camera size={32} />
                                        <span className="text-sm font-medium">Take Photo</span>
                                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => setVoucher(e.target.files?.[0] || null)} />
                                    </label>
                                    <label className="flex-1 flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 cursor-pointer hover:border-primary-400 hover:text-primary-600 transition-colors bg-gray-50">
                                        <Upload size={32} />
                                        <span className="text-sm font-medium">Upload</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={e => setVoucher(e.target.files?.[0] || null)} />
                                    </label>
                                </div>

                                {voucher && (
                                    <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
                                        <Check size={16} />
                                        Ready to upload: {voucher.name}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <Button
                                        className="w-full py-4 text-lg"
                                        disabled={!voucher}
                                        onClick={handleConfirmWithVoucher}
                                    >
                                        Confirm Payment
                                    </Button>
                                    <button
                                        onClick={() => setShowNoVoucherConfirm(true)}
                                        className="w-full text-center text-xs text-gray-400 hover:text-gray-600 underline"
                                    >
                                        Clear debt without uploading a voucher
                                    </button>
                                    <button
                                        onClick={() => setShowVoucherModal(false)}
                                        className="w-full text-center text-sm font-medium text-gray-500 py-2"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mx-auto mb-4">
                                        <AlertTriangle size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Are you sure?</h3>
                                    <p className="text-gray-500 text-sm mt-2">
                                        I acknowledge that I am clearing this debt without proof of payment and I resign any future claims regarding this specific transaction.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <Button
                                        variant="danger"
                                        className="w-full py-4"
                                        onClick={handleConfirmWithoutVoucher}
                                    >
                                        Yes, I Acknowledge
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full py-4"
                                        onClick={() => setShowNoVoucherConfirm(false)}
                                    >
                                        Go Back
                                    </Button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
};
