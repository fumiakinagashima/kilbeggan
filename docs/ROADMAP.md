# Kilbeggan Roadmap

目標: 「こういうコンセプトの製品がある」と示せるコアを、フェーズを追って実装する。

---

## Phase 1 — 活動記録コア

> フィールド担当が顧客を選んでテキストを投稿し、タイムラインで確認できる最小プロダクト。

- [x] SvelteKitプロジェクトセットアップ
- [x] Cloudflare/Wranglerセットアップ (D1・KV・R2バインディング、ローカル開発環境)
- [x] DBスキーマ定義 (users, customers, activities)
- [x] PWA設定 (manifest, Service Worker)
- [x] 認証 (メール+パスワード、セッション管理/KV)
- [x] 顧客マスタ (最小フィールド + 手動登録UI)
- [x] 活動投稿UI (Twitter風フリーテキスト投稿、@メンションで顧客を選択)
- [x] 活動フィード (タイムライン表示、@メンション青色表示)
- [x] プライベート投稿 (非公開フラグ、フィードからトグル)
- [x] スキーマ改訂 (customers: company必須化、users: admin/user権限、activities: 多対多メンション)
- [x] ルーティング整理 (/ 投稿専用, /fields 活動一覧, /fields/[id] 活動編集, /customers/[id]/edit 顧客編集)
- [x] ダークモード/ライトモード切り替え (システムがデフォルト、チラつき防止のインラインスクリプト)
- [x] 投稿へのファイル添付・写真撮影 (R2アップロード、activities.attachmentsカラム追加)
- [x] 投稿・表示での改行保持 (bodyToHtml/bodyToEditorHtml、レイアウトシフト対策)
- [x] ページState管理のリファクタリング (index.svelte.tsにファクトリ関数として切り出し、+page.svelteをtemplate専用に)
- [x] 添付ファイル改善 (元ファイル名表示、画像はinline/それ以外はdownload、iOSログイン修正)
- [x] 活動編集での添付ファイル対応 (AttachmentAreaコンポーネント化、編集ページにファイル/カメラボタン追加)

---

## Phase 2 — AI処理層

> 投稿されたテキストをAIが自動で整理・要約する。

- [x] 投稿の自動タグ付け (Claude Haikuによるカテゴリ分類: 商談/クレーム/情報収集等、ctx.waitUntilで非同期実行)
- [x] 顧客単位のAI要約 (顧客詳細ページに要約生成ボタン、D1に保存)
- [x] マネージャー向けチームサマリー (/dashboardページ、直近7日間の活動をAI要約、KVにキャッシュ)
- [x] 異常検知 (30日以上未接触顧客を「要フォロー」バッジ表示、サマリーと顧客一覧に反映)
- [x] サマリーページ名称変更 (ダッシュボード → サマリー、/dashboard → /summary)
- [x] 顧客編集フォーム修正 (use:enhanceでSPA化、バリデーションエラーをインライン表示)
- [x] @メンション形式をIDベースに変更 (@{id}形式で保存、表示時にactivityMentions joinで現在名を解決、旧形式後方互換あり)

---

## Phase 3 — マネージャーダッシュボード

> マネージャーがチームの状況をリアルタイムで把握できる画面。

