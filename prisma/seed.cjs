const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const prisma = new PrismaClient();

async function main() {
    const csvPath = path.join(__dirname, '../data/story_map.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
    });

    console.log(`Found ${records.length} records in CSV.`);

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
                status: status
            }
        });
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
