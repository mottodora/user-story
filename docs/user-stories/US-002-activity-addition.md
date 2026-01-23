# US-002: Activity追加機能（モーダル化）

## ユーザーストーリー

**As a** ユーザーストーリーマップの管理者  
**I want** 新しいActivityをモーダルダイアログから追加できるようにしたい  
**So that** より直感的でエラーの少ない方法でマップを拡張できる

## 背景

初期の実装では、Activityの追加に`prompt()`メソッドを使用していましたが、これには以下の課題がありました：
- UIの一貫性が低い（ブラウザネイティブのダイアログ）
- バリデーション機能が不十分（空白や重複のチェックが難しい）
- ユーザーエクスペリエンスが低い（モダンなWebアプリケーションとしての体験が損なわれる）

そこで、専用の`AddActivityModal`コンポーネントを作成し、より洗練されたUI/UXを提供することにしました。

## 受け入れ基準

### 基本機能
- [ ] 「+ 新規Activity」ボタンをクリックすると、モーダルが開く
- [ ] モーダルにはActivity名を入力するテキストフィールドがある
- [ ] 「追加」ボタンと「キャンセル」ボタンが表示される
- [ ] モーダル外をクリックすると閉じる
- [ ] ESCキーでモーダルを閉じることができる

### バリデーション
- [ ] 空白のActivity名は受け付けない
  - エラーメッセージ: 「Activity名を入力してください」
- [ ] 既存のActivity名と重複する場合は受け付けない
  - エラーメッセージ: 「同じ名前のActivityが既に存在します」
- [ ] 前後の空白は自動的にトリミングされる

### データ永続化
- [ ] 追加されたActivityは即座にデータベースに保存される
- [ ] 追加後、ボードに新しい列が表示される
- [ ] 追加失敗時にはエラーメッセージが表示される

### UI/UX
- [ ] モーダルは他のモーダル（`EditStoryModal`など）と一貫したデザイン
- [ ] 入力フィールドには自動フォーカスが当たる
- [ ] バックドロップブラー効果により、背景が視覚的に分離される

## 実装の詳細

### コンポーネント

#### AddActivityModal
- **場所**: `src/components/AddActivityModal.tsx`
- **責務**: 
  - Activity名の入力UIを提供
  - バリデーション（空白チェック、重複チェック）
  - エラーメッセージの表示
- **Props**:
  - `isOpen: boolean` - モーダルの開閉状態
  - `onClose: () => void` - モーダルを閉じるハンドラー
  - `onAdd: (name: string) => void` - Activity追加ハンドラー
  - `existingActivities: string[]` - 既存のActivity一覧（重複チェック用）

#### MapPage
- **場所**: `src/components/MapPage.tsx`
- **変更内容**:
  - `showAddActivityModal` 状態を追加
  - `handleAddActivity` 関数を追加（API呼び出し）
  - アクションバーに「+ 新規Activity」ボタンを配置
  - `AddActivityModal` をレンダリング

### バックエンドAPI

#### POST /api/activities
- **パラメータ**:
  - `mapId: string` - マップID
  - `name: string` - 新しいActivity名
- **処理**:
  1. 既存のactivitiesをJSONから解析
  2. 重複チェック
  3. 新しいActivityを配列に追加
  4. データベースを更新
- **レスポンス**:
  - 成功: `{ success: true, activities: string[] }`
  - 失敗: `{ error: string }`

### データベーススキーマ

`StoryMap`モデルの`activities`フィールドにJSON文字列として保存：
```prisma
model StoryMap {
  id         String   @id @default(uuid())
  name       String
  isSample   Boolean  @default(false)
  activities String?  @default("[]")  // JSON配列
  stories    Story[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

## デザイン/UXの考慮事項

### 視覚的一貫性
- `EditStoryModal`と同様のスタイリング（Tailwind CSS）
- backdrop-blur効果による背景の視覚的分離
- アニメーション（fade-in）によるスムーズな表示

### アクセシビリティ
- 入力フィールドに自動フォーカス（`autoFocus`属性）
- ESCキーでモーダルを閉じる
- モーダル外クリックで閉じる

### エラーハンドリング
- リアルタイムバリデーション（入力中にエラーを解除）
- 明確なエラーメッセージ（赤色で表示）
- API エラー時のフォールバック処理

### UI配置
- アクションバーの右側に「+ 新規Activity」ボタンを配置
- 「Export CSV」ボタンの左側に配置し、視覚的なバランスを保つ

## テストシナリオ

### 正常系
1. **新規Activity追加**
   - 「+ 新規Activity」ボタンをクリック → モーダルが開く
   - Activity名を入力（例: "ユーザー登録"）
   - 「追加」ボタンをクリック → Activityが追加され、ボードに新しい列が表示される

2. **モーダルのキャンセル**
   - モーダルを開く → 「キャンセル」ボタンをクリック → モーダルが閉じる
   - モーダルを開く → モーダル外をクリック → モーダルが閉じる

### 異常系
1. **空白のActivity名**
   - モーダルを開く → Activity名を入力せずに「追加」をクリック
   - エラーメッセージ「Activity名を入力してください」が表示される

2. **重複したActivity名**
   - モーダルを開く → 既存のActivity名を入力（例: "Login"）
   - 「追加」をクリック → エラーメッセージ「同じ名前のActivityが既に存在します」が表示される

3. **前後の空白**
   - モーダルを開く → Activity名の前後に空白を含めて入力（例: " Test "）
   - 「追加」をクリック → 空白がトリミングされ、"Test"として追加される

## 関連リソース

- **実装会話**: [383773ed-b4fd-4866-91fa-8895e751274d](../../../.gemini/antigravity/conversations/383773ed-b4fd-4866-91fa-8895e751274d)
- **Knowledge Item**: [User Story Mapping Implementation](../../../.gemini/antigravity/knowledge/user_story_mapping_implementation)

## ステータス

- **作成日**: 2026-01-23
- **最終更新日**: 2026-01-23
- **ステータス**: ✅ 実装完了
- **実装者**: @mottodora

## 変更履歴

### 2026-01-22～2026-01-23
- **初回実装**: `prompt()`から専用モーダルへの移行
- **バリデーション追加**: 空白チェック、重複チェック機能を実装
- **UI改善**: アクションバーへのボタン配置、視覚的一貫性の確保
