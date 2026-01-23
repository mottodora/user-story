# US-009: AI活用マップ生成機能

## User Story

**As a** プロダクトオーナー  
**I want** AIを使ってユーザーストーリーマップの叩き台を自動生成したい  
**So that** ゼロからマップを作成する手間を削減し、素早くプロジェクトを開始できる

## Background

ユーザーストーリーマッピングを始める際、白紙の状態から全てのアクティビティやストーリーを考えるのは時間がかかります。特に新規プロジェクトでは、全体像を把握するまでに多くの試行錯誤が必要です。

この機能では、ユーザーがプロダクトのアイデアをテキストで入力すると、Google Gemini APIを活用してbackbone（アクティビティ）、MVP、次のリリースなどの叩き台を自動生成します。生成されたマップは編集可能なため、ユーザーは自由にカスタマイズできます。

## Acceptance Criteria

### 必須条件

- [ ] ホームページに「AIでマップを生成」ボタンが表示される
- [ ] ボタンはグラデーション背景（紫→青）とSparklesアイコンで視覚的に目立つ
- [ ] ボタンクリックでAI生成モーダルが開く
- [ ] モーダルには以下が含まれる:
  - タイトル「AIでマップを生成」
  - プロダクトアイデアを入力するテキストエリア
  - 文字数カウンター
  - 「キャンセル」と「生成する」ボタン
- [ ] 「生成する」ボタンクリック時、ローディング表示が出る
- [ ] AI生成完了後、プレビュー画面が表示される
- [ ] プレビュー画面には以下が含まれる:
  - 生成されたマップ名
  - アクティビティのリスト
  - リリース別のストーリー一覧
  - 「再生成」と「このまま作成」ボタン
- [ ] 「このまま作成」クリック後、新規マップが作成される
- [ ] 作成されたマップの詳細画面に自動遷移する
- [ ] 生成されたアクティビティとストーリーがボード上に表示される

### エラーハンドリング

- [ ] APIキーが未設定の場合、適切なエラーメッセージを表示
- [ ] テキストエリアが空の場合、バリデーションエラーを表示
- [ ] ネットワークエラー時、ユーザーフレンドリーなメッセージを表示
- [ ] エラー発生時、リトライオプションを提供

## Implementation Details

### データモデル

#### StoryMap拡張

`prisma/schema.prisma`に以下のフィールドを追加:

```prisma
model StoryMap {
  id            String   @id @default(uuid())
  name          String
  isSample      Boolean  @default(false)
  activities    String?  @default("[]")
  aiPrompt      String?          // 新規: ユーザーのプロンプト
  isAiGenerated Boolean  @default(false)  // 新規: AI生成フラグ
  stories       Story[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**マイグレーション**: `20260123044439_add_ai_fields`

### バックエンドAPI

#### [`api/ai-generate.ts`](file:///Users/motoki/Documents/user-story-mapping/api/ai-generate.ts)

Google Gemini APIを使用してマップ構造を生成。

**技術スタック**:
- Vercel AI SDK (`ai` パッケージ)
- Google Gemini統合 (`@ai-sdk/google`)
- Zodスキーマバリデーション (`zod`)

**プロンプト設計**:
```
あなたはユーザーストーリーマッピングの専門家です。
ユーザーストーリーマップは、ユーザーの行動フローを水平方向（Backbone/アクティビティ）に配置し、
各アクティビティに関連する機能を優先順位順に垂直方向（リリース）に配置したものです。

以下のプロダクトアイデアから、実用的なユーザーストーリーマップを生成してください：

[ユーザー入力]

要件：
- 適切なマップ名を生成する
- 3〜7個程度のアクティビティを生成する（ユーザーの行動順序を考慮）
- 各リリースには以下を考慮：
  * MVP: 最小限の価値を提供するために必要な機能
  * 次へ: MVPの次に追加すべき機能
  * 将来: 長期的に検討すべき機能
- 各ストーリーには具体的なタイトルをつける
```

**レスポンススキーマ**:
```typescript
{
  mapName: string,
  activities: string[],
  releases: [
    {
      name: string,
      stories: [
        { title: string, activity: string, body?: string }
      ]
    }
  ]
}
```

#### [`api/maps.ts`](file:///Users/motoki/Documents/user-story-mapping/api/maps.ts)拡張

AI生成マップのデータを一括作成。

**変更点**:
- `aiPrompt`, `isAiGenerated`, `activities`, `stories`パラメータを受け入れ
- Prismaトランザクションでマップとストーリーを同時作成
- 既存の通常マップ作成との互換性を維持

### フロントエンド

#### [`AiMapGeneratorModal.tsx`](file:///Users/motoki/Documents/user-story-mapping/src/components/AiMapGeneratorModal.tsx)

3ステップウィザード形式のモーダル。

**ステップ管理**:
```typescript
type Step = 'input' | 'generating' | 'preview';
```

**主要機能**:
- Step 1: テキストエリアでアイデア入力、文字数カウンター
- Step 2: ローディングスピナーとメッセージ
- Step 3: 生成結果のプレビュー（マップ名、アクティビティ、ストーリー一覧）

#### [`HomePage.tsx`](file:///Users/motoki/Documents/user-story-mapping/src/components/HomePage.tsx)修正

「AIでマップを生成」ボタンを追加。

**デザイン**:
```tsx
<button
  onClick={() => setIsAiModalOpen(true)}
  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
