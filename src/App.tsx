import { useEffect, useState } from 'react';
import type { Story, StoryMapData, StoryMap } from './types';

import { StoryMapBoard } from './components/StoryMapBoard';
import { EditStoryModal } from './components/EditStoryModal';
import { HomePage } from './components/HomePage';


function App() {
  const [maps, setMaps] = useState<StoryMap[]>([]);
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);
  const [data, setData] = useState<StoryMapData | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load all maps on mount
  useEffect(() => {
    fetch('/api/maps')
      .then(res => res.json())
      .then((fetchedMaps: StoryMap[]) => {
        setMaps(fetchedMaps);
        // Don't auto-select, show home page instead
      })
      .catch(e => {
        console.error("Failed to load maps:", e);
        setError("Failed to load maps.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Load stories when map changes
  useEffect(() => {
    if (!currentMapId) return;

    // Clear old data immediately when switching maps
    setData(null);
    setIsLoading(true);
    fetch(`/api/stories?mapId=${currentMapId}`)
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
  }, [currentMapId]);

  const handleSaveStory = async (updatedStory: Story) => {
    if (!data) return;

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
        body: JSON.stringify({ story: updatedStory })
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

  const handleActivityReorder = (newActivities: string[]) => {
    if (!data) return;
    setData({ ...data, activities: newActivities });
  };

  const handleStoryUpdate = (newStories: Story[]) => {
    if (!data) return;
    setData({ ...data, stories: newStories });
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

  const handleCreateMap = async () => {
    const name = prompt('新しいマップの名前を入力してください:');
    if (!name) return;

    try {
      const res = await fetch('/api/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!res.ok) throw new Error("Failed to create map");
      const newMap = await res.json();
      setMaps([...maps, newMap]);
      setCurrentMapId(newMap.id);
    } catch (e) {
      console.error("Create Map Error:", e);
      alert('マップの作成に失敗しました');
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50 text-slate-900">
      <header className="flex-none h-16 px-6 bg-white border-b border-slate-200 shadow-sm z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-blue-200 shadow-lg">
            S
          </div>
          {currentMapId ? (
            <button
              onClick={() => setCurrentMapId(null)}
              className="text-xl font-bold text-slate-800 hover:text-blue-600 tracking-tight transition-colors cursor-pointer"
              title="ホームに戻る"
            >
              User Story Mapping
            </button>
          ) : (
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              User Story Mapping
            </h1>
          )}
          {data?.map && (
            <div className="ml-4 flex items-center gap-2">
              <span className="text-sm px-3 py-1.5 bg-blue-50 rounded-lg text-blue-700 font-medium border border-blue-200">
                📋 {data.map.name} {data.map.isSample && '(サンプル)'}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm px-3 py-1 bg-slate-100 rounded-full text-slate-600 font-medium">
            {data?.stories.length || 0} Stories
          </div>
          <button
            onClick={handleCreateMap}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow"
          >
            + 新規マップ
          </button>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow">
            Export
          </button>
        </div>
      </header>

      {/* Map Selector Dropdown */}


      <main className="flex-1 overflow-hidden relative">
        {!currentMapId ? (
          <HomePage
            maps={maps}
            onSelectMap={setCurrentMapId}
            onCreateMap={handleCreateMap}
          />
        ) : data ? (
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
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-600"></div>
                <p className="text-slate-400 font-medium">Loading map...</p>
              </>
            ) : error ? (
              <div className="text-red-500 font-medium text-center">
                <p>Error: {error}</p>
                <p className="text-sm mt-2 text-slate-500">
                  If you are running locally, please use <code>npx vercel dev</code>.
                </p>
              </div>
            ) : (
              <div className="text-slate-400 font-medium">No data found.</div>
            )}
          </div>
        )}
      </main >
    </div >
  );
}

export default App;
