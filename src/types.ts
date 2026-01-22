export type Priority = 'MVP' | 'Next' | 'Later' | string;

export interface Story {
    id: string;
    activity: string;
    title: string;
    release: string; // Priority
    acceptanceCriteria?: string;
    notes?: string;
    kpi?: string;
    status?: string;
}

export interface StoryMapData {
    activities: string[];
    releases: string[];
    stories: Story[];
}
