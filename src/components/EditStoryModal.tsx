import React, { useState, useEffect } from 'react';
import type { Story } from '../types';

interface EditStoryModalProps {
    story: Story | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedStory: Story) => void;
    activities: string[];
    releases: string[];
}

export const EditStoryModal: React.FC<EditStoryModalProps> = ({
    story,
    isOpen,
    onClose,
    onSave,
    activities,
    releases
}) => {
    const [formData, setFormData] = useState<Story | null>(null);

    useEffect(() => {
        if (story) {
            setFormData(story);
        }
    }, [story]);

    if (!isOpen || !formData) return null;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            onSave(formData);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-slate-900/5 scale-100"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="font-bold text-lg text-slate-800">Edit Story</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5 leading-snug">
                            Story Title
                        </label>
                        <textarea
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-800 font-medium bg-white shadow-sm resize-none"
                            rows={2}
                            required
                            placeholder="As a user, I want to..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Activity</label>
                            <select
                                name="activity"
                                value={formData.activity}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-700 shadow-sm"
                            >
                                {activities.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
                            <select
                                name="release"
                                value={formData.release}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-700 shadow-sm"
                            >
                                {releases.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Acceptance Criteria</label>
                        <textarea
                            name="acceptanceCriteria"
                            value={formData.acceptanceCriteria || ''}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none shadow-sm"
                            rows={4}
                            placeholder="- User can..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                            <input
                                type="text"
                                name="status"
                                value={formData.status || ''}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                                placeholder="Draft, Done..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">KPI</label>
                            <input
                                type="text"
                                name="kpi"
                                value={formData.kpi || ''}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                                placeholder="KPI..."
                            />
                        </div>
                    </div>

                </form>

                <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200/60 rounded-lg transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all text-sm transform active:scale-95"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
