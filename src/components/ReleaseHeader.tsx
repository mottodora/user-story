import React from 'react';
import { clsx } from 'clsx';

interface ReleaseHeaderProps {
    title: string;
    isFirst?: boolean;
}

export const ReleaseHeader: React.FC<ReleaseHeaderProps> = ({ title }) => {
    // Simple color coding logic
    const isMVP = title.toUpperCase().includes('MVP');

    return (
        <div className={clsx(
            "p-4 border-r-2 border-slate-200 flex items-center justify-center font-bold sticky left-0 z-20 min-w-[100px]",
            isMVP ? "bg-orange-50 text-orange-700" : "bg-white text-slate-600"
        )}>
            <span className="writing-mode-vertical md:writing-mode-horizontal transform -rotate-180 md:rotate-0 whitespace-nowrap">
                {title}
            </span>
        </div>
    );
};
