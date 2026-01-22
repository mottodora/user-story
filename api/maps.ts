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
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ error: "Name is required" });
            }
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
