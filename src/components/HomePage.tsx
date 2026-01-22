import type { StoryMap } from '../types';

interface HomePageProps {
    maps: StoryMap[];
    onSelectMap: (mapId: string) => void;
    onCreateMap: () => void;
}

export function HomePage({ maps, onSelectMap, onCreateMap }: HomePageProps) {
    const sampleMaps = maps.filter(m => m.isSample);
    const userMaps = maps.filter(m => !m.isSample);

    return (
        <div className="h-full w-full overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-8 py-12">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-3">
                        ユーザーストーリーマッピング
                    </h1>
                    <p className="text-slate-600 text-lg">
                        プロジェクトのストーリーマップを作成・管理できます
                    </p>
                </div>

                {/* Create New Map Button */}
                <div className="mb-8">
                    <button
                        onClick={onCreateMap}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                        <span className="text-xl">+</span>
                        新規マップを作成
                    </button>
                </div>

                {/* Sample Maps */}
                {sampleMaps.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <span>📋</span>
                            サンプルプロジェクト
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sampleMaps.map(map => (
                                <MapCard key={map.id} map={map} onSelect={onSelectMap} />
                            ))}
                        </div>
                    </div>
                )}

                {/* User Maps */}
                {userMaps.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <span>📁</span>
                            マイプロジェクト
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userMaps.map(map => (
                                <MapCard key={map.id} map={map} onSelect={onSelectMap} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {userMaps.length === 0 && sampleMaps.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">
                            まだマップがありません
                        </h3>
                        <p className="text-slate-500 mb-6">
                            新規マップを作成して始めましょう
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

interface MapCardProps {
    map: StoryMap;
    onSelect: (mapId: string) => void;
}

function MapCard({ map, onSelect }: MapCardProps) {
    const createdDate = new Date(map.createdAt).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <button
            onClick={() => onSelect(map.id)}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all border border-slate-200 hover:border-blue-300 text-left group"
        >
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {map.name}
                </h3>
                {map.isSample && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                        サンプル
                    </span>
                )}
            </div>

            <div className="text-sm text-slate-500 space-y-1">
                <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>{createdDate}</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-sm text-blue-600 font-medium group-hover:text-blue-700">
                    開く →
                </span>
            </div>
        </button>
    );
}
