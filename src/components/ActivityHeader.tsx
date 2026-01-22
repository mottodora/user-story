import React from 'react';

interface ActivityHeaderProps {
    title: string;
}

export const ActivityHeader: React.FC<ActivityHeaderProps> = ({ title }) => {
    return (
        <div className="bg-slate-100 p-3 border-b-2 border-slate-200 font-bold text-slate-700 text-center uppercase tracking-wide text-sm min-w-[120px]">
            {title}
        </div>
    );
};
