import React from 'react';
import type { StoryMapData, Story } from '../types';

interface StoryTableProps {
    data: StoryMapData;
    onStoryClick?: (story: Story) => void;
}

export const StoryTable: React.FC<StoryTableProps> = ({ data, onStoryClick }) => {
    // Sort stories by Release then Activity for better readability
    const sortedStories = [...data.stories].sort((a, b) => {
        if (a.release !== b.release) {
            return data.releases.indexOf(a.release) - data.releases.indexOf(b.release);
        }
        if (a.activity !== b.activity) {
            return data.activities.indexOf(a.activity) - data.activities.indexOf(b.activity);
        }
        return 0;
    });

    return (
        <div className="overflow-auto h-full w-full bg-slate-50 p-6">
            <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                        <tr>
                            <th className="px-6 py-3">Release</th>
                            <th className="px-6 py-3">Activity</th>
                            <th className="px-6 py-3">Title</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Body</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {sortedStories.map((story) => (
                            <tr
                                key={story.id}
                                onClick={() => onStoryClick?.(story)}
                                className="hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                                <td className="px-6 py-4 font-medium text-slate-900">{story.release}</td>
                                <td className="px-6 py-4 text-slate-800">{story.activity}</td>
                                <td className="px-6 py-4 font-medium text-blue-600">{story.title}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                        ${story.status === 'Done' ? 'bg-green-100 text-green-800' :
                                            story.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                'bg-slate-100 text-slate-800'}`}>
                                        {story.status || 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 truncate max-w-xs">{story.body}</td>
                            </tr>
                        ))}
                        {sortedStories.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                    No stories found. Add some from the Board view!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
