import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActivityHeader } from './ActivityHeader';

interface SortableActivityHeaderProps {
    id: string;
    title: string;
    onActivityClick?: (activityName: string) => void;
}

export const SortableActivityHeader: React.FC<SortableActivityHeaderProps> = ({ id, title, onActivityClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id,
        data: { type: 'Activity' }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as const,
        touchAction: 'none' // Prevent scrolling while dragging
    };

    const handleClick = (e: React.MouseEvent) => {
        // Only trigger click if not dragging
        if (!isDragging && onActivityClick) {
            e.stopPropagation();
            onActivityClick(title);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="sticky top-0 z-20 h-full flex flex-col"
        >
            <div onClick={handleClick}>
                <ActivityHeader title={title} />
            </div>
        </div>
    );
};
