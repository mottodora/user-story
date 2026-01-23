# US-004: Story永続化機能

## ユーザーストーリー

**As a** ユーザーストーリーマップの管理者  
**I want** 作成したStoryがデータベースに保存され、リロード後も保持されるようにしたい  
**So that** 作業内容が失われることなく、継続的にマップを編集できる

## 背景

初期の実装では、Storyデータはメモリ上のみに保存されており、ページをリロードすると全てのデータが失われていました。これでは実用的な利用ができないため、以下の永続化機能を実装しました：

- Prisma + SQLiteによるデータベース統合
- Story CRUD操作のためのAPI実装
- ドラッグ&ドロップによる移動の自動保存
- マップデータのフェッチと初期状態の復元

## 受け入れ基準

### データの永続化
- [ ] 新規作成したStoryがデータベースに保存される
- [ ] Storyの編集内容がデータベースに反映される
- [ ] Storyの削除がデータベースに反映される
- [ ] ドラッグ&ドロップによる移動（Activity/Release変更）が保存される

### データの読み込み
- [ ] ページを開いた時、保存済みのStoryが表示される
- [ ] リロード後も同じ状態が復元される
- [ ] 複数のマップそれぞれに固有のStoryが保存される

### エラーハンドリング
- [ ] 保存失敗時にエラーメッセージが表示される
- [ ] ネットワークエラー時の適切なフィードバック
- [ ] データ不整合時の復旧処理

### パフォーマンス
- [ ] Story移動時の保存がスムーズ（ユーザー操作を阻害しない）
- [ ] 初期ロード時のデータフェッチが高速

## 実装の詳細

### データベーススキーマ

```prisma
model StoryMap {
  id         String   @id @default(uuid())
  name       String
  isSample   Boolean  @default(false)
  activities String?  @default("[]")
  stories    Story[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Story {
  id        String   @id @default(uuid())
  title     String
  activity  String
  release   String
  body      String?
  status    String?
  mapId     String
  map       StoryMap @relation(fields: [mapId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**重要な設計判断**:
- `onDelete: Cascade`: マップ削除時に関連Storyも自動削除
- `activities`はJSON文字列として`StoryMap`に保存（順序を維持）

### バックエンドAPI

#### GET /api/stories
- **パラメータ**: 
  - `mapId: string` (クエリパラメータ)
- **処理**:
  1. 指定されたマップのStoryをすべて取得
  2. マップのactivitiesをJSON解析
  3. releasesを抽出（またはデフォルト値を使用）
- **レスポンス**:
  ```typescript
  {
    map: StoryMap,
    stories: Story[],
    activities: string[],
    releases: string[]
  }
  ```

#### POST /api/stories
- **パラメータ**:
  - `story: Story` - 保存/更新するStory
  - `mapId: string` - マップID
- **処理**:
  - `upsert`操作（IDが存在すればupdate、なければcreate）
- **レスポンス**: 保存されたStoryオブジェクト

#### DELETE /api/stories
- **パラメータ**: 
  - `id: string` (クエリパラメータ)
- **処理**: 指定されたStoryを削除
- **レスポンス**: `{ success: true }`

### フロントエンド実装

#### MapPage
- **場所**: `src/components/MapPage.tsx`
- **変更内容**:
  - `useEffect`でマップデータをフェッチ
  - `handleStoryUpdate`関数でStory更新をAPI経由で保存
  - `handleStoryMove`関数でドラッグ&ドロップ時の保存
  - `handleDeleteStory`関数でStory削除

**重要な実装ポイント**:
```typescript
// mapIdを常にAPIリクエストに含める
const handleStoryUpdate = async (story: Story) => {
  await fetch('/api/stories', {
    method: 'POST',
    body: JSON.stringify({ story, mapId })
  });
};
```

#### ドラッグ&ドロップの永続化
- `onDragEnd`イベント内で、移動後のStory情報をAPIに送信
- optimistic UIにより、UIは即座に更新され、バックグラウンドで保存

### エラーハンドリング

- **APIエラー**: try-catchブロックでキャッチし、ユーザーにエラーメッセージを表示
- **ネットワークエラー**: タイムアウト処理とリトライ機能
- **データ不整合**: フェッチ失敗時のフォールバック（デフォルトデータの使用）

## デザイン/UXの考慮事項

### 保存インジケーター
- 現在の実装では、保存は自動的かつ透過的に行われる
- 将来的には「保存中...」インジケーターを追加することも検討

### Optimistic UI
- ドラッグ&ドロップ時、UIは即座に更新
- バックグラウンドでAPIリクエストを実行
- 失敗時のロールバック処理

### データフェッチ戦略
- ページ読み込み時に一度だけフェッチ
- その後はローカル状態を操作し、変更時にAPIで同期

## テストシナリオ

### 正常系
1. **Story作成と永続化**
   - 新しいStoryを作成 → ページをリロード → Storyが表示される

2. **Story編集と永続化**
   - Storyを編集（タイトル、本文など変更）→ 保存 → リロード → 編集内容が反映されている

3. **ドラッグ&ドロップと永続化**
   - Storyを別のセルに移動 → リロード → 移動後の位置に表示される

4. **Story削除と永続化**
   - Storyを削除 → リロード → 削除されたStoryは表示されない

### 異常系
1. **ネットワークエラー時の保存**
   - ネットワークを切断 → Storyを編集 → エラーメッセージが表示される

2. **存在しないマップIDへのアクセス**
   - 存在しないマップIDでアクセス → 404エラーまたはリダイレクト

3. **データ不整合の復旧**
   - データベースから不正なJSONが返される → デフォルト値を使用してレンダリング

## 関連リソース

- **実装会話**: 
  - [1a4cadc4-ae0a-4f2d-9085-6ec3ef6b27b7](../../../.gemini/antigravity/conversations/1a4cadc4-ae0a-4f2d-9085-6ec3ef6b27b7)
  - [c39f8070-6084-4112-b087-139f03d2c77a](../../../.gemini/antigravity/conversations/c39f8070-6084-4112-b087-139f03d2c77a)
- **Knowledge Item**: [User Story Mapping Implementation](../../../.gemini/antigravity/knowledge/user_story_mapping_implementation)

## ステータス

- **作成日**: 2026-01-23
- **最終更新日**: 2026-01-23
- **ステータス**: ✅ 実装完了
- **実装者**: @mottodora

## 変更履歴

### 2026-01-22
- **初回実装**: Prisma + SQLiteによるデータベース統合
- **API実装**: Story CRUD操作のためのエンドポイント作成
- **バグ修正**: mapIdの欠落によるStory保存失敗を修正
- **ドラッグ&ドロップ対応**: 移動時の自動保存機能を実装
