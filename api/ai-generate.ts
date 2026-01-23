import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

// レスポンススキーマの定義
const MapGenerationSchema = z.object({
    mapName: z.string().describe('生成されたマップの名前'),
    activities: z.array(z.string()).describe('ユーザーの行動フローを表すアクティビティのリスト'),
    releases: z.array(
        z.object({
            name: z.string().describe('リリース名（例: MVP, 次へ、将来）'),
            stories: z.array(
                z.object({
                    title: z.string().describe('ストーリーのタイトル'),
                    activity: z.string().describe('このストーリーが属するアクティビティ'),
                    body: z.string().optional().describe('ストーリーの詳細説明'),
                })
            ),
        })
    ),
});

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({ error: 'プロンプトを入力してください' });
    }

    // APIキーの確認
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        console.error('GOOGLE_GENERATIVE_AI_API_KEY is not set');
        return res.status(500).json({
            error: 'APIキーが設定されていません。管理者に連絡してください。'
        });
    }

    try {
        // Gemini APIを使用してマップ構造を生成
        const { object } = await generateObject({
            model: google('gemini-2.0-flash-exp', { apiKey }),
            schema: MapGenerationSchema,
            prompt: `あなたはユーザーストーリーマッピングの専門家です。
ユーザーストーリーマップは、ユーザーの行動フローを水平方向（Backbone/アクティビティ）に配置し、
各アクティビティに関連する機能を優先順位順に垂直方向（リリース）に配置したものです。

以下のプロダクトアイデアから、実用的なユーザーストーリーマップを生成してください：

${prompt}

要件：
- 適切なマップ名を生成する
- 3〜7個程度のアクティビティを生成する（ユーザーの行動順序を考慮）
- 各リリースには以下を考慮：
  * MVP: 最小限の価値を提供するために必要な機能
  * 次へ: MVPの次に追加すべき機能
  * 将来: 長期的に検討すべき機能
- 各ストーリーには具体的なタイトルをつける
- ストーリーの詳細（body）は簡潔に記述する

日本語で生成してください。`,
        });

        return res.status(200).json(object);
    } catch (error) {
        console.error('AI generation error:', error);

        // エラー詳細のログ
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }

        return res.status(500).json({
            error: 'マップの生成中にエラーが発生しました。もう一度お試しください。',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
