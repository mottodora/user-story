import React, { useMemo, useState } from 'react';
import type { StoryMapData, Story } from '../types';
import { ActivityHeader } from './ActivityHeader';
import { ReleaseHeader } from './ReleaseHeader';
import { StoryCard } from './StoryCard';
import { SortableActivityHeader } from './SortableActivityHeader';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    type DragStartEvent,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

interface StoryMapBoardProps {
    data: StoryMapData;
    onStoryClick?: (story: Story) => void;
    onActivityReorder?: (newOrder: string[]) => void;
}

export const StoryMapBoard: React.FC<StoryMapBoardProps> = ({ data, onStoryClick, onActivityReorder }) => {
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Avoid accidental drags
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Organize data into a grid: Release -> Activity -> Stories[]
    const grid = useMemo(() => {
        const map = new Map<string, Map<string, Story[]>>();

        // Initialize map structure
        data.releases.forEach(r => {
            const row = new Map<string, Story[]>();
            data.activities.forEach(a => row.set(a, []));
            map.set(r, row);
        });

        // Populate stories
        data.stories.forEach(story => {
            const row = map.get(story.release);
            if (row) {
                const cell = row.get(story.activity);
                if (cell) {
                    cell.push(story);
                }
            }
        });
        return map;
    }, [data]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = data.activities.indexOf(active.id as string);
            const newIndex = data.activities.indexOf(over.id as string);

            if (onActivityReorder) {
                const newOrder = arrayMove(data.activities, oldIndex, newIndex);
                onActivityReorder(newOrder);
            }
        }
        setActiveId(null);
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="overflow-auto h-full w-full bg-slate-50 scrollbar-thin scrollbar-thumb-slate-300">
                <div
                    className="grid gap-0 w-full"
                    style={{
                        gridTemplateColumns: `auto repeat(${data.activities.length}, minmax(120px, 1fr))`
                    }}
                >
                    {/* Corner Cell (Top Left) */}
                    <div className="sticky top-0 z-30 left-0 bg-slate-100 border-b-2 border-r-2 border-slate-200"></div>

                    {/* Activity Headers (Top Row) */}
                    <SortableContext
                        items={data.activities}
                        strategy={horizontalListSortingStrategy}
                    >
                        {data.activities.map(activity => (
                            <SortableActivityHeader key={activity} id={activity} title={activity} />
                        ))}
                    </SortableContext>

                    {/* Release Rows */}
                    {data.releases.map(release => (
                        <React.Fragment key={release}>
                            {/* Release Header (Left Column) */}
                            <ReleaseHeader title={release} />

                            {/* Story Cells */}
                            {data.activities.map(activity => {
                                const stories = grid.get(release)?.get(activity) || [];
                                return (
                                    <div
                                        key={`${release}-${activity}`}
                                        className="p-3 border-b border-r border-slate-200 min-h-[160px] bg-white group/cell hover:bg-sky-50/30 transition-colors flex flex-col gap-3"
                                    >
                                        {stories.map(story => (
                                            <StoryCard
                                                key={story.id}
                                                story={story}
                                                onClick={onStoryClick}
                                            />
                                        ))}

                                        {/* Add Button Placeholder - Visible on Hover */}
                                        <button className="mt-auto opacity-0 group-hover/cell:opacity-100 transition-opacity w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 text-sm font-medium">
                                            + Add Story
                                        </button>
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <DragOverlay dropAnimation={dropAnimation}>
                {activeId ? <ActivityHeader title={activeId} /> : null}
            </DragOverlay>
        </DndContext>
    );
};
