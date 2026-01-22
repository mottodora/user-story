import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StoryCard } from './StoryCard';
import type { Story } from '../types';

interface SortableStoryCardProps {
    story: Story;
    onClick?: (story: Story) => void;
}

export const SortableStoryCard: React.FC<SortableStoryCardProps> = ({ story, onClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: story.id, data: { type: 'Story', story } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="touch-none" // prevent scrolling on touch devices while dragging
        >
            <StoryCard story={story} onClick={onClick} />
        </div>
    );
};
