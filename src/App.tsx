import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import type { StoryMap } from './types';
import { HomePage } from './components/HomePage';
import { MapPage } from './components/MapPage';

function App() {
  const [maps, setMaps] = useState<StoryMap[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load all maps on mount
  useEffect(() => {
    fetch('/api/maps')
      .then(res => res.json())
      .then((fetchedMaps: StoryMap[]) => {
        setMaps(fetchedMaps);
      })
      .catch(e => {
        console.error("Failed to load maps:", e);
        setError("Failed to load maps.");
      })
      .finally(() => setIsLoading(false));
  }, []);

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
      navigate(`/maps/${newMap.id}`);
    } catch (e) {
      console.error("Create Map Error:", e);
      alert('マップの作成に失敗しました');
    }
  };

  const handleSelectMap = (mapId: string) => {
    navigate(`/maps/${mapId}`);
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50 text-slate-900">
      <Header />
      <main className="flex-1 overflow-hidden relative">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                maps={maps}
                onSelectMap={handleSelectMap}
                onCreateMap={handleCreateMap}
              />
            }
          />
          <Route
            path="/maps/:mapId"
            element={<MapPageWrapper maps={maps} onCreateMap={handleCreateMap} />}
          />
        </Routes>
      </main>
    </div>
  );
}

// Header component that shows current map info
function Header() {
  const { mapId } = useParams();
  const navigate = useNavigate();
  const [mapData, setMapData] = useState<{ map?: { name: string; isSample: boolean }; stories?: any[] } | null>(null);

  useEffect(() => {
    if (!mapId) {
      setMapData(null);
      return;
    }

    fetch(`/api/stories?mapId=${mapId}`)
      .then(res => res.json())
      .then(data => setMapData(data))
      .catch(e => console.error("Failed to load map data for header:", e));
  }, [mapId]);

  return (
    <header className="flex-none h-16 px-6 bg-white border-b border-slate-200 shadow-sm z-40 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-blue-200 shadow-lg">
          S
        </div>
        {mapId ? (
          <button
            onClick={() => navigate('/')}
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
        {mapData?.map && (
          <div className="ml-4 flex items-center gap-2">
            <span className="text-sm px-3 py-1.5 bg-blue-50 rounded-lg text-blue-700 font-medium border border-blue-200">
              📋 {mapData.map.name} {mapData.map.isSample && '(サンプル)'}
            </span>
          </div>
        )}
      </div>
      {mapId && mapData && (
        <div className="flex items-center gap-4">
          <div className="text-sm px-3 py-1 bg-slate-100 rounded-full text-slate-600 font-medium">
            {mapData.stories?.length || 0} Stories
          </div>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow">
            Export
          </button>
        </div>
      )}
    </header>
  );
}

// Wrapper to pass props to MapPage
function MapPageWrapper({ maps, onCreateMap }: { maps: StoryMap[]; onCreateMap: () => void }) {
  return <MapPage />;
}

export default App;
