# US-001: Activity削除機能

## ユーザーストーリー

**As a** ユーザーストーリーマップの管理者  
**I want** 不要になったActivityを削除できるようにしたい  
**So that** マップを整理し、現在の状況を正確に反映できる

## 背景

ユーザーストーリーマッピングツールでは、Activityを追加できるが、削除する機能がなかった。プロジェクトの進行に伴い、不要になったActivityや統合されたActivityを削除する必要がある。

## 受け入れ基準

### 基本機能
- [ ] Activityヘッダーをクリックすると、Activity詳細モーダルが開く
- [ ] モーダルにはActivity名と関連するStory数が表示される
- [ ] モーダルには削除ボタンが表示される
- [ ] ドラッグ&ドロップ機能とクリック機能が競合しない

### カスケード削除
- [ ] 関連Storyがある場合でも削除ボタンが有効である
- [ ] 関連Storyがある場合、警告メッセージが表示される
  - 「⚠️ このActivityには○件のStoryが紐付いています。Activityを削除すると、関連するStoryも一緒に削除されます。」
- [ ] 削除ボタンをクリックすると、確認ダイアログが表示される
  - 関連Storyがない場合: 「本当に削除してもよろしいですか？この操作は取り消せません。」
  - 関連Storyがある場合: 「本当に削除してもよろしいですか？このActivityと関連する○件のStoryも一緒に削除されます。この操作は取り消せません。」
- [ ] 確認後、Activityと関連するすべてのStoryが削除される
- [ ] 削除後、ボードが自動的に更新される

### エラーハンドリング
- [ ] 削除に失敗した場合、エラーメッセージが表示される
- [ ] モーダルのキャンセルボタンで削除をキャンセルできる
- [ ] モーダル外をクリックして閉じることができる

## 実装の詳細

### コンポーネント

#### ActivityDetailModal
- **場所**: `src/components/ActivityDetailModal.tsx`
- **責務**: 
  - Activity名と関連Story数を表示
  - 削除ボタンと確認ダイアログ
  - 警告メッセージの表示
- **Props**:
  - `isOpen: boolean` - モーダルの開閉状態
  - `onClose: () => void` - モーダルを閉じるハンドラー
  - `onDelete: (name: string) => Promise<{success: boolean; error?: string}>` - 削除ハンドラー
  - `activityName: string | null` - Activity名
  - `storyCount: number` - 関連Story数

#### SortableActivityHeader
- **場所**: `src/components/SortableActivityHeader.tsx`
- **変更内容**:
  - `onActivityClick` propsを追加
  - クリックハンドラーを実装（ドラッグ中はクリックを無視）

#### StoryMapBoard
- **場所**: `src/components/StoryMapBoard.tsx`
- **変更内容**:
  - `onActivityClick` propsを追加し、親コンポーネントに伝播

#### MapPage
- **場所**: `src/components/MapPage.tsx`
- **変更内容**:
  - `selectedActivity` 状態を追加
  - `handleActivityClick` 関数を追加
  - `handleDeleteActivity` 関数を追加（API呼び出し）
  - `ActivityDetailModal` をレンダリング

### バックエンドAPI

#### DELETE /api/activities
- **パラメータ**:
  - `mapId: string` - マップID（クエリパラメータ）
  - `name: string` - Activity名（クエリパラメータ）
- **処理**:
  1. 関連するすべてのStoryを削除 (`prisma.story.deleteMany`)
  2. マップからActivityを削除
- **レスポンス**:
  - 成功: `{ success: true, activities: string[] }`
  - 失敗: `{ error: string }`

## デザインの考慮事項

### UX
- **2段階確認**: 誤操作を防ぐため、削除ボタンをクリックした後に確認ダイアログを表示
- **明確な警告**: カスケード削除の影響を明確に伝えるため、警告メッセージを黄色で強調表示
- **視覚的フィードバック**: 削除ボタンは常に赤色で表示され、削除アクションであることを明示

### アクセシビリティ
- モーダルは ESC キーで閉じることができる
- モーダル外をクリックして閉じることができる
- 削除中は「削除中...」というローディング状態を表示

## テストシナリオ

### 正常系
1. **関連Storyがない場合の削除**
   - Activityヘッダーをクリック → モーダルが開く
   - 削除ボタンをクリック → 確認ダイアログが表示
   - 確定ボタンをクリック → Activityが削除される

2. **関連Storyがある場合のカスケード削除**
   - Activityヘッダーをクリック → モーダルが開く
   - 警告メッセージが表示される
   - 削除ボタンをクリック → カスケード削除の確認ダイアログが表示
   - 確定ボタンをクリック → Activityと関連Storyが削除される

### 異常系
1. **削除のキャンセル**
   - モーダルを開く → キャンセルボタンをクリック → モーダルが閉じる
   - モーダルを開く → モーダル外をクリック → モーダルが閉じる

2. **ドラッグとクリックの競合**
   - Activityヘッダーをドラッグ → クリックイベントが発火しない
   - Activityヘッダーを短時間でクリック → モーダルが開く

## 関連リソース

- **実装PR**: [#XXX](リンク)
- **Walkthrough**: [Activity削除機能の実装](../../../.gemini/antigravity/brain/f9e21703-6c61-44b8-98de-a11bd42d7b7d/walkthrough.md)
- **スクリーンショット**: 
  - [Activity詳細モーダル](../../../.gemini/antigravity/brain/f9e21703-6c61-44b8-98de-a11bd42d7b7d/activity_modal_empty_1769134329860.png)
  - [カスケード削除確認](../../../.gemini/antigravity/brain/f9e21703-6c61-44b8-98de-a11bd42d7b7d/activity_delete_confirm_modal_1769134776026.png)

## ステータス

- **作成日**: 2026-01-23
- **最終更新日**: 2026-01-23
- **ステータス**: ✅ 実装完了
- **実装者**: @mottodora

## 変更履歴

### 2026-01-23
- **初回実装**: 関連Storyがある場合は削除を拒否する仕様で実装
- **カスケード削除対応**: ユーザーの要望により、関連Storyも一緒に削除する仕様に変更
