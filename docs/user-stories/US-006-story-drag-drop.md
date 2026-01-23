# US-006: Storyドラッグ&ドロップ機能

## ユーザーストーリー

**As a** ユーザーストーリーマップの編集者  
**I want** Storyカードをドラッグ&ドロップで移動できるようにしたい  
**So that** 直感的な操作でStoryの優先度やActivityを変更できる

## 背景

ユーザーストーリーマッピングでは、Storyの位置（Activity × Release）が重要な意味を持ちます。プロジェクトの進行に伴い、StoryのActivityや優先度（Release）を変更する必要があります。

従来の方法（編集モーダルでドロップダウンから選択）よりも、ドラッグ&ドロップによる直感的な操作を可能にすることで、ユーザーエクスペリエンスが大幅に向上します。

## 受け入れ基準

### 基本的なドラッグ&ドロップ
- [ ] Storyカードをマウスでドラッグできる
- [ ] ドラッグ中、カードが半透明になる
- [ ] ドロップ可能なエリアが視覚的に示される
- [ ] ドロップ後、Storyが新しい位置に移動する

### 水平方向の移動（Activity間）
- [ ] Storyを別のActivity列にドラッグ&ドロップできる
- [ ] ドロップ後、Storyの`activity`フィールドが更新される

### 垂直方向の移動（Release間）
- [ ] Storyを別のRelease行にドラッグ&ドロップできる
- [ ] ドロップ後、Storyの`release`フィールドが更新される

### セル内での並び替え
- [ ] 同じセル内でStoryの順序を変更できる
- [ ] ドロップ時、挿入位置がプレビューされる

### データ永続化
- [ ] ドラッグ&ドロップによる変更がデータベースに保存される
- [ ] リロード後も移動後の位置が保持される

### UX
- [ ] ドラッグ操作がスムーズである
- [ ] タッチデバイスでのスクロールが妨げられない
- [ ] ドラッグ中の視覚的フィードバックが明確

## 実装の詳細

### ライブラリ選定

**@dnd-kit** を採用：
- モダンなReact向けドラッグ&ドロップライブラリ
- アクセシビリティサポート
- タッチデバイス対応
- パフォーマンス最適化

### コンポーネント

#### SortableStoryCard
- **場所**: `src/components/SortableStoryCard.tsx`
- **責務**: 
  - `useSortable`フックでドラッグ可能にする
  - ドラッグ中の視覚的フィードバック（半透明化）
  - Story情報をドラッグデータとして保持
- **Props**:
  - `story: Story` - 表示するStory
  - `onClick?: (story: Story) => void` - クリックハンドラー

**重要な実装**:
```tsx
const { attributes, listeners, setNodeRef, transform, transition, isDragging } = 
  useSortable({ 
    id: story.id, 
    data: { type: 'Story', story } 
  });

const style = {
  transform: CSS.Translate.toString(transform),
  transition,
  opacity: isDragging ? 0.5 : 1,
};
```

#### StoryMapCell
- **場所**: `src/components/StoryMapCell.tsx`
- **責務**: 
  - `useDroppable`でドロップ先として機能
  - セル内のStoryを`SortableContext`でラップ
  - ドロップ時のハイライト表示
- **Props**:
  - `activity: string` - Activity名
  - `release: string` - Release名
  - `stories: Story[]` - セル内のStory一覧

**重要な実装**:
```tsx
const { setNodeRef, isOver } = useDroppable({
  id: `${activity}-${release}`,
  data: { type: 'Cell', activity, release }
});

// セル内のStoryの並び替え
<SortableContext items={stories.map(s => s.id)} strategy={verticalListSortingStrategy}>
  {stories.map(story => <SortableStoryCard key={story.id} story={story} />)}
</SortableContext>
```

