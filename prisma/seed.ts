import { PrismaClient } from '@prisma/client';
// @ts-ignore
import fs from 'fs';
// @ts-ignore
import path from 'path';
// @ts-ignore
import { parse } from 'csv-parse/sync';
// @ts-ignore
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seeding...');
    // 1. Create a sample map
    try {
        const sampleMap = await prisma.storyMap.create({
            data: {
                name: 'サンプルプロジェクト',
                isSample: true,
            }
        });
        console.log('Sample map created:', sampleMap.id);

        const csvPath = path.join(__dirname, '../data/story_map.csv');
        console.log('CSV Path:', csvPath);
        const csvContent = fs.readFileSync(csvPath, 'utf-8');

        const records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true,
            bom: true,
        });

        console.log(`Found ${records.length} records in CSV.`);
        if (records.length > 0) {
            console.log('Sample record keys:', Object.keys(records[0]));
        }

        for (const record of records) {
            const activity = record['アクティビティ（バックボーン）'];
            const title = record['タイトル'];
            const body = record['ユーザーストーリー'];
            const release = record['優先度'];
            const status = record['ステータス'] || 'Draft';

            await prisma.story.create({
                data: {
                    title: title,
                    activity: activity,
                    release: release || 'MVP',
                    body: body,
                    status: status,
                    mapId: sampleMap.id
                }
            });
        }

        console.log('Seeding finished.');
    } catch (err) {
        console.error('Error during seeding:', err);
        throw err;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