>
  <Sparkles className="w-5 h-5" />
  AIでマップを生成
</button>
```

#### [`App.tsx`](file:///Users/motoki/Documents/user-story-mapping/src/App.tsx)修正

AI生成マップの作成ハンドラーを実装。

**フロー**:
1. モーダルから生成データを受け取る
2. リリース別のストーリーをフラット化
3. `/api/maps`にPOST
4. 成功時にマップ詳細画面へ遷移

### 依存関係

[`package.json`](file:///Users/motoki/Documents/user-story-mapping/package.json)に追加:
- `ai@^4.1.17`
- `@ai-sdk/google@^1.0.10`
- `zod@^3.24.1`

## Test Scenarios

### シナリオ1: 正常系 - AI生成マップの作成

**前提条件**:
- `.env`ファイルに`GOOGLE_GENERATIVE_AI_API_KEY`が設定されている

**手順**:
1. ホームページで「AIでマップを生成」ボタンをクリック
2. テキストエリアに以下を入力:
   ```
   オンラインで本を検索・レビューできる読書管理アプリ。
   ユーザーは本を検索し、読みたいリストに追加できる。
   読了後にレビューとスコアを投稿できる。
   ```
3. 「生成する」ボタンをクリック
4. プレビュー画面で生成結果を確認
5. 「このまま作成」ボタンをクリック

**期待結果**:
- マップが正常に作成される
- マップ詳細画面に遷移する
- ボード上にアクティビティとストーリーが表示される

### シナリオ2: エラーケース - APIキー未設定

**前提条件**:
- `.env`ファイルに`GOOGLE_GENERATIVE_AI_API_KEY`が設定されていない

**手順**:
1. 「AIでマップを生成」ボタンをクリック
2. プロンプトを入力
3. 「生成する」ボタンをクリック

**期待結果**:
- エラーメッセージ「APIキーが設定されていません。管理者に連絡してください。」が表示される
- ステップ1（入力画面）に戻る

### シナリオ3: エラーケース - 空のプロンプト

**手順**:
1. 「AIでマップを生成」ボタンをクリック
2. テキストエリアを空のままにする
3. 「生成する」ボタンをクリック

**期待結果**:
- エラーメッセージ「プロンプトを入力してください」が表示される
- 「生成する」ボタンが無効化される

### シナリオ4: 再生成

**手順**:
1. マップを生成
2. プレビュー画面で「再生成」ボタンをクリック

**期待結果**:
- 入力画面（ステップ1）に戻る
- 以前のプロンプトが保持されている

## Related Resources

### ドキュメント
- [実装計画](file:///Users/motoki/.gemini/antigravity/brain/7ea35467-c07d-46ff-bf84-603d8860363b/implementation_plan.md)
- [ウォークスルー](file:///Users/motoki/.gemini/antigravity/brain/7ea35467-c07d-46ff-bf84-603d8860363b/walkthrough.md)

### コード
- [api/ai-generate.ts](file:///Users/motoki/Documents/user-story-mapping/api/ai-generate.ts)
- [api/maps.ts](file:///Users/motoki/Documents/user-story-mapping/api/maps.ts)
- [AiMapGeneratorModal.tsx](file:///Users/motoki/Documents/user-story-mapping/src/components/AiMapGeneratorModal.tsx)
- [HomePage.tsx](file:///Users/motoki/Documents/user-story-mapping/src/components/HomePage.tsx)
- [App.tsx](file:///Users/motoki/Documents/user-story-mapping/src/App.tsx)

### 外部リソース
- [Google AI Studio](https://makersuite.google.com/app/apikey) - APIキー取得
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)

## Change Log

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-23 | 初版作成 | AI Assistant |

## Notes

- APIキーは環境変数で管理され、コードには含まれません
- `.env`ファイルは`.gitignore`に追加済みです
- `.env.example`ファイルを参考に環境変数を設定してください
- AI生成されたマップは後から編集可能です（Activity追加、Story編集など）
- 生成コストを抑えるため、プロンプトは500文字以内を推奨します