#### StoryMapBoard
- **場所**: `src/components/StoryMapBoard.tsx`
- **責務**: 
  - `DndContext`でドラッグ&ドロップコンテキストを提供
  - `onDragEnd`イベントでドロップ処理
  - 衝突検出アルゴリズムの設定
- **Props**:
  - `onStoryMove: (storyId: string, newActivity: string, newRelease: string) => void`

**ドラッグ終了イベント処理**:
```tsx
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  
  if (!over) return;
  
  const activeStory = active.data.current?.story;
  const overData = over.data.current;
  
  if (overData?.type === 'Cell') {
    onStoryMove(activeStory.id, overData.activity, overData.release);
  }
};
```

### バックエンドAPI

Story移動時は既存の`POST /api/stories`エンドポイントを使用：
- Storyの`activity`と`release`フィールドを更新
- `upsert`操作で既存Storyを更新

### デバイス対応

タッチデバイスでのスクロール問題を回避：
```tsx
<div 
  {...attributes} 
  {...listeners}
  className="touch-none"  // prevent scrolling on touch devices
>
```

## デザイン/UXの考慮事項

### 視覚的フィードバック
- **ドラッグ中**: カードが半透明（`opacity: 0.5`）になる
- **ドロップ可能エリア**: セルがハイライトされる（`isOver`状態）
- **トランジション**: スムーズなアニメーション（transform, transition）

### パフォーマンス
- `@dnd-kit`は仮想DOM最適化により高速
- 大量のStoryでもスムーズな操作が可能

### アクセシビリティ
- キーボード操作のサポート（`@dnd-kit`が自動的に提供）
- スクリーンリーダー対応

### タッチデバイス対応
- `touch-none`クラスによるスクロール競合の回避
- タッチジェスチャーでのドラッグ操作

## テストシナリオ

### 正常系
1. **水平方向の移動（Activity間）**
   - Storyカードをドラッグ → 別のActivity列にドロップ
   - Storyが新しいActivityに移動される
   - リロード後も新しい位置に表示される

2. **垂直方向の移動（Release間）**
   - Storyカードをドラッグ → 別のRelease行にドロップ
   - Storyが新しいReleaseに移動される
   - リロード後も新しい位置に表示される

3. **斜め方向の移動（Activity & Release変更）**
   - Storyカードをドラッグ → 異なるActivity × Releaseのセルにドロップ
   - Storyの`activity`と`release`が両方とも更新される

4. **同一セル内での並び替え**
   - セル内のStoryをドラッグ → 同じセル内の別の位置にドロップ
   - Story の順序が変更される

### 異常系
1. **ドラッグのキャンセル**
   - Storyをドラッグ → ドロップせずにリリース
   - 元の位置に戻る

2. **無効なドロップエリア**
   - Storyをドラッグ → ボード外にドロップ
   - 元の位置に戻る

3. **保存失敗時**
   - ネットワークエラー時にドラッグ&ドロップ → エラーメッセージが表示される
   - UIは元の状態に戻る（ロールバック）

## 関連リソース

- **実装会話**: [448576c3-0fa2-4ebb-a2a3-5bb5f9c6f748](../../../.gemini/antigravity/conversations/448576c3-0fa2-4ebb-a2a3-5bb5f9c6f748)
- **Knowledge Item**: [User Story Mapping Implementation](../../../.gemini/antigravity/knowledge/user_story_mapping_implementation)
- **ライブラリ**: [@dnd-kit](https://dndkit.com/)

## ステータス

- **作成日**: 2026-01-23
- **最終更新日**: 2026-01-23
- **ステータス**: ✅ 実装完了
- **実装者**: @mottodora

## 変更履歴

### 2026-01-22
- **初回実装**: @dnd-kitを使用したドラッグ&ドロップ機能
- **UI改善**: ドラッグ中の視覚的フィードバックの追加
- **タッチデバイス対応**: `touch-none`クラスによるスクロール競合の解消
- **永続化統合**: ドラッグ&ドロップによる移動をAPIで保存
