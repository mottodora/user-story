import React from 'react';
import type { Story } from '../types';
import { clsx } from 'clsx';

interface StoryCardProps {
    story: Story;
    onClick?: (story: Story) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, onClick }) => {
    return (
        <div
            onClick={() => onClick?.(story)}
            className={clsx(
                "bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer text-sm group",
                "flex flex-col gap-2 h-full relative"
            )}
        >
            <div className="font-medium text-gray-800 leading-snug">{story.title}</div>
            {story.acceptanceCriteria && (
                <div className="text-xs text-gray-500 line-clamp-3">
                    {story.acceptanceCriteria}
                </div>
            )}

            <div className="mt-auto pt-2 flex items-center justify-between">
                {story.status && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 truncate max-w-[100px]">
                        {story.status}
                    </span>
                )}
                {story.kpi && (
                    <span className="text-[10px] text-blue-500 font-medium" title={`KPI: ${story.kpi}`}>
                        KPI available
                    </span>
                )}
            </div>
        </div>
    );
};
