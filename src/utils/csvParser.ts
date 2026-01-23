import Papa from 'papaparse';
import type { Story, StoryMapData } from '../types';

export const parseCSV = (csvText: string): StoryMapData => {
    const parseResult = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
    });

    const rawData = parseResult.data as Record<string, string>[];
    const stories: Story[] = [];
    const activities = new Set<string>();
    const releases = new Set<string>();

    rawData.forEach((row, index) => {
        const activity = row['アクティビティ（バックボーン）'];
        const title = row['タイトル'];
        const body = row['ユーザーストーリー'];
        const release = row['優先度'];

        if (!activity && !title) return;

        if (activity) activities.add(activity);
        if (release) releases.add(release);

        stories.push({
            id: `story-${index}`,
            activity: activity || 'Uncategorized',
            title: title || '',
            body: body || '',
            release: release || 'Unscheduled',
            acceptanceCriteria: row['受け入れ条件（簡易）'],
            notes: row['メモ / ルール'],
            kpi: row['KPI（任意）'],
            status: row['ステータス'],
        });
    });

    return {
        map: {
            id: 'imported-map',
            name: 'Imported Map',
            isSample: false,
            createdAt: new Date().toISOString()
        },
        activities: Array.from(activities),
        releases: Array.from(releases),
        stories,
    };
};
