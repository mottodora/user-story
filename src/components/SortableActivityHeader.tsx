import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActivityHeader } from './ActivityHeader';

interface SortableActivityHeaderProps {
    id: string;
    title: string;
}

export const SortableActivityHeader: React.FC<SortableActivityHeaderProps> = ({ id, title }) => {
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="sticky top-0 z-20 h-full flex flex-col"
        >
            {/* Visual handle or just draggable header? checking ActivityHeader */}
            <ActivityHeader title={title} />
        </div>
    );
};
