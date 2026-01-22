import React, { useState, useEffect } from 'react';

interface AddActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (name: string) => void;
    existingActivities: string[];
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
    isOpen,
    onClose,
    onAdd,
    existingActivities
}) => {
    const [activityName, setActivityName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setActivityName('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedName = activityName.trim();

        if (!trimmedName) {
            setError('Activity名を入力してください');
            return;
        }

        if (existingActivities.includes(trimmedName)) {
            setError('同じ名前のActivityが既に存在します');
            return;
        }

        onAdd(trimmedName);
        onClose();
    };

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
                    <h2 className="font-bold text-lg text-slate-800">新規Activity追加</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 leading-snug">
                            Activity名
                        </label>
                        <input
                            type="text"
                            value={activityName}
                            onChange={(e) => {
                                setActivityName(e.target.value);
                                setError('');
                            }}
                            className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-slate-800 font-medium text-base bg-white shadow-sm"
                            placeholder="例: ユーザー登録"
                            autoFocus
                        />
                        {error && (
                            <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
                        )}
                    </div>
                </form>

                <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200/60 rounded-lg transition-colors text-sm"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-5 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-md shadow-green-600/20 transition-all text-sm transform active:scale-95"
                    >
                        追加
                    </button>
                </div>
            </div>
        </div>
    );
};
