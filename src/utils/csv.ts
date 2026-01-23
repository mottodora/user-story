import Papa from 'papaparse';
import type { Story } from '../types';

export const exportStoriesToCSV = (stories: Story[]) => {
    // Map stories to CSV format with Japanese headers matching import format
    const csvData = stories.map(story => ({
        'リリース': story.release,
        'アクティビティ（バックボーン）': story.activity,
        'タイトル': story.title,
        'ステータス': story.status || '',
        'ユーザーストーリー': story.body || '',
        '受け入れ条件（簡易）': story.acceptanceCriteria || '',
        'メモ / ルール': story.notes || '',
        'KPI（任意）': story.kpi || '',
        'ID': story.id // Include ID for reference
    }));

    const csv = Papa.unparse(csvData, {
        header: true
    });

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `user-story-map-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
