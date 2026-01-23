import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    console.log(`[${req.method}] /api/maps`);

    try {
        if (req.method === 'GET') {
            const maps = await prisma.storyMap.findMany({
                orderBy: { createdAt: 'desc' }
            });
            res.status(200).json(maps);
        } else if (req.method === 'POST') {
            const { name, aiPrompt, isAiGenerated, activities, stories } = req.body;
            if (!name) {
                return res.status(400).json({ error: "Name is required" });
            }

            // AI生成マップの場合、トランザクションでマップとストーリーを一括作成
            if (isAiGenerated && activities && stories) {
                const newMap = await prisma.storyMap.create({
                    data: {
                        name,
                        isSample: false,
                        aiPrompt,
                        isAiGenerated: true,
                        activities: JSON.stringify(activities),
                        stories: {
                            create: stories.map((story: any) => ({
                                title: story.title,
                                activity: story.activity,
                                release: story.release,
                                body: story.body || '',
                                status: story.status || 'todo'
                            }))
                        }
                    },
                    include: {
                        stories: true
                    }
                });
                return res.status(201).json(newMap);
            }

            // 通常のマップ作成
            const newMap = await prisma.storyMap.create({
                data: { name, isSample: false }
            });
            res.status(201).json(newMap);
        } else if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) {
                return res.status(400).json({ error: "ID is required" });
            }
            await prisma.storyMap.delete({
                where: { id: String(id) }
            });
            res.status(200).json({ success: true });
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
