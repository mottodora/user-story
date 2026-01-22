import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    console.log(`[${req.method}] /api/stories`);

    try {
        if (req.method === 'GET') {
            const { mapId } = req.query;

            if (!mapId) {
                return res.status(400).json({ error: 'mapId is required' });
            }

            // Get the map
            const map = await prisma.storyMap.findUnique({
                where: { id: String(mapId) }
            });

            if (!map) {
                return res.status(404).json({ error: 'Map not found' });
            }

            // Get stories for this map
            const stories = await prisma.story.findMany({
                where: { mapId: String(mapId) }
            });

            // Get activities from the map's activities field, or extract from stories
            let activities = [];
            try {
                activities = map.activities ? JSON.parse(map.activities) : [];
            } catch (e) {
                console.error('Failed to parse activities:', e);
                activities = [];
            }

            // If no activities are stored, extract from stories (backward compatibility)
            if (activities.length === 0) {
                const activitySet = new Set(stories.map(s => s.activity));
                activities = Array.from(activitySet).sort();

                // Default activities if still empty
                if (activities.length === 0) {
                    activities = ['User Registration', 'Login', 'Profile'];
                }

                // Save extracted activities to database for future use
                await prisma.storyMap.update({
                    where: { id: String(mapId) },
                    data: { activities: JSON.stringify(activities) }
                });
            }

            // Extract unique releases (priorities)
            let releases = Array.from(new Set(stories.map(s => s.release)));
            if (releases.length === 0) {
                releases = ['MVP', 'Next', 'Later'];
            }

            // Ensure standard releases exist if we want them to always be there
            const defaultReleases = ['MVP', 'Next', 'Later'];
            defaultReleases.forEach(r => {
                if (!releases.includes(r)) releases.push(r);
            });

            res.status(200).json({
                map: {
                    id: map.id,
                    name: map.name,
                    isSample: map.isSample,
                    createdAt: map.createdAt.toISOString()
                },
                stories,
                activities,
                releases
            });
        } else if (req.method === 'POST') {
            const body = req.body;
            // Body can be a single story to save/update
            // OR it can be the whole state. 
            // Plan said: "Save Data: On any change (add/edit/delete), fetch('/api/stories', { method: 'POST', ... })"
            // But standard REST is better.
            // Let's support:
            // 1. POST { story } -> create/update
            // 2. DELETE { id } -> delete

            // The frontend "save" sends the updated story.
            if (body.story) {
                const { id, title, activity, release, body: storyBody, status } = body.story;
                const { mapId } = body;

                if (!mapId) {
                    return res.status(400).json({ error: 'mapId is required for saving story' });
                }

                const result = await prisma.story.upsert({
                    where: { id: id || 'new' }, // 'new' won't match UUID usually
                    update: { title, activity, release, body: storyBody, status },
                    create: { id, mapId, title, activity, release, body: storyBody, status },
                });
                res.status(200).json(result);
            } else if (body.deleteId) {
                await prisma.story.delete({
                    where: { id: body.deleteId },
                });
                res.status(200).json({ success: true });
            } else {
                // Fallback: if we send the whole board? No, let's stick to granular updates if possible or handle bulk?
                // The frontend code currently updates the whole "data" object locally.
                // Let's update frontend to call granular APIs.
                res.status(400).json({ error: "Invalid payload" });
            }

        } else if (req.method === 'DELETE') {
            // Support RESTful DELETE /api/stories?id=...
            const { id } = req.query;
            if (id) {
                await prisma.story.delete({ where: { id: String(id) } });
                res.status(200).json({ success: true });
            } else {
                res.status(400).json({ error: "Missing id" });
            }
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
