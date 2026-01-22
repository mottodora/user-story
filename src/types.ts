export type Priority = 'MVP' | 'Next' | 'Later' | string;

export interface Story {
    id: string;
    activity: string;
    title: string;
    body?: string;
    release: string; // Priority
    acceptanceCriteria?: string;
    notes?: string;
    kpi?: string;
    status?: string;
}

export interface StoryMap {
    id: string;
    name: string;
    isSample: boolean;
    createdAt: string;
}

export interface StoryMapData {
    map: StoryMap;
    activities: string[];
    releases: string[];
    stories: Story[];
}
