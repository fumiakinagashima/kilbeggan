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
| プッシュ通知 | Web Push API (VAPID、PWA Service Worker経由。OneSignal等の外部サービスは使わない) |
| モバイル | PWA (vite-plugin-pwa + @vite-pwa/sveltekit) |
| パッケージマネージャー | bun |

---

## Design Decisions

- **レスポンシブ**: スマートフォン（フィールド担当）〜13-15インチラップトップ（マネージャー）の両方をカバー。CSSメディアクエリでレイアウト切り替え、UA判定は使わない。ブレークポイントは768px（〜767px: ボトムナビ+全画面、768px〜: サイドナビ+2カラム）
- **PWA**: ネイティブアプリ不要。ホーム画面追加でネイティブに近いUX
- **オフライン**: 投稿はオンライン前提。キャッシュ対応は後フェーズ
- **マルチテナント**: Phase 5以降。現フェーズでは単一テナントで実装
- **認証**: メール+パスワード方式。セッションはCF KVで管理
- **権限**: 単一テナント内でaccounts.roleにより`admin`/`user`を区別。アカウント管理(`/accounts`: 一覧・新規追加・権限変更・削除)は管理者のみアクセス可能で、デスクトップサイドバーのみに導線を表示（モバイルのボトムナビには出さない）。新規アカウントはパスワードリセットリンクではなく、管理者が初期パスワードをその場で設定する方式（`passwordHash`はNOT NULL制約のため）

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

### AI実装の注意点

Claudeは「JSON形式のみ返す」と指示しても、` ```json ... ``` `のようにMarkdownのコードフェンスで囲んで返すことがある。`src/lib/server/ai/`配下でAIレスポンスをJSON.parseする箇所は、必ず`src/lib/server/ai/json.ts`の`stripCodeFence`を通してからパースする（`score.ts`/`classify.ts`参照）。これを怠ると、フェンス付きレスポンスが返ってきた際にパースが失敗し、無言でエラー/フォールバックになる。

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

## Coding Rules

### ページのState管理

`$state` / `$derived` などのrunesとコンポーネント内関数は `index.svelte.ts` に切り出してclassベースで管理する。`+page.svelte` は template と `<style>` のみを持つ薄いコンポーネントにする。stateを持たないページは `index.svelte.ts` を作らない。

**ファイル構成**:
```
routes/(app)/some-page/
  ├ index.svelte.ts    ← class-based state (runes + functions)
  ├ +page.server.ts
  └ +page.svelte       ← template + style のみ
```

**パターン**:
```typescript
// index.svelte.ts
import type { PageData } from './$types';

export function createSomePageState(getData: () => PageData) {
  let value = $state(0);

  // $derived が getData() を直接参照できる（クラスの順序問題なし）
  const derived = $derived(getData().items.filter(...));

  async function doSomething() { ... }

  return {
    get value() { return value; },
    set value(v: number) { value = v; },  // bind:value などで書き込む場合は setter も追加
    get derived() { return derived; },
    doSomething,
  };
}
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { createSomePageState } from './index.svelte.ts';
  let { data } = $props();
  const state = createSomePageState(() => data);
</script>
```

**ルール**:
- 関数ベース（ファクトリ関数）で実装する。クラスは `$derived` + 外部データの組み合わせで順序問題が生じるため使わない
- `data` propは `() => data` の形で渡す（Svelte 5のreactivityを保つため）
- `$derived` はクロージャ内で直接 `getData()` を参照できる
- 返り値はgetter/setterオブジェクト。外部から書き込む必要があるものだけsetterを追加する
- `bind:value` や `bind:this` が必要なプロパティはgetter + setterの両方を返す
- リアクティブ不要な内部変数（例: `mentionRange`）は `$state` をつけない普通の `let` で定義する
- `goto` など SvelteKit モジュールは `.svelte.ts` ファイル内でインポートして使用できる

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
