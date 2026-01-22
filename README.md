# User Story Mapping Tool

ユーザーストーリーマッピングを行うためのWebアプリケーションです。
CSVデータをインポートし、アクティビティ（バックボーン）と優先度（リリース）のマトリクス上にユーザーストーリーを可視化・編集することができます。

![User Story Map Board](./public/screenshot.png) 
*(スクリーンショットはイメージです)*

## 特徴 (Features)

- **ユーザーストーリーマップの可視化**: アクティビティを横軸、優先度（リリース）を縦軸としたグリッド表示。
- **インタラクティブな編集**: ストーリーカードをクリックして、タイトル、優先度、ステータス、受け入れ条件などを編集可能。
- **CSVインポート**: 所定のフォーマットのCSVファイルを読み込んでマップを生成。
- **モダンなUI**: TailwindCSS (v4) を使用したクリーンで使いやすいデザイン。

## 技術スタック (Tech Stack)

- **Frontend**: React, TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS (v4)
- **CSV Parsing**: Papaparse
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

### 3. アプリケーションの実行
```bash
npm run dev
```
ブラウザで `http://localhost:5173` (またはコンソールに表示されるポート) を開いてください。

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
