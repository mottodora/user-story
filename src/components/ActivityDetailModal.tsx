import React, { useState, useEffect } from 'react';

interface ActivityDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: (name: string) => Promise<{ success: boolean; error?: string; storyCount?: number }>;
    activityName: string | null;
    storyCount: number;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
    isOpen,
    onClose,
    onDelete,
    activityName,
    storyCount
}) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setShowConfirm(false);
            setError('');
        }
    }, [isOpen]);

    if (!isOpen || !activityName) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        setError('');

        try {
            const result = await onDelete(activityName);
            if (result.success) {
                onClose();
            } else {
                setError(result.error || '削除に失敗しました');
            }
        } catch (e) {
            setError('削除に失敗しました');
        } finally {
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    const hasStories = storyCount > 0;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col ring-1 ring-slate-900/5 scale-100"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="font-bold text-lg text-slate-800">Activity詳細</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-slate-700 mb-2 leading-snug">
                            Activity名
                        </label>
                        <div className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 text-slate-800 font-medium text-base">
                            {activityName}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-slate-700 mb-2 leading-snug">
                            関連Story数
                        </label>
                        <div className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50 text-slate-800 font-medium text-base">
                            {storyCount} 件
                        </div>
                    </div>

                    {storyCount > 0 && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800 font-medium">
                                ⚠️ このActivityには{storyCount}件のStoryが紐付いています。Activityを削除すると、関連するStoryも一緒に削除されます。
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800 font-medium">{error}</p>
                        </div>
                    )}

                    {!hasStories && showConfirm && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800 font-medium">
                                本当に削除してもよろしいですか？この操作は取り消せません。
                            </p>
                        </div>
                    )}

                    {hasStories && showConfirm && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800 font-medium">
                                本当に削除してもよろしいですか？このActivityと関連する{storyCount}件のStoryも一緒に削除されます。この操作は取り消せません。
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3">
                    {!showConfirm ? (
                        <>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200/60 rounded-lg transition-colors text-sm"
                            >
                                閉じる
                            </button>
                            <button
                                onClick={() => setShowConfirm(true)}
                                className="px-5 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 shadow-md shadow-red-600/20 transition-all text-sm transform active:scale-95"
                            >
                                削除
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => setShowConfirm(false)}
                                disabled={isDeleting}
                                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200/60 rounded-lg transition-colors text-sm disabled:opacity-50"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-5 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 shadow-md shadow-red-600/20 transition-all text-sm transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? '削除中...' : '確定'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
