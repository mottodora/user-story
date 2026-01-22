import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableStoryCard } from './SortableStoryCard';
import type { Story } from '../types';

interface StoryMapCellProps {
    release: string;
    activity: string;
    stories: Story[];
    onStoryClick?: (story: Story) => void;
    onAddStory?: (release: string, activity: string) => void;
}

export const StoryMapCell: React.FC<StoryMapCellProps> = ({ release, activity, stories, onStoryClick, onAddStory }) => {
    const cellId = `${release}-${activity}`;
    const { setNodeRef } = useDroppable({
        id: cellId,
        data: {
            type: 'Cell',
            release,
            activity,
        },
    });

    return (
        <div
            ref={setNodeRef}
            className="p-3 border-b border-r border-slate-200 min-h-[160px] bg-white group/cell hover:bg-sky-50/30 transition-colors flex flex-col gap-3"
        >
            <SortableContext items={stories.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {stories.map(story => (
                    <SortableStoryCard
                        key={story.id}
                        story={story}
                        onClick={onStoryClick}
                    />
                ))}
            </SortableContext>

            {/* Add Button Placeholder - Visible on Hover */}
            <button
                onClick={() => onAddStory?.(release, activity)}
                className="mt-auto opacity-0 group-hover/cell:opacity-100 transition-opacity w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 text-sm font-medium"
            >
                + Add Story
            </button>
        </div>
    );
};
