import React, { useMemo, useState } from 'react';
import type { StoryMapData, Story } from '../types';
import { ActivityHeader } from './ActivityHeader';
import { ReleaseHeader } from './ReleaseHeader';
import { SortableActivityHeader } from './SortableActivityHeader';
import { StoryMapCell } from './StoryMapCell';
import { StoryCard } from './StoryCard';
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
    type DragOverEvent,
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
    onStoryUpdate?: (newStories: Story[]) => void;
}

export const StoryMapBoard: React.FC<StoryMapBoardProps> = ({
    data,
    onStoryClick,
    onActivityReorder,
    onStoryUpdate
}) => {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeStory, setActiveStory] = useState<Story | null>(null);

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

        // Populate stories - maintain relative order from data.stories
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
        const { active } = event;
        setActiveId(active.id as string);
        if (active.data.current?.type === 'Story') {
            setActiveStory(active.data.current.story as Story);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeType = active.data.current?.type;
        const overType = over.data.current?.type;

        // Give priority to Story dragging logic
        if (activeType === 'Story' && onStoryUpdate) {
            const activeId = active.id as string;
            const overId = over.id as string;

            // Find current story and its index
            const activeIndex = data.stories.findIndex(s => s.id === activeId);
            const activeStory = data.stories[activeIndex];
            if (!activeStory) return;

            if (overType === 'Story') {
                const overIndex = data.stories.findIndex(s => s.id === overId);
                const overStory = data.stories[overIndex];

                if (activeStory.activity !== overStory.activity || activeStory.release !== overStory.release) {
                    // Moving to different list (cell)
                    const newStories = [...data.stories];
                    // Update metadata first
                    newStories[activeIndex] = {
                        ...activeStory,
                        activity: overStory.activity,
                        release: overStory.release
                    };
                    // Move in array
                    const reorderedStories = arrayMove(newStories, activeIndex, overIndex);
                    onStoryUpdate(reorderedStories);
                } else if (activeIndex !== overIndex) {
                    // Reordering within same list
                    const reorderedStories = arrayMove(data.stories, activeIndex, overIndex);
                    onStoryUpdate(reorderedStories);
                }
            } else if (overType === 'Cell') {
                // Moving to an empty area in a cell
                const { release, activity } = over.data.current || {};

                if (activeStory.activity !== activity || activeStory.release !== release) {
                    const newStories = [...data.stories];
                    newStories[activeIndex] = {
                        ...activeStory,
                        activity: activity,
                        release: release
                    };
                    // If moving to a cell, we usually append or keep order? 
                    // To keep it simple, just update metadata. 
                    // However, if we don't move it in the array, it might jump around if the sort logic relies on array order.
                    // But here grouping relies on metadata.
                    onStoryUpdate(newStories);
                }
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        // Handle Activity Reordering
        if (active.data.current?.type === 'Activity' && over && active.id !== over.id) {
            const oldIndex = data.activities.indexOf(active.id as string);
            const newIndex = data.activities.indexOf(over.id as string);

            if (onActivityReorder && oldIndex !== -1 && newIndex !== -1) {
                const newOrder = arrayMove(data.activities, oldIndex, newIndex);
                onActivityReorder(newOrder);
            }
        }

        setActiveId(null);
        setActiveStory(null);
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
            onDragOver={handleDragOver}
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
                                    <StoryMapCell
                                        key={`${release}-${activity}`}
                                        release={release}
                                        activity={activity}
                                        stories={stories}
                                        onStoryClick={onStoryClick}
                                    />
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <DragOverlay dropAnimation={dropAnimation}>
                {activeId ? (
                    activeStory ? (
                        <StoryCard story={activeStory} />
                    ) : (
                        <ActivityHeader title={activeId} />
                    )
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};
