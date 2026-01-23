# User Story Mapping Tool

ユーザーストーリーマッピングを行うためのWebアプリケーションです。
CSVデータをインポートし、アクティビティ（バックボーン）と優先度（リリース）のマトリクス上にユーザーストーリーを可視化・編集することができます。

![User Story Map Board](./public/screenshot.png) 
*(スクリーンショットはイメージです)*

## 特徴 (Features)

- **AIマップ生成**: Google Gemini APIを使用して、プロダクトアイデアからユーザーストーリーマップを自動生成。
- **ユーザーストーリーマップの可視化**: アクティビティを横軸、優先度（リリース）を縦軸としたグリッド表示。
- **インタラクティブな編集**: ストーリーカードをクリックして、タイトル、優先度、ステータス、受け入れ条件などを編集可能。
- **ドラッグ&ドロップ**: ストーリーカードとアクティビティを直感的に並び替え。
- **CSVエクスポート**: マップデータをCSV形式でエクスポート。
- **モダンなUI**: TailwindCSS (v4) を使用したクリーンで使いやすいデザイン。

## 技術スタック (Tech Stack)

- **Frontend**: React, TypeScript
- **Backend**: Vercel API Routes
- **Database**: Prisma + SQLite (PostgreSQL対応)
- **Build Tool**: Vite
- **Styling**: TailwindCSS (v4)
- **Drag & Drop**: @dnd-kit
- **AI Integration**: Vercel AI SDK + Google Gemini API
- **Icons**: Lucide React

## セットアップと実行 (Getting Started)

### 1. リポジトリのクローン
```bash
git clone git@github.com:mottodora/user-story.git
cd user-story-mapping
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定

AI生成機能を使用する場合、`.env`ファイルを作成してGoogle Gemini APIキーを設定してください：

```bash
cp .env.example .env
# .envファイルを編集して、GOOGLE_GENERATIVE_AI_API_KEYを設定
```

APIキーは[Google AI Studio](https://makersuite.google.com/app/apikey)で取得できます。

### 4. データベースのセットアップ
```bash
npx prisma migrate dev
```

### 5. アプリケーションの実行
```bash
PORT=3000 npx vercel dev
```
ブラウザで `http://localhost:3000` を開いてください。

## データフォーマット (CSV)

`data/story_map.csv` に配置されるCSVファイルは以下のカラムを持つ必要があります：

- **アクティビティ（バックボーン）**: 横軸のグループ（例: ユーザー登録、検索、購入）
- **優先度**: 縦軸のリリース/優先度（例: MVP, 次回以降, Low）
- **ユーザーストーリー**: ストーリーのタイトル
- **受け入れ条件（簡易）**: (Optional) ストーリーの詳細
- **ステータス**: (Optional) 開発ステータス
- **KPI（任意）**: (Optional) 関連するKPI

## ライセンス

MIT
