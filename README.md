# hatena-blog-api2

## ※このライブラリおよびREADMEは現在作成中です。

このライブラリは非公式なNode.js用の[Hatena::Blog AtomPub API](http://developer.hatena.ne.jp/ja/documents/blog/apis/atom)のラッパーです。
[bouzuya](https://github.com/bouzuya)さんの[node-hatena-blog-api](https://github.com/bouzuya/node-hatena-blog-api)をベースにcoffeeからes6に変換し、いくつか修正を加えています。
https://github.com/bouzuya/node-hatena-blog-api

## インストール方法

$ npm install https://github.com/sfpgmr/node-hatena-blog-api2

## 使い方

 [`サンプルコード`](examples/)も併せてご確認ください。

### 初期設定

本ライブラリはOAuthおよびWSSEの認証方式に対応しております。いずれかの認証方式を選択し、ライブラリを初期化してください。

#### WSSEの場合の初期化

ライブラリ（[Blog](https://github.com/sfpgmr/node-hatena-blog-api2/blob/master/src/blog.js)）を`require()`し、WSSEにおける初期化パラメータをオブジェクトに格納し、[Blog](https://github.com/sfpgmr/node-hatena-blog-api2/blob/master/src/blog.js)のインスタンスを生成します。

※WSSE認証については[「はてなサービスにおけるWSSE認証」](http://developer.hatena.ne.jp/ja/documents/auth/apis/wsse)を参照してください。


```javascript
const Blog = require('hatena-blog-api2').Blog;

const client = new Blog({
  type: 'wsse',// 認証方式
  username: 'はてなブログユーザー名',
  blogId: 'はてなブログID',
  apiKey: ' [AtomPub API key](http://blog.hatena.ne.jp/my/config/detail)'
});
```

* ブログIDはブログのURLです。カスタムドメインの場合はブログURLではないので注意してください。確認方法は[「はてなブログの設定」->「詳細設定」](http://blog.hatena.ne.jp/my/config/detail)の「AtomPub」欄にある「ルートエンドポイント」項目を参照してください。  
ルートエンドポイントの内容は通常以下のフォーマットとなっています。  
https://blog.hatena.ne.jp/(はてなブログユーザー名）/（はてなブログID）/atom
* AtomPubのAPIキーは[「はてなブログの設定」->「詳細設定」](http://blog.hatena.ne.jp/my/config/detail)の「AtomPub」欄にある「APIキー」です。

#### OAuthの設定

ライブラリ（[Blog](https://github.com/sfpgmr/node-hatena-blog-api2/blob/master/src/blog.js)）を`require()`し、OAuthにおける初期化パラメータをオブジェクトに格納し、[Blog](https://github.com/sfpgmr/node-hatena-blog-api2/blob/master/src/blog.js)のインスタンスを生成します。

※アプリケーション・スコープは"read_private"かつ"write_private"である必要があります。

※OAuthについては[「はてなサービスにおける OAuth」](http://developer.hatena.ne.jp/ja/documents/auth/apis/oauth)をご確認ください。

```javascript
const Blog = require('hatena-blog-api2').Blog;
const client = new Blog({
  type: 'oauth',// 認証方式
  blogId: 'はてなブログID',
  consumerKey: 'コンシューマー・キー',
  consumerSecret: 'コンシューマー・シークレット',
  accessToken: 'アクセス・トークン',
  accessTokenSecret: 'アクセス・トークン・シークレット'
});

// ...
```

### 初期化したライブラリの利用

インスタンスを使用して、各種メソッドを呼び出します。  
[元ライブラリ](https://github.com/bouzuya/node-hatena-blog-api)はcallback/[Promise](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise)に対応しておりましたが、本ライブラリはPromiseのみとなっています。

```javascript
const Blog = require('hatena-blog-api').Blog;/* ... */;
var client = new Blog (/* ... */);
var options = {/* ... */};

// 記事の作成
client.post(options) 
.then(()=>{
  // 作成完了
  console.log('uploaded');
})
.catch((err)=>{
  // エラー処理
  console.error(err);
});
```
## API ドキュメント

### Blog Class

AtomPub APIをメソッドで提供します。

#### コンストラクタ

##### 書式
```javascript
constructor({ type,userName,blogId,apiKey,consumerKey,consumerSecret,accessToken,accessTokenSecret})
```

##### 説明
optionパラメータオブジェクトを引数に持ちます。  
利用者は認証に必要なオプションパラメータを指定してコンストラクタを呼び出します。

##### 引数

* ***type*** ... 認証方式を指定します。  
設定できる値は'*wsse*'か'*oauth*'のいずれかです。  
既定値は'*wsse*'です。  
'*wsse*','*oauth*'以外の値を指定した場合は例外が発生します。
* ***userName*** (必須) ... はてなブログユーザー名を指定します。  
`''`(空文字列)・`null`・未指定(`undefined`)の場合は例外が発生します。
* ***blogId*** (必須) ... はてなブログIDを指定します。  
`''`(空文字列)・`null`・未指定(`undefined`)の場合は例外が発生します。
* ***apiKey*** (必須) ... はてなブログのAPIキーを指定します。  
`''`(空文字列)・`null`・未指定(`undefined`)の場合は例外が発生します。
* ***consumerKey*** ('oauth'のみ必須) ... コンシューマー・キーを指定します。  
'*wsse*'認証では使用しません。  
`''`(空文字列)・`null`・未指定(`undefined`)の場合は例外が発生します。
* ***consumerSecret*** ('oauth'のみ必須) ... コンシューマー・シークレットを指定します。  
'*wsse*'認証では使用しません。  
`''`(空文字列)・`null`・未指定(`undefined`)の場合は例外が発生します。
* ***accessToken*** ('oauth'のみ必須) ... アクセストークンを指定します。  
'*wsse*'認証では使用しません。  
`''`(空文字列)・`null`・未指定(`undefined`)の場合は例外が発生します。
* ***accessTokenSecret*** ('oauth'のみ必須) ... アクセストークンを指定します。  
'*wsse*'認証では使用しません。  
`''`(空文字列)・`null`・未指定(`undefined`)の場合は例外が発生します。

##### 使用例

```javascript
const Blog = require('hatena-blog-api2').Blog;

//コンストラクタ
const client = new Blog({
  type:'wsse',
  userName:'sfpgmr',
  blogId:'sfpgmr.hatenablog.jp',
  apiKey:'(APIキー)'
});

```

#### Blog.postEntry()

##### 書式

```javascript
postEntry({ title = '', content = '',  updated = new Date(), categories, draft = true });
```

##### 説明

記事をポストします。

##### 引数

* ***title*** ... 記事タイトルを指定します。既定値は`''`(空白)です。`null`は空白に置き換えられます。
* ***content*** ... 記事本文を指定します。既定値は`''`(空白)です。`null`は空白に置き換えられます。
* ***updated*** ... 記事の公開日付を指定します。値は`Date`もしくはISO8601形式でミリ秒を省略したものを文字列で指定します。それ以外の値を指定した場合は例外が発生します。
* ***categories*** ... カテゴリ文字列を配列で指定します。指定しない場合は省略されます。
* ***draft*** ... 下書きかどうかを指定します。既定値は`false`(公開)です。`null`値の場合は`false`に設定します。

##### 戻り値

Promiseを返します。`then()`ではセットする`function`オブジェクトの第一引数に処理結果がjsonで返ります。

```javascript
```



#### Blog.updateEntry()

##### 書式



## License

[MIT](LICENSE)

## 製作者

SFPGMR (Satoshi Fujiwara)

## 免責事項

* 本ライブラリのソースコード、Webページに書かれている情報は、その内容について保証するものではありません。
* 製作者は本ライブラリおよびソースコードの利用によって生じたいかなる損害にも責任を負いません。
* 本ライブラリの内容や情報は予告なく変更される場合があります。


