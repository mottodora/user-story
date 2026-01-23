# US-005: Story追加・削除機能

## ユーザーストーリー

**As a** ユーザーストーリーマップの編集者  
**I want** ボード上の特定のセルに新しいStoryを追加し、不要なStoryを削除できるようにしたい  
**So that** マップの内容を自由に編集・管理できる

## 背景

ユーザーストーリーマッピングツールとして、Storyの追加と削除は最も基本的な機能です。以下の要件を満たす実装が必要でした：

- **セル単位での追加**: 特定のActivity × Releaseのセルに新しいStoryを追加
- **編集モーダルからの削除**: 既存のStoryを編集モーダルから削除
- **データベース連携**: 追加・削除操作を永続化
- **UI/UXの最適化**: ホバー時のボタン表示、確認ダイアログなど

## 受け入れ基準

### Story追加機能
- [ ] セル（Activity × Releaseの交差点）にホバーすると、「Add Story」ボタンが表示される
- [ ] 「Add Story」ボタンをクリックすると、編集モーダルが開く
- [ ] モーダルには、選択されたActivityとReleaseが自動的に設定される
- [ ] タイトルと詳細情報を入力してStoryを作成できる
- [ ] 作成後、そのセルにStoryカードが表示される

### Story削除機能
- [ ] Storyカードをクリックすると、編集モーダルが開く
- [ ] モーダルには「Delete」ボタンが表示される
- [ ] 「Delete」ボタンをクリックすると、確認ダイアログが表示される
- [ ] 確認後、Storyが削除される
- [ ] 削除後、ボードから該当のStoryカードが消える

### データ永続化
- [ ] 追加されたStoryはデータベースに保存される
- [ ] 削除されたStoryはデータベースから削除される
- [ ] リロード後も追加・削除の結果が保持される

### エラーハンドリング
- [ ] 削除失敗時にエラーメッセージが表示される
- [ ] 削除のキャンセルが可能

## 実装の詳細

### コンポーネント

#### StoryMapCell
- **場所**: `src/components/StoryMapCell.tsx`
- **責務**: 
  - セル内のStoryカードの表示
  - ホバー時の「Add Story」ボタン表示
  - セルへのドロップ機能
- **Props**:
  - `activity: string` - Activity名
  - `release: string` - Release名
  - `stories: Story[]` - セル内のStory一覧
  - `onAddStory: (activity: string, release: string) => void` - Story追加ハンドラー
  - `onStoryClick: (story: Story) => void` - Storyクリックハンドラー

**重要な実装**:
```tsx
// ホバー時のボタン表示
<div className="group relative">
  <div className="opacity-0 group-hover:opacity-100">
    <button onClick={() => onAddStory(activity, release)}>
      Add Story
    </button>
  </div>
</div>
```

#### EditStoryModal
- **場所**: `src/components/EditStoryModal.tsx`
- **責務**: 
  - Story編集フォームの表示
  - タイトル、本文、Activity、Release、ステータス、KPIの編集
  - 削除ボタンの提供
- **Props**:
  - `story: Story | null` - 編集対象のStory（nullの場合は新規作成）
  - `isOpen: boolean` - モーダルの開閉状態
  - `onClose: () => void` - モーダルを閉じるハンドラー
  - `onSave: (updatedStory: Story) => void` - 保存ハンドラー
  - `onDelete: (storyId: string) => void` - 削除ハンドラー
  - `activities: string[]` - Activity一覧
  - `releases: string[]` - Release一覧

**削除処理の実装**:
```tsx
const handleDelete = () => {
  if (formData && onDelete) {
    if (window.confirm('Are you sure you want to delete this story?')) {
      onDelete(formData.id);
    }
  }
};
```

#### MapPage
- **場所**: `src/components/MapPage.tsx`
- **変更内容**:
  - `handleAddStory`関数を追加（新規Story作成）
  - `handleDeleteStory`関数を追加（Story削除とAPI呼び出し）
  - `EditStoryModal`の統合

### バックエンドAPI

#### POST /api/stories (Story追加)
- **パラメータ**:
  - `story: Story` - 新規Storyオブジェクト
  - `mapId: string` - マップID
- **処理**: `upsert`操作でStoryを作成
- **レスポンス**: 作成されたStoryオブジェクト

#### DELETE /api/stories (Story削除)
- **パラメータ**: 
  - `id: string` (クエリパラメータ)
- **処理**: 指定されたStoryを削除
- **レスポンス**: `{ success: true }`

### データフロー

**Story追加のフロー**:
1. ユーザーがセルの「Add Story」ボタンをクリック
2. `handleAddStory(activity, release)`が呼ばれる
3. 新しいStoryオブジェクトを作成（UUIDを生成）
4. 編集モーダルが開き、ActivityとReleaseが事前設定される
5. ユーザーがタイトルなどを入力して保存
6. `POST /api/stories`でデータベースに保存
7. ローカル状態を更新し、UIに反映

**Story削除のフロー**:
1. ユーザーがStoryカードをクリック
2. 編集モーダルが開く
3. 「Delete」ボタンをクリック
4. 確認ダイアログが表示される
5. 確認後、`handleDeleteStory(storyId)`が呼ばれる
6. `DELETE /api/stories?id={storyId}`でデータベースから削除
7. ローカル状態を更新し、UIから削除

## デザイン/UXの考慮事項

### ホバーインタラクション
- セルにホバーするとボタンが表示される（`opacity-0` → `opacity-100`）
- 視覚的なノイズを減らしながら、必要な時だけ機能を提示

### 削除の確認ダイアログ
- 誤削除を防ぐため、`window.confirm()`で確認
- 将来的にはカスタムモーダルに移行することも検討

### 視覚的フィードバック
- Story追加後、ボードに即座にカードが表示される
- Story削除後、アニメーションで消える（現在は即時削除）

### アクセシビリティ
- ホバーだけでなく、フォーカス時にもボタンが表示されるべき（改善余地あり）
- キーボード操作のサポート

## テストシナリオ

### 正常系
1. **Story追加**
   - セルにホバー → 「Add Story」ボタンが表示される
   - ボタンをクリック → モーダルが開く
   - タイトルを入力（例: "ユーザー登録機能"）→ 保存
   - セルに新しいStoryカードが表示される

2. **Story削除**
   - Storyカードをクリック → モーダルが開く
   - 「Delete」ボタンをクリック → 確認ダイアログが表示される
   - 確認 → Storyが削除され、ボードから消える

3. **永続化の確認**
   - Storyを追加 → リロード → Storyが表示される
   - Storyを削除 → リロード → Storyが表示されない

### 異常系
1. **削除のキャンセル**
   - Storyの削除確認ダイアログで「キャンセル」→ Storyは削除されない

2. **削除失敗時**
   - ネットワークエラー時に削除を試行 → エラーメッセージが表示される

3. **空のStory作成**
   - タイトルを入力せずに保存 → バリデーションエラー（required属性で防止）

## 関連リソース

- **実装会話**: [ea357f57-2d02-49ff-8c79-da99049bed15](../../../.gemini/antigravity/conversations/ea357f57-2d02-49ff-8c79-da99049bed15)
- **Knowledge Item**: [User Story Mapping Implementation](../../../.gemini/antigravity/knowledge/user_story_mapping_implementation)

## ステータス

- **作成日**: 2026-01-23
- **最終更新日**: 2026-01-23
- **ステータス**: ✅ 実装完了
- **実装者**: @mottodora

## 変更履歴

### 2026-01-22
- **初回実装**: Story追加・削除機能の実装
- **UI改善**: ホバー時のボタン表示、モーダル統合
- **API連携**: 永続化機能との統合