- [x] 顧客スコア (1-100のAIスコアリング、顧客詳細ページで手動再計算、活動不足時のエラーメッセージ)
- [ ] 顧客スコアの自動更新 (活動投稿時にバックグラウンドで再計算)
- [x] AI要約の編集・フィードバック機能 (要約の手動編集+編集者/日時記録、マネージャーコメント欄、AIプロンプトを中〜長期分析に改善)
- [x] UI改善 (活動カードのケバブメニュー化、活動詳細の削除ボタン削除、顧客詳細の活動履歴セクション削除、モバイル設定画面にログアウトボタン追加)
- [x] サマリー画面削除 (ナビ・ルートを削除してシンプル化)
- [x] 要フォロー設定 (管理者が「未接触日数」を設定画面から変更可能、org_settingsテーブル追加)
- [x] 非対象活動を最終接触から除外 (isPrivate=trueは要フォロー判定に含めない)
- [x] 顧客フォームコンポーネント化 (new/editで共通のCustomerFormFieldsコンポーネント)
- [x] 活動フィード無限スクロール (30件単位、IntersectionObserverでセンチネル監視、カーソルベースページネーション)
- [x] セキュリティ修正 (Safari Cookie無効時のlocalStorage SecurityError対策、titleタグをsvelte:headに移動)
- [x] サインイン画面・サイドバーのデザイン統一 (Midleton/Boannに合わせたカードUI・タイポグラフィ・アカウント行、レスポンシブ構造は維持)
- [x] リマインダー機能 (Midletonを参考にUI/機能を実装。日時・内容・通知先を指定して登録、一覧編集削除、Cron Trigger(1分毎)+手動実行での配信。通知先はメール(Resend)とアプリ内通知センターのみ対応、Slack連携は対象外)
- [x] アプリ内通知センター (サイドバーのベルアイコン+未読バッジ+ドロワー、モバイルは設定画面から アクセス)
- [x] 通知センターをドロワーからページ化 (`/notifications`、活動一覧と同じカードUI。クリックで背景色が反転する挙動を廃止し、通知ごとに削除ボタンを追加。`NotificationDrawer`コンポーネントは削除)
- [x] プッシュ通知 (PWA + Web Push API。OneSignalから変更。VAPID鍵、Service Workerでpush/notificationclick処理、push_subscriptionsテーブル、リマインダーの通知先に「プッシュ通知」を追加。送信は@block65/webcrypto-web-push（Web Crypto APIのみで動作しCloudflare Workers互換）。本番にVAPID secrets登録済み、iPhone実機で配信確認済み。設定画面から有効/無効を切り替え可能
- [x] 通知アイコンをPNG化 (showNotification/manifestのicon/badgeがSVG指定で一部ブラウザで非表示になる問題を修正。icon-192/512とapple-touch-iconをSVGソースからPNG再生成、Kの文字をserif体+ベージュ寄りの配色に変更)
- [x] @vite-pwa/sveltekit撤去、SvelteKit標準のService Worker機能に移行 (本番ビルドが `injectManifest` とVite 8のclient/ssr分離ビルドの競合で失敗する既知の未解決バグ[vite-pwa/sveltekit#101]を踏み、`src/service-worker.ts`をSvelteKit標準機能に切り替え。manifest.webmanifestは`static/`に静的配置し`app.html`に直接リンク。オフラインキャッシュは未実装のまま(後フェーズ)、push/notificationclickのみ実装。iOS Safariで`datetime-local`入力がカード幅からはみ出す不具合も修正
- [x] トップ画面を活動一覧に変更 (`/`が旧`/fields`の活動一覧、投稿画面は`/post`に移動。投稿画面ヘッダーの「KILBEGGAN」ロゴを他画面と同じページタイトル「投稿」表示に統一。活動編集(`/fields/[id]`)のURLは維持しつつ戻り先を`/`に修正)
- [x] ナビゲーション再編 (投稿はフッター/サイドバーのメニュー項目から撤去し、活動一覧ページ上部の「投稿」ボタンから`/post`へ遷移する方式に変更。投稿完了後は活動一覧に自動遷移。通知は設定画面経由のモバイル導線を廃止し、ボトムナビ/サイドバーに常時表示する項目として昇格(未読バッジ付き))
- [x] 投稿下書きの保持 (投稿画面の入力内容(本文・メンション・非対象フラグ・添付ファイル)を`$lib/stores/composeDraft.svelte.ts`にモジュール単位で保持。他ページへ遷移して`/post`に戻っても入力内容が復元される。投稿成功時のみ下書きをクリア。ブラウザのリロード/タブ閉じまでは保持されない(メモリ上のみ))
- [x] デスクトップサイドバーの高さ固定 (`min-height: 100dvh` → `height: 100vh`)
- [x] アカウント管理機能を追加 (Midletonの`/database/accounts`相当。`/accounts`ページでアカウント一覧表示・新規追加(名前・メール・初期パスワード・権限)・権限変更・削除に対応。API: `POST /api/accounts`, `PATCH`/`DELETE /api/accounts/[id]`。Midletonには無い安全策として、自分自身の権限変更・削除の禁止と、最後の管理者の降格・削除を防ぐガードを追加。新規アカウントはMidletonのようなパスワードリセットリンクでの自己アクティベーションではなく、管理者が初期パスワードをその場で設定する方式(Kilbegganの`passwordHash`はNOT NULL制約のため)。ナビゲーションには管理者権限のデスクトップサイドバーのみ表示、モバイルのボトムナビには出さない)

---

## Phase 4 — 顧客情報の自動取得

> 顧客登録の手間を最小化する。

- [ ] WEBクローリングによる企業情報取得
- [ ] 名刺スキャンによる顧客登録
- [ ] 既存CRM連携 (Salesforce / HubSpot API)

---

## Phase 5 — OEM対応 *(現フェーズ対象外)*

- [ ] マルチテナント設計
- [ ] ホワイトラベル (ロゴ・カラー設定)
- [ ] 顧客ごとのカスタムフィールド
- [ ] 外部CRMへのエクスポートAPI
