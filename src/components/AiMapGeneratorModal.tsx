import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface GeneratedMap {
    mapName: string;
    activities: string[];
    releases: {
        name: string;
        stories: {
            title: string;
            activity: string;
            body?: string;
        }[];
    }[];
}

interface AiMapGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (data: GeneratedMap) => void;
}

type Step = 'input' | 'generating' | 'preview';

export default function AiMapGeneratorModal({ isOpen, onClose, onGenerate }: AiMapGeneratorModalProps) {
    const [step, setStep] = useState<Step>('input');
    const [prompt, setPrompt] = useState('');
    const [generatedData, setGeneratedData] = useState<GeneratedMap | null>(null);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('プロンプトを入力してください');
            return;
        }

        setError('');
        setStep('generating');

        try {
            const response = await fetch('/api/ai-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'マップの生成に失敗しました');
            }

            const data = await response.json();
            setGeneratedData(data);
            setStep('preview');
        } catch (err) {
            setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
            setStep('input');
        }
    };

    const handleConfirm = () => {
        if (generatedData) {
            onGenerate(generatedData);
            handleClose();
        }
    };

    const handleClose = () => {
        setStep('input');
        setPrompt('');
        setGeneratedData(null);
        setError('');
        onClose();
    };

    const handleRegenerate = () => {
        setStep('input');
        setGeneratedData(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-2xl m-4">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-lg">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6" />
                        <h2 className="text-2xl font-bold">AIでマップを生成</h2>
                    </div>
                    <p className="text-purple-100 mt-2 text-sm">
                        プロダクトのアイデアを入力すると、AIがユーザーストーリーマップの叩き台を作成します
                    </p>
                </div>

                <div className="p-6">
                    {/* Step 1: Input */}
                    {step === 'input' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    プロダクトアイデアを入力してください
                                </label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="例: オンラインでタスクを管理できるTodoアプリを作りたい。ユーザーはタスクを作成、編集、削除でき、完了・未完了を切り替えられる。カテゴリー分けやデッドライン設定も可能にしたい。"
                                    className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    {prompt.length} 文字（推奨: 100〜500文字）
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={handleClose}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleGenerate}
                                    disabled={!prompt.trim()}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    生成する
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Generating */}
                    {step === 'generating' && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                            <p className="text-lg font-medium text-gray-700">AIがマップを生成中...</p>
                            <p className="text-sm text-gray-500 mt-2">少々お待ちください</p>
                        </div>
                    )}

                    {/* Step 3: Preview */}
                    {step === 'preview' && generatedData && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    マップ名: {generatedData.mapName}
                                </h3>
                                <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        以下の内容でマップを作成します。必要に応じて後から編集できます。
                                    </p>
                                </div>
                            </div>

                            {/* Activities */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">
                                    アクティビティ ({generatedData.activities.length}個)
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {generatedData.activities.map((activity, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                                        >
                                            {activity}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Releases and Stories */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">ストーリー</h4>
                                {generatedData.releases.map((release, releaseIdx) => (
                                    <div key={releaseIdx} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                            <h5 className="font-medium text-gray-900">{release.name}</h5>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {release.stories.length} ストーリー
                                            </p>
                                        </div>
                                        <div className="p-4">
                                            <div className="grid gap-2">
                                                {release.stories.map((story, storyIdx) => (
                                                    <div
                                                        key={storyIdx}
                                                        className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                                                    >
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900 text-sm">{story.title}</p>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                アクティビティ: {story.activity}
                                                            </p>
                                                            {story.body && (
                                                                <p className="text-xs text-gray-500 mt-1">{story.body}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                                <button
                                    onClick={handleRegenerate}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    再生成
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
                                >
                                    このまま作成
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
