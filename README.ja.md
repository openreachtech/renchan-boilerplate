# renchan-boilerplate

[renchan](https://github.com/openreachtech/renchan) アプリケーションの動くスケルトンです。2 つの GraphQL エンドポイント、RESTful API エンドポイント、そして Sequelize が、すでに組み上がっています。

## 目次

- [概要](#概要)
- [インストール](#インストール)
- [使い方](#使い方)
- [API](#api)
- [セッショントークンの仕組み](#セッショントークンの仕組み)
- [コントリビューション](#コントリビューション)
- [ライセンス](#ライセンス)
- [開発者](#開発者)
- [著作権](#著作権)

## 概要

renchan は、テンプレートクラスから GraphQL / RESTful API のエンドポイントを組み立てる、Express ベースのフレームワークです。本リポジトリは、その上に作るアプリケーションの出発点です。

空のディレクトリではありません。クローンして install すれば、3 つのサーバーがすでに待ち受け、それぞれが `healthCheck` クエリに応答します。Sequelize は SQLite に対してすでに起動し、セッションのアクセストークンとリフレッシュトークンを扱うクラスも書かれています。残っているのは、アプリケーション固有のスキーマ・リゾルバー・モデルです。

## インストール

Node.js LTS が必要です（CI がビルド対象とするバージョン）。

boilerplate はパッケージとして install するものではなく、クローンして使います。

```sh
git clone https://github.com/openreachtech/renchan-boilerplate.git <your-project>
cd <your-project>
npm install
npm run db:refresh
npm run dev
```

`package.json` の `name` / `version` / `description` は `TODO` のプレースホルダーのまま同梱されています。最初に埋めてください。

ES モジュール（`"type": "module"`）です。import は ESM の `import` 構文で記述してください。

## 使い方

### 3 つのサーバー

`server/index.js` が、それぞれ別のポートで 3 つすべてを起動します。

| サーバー | ポート | エンドポイント | エンジン |
| :-- | :-- | :-- | :-- |
| 顧客向け GraphQL | 3900 | `/graphql-customer` | `CustomerGraphqlServerEngine` |
| 管理者向け GraphQL | 5800 | `/graphql-admin` | `AdminGraphqlServerEngine` |
| RESTful API | 8001 | `/v1` | `AppRestfulApiServerEngine` |

いずれも `127.0.0.1` だけにバインドします。リバースプロキシの背後に置く前提なので、他のネットワークインターフェイスからの接続は受け付けません。

各 GraphQL エンドポイントは、そのままヘルスチェックに応答します。

```sh
curl -X POST http://127.0.0.1:3900/graphql-customer \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ healthCheck }"}'
```

本番では PM2 でサーバーを動かします。設定は `pm2.config.cjs` です。

### コマンド

| コマンド | 内容 |
| :-- | :-- |
| `npm run dev` | `NODE_ENV=development` で `server/` を nodemon 実行する |
| `npm test` | データベースを作り直し、シードを投入して Jest を実行する（`test.sh`） |
| `npm run test:live` | データベースには手を付けず、`live` 環境に対して Jest を実行する（`test-live.sh`） |
| `npm run lint` | リポジトリ全体に ESLint をかける（別名: `npm run l`） |
| `npm run db:setup` | マイグレーションを実行する |
| `npm run db:seed:master` | `sequelize/seeders/dev-master/` を投入する |
| `npm run db:seed:dev` | `sequelize/seeders/development/` を投入する |
| `npm run db:teardown` | `sequelize/storage/` 配下の SQLite ファイルを削除する（別名: `npm run db:drop`） |
| `npm run db:refresh` | teardown → マイグレーション → 両方のシード投入（別名: `npm run r`） |

`npm test` は Jest と同じ引数を取ります。加えて `--empty` で master シードのみ、`--seeded` で development シードまで入れた状態を対象にできます。

```sh
npm test tests/__tests__/server/graphql/
npm test -- --empty
```

`sequelize/seeders/master/` には、実際のデプロイ向けのシードが入ります。どのスクリプトからも参照されていません。意図的に、手で投入するものです。

### アプリケーションのコードを置く場所

```
├── app/                    # 全サーバーで共有するコード
│   ├── constants/          # 定数を ESM に再エクスポート
│   ├── globals/            # env ファサード、ルートパス、CJS require
│   └── session/            # アクセストークンとリフレッシュトークン
├── constants/              # CJS で書いた定数
├── public/                 # サーバーが配信する静的ファイル
├── sequelize/
│   ├── config.cjs          # NODE_ENV ごとの接続設定
│   ├── migrations/         # マイグレーションはここに書く
│   ├── models/             # モデルはここに書く
│   └── seeders/            # master, dev-master, development
├── server/
│   ├── graphql/
│   │   ├── contexts/       # 対象者ごとの context と share
│   │   ├── resolvers/      # リゾルバーはここに書く
│   │   ├── schemas/        # GraphQL スキーマはここに書く
│   │   └── *ServerEngine.js
│   ├── restfulapi/
│   │   ├── renderers/      # レンダラーはここに書く
│   │   └── AppRestfulApiServerEngine.js
│   └── index.js            # 3 つのサーバーとそのポート
├── tests/                  # Jest のテスト
└── types/                  # アンビエントな型宣言
```

アプリケーションによる実装を待っている箇所が、コード中に 3 つ示されています。

| 対象 | 場所 |
| :-- | :-- |
| サインイン済みユーザーの特定方法 | `CustomerGraphqlContext.findUser()`、`AdminGraphqlContext.findUser()`、`AppRestfulApiContext.findUser()` |
| ユーザーが到達できるスキーマフィールド | 各エンジンの `#get:visaIssuers` |
| パッケージ自身の識別情報 | `package.json` の `name` / `version` / `description` |

### actual と stub のリゾルバー

各 GraphQL エンジンは 2 つのリゾルバーディレクトリを宣言します。スキーマフィールドは、actual のリゾルバーがあればそれが応答し、なければ stub が応答します。

```
server/graphql/resolvers/customer/
├── actual/          # 本実装
│   ├── queries/
│   └── mutations/
└── stub/            # actual が書かれるまで応答する
    ├── queries/
    └── mutations/
```

stub があることで、クエリの実装前でもフロントエンドはそのフィールドに対して開発を進められます。なお認証フィルターは actual のリゾルバーだけから組み立てられるため、stub が応答するフィールドはフィルターを通らずに到達されます。

### 環境変数

環境変数は `@openreachtech/renchan-env` 経由で読みます。リポジトリルートの、`NODE_ENV` の名前が付いた dotenv ファイルを読み込むので、`NODE_ENV=development` なら development のものを読みます。`NODE_ENV=production` ではファイルを一切読まず、プロセスの環境変数だけが情報源になります。

| 変数 | 決めるもの | 既定値 |
| :-- | :-- | :-- |
| `AUTH_REFRESH_TOKEN_TTL_DAYS` | リフレッシュトークン Cookie の寿命（日数） | 14 |
| `AUTH_COOKIE_SECURE` | その Cookie に `Secure` を付けるかどうか。文字列 `false` のときだけ外れる | 付ける |
| `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_DIALECT`, `DATABASE_HOST`, `DATABASE_PORT` | `sequelize/config.cjs` の production の接続設定 | — |

### データベース

`sequelize/config.cjs` は `NODE_ENV` ごとにエントリーを持ちます。`development` は `sequelize/storage/` 配下の SQLite、`live` と `staging` は MariaDB と MySQL、`production` は上記の変数から組み立てます。

development はファイル 1 つで動くため、`npm run db:refresh` はデータベースを捨てて作り直すところまでを一息で行えます。

## API

クラスメンバーは以下の表記に従って記述します。

| notation | members |
| :-- | :-- |
| `#instanceProperty` | instance property |
| `#instanceMethod()` | instance method |
| `#get:instanceGetter` | instance getter |
| `#set:instanceSetter` | instance setter |
| `.staticProperty` | static property |
| `.staticMethod()` | static method |
| `.get:staticGetter` | static getter |
| `.set:staticSetter` | static setter |

### `SessionClerk`

セッションのデータに対する唯一の窓口です。セッションを構成するテーブル群への読み書きはすべてここを通ります。呼び出し側はこのクラスにのみ依存し、テーブルを直接触ることはありません。

| メンバー | 説明 |
| :-- | :-- |
| `.create()` | 渡されたアクセストークン／リフレッシュトークンのモデルを束ねた clerk を生成する |
| `#saveSession()` | セッションを開始し、最初のトークンペアを返す |
| `#findRefreshToken()` | 提示されたリフレッシュトークンが属する行を検索する |
| `#rotateSession()` | 提示されたリフレッシュトークンを使い切り、同じ系列の次のペアを発行する |
| `#revokeSession()` | 系列ごと失効させ、何件を除去したかを報告する |

モデルは import ではなく注入されるため、2 つの対象者が 1 つの実装を共有できます。

```js
const sessionClerk = SessionClerk.create({
  AccessTokenModel,
  RefreshTokenModel,
})

const savingResult = await sessionClerk.saveSession({
  userId,
  now: new Date(),
})

if (savingResult.hasError()) {
  // トランザクションはロールバックされている
}

const credentialPair = savingResult.credentialPair
```

書き込みは呼び出し側に例外を投げません。それぞれが自分のトランザクションを開き、結果をオブジェクトで報告します（失敗なら `#hasError()`、成功ならペイロード）。内部で投げられた例外はトランザクションをロールバックし、`#error` として渡ってきます。エラーの命名はリゾルバーに委ねられます。

`sequelize/models/` は空の状態で同梱されるため、2 つのモデルはアプリケーション側のものです。

## セッショントークンの仕組み

セッションはトークンのペアです。`Math.random()` ではなく `crypto.randomBytes()` から生成します。前者は決定的な数列であり、十分な数のトークンを観測すれば次に来るものを絞り込めてしまうためです。

2 つの半分は、保存の仕方が異なります。リフレッシュトークンは SHA-256 のダイジェストで保存します。長命な側であり、データベースのダンプが漏れれば、そのまま使えるセッションの一覧になってしまうからです。検索時は届いた値をハッシュして突き合わせます。アクセストークンはそのまま保存します。数分で失効する一方、ハッシュ化すればリクエストごとにダイジェスト計算を払うことになるからです。

リフレッシュトークンは `HttpOnly` の Cookie としてブラウザーに届きます。対象者ごとに別名の Cookie を持ち（`customer_refresh_token` と `admin_refresh_token`）、それぞれのエンドポイントのパスにスコープされます。そのため顧客の Cookie が管理者エンドポイントに送られること自体がありません。Cookie はドメインを指定しません。意図的です。ドメインを名指しすると Cookie が全サブドメインに広がり、そのどれか 1 つでの XSS が届いてしまいます。

Cookie の設定は `BaseAppGraphqlServerEngine` にあり、Cookie 自体は `RefreshTokenExpressCookieClerk` を通して書き込まれます。セッションを扱うリゾルバーが、受け取った context から clerk を組み立てて操作し、それ以外のリゾルバーは Cookie に触れません。

## コントリビューション

バグ報告・機能要望・コード貢献を歓迎します。

GitHub Issues からお気軽にご連絡ください。

```sh
git clone https://github.com/openreachtech/renchan-boilerplate.git
cd renchan-boilerplate
npm install
npm run lint
npm test
```

## ライセンス

本プロジェクトは Apache License 2.0 で公開されています。

詳細は [LICENSE ファイル](./LICENSE) を参照してください。

## 開発者

[Open Reach Tech Inc.](https://openreach.tech)

## 著作権

© 2026 Open Reach Tech Inc.
