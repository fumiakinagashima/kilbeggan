## Project Overview

**Kilbeggan** は「逆CRM」コンセプトの活動記録SaaS。
従来のCRMが「現場が入力しない」問題を抱えるのに対し、Kilbegganは入力コストをゼロに近づけ（SNS的なテキスト投稿）、構造化・分析をAIに任せる。

| 役割 | 担当 |
|---|---|
| フィールド担当 | 顧客を選んでテキストを投稿するだけ |
| AI | 投稿を要約・タグ付け・分析 |
| マネージャー | AIが整理した情報を確認・判断 |

**ターゲット**: CRM形骸化に悩む企業（外回り主体の職種 — 製造外販・不動産・保険・医療機器など）

---

## Tech Stack

| 領域 | 技術 |
|---|---|
| フロントエンド | SvelteKit 5 (TypeScript) |
| スタイル | SCSS |
| バリデーション | Zod |
| ORM | DrizzleORM |
| インフラ | Cloudflare (Workers, D1, R2, KV) |
| AI | Claude API (`@anthropic-ai/sdk`) |
| メール | Resend (fetch直呼び、SDKなし) |
| プッシュ通知 | OneSignal |
| モバイル | PWA (vite-plugin-pwa + @vite-pwa/sveltekit) |
| パッケージマネージャー | bun |

---

## Design Decisions

- **レスポンシブ**: スマートフォン（フィールド担当）〜13-15インチラップトップ（マネージャー）の両方をカバー。CSSメディアクエリでレイアウト切り替え、UA判定は使わない。ブレークポイントは768px（〜767px: ボトムナビ+全画面、768px〜: サイドナビ+2カラム）
- **PWA**: ネイティブアプリ不要。ホーム画面追加でネイティブに近いUX
- **オフライン**: 投稿はオンライン前提。キャッシュ対応は後フェーズ
- **マルチテナント**: Phase 5以降。現フェーズでは単一テナントで実装
- **認証**: メール+パスワード方式。セッションはCF KVで管理

---

## Directory Structure

```
src/
  lib/
    server/
      ai/         ← Claude API (client, prompt, streaming)
      auth/       ← session / KV / password
      db/         ← DrizzleORM schema + service層
      email/      ← Resend (fetch直呼び)
    components/   ← Svelteコンポーネント
    stores/       ← Svelteストア (.svelte.ts)
    types/        ← 共有型定義
  routes/
    api/          ← SvelteKit APIルート (+server.ts)
    (app routes)  ← ページルート (+page.svelte / +page.server.ts)
```

---

## Reference — Midleton

Claude API・Resendの実装パターンはMidletonを参照する。UI/UXは参照しない。

- パス: `/Users/user/Documents/Alcogy/products/midleton`
- Claude API クライアント: `src/lib/server/ai/client.ts`
- Resend 実装: `src/lib/server/email/providers/resend.ts`
- 認証・セッション: `src/lib/server/auth/session.ts`

---

## Git Workflow

- フェーズごとにブランチを切る。フェーズが大きければタスク単位で切る
  - 例: `feature/phase1-wrangler-setup`, `feature/phase1-auth`
- **Push / PR / Merge はユーザーが行う — Claudeは実施しない**
- **コミットは明示的に指示があった場合のみ行う**
- コミット前に必ず `docs/ROADMAP.md` を更新する
- ロードマップに収まらない作業・新たな作業が発生した場合は `docs/ROADMAP.md` を修正する
- コミットメッセージは英語で記載する
- Co-Authored-By は付けない

---

## Project Configuration

- **Language**: TypeScript
- **Package Manager**: bun
- **Add-ons**: prettier, eslint, vitest, playwright, sveltekit-adapter, drizzle, mcp

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.
