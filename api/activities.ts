import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    console.log(`[${req.method}] /api/activities`);

    try {
        if (req.method === 'POST') {
            const { mapId, name } = req.body;

            if (!mapId || !name) {
                return res.status(400).json({ error: 'mapId and name are required' });
            }

            // Get the current map
            const map = await prisma.storyMap.findUnique({
                where: { id: String(mapId) }
            });

            if (!map) {
                return res.status(404).json({ error: 'Map not found' });
            }

            // Parse current activities
            let activities = [];
            try {
                activities = map.activities ? JSON.parse(map.activities) : [];
            } catch (e) {
                console.error('Failed to parse activities:', e);
                activities = [];
            }

            // Check for duplicates
            if (activities.includes(name)) {
                return res.status(400).json({ error: 'Activity already exists' });
            }

            // Add new activity
            activities.push(name);

            // Update the map
            await prisma.storyMap.update({
                where: { id: String(mapId) },
                data: { activities: JSON.stringify(activities) }
            });

            res.status(200).json({ success: true, activities });

        } else if (req.method === 'PUT') {
            // Update activity order (for drag-and-drop reordering)
            const { mapId, activities } = req.body;

            if (!mapId || !activities || !Array.isArray(activities)) {
                return res.status(400).json({ error: 'mapId and activities array are required' });
            }

            await prisma.storyMap.update({
                where: { id: String(mapId) },
                data: { activities: JSON.stringify(activities) }
            });

            res.status(200).json({ success: true, activities });

        } else if (req.method === 'DELETE') {
            const { mapId, name } = req.query;

            if (!mapId || !name) {
                return res.status(400).json({ error: 'mapId and name are required' });
            }

            // Check if any stories are using this activity
            const storiesWithActivity = await prisma.story.findMany({
                where: {
                    mapId: String(mapId),
                    activity: String(name)
                }
            });

            if (storiesWithActivity.length > 0) {
                return res.status(400).json({
                    error: 'Cannot delete activity with existing stories',
                    storyCount: storiesWithActivity.length
                });
            }

            // Get the current map
            const map = await prisma.storyMap.findUnique({
                where: { id: String(mapId) }
            });

            if (!map) {
                return res.status(404).json({ error: 'Map not found' });
            }

            // Parse and update activities
            let activities = [];
            try {
                activities = map.activities ? JSON.parse(map.activities) : [];
            } catch (e) {
                console.error('Failed to parse activities:', e);
            }

            activities = activities.filter(a => a !== name);

            await prisma.storyMap.update({
                where: { id: String(mapId) },
                data: { activities: JSON.stringify(activities) }
            });

            res.status(200).json({ success: true, activities });

        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
