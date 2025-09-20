# 焚き火サバイバル（GitHub Pages 用）

このプロジェクトは Vite + React + TypeScript + Tailwind で構成されています。
アップロードしていただいた `CampfireGame.tsx` をそのまま表示するシンプルな構成です。

## ローカル実行
```bash
npm install
npm run dev
```

## ビルド
```bash
npm run build
```

## GitHub Pages デプロイ（Actions）

1. このリポジトリを GitHub に作成して push します。
2. Settings → Pages で「Build and deployment: GitHub Actions」を選択。
3. そのまま Actions が走り、`https://<yourname>.github.io/campfire-game/` で公開されます。

もしリポジトリ名を変更する場合は、`vite.config.ts` の `base` を変更してください。