# US-008: CSVエクスポート機能

## ユーザーストーリー

**As a** ユーザーストーリーマップの管理者  
**I want** マップ上のStoryをCSV形式でエクスポートできるようにしたい  
**So that** スプレッドシートソフトで分析したり、他のツールと連携したり、バックアップを取れる

## 背景

ユーザーストーリーマッピングツールで作成したデータを、外部で活用したいというニーズがあります：
- **スプレッドシートでの分析**: Excel/Google Sheetsで詳細な分析
- **データポータビリティ**: 他のツールへのデータ移行
- **バックアップ**: データの保管や共有
- **再インポート**: CSVを編集して再度インポート（将来的な機能）

そこで、ボードビューに加えてテーブルビューを実装し、日本語ヘッダーのCSVエクスポート機能を提供しました。

## 受け入れ基準

### CSVエクスポート機能
- [ ] 「Export CSV」ボタンがアクションバーに表示される
- [ ] ボタンをクリックすると、CSV ファイルがダウンロードされる
- [ ] ファイル名は `user-story-map-YYYY-MM-DD.csv` 形式

### CSVフォーマット
- [ ] 日本語ヘッダーを使用（既存のインポート機能と互換性）
- [ ] 以下の列を含む：
  - リリース
  - アクティビティ（バックボーン）
  - タイトル
  - ステータス
  - ユーザーストーリー
  - 受け入れ条件（簡易）
  - メモ / ルール
  - KPI（任意）
  - ID
- [ ] 空のフィールドは空文字列として出力

### テーブルビュー
- [ ] ボード/テーブルビューの切り替えボタンが表示される
- [ ] テーブルビューでは、全Storyが一覧表示される
- [ ] Release → Activity の順でソートされる
- [ ] 行をクリックすると、編集モーダルが開く

### UI配置
- [ ] 「Export CSV」ボタンはアクションバーの右端に配置
- [ ] ボードビュー/テーブルビューどちらでも常に表示される

## 実装の詳細

### コンポーネント

#### StoryTable
- **場所**: `src/components/StoryTable.tsx`
- **責務**: 
  - Storyをテーブル形式で表示
  - Release → Activityの順でソート
  - 行クリックで編集モーダルを開く
- **Props**:
  - `stories: Story[]` - 表示するStory一覧
  - `activities: string[]` - Activity一覧（ソート順序用）
  - `releases: string[]` - Release一覧（ソート順序用）
  - `onStoryClick: (story: Story) => void` - Story クリックハンドラー

**ソートロジック**:
```tsx
const sortedStories = [...stories].sort((a, b) => {
  const releaseOrder = releases.indexOf(a.release) - releases.indexOf(b.release);
  if (releaseOrder !== 0) return releaseOrder;
  
  return activities.indexOf(a.activity) - activities.indexOf(b.activity);
});
```

#### MapPage
- **場所**: `src/components/MapPage.tsx`
- **変更内容**:
  - `viewMode`状態を追加（'board' | 'table'）
  - ビュー切り替えボタンの追加
  - `StoryTable`コンポーネントの統合
  - 「Export CSV」ボタンの配置

### ユーティリティ関数

#### exportStoriesToCSV
- **場所**: `src/utils/csv.ts`
- **責務**: 
  - Story配列をCSV形式に変換
  - 日本語ヘッダーを使用
  - ブラウザでファイルをダウンロード
- **ライブラリ**: `papaparse`

**実装**:
```typescript
import Papa from 'papaparse';

export const exportStoriesToCSV = (stories: Story[]) => {
  const csvData = stories.map(story => ({
    'リリース': story.release,
    'アクティビティ（バックボーン）': story.activity,
    'タイトル': story.title,
    'ステータス': story.status || '',
    'ユーザーストーリー': story.body || '',
    '受け入れ条件（簡易）': story.acceptanceCriteria || '',
    'メモ / ルール': story.notes || '',
    'KPI（任意）': story.kpi || '',
    'ID': story.id
  }));

  const csv = Papa.unparse(csvData, { header: true });
  
  // ダウンロード処理
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `user-story-map-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

### CSVフォーマット仕様

**ヘッダー** (日本語):
- リリース
- アクティビティ（バックボーン）
- タイトル
- ステータス
- ユーザーストーリー
- 受け入れ条件（簡易）
- メモ / ルール
- KPI（任意）
- ID

**互換性**:
- 既存の`csvParser.ts`（インポート機能）と100%互換
- エクスポートしたCSVを編集して再インポート可能（将来的）

## デザイン/UXの考慮事項

### ビュー切り替え
- ボタンでボード/テーブルビューを切り替え
- 現在のビューがハイライトされる
- 切り替え時もStoryの選択状態は保持

### テーブルUIのデザイン
- シンプルで読みやすいテーブルレイアウト
- 行ごとにホバーエフェクト（背景色の変化）
- ステータスバッジの色分け

### エクスポートボタンの配置
- アクションバーの右端に配置（一貫した位置）
- 常に表示（ボード/テーブルビュー両方）
- クリック後、即座にダウンロード開始

### ファイル名の自動生成
- 日付を含めることでバージョン管理が容易
- `user-story-map-2026-01-22.csv` のような形式

## テストシナリオ

### 正常系
1. **CSVエクスポート**
   - 「Export CSV」ボタンをクリック
   - CSVファイルがダウンロードされる
   - ファイル名が `user-story-map-YYYY-MM-DD.csv` である
   - ファイルを開くと、全Storyが正しく含まれている

2. **テーブルビュー表示**
   - 「Table」ボタンをクリック
   - テーブルビューに切り替わる
   - 全Storyが一覧表示される
   - Release → Activity の順でソートされている

3. **テーブルからStory編集**
   - テーブルビューで行をクリック
   - 編集モーダルが開く
   - Story内容が正しく表示される

4. **ビュー切り替え**
   - ボード → テーブル → ボード と切り替え
   - データが正しく表示される

### 異常系
1. **Storyが存在しない場合**
   - 空のマップで「Export CSV」をクリック
   - ヘッダーのみのCSVがダウンロードされる

2. **ブラウザのダウンロード制限**
   - ダウンロードがブロックされた場合の処理

### データ整合性
1. **日本語ヘッダーの確認**
   - エクスポートしたCSVのヘッダーが日本語である
   - 文字化けしていない（UTF-8 BOM）

2. **空フィールドの処理**
   - オプショナルフィールド（body, kpiなど）が空の場合、空文字列として出力される

## 関連リソース

- **実装会話**: [f7b1b455-8f1a-4bcc-9c30-c5fe599ef4c7](../../../.gemini/antigravity/conversations/f7b1b455-8f1a-4bcc-9c30-c5fe599ef4c7)
- **Knowledge Item**: [User Story Mapping Implementation - Export Functionality](../../../.gemini/antigravity/knowledge/user_story_mapping_implementation/artifacts/export_functionality.md)
- **ライブラリ**: [PapaParse](https://www.papaparse.com/)

## ステータス

- **作成日**: 2026-01-23
- **最終更新日**: 2026-01-23
- **ステータス**: ✅ 実装完了
- **実装者**: @mottodora

## 変更履歴

### 2026-01-22
- **初回実装**: CSVエクスポート機能の実装
- **テーブルビュー追加**: データ確認用のテーブルビュー
- **日本語ヘッダー対応**: インポート機能との互換性確保
- **UI改善**: アクションバーへのボタン配置、ビュー切り替え機能
