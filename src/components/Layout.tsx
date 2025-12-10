import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, PlusCircle, CheckCircle, History } from 'lucide-react';
import clsx from 'clsx';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/roomies', icon: Users, label: 'Roomies' },
        { path: '/add-expense', icon: PlusCircle, label: 'Add' },
        { path: '/settle-up', icon: CheckCircle, label: 'Settle' },
        { path: '/history', icon: History, label: 'History' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative">
            <header className="bg-white p-4 shadow-sm z-10 sticky top-0">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    RoomieSplit
                </h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 pb-24">
                {children}
            </main>

            <nav className="bg-white border-t border-gray-100 fixed bottom-0 w-full max-w-md pb-safe">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex flex-col items-center justify-center w-full h-full transition-colors duration-200",
                                    isActive ? "text-primary-600" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-medium mt-1">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};
