import React, { ButtonHTMLAttributes, InputHTMLAttributes } from 'react';
import clsx from 'clsx';

export const Button: React.FC<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'danger' }> = ({
    className,
    variant = 'primary',
    ...props
}) => {
    const variants = {
        primary: "bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30",
        secondary: "bg-secondary-600 hover:bg-secondary-700 text-white shadow-lg shadow-secondary-500/30",
        outline: "border-2 border-gray-200 hover:border-primary-500 hover:text-primary-600 text-gray-600 bg-transparent",
        danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30",
    };

    return (
        <button
            className={clsx(
                "px-4 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2",
                variants[variant],
                className
            )}
            {...props}
        />
    );
};

export const Input: React.FC<InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({
    className,
    label,
    id,
    ...props
}) => {
    return (
        <div className="flex flex-col gap-1.5">
            {label && <label htmlFor={id} className="text-sm font-medium text-gray-700 ml-1">{label}</label>}
            <input
                id={id}
                className={clsx(
                    "px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all duration-200",
                    className
                )}
                {...props}
            />
        </div>
    );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={clsx("bg-white rounded-2xl p-5 shadow-sm border border-gray-100", className)}>
        {children}
    </div>
);
