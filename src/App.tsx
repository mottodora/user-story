import { useEffect, useState } from 'react';
import type { Story, StoryMapData } from './types';
import { parseCSV } from './utils/csvParser';
import { StoryMapBoard } from './components/StoryMapBoard';
import { EditStoryModal } from './components/EditStoryModal';
// @ts-ignore
import csvDataRaw from '../data/story_map.csv?raw';

function App() {
  const [data, setData] = useState<StoryMapData | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);

  useEffect(() => {
    if (csvDataRaw) {
      try {
        const parsed = parseCSV(csvDataRaw);
        setData(parsed);
      } catch (e) {
        console.error("CSV Parse Error:", e);
      }
    }
  }, []);

  const handleSaveStory = (updatedStory: Story) => {
    if (!data) return;

    // Check if story already exists
    const exists = data.stories.some(s => s.id === updatedStory.id);

    let newStories;
    if (exists) {
      newStories = data.stories.map(s => s.id === updatedStory.id ? updatedStory : s);
    } else {
      newStories = [...data.stories, updatedStory];
    }

    setData({ ...data, stories: newStories });
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

  const handleActivityReorder = (newActivities: string[]) => {
    if (!data) return;
    setData({ ...data, activities: newActivities });
  };

  const handleStoryUpdate = (newStories: Story[]) => {
    if (!data) return;
    setData({ ...data, stories: newStories });
  };

  const handleDeleteStory = (storyId: string) => {
    if (!data) return;
    const newStories = data.stories.filter(s => s.id !== storyId);
    setData({ ...data, stories: newStories });
    setEditingStory(null);
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50 text-slate-900">
      <header className="flex-none h-16 px-6 bg-white border-b border-slate-200 shadow-sm z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-blue-200 shadow-lg">
            S
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            User Story Mapping
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm px-3 py-1 bg-slate-100 rounded-full text-slate-600 font-medium">
            {data?.stories.length || 0} Stories
          </div>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow">
            Export
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        {data ? (
          <>
            <StoryMapBoard
              data={data}
              onStoryClick={setEditingStory}
              onActivityReorder={handleActivityReorder}
              onStoryUpdate={handleStoryUpdate}
              onAddStory={handleAddStory}
            />
            <EditStoryModal
              story={editingStory}
              isOpen={!!editingStory}
              onClose={() => setEditingStory(null)}
              onSave={handleSaveStory}
              onDelete={handleDeleteStory}
              activities={data.activities}
              releases={data.releases}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full flex-col gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-600"></div>
            <p className="text-slate-400 font-medium">Loading map...</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
