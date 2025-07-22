# FlowNote

教育機関と保護者をつなぐ美しいコミュニケーション＆お知らせ管理アプリ

## 🌟 特徴

- **美しいUI**: Three.jsを使った水のような流れるアニメーション背景
- **リアルタイムメッセージ**: 先生と保護者の双方向コミュニケーション
- **プリント管理**: PDF配布・閲覧・カテゴリ分類
- **行事カレンダー**: 年間行事の管理とリマインダー
- **プッシュ通知**: 重要なお知らせをリアルタイム配信
- **レスポンシブ**: モバイルファーストのデザイン
- **PWA対応**: アプリのようにインストール可能

## 🛠 技術スタック

### フロントエンド
- **Next.js 15**: React フレームワーク
- **TypeScript**: 型安全な開発
- **Tailwind CSS**: ユーティリティファーストのCSS
- **Three.js**: WebGLアニメーション
- **Framer Motion**: スムーズなアニメーション

### バックエンド・インフラ
- **Firebase**: 認証・データベース・ストレージ・メッセージング
- **Firestore**: リアルタイムデータベース
- **Firebase Auth**: 認証システム
- **Firebase Storage**: ファイルストレージ
- **Firebase Cloud Messaging**: プッシュ通知

### その他
- **React Three Fiber**: Three.jsのReactラッパー
- **date-fns**: 日付操作ライブラリ
- **Lucide React**: アイコンライブラリ

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example` を `.env.local` にコピーして、Firebaseの設定情報を入力：

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_VAPID_KEY=your-vapid-key
```

### 3. Firebase プロジェクトの設定

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. Authentication を有効化（メール/パスワード認証）
3. Firestore Database を作成
4. Firebase Storage を有効化
5. Cloud Messaging を設定してVAPIDキーを取得

### 4. 開発サーバーの起動

```bash
npm install
```

```bash
npm run dev
```

アプリケーションは `http://localhost:3000` で利用できます。

## 📱 主要機能

### 認証システム
- メール/パスワード認証
- ユーザー役割管理（先生・保護者・管理者）
- パスワードリセット

### メッセージ機能
- リアルタイム双方向メッセージ
- ファイル添付（画像・PDF等）
- 既読管理
- 会話一覧

### プリント管理
- PDFアップロード・配布
- カテゴリ別整理
- 検索機能
- プレビュー・ダウンロード

### カレンダー機能
- インタラクティブカレンダー
- イベント作成・管理
- 持ち物・準備物管理
- リマインダー通知

### 通知機能
- Firebase Cloud Messaging
- ブラウザプッシュ通知
- リアルタイム通知
- 通知設定管理

## 🎨 デザインシステム

### カラーパレット
- **Primary**: Cyan (#22d3ee) - 水をイメージした清涼感
- **Secondary**: Blue (#3b82f6) - 信頼性を表現
- **Accent**: Purple (#8b5cf6) - アクセントカラー

### レスポンシブブレイクポイント
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px  
- **Desktop**: 1024px+

### アニメーション
- **Water Background**: Three.jsシェーダーによる流体アニメーション
- **UI Animations**: Framer Motionによるスムーズな画面遷移
- **Micro Interactions**: ホバー・クリック時のフィードバック

## 📂 プロジェクト構造

```
src/
├── app/                    # Next.js App Router
├── components/            
│   ├── auth/              # 認証関連コンポーネント
│   ├── layout/            # レイアウトコンポーネント
│   ├── three/             # Three.js関連
│   └── ui/                # 再利用可能なUIコンポーネント
├── contexts/              # React Context
├── hooks/                 # カスタムフック
├── lib/                   # ライブラリ設定
├── services/              # API・サービス層
├── types/                 # TypeScript型定義
└── utils/                 # ユーティリティ関数
```

## 🔒 セキュリティ

- Firebase Authentication による安全な認証
- Firestore Security Rules によるデータアクセス制御
- ファイルアップロード時のバリデーション
- XSS対策・CSRF対策

## 📖 使用方法

### 初回セットアップ
1. 新規アカウント作成（先生・保護者を選択）
2. 学校IDの設定
3. プロフィール情報の入力

### 日常的な使用
1. **ダッシュボード**: 最新情報を一目で確認
2. **メッセージ**: 必要に応じて先生や保護者とコミュニケーション
3. **プリント**: 配布されたお知らせを確認・ダウンロード
4. **カレンダー**: 今後の行事予定をチェック

## 🤝 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを開く

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🙏 謝辞

- Three.js コミュニティ
- Firebase チーム  
- Next.js チーム
- Tailwind CSS チーム
