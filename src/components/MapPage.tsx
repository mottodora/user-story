import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Story, StoryMapData } from '../types';
import { StoryMapBoard } from './StoryMapBoard';
import { EditStoryModal } from './EditStoryModal';
import { AddActivityModal } from './AddActivityModal';

export const MapPage = () => {
    const { mapId } = useParams<{ mapId: string }>();
    const [data, setData] = useState<StoryMapData | null>(null);
    const [editingStory, setEditingStory] = useState<Story | null>(null);
    const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load stories when map changes
    useEffect(() => {
        if (!mapId) return;

        setData(null);
        setIsLoading(true);
        fetch(`/api/stories?mapId=${mapId}`)
            .then(res => {
                if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
                return res.json();
            })
            .then((data: StoryMapData) => {
                setData(data);
                setError(null);
            })
            .catch(e => {
                console.error("API Fetch Error:", e);
                setError("Failed to load stories. Make sure the backend is running (npm run dev is not enough, use 'vercel dev').");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [mapId]);

    const handleSaveStory = async (updatedStory: Story) => {
        if (!data || !mapId) return;

        // Optimistic update
        const exists = data.stories.some(s => s.id === updatedStory.id);
        let newStories;
        if (exists) {
            newStories = data.stories.map(s => s.id === updatedStory.id ? updatedStory : s);
        } else {
            newStories = [...data.stories, updatedStory];
        }
        setData({ ...data, stories: newStories });

        // Persist to API
        try {
            const res = await fetch('/api/stories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ story: updatedStory, mapId })
            });
            if (!res.ok) throw new Error("Failed to save");
        } catch (e) {
            console.error("Save Error:", e);
            // TODO: Revert local state on error
        }
    };

    const handleAddStory = (release: string, activity: string) => {
        const newStory: Story = {
            id: crypto.randomUUID(),
            title: '',
            activity,
            release,
            body: '',
            status: 'Draft'
        };
        setEditingStory(newStory);
    };

    const handleActivityReorder = async (newActivities: string[]) => {
        if (!data || !mapId) return;
        setData({ ...data, activities: newActivities });

        // Persist to API
        try {
            const res = await fetch('/api/activities', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mapId, activities: newActivities })
            });
            if (!res.ok) throw new Error("Failed to update activity order");
        } catch (e) {
            console.error("Activity Reorder Error:", e);
        }
    };

    const handleStoryUpdate = async (newStories: Story[]) => {
        if (!data || !mapId) return;

        // Optimistic update
        const oldStories = data.stories;
        setData({ ...data, stories: newStories });

        // Find which stories changed and persist them
        try {
            const changedStories = newStories.filter((newStory) => {
                const oldStory = oldStories.find(s => s.id === newStory.id);
                return oldStory && (
                    oldStory.activity !== newStory.activity ||
                    oldStory.release !== newStory.release
                );
            });

            // Save each changed story
            for (const story of changedStories) {
                const res = await fetch('/api/stories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ story, mapId })
                });
                if (!res.ok) throw new Error(`Failed to save story ${story.id}`);
            }
        } catch (e) {
            console.error("Story Update Error:", e);
            // Revert on error
            setData({ ...data, stories: oldStories });
        }
    };

    const handleAddActivity = async () => {
        setIsAddActivityModalOpen(true);
    };

    const handleAddActivitySubmit = async (name: string) => {
        if (!mapId || !data) return;

        try {
            const res = await fetch('/api/activities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mapId, name })
            });
            if (!res.ok) throw new Error("Failed to add activity");

            // ローカル状態を更新
            setData({ ...data, activities: [...data.activities, name] });
        } catch (e) {
            console.error("Add Activity Error:", e);
            alert('Activityの追加に失敗しました');
        }
    };

    const handleDeleteStory = async (storyId: string) => {
        if (!data) return;

        // Optimistic update
        const newStories = data.stories.filter(s => s.id !== storyId);
        setData({ ...data, stories: newStories });
        setEditingStory(null);

        // Persist to API
        try {
            const res = await fetch(`/api/stories?id=${storyId}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error("Failed to delete");
        } catch (e) {
            console.error("Delete Error:", e);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full flex-col gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-600"></div>
                <p className="text-slate-400 font-medium">Loading map...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-red-500 font-medium text-center">
                    <p>Error: {error}</p>
                    <p className="text-sm mt-2 text-slate-500">
                        If you are running locally, please use <code>npx vercel dev</code>.
                    </p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-slate-400 font-medium">No data found.</div>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col">
            {/* Top action bar */}
            <div className="flex-none px-6 py-3 bg-white border-b border-slate-200 flex items-center justify-end gap-4">
                <button
                    onClick={handleAddActivity}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors shadow"
                >
                    + 新規Activity
                </button>
            </div>

            {/* Map board */}
            <div className="flex-1 overflow-hidden">
                <StoryMapBoard
                    data={data}
                    onStoryClick={setEditingStory}
                    onActivityReorder={handleActivityReorder}
                    onStoryUpdate={handleStoryUpdate}
                    onAddStory={handleAddStory}
                />
            </div>

            {/* Modals */}
            <EditStoryModal
                story={editingStory}
                isOpen={!!editingStory}
                onClose={() => setEditingStory(null)}
                onSave={handleSaveStory}
                onDelete={handleDeleteStory}
                activities={data.activities}
                releases={data.releases}
            />
            <AddActivityModal
                isOpen={isAddActivityModalOpen}
                onClose={() => setIsAddActivityModalOpen(false)}
                onAdd={handleAddActivitySubmit}
                existingActivities={data.activities}
            />
        </div>
    );
};
