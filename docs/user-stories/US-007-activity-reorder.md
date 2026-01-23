# US-007: Activity並び替え機能

## ユーザーストーリー

**As a** ユーザーストーリーマップの管理者  
**I want** Backbone（Activity列）をドラッグ&ドロップで並び替えられるようにしたい  
**So that** ユーザージャーニーやワークフローの流れに合わせてActivityの順序を調整できる

## 背景

ユーザーストーリーマッピングでは、Backbone（水平方向のActivity）の順序が重要です。通常、左から右へユーザージャーニーやワークフローの時系列に沿って並べます。

プロジェクトの進行に伴い、Activityの順序を変更する必要が生じることがあります。そのため、直感的なドラッグ&ドロップ操作でActivityを並び替えられる機能を実装しました。

## 受け入れ基準

### 基本的なドラッグ&ドロップ
- [ ] Activityヘッダーをマウスでドラッグできる
- [ ] ドラッグ中、ヘッダーが半透明になる
- [ ] ドロップ後、Activityの列が新しい位置に移動する
- [ ] 移動にあわせて、グリッド全体が再配置される

### データ永続化
- [ ] 並び替えたActivityの順序がデータベースに保存される
- [ ] リロード後も新しい順序が保持される

### ドラッグとクリックの競合回避
- [ ] ドラッグ操作中はクリックイベントが発火しない
- [ ] 短いクリックでは詳細モーダルが開く（US-001と連携）
- [ ] ドラッグ後のクリック誤爆を防ぐ

### UX
- [ ] ドラッグ操作がスムーズである
- [ ] 視覚的フィードバックが明確
- [ ] タッチデバイスでも操作可能

## 実装の詳細

### コンポーネント

#### SortableActivityHeader
- **場所**: `src/components/SortableActivityHeader.tsx`
- **責務**: 
  - `useSortable`フックでActivityヘッダーをドラッグ可能にする
  - ドラッグ中の視覚的フィードバック
  - ドラッグとクリックの競合を回避
- **Props**:
  - `id: string` - Activity ID（ソート用）
  - `title: string` - Activity名
  - `onActivityClick?: (activityName: string) => void` - クリックハンドラー

**重要な実装（ドラッグとクリックの競合回避）**:
```tsx
const { isDragging } = useSortable({
  id,
  data: { type: 'Activity' }
});

const handleClick = (e: React.MouseEvent) => {
  // ドラッグ中はクリックイベントを無視
  if (!isDragging && onActivityClick) {
    e.stopPropagation();
    onActivityClick(title);
  }
};
```

#### StoryMapBoard
- **場所**: `src/components/StoryMapBoard.tsx`
- **責務**: 
  - Activities全体を`SortableContext`でラップ
  - `onDragEnd`でActivity順序の変更を処理
  - Activity順序の更新を親コンポーネントに通知
- **Props**:
  - `activities: string[]` - Activity一覧（順序を含む）
  - `onActivityReorder: (newOrder: string[]) => void` - 並び替えハンドラー

**並び替え処理の実装**:
```tsx
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  
  if (active.data.current?.type === 'Activity' && over) {
    const oldIndex = activities.indexOf(active.id);
    const newIndex = activities.indexOf(over.id);
    
    const newActivities = arrayMove(activities, oldIndex, newIndex);
    onActivityReorder(newActivities);
  }
};
```

#### MapPage
- **場所**: `src/components/MapPage.tsx`
- **変更内容**:
  - `handleActivityReorder`関数を追加
  - API経由でActivity順序を永続化

### バックエンドAPI

#### PUT /api/activities
- **パラメータ**:
  - `mapId: string` - マップID
  - `activities: string[]` - 新しいActivity順序の配列
- **処理**:
  - `StoryMap`の`activities`フィールドをJSON文字列として更新
- **レスポンス**: `{ success: true, activities: string[] }`

### データベーススキーマ

`StoryMap`モデルの`activities`フィールドに順序を保持：
```prisma
model StoryMap {
  activities String?  @default("[]")  // ["Login", "Profile", "Settings"]
}
```

配列の順序がそのままActivityの表示順序になります。

## デザイン/UXの考慮事項

### 視覚的フィードバック
- **ドラッグ中**: ヘッダーが半透明（`opacity: 0.5`）
- **Z-index**: ドラッグ中は他の要素より前面に表示（`z-index: 50`）
- **位置のプレビュー**: ドロップ位置が視覚的に示される

### ドラッグとクリックの競合回避
- `isDragging`状態を監視し、ドラッグ中はクリックイベントを無視
- これにより、ドラッグ終了時にモーダルが誤って開くことを防ぐ

### タッチデバイス対応
- `touchAction: 'none'`でスクロールとの競合を回避
- タッチジェスチャーでのドラッグ操作をサポート

### パフォーマンス
- `@dnd-kit`の最適化により、多数のActivityでもスムーズ
- Activityとそのストーリーが一緒に移動する

## テストシナリオ

### 正常系
1. **Activity並び替え**
   - Activityヘッダーをドラッグ → 別の位置にドロップ
   - Activity列全体が新しい位置に移動する
   - リロード後も新しい順序が保持される

2. **複数のActivity並び替え**
   - 複数のActivityを順次ドラッグ&ドロップ
   - 各移動が正しく反映される

3. **ドラッグとクリックの分離**
   - Activityヘッダーをクリック（ドラッグなし）→ 詳細モーダルが開く
   - Activityヘッダーをドラッグ → モーダルは開かない

### 異常系
1. **ドラッグのキャンセル**
   - Activityをドラッグ → ドロップせずにリリース
   - 元の位置に戻る

2. **保存失敗時**
   - ネットワークエラー時に並び替え → エラーメッセージが表示される
   - UIは元の状態に戻る（ロールバック）

3. **同じ位置へのドロップ**
   - Activityを元の位置にドロップ → 変化なし（APIリクエストなし）

## 関連リソース

- **実装会話**: [3c1b8711-6c9f-4d8d-8aa3-44659ca5b4ab](../../../.gemini/antigravity/conversations/3c1b8711-6c9f-4d8d-8aa3-44659ca5b4ab)
- **Knowledge Item**: [User Story Mapping Implementation](../../../.gemini/antigravity/knowledge/user_story_mapping_implementation)
- **関連US**: [US-001: Activity削除機能](./US-001-activity-deletion.md)（クリックイベントと連携）

## ステータス

- **作成日**: 2026-01-23
- **最終更新日**: 2026-01-23
- **ステータス**: ✅ 実装完了
- **実装者**: @mottodora

## 変更履歴

### 2026-01-22
- **初回実装**: @dnd-kitを使用したActivity並び替え機能
- **競合回避**: ドラッグとクリックの競合問題を解決
- **永続化**: Activity順序のデータベース保存
- **UI改善**: ドラッグ中の視覚的フィードバックの追加
