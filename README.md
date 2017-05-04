# hatena-blog-api2

## ※このライブラリおよびREADMEは現在作成中です。

このライブラリは非公式なNode.js用の[Hatena::Blog AtomPub API](http://developer.hatena.ne.jp/ja/documents/blog/apis/atom)のラッパーです。
[bouzuya](https://github.com/bouzuya)さんの[node-hatena-blog-api](https://github.com/bouzuya/node-hatena-blog-api)をベースにcoffeeからes6に変換し、いくつか修正を加えています。  
https://github.com/bouzuya/node-hatena-blog-api

## 開発のポリシー

* 不正なポストを行わないようにするため、引数のチェックはできる限り入念に行う。
* ES6(ES2015)の構文をできる限り採用する。

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
## データフォーマット

AtomPub API はデータフォーマットとしてXMLを使用しています。本ライブラリでは、APIに渡すデータ・返却されるデータを[xml2js](https://github.com/Leonidas-from-XIV/node-xml2js)を使用してJSONへ変換しています。変換されるJSONデータはxml2jsの変換方式に準じています。

* XMLタグの親子関係 ... JSONプロパティの階層で対応
* XMLタグの属性 ... プロパティ $ の中に格納
* XMLタグのtextノードの値 ... プロパティ _ に格納

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

引数はオブジェクト'`{}`'１つのみです。  
オブジェクトのプロパティとして以下のパラメータを格納します。

* ***title*** ... 記事タイトルを指定します。既定値は`''`(空白)です。`null`は空白に置き換えられます。
* ***content*** ... 記事本文を指定します。既定値は`''`(空白)です。`null`は空白に置き換えられます。
* ***updated*** ... 記事の公開日付を指定します。値は`Date`もしくはISO8601形式でミリ秒を省略したものを文字列で指定します。それ以外の値を指定した場合は`reject`されます。
* ***categories*** ... カテゴリ文字列を文字列、もしくは文字列の配列で指定します。指定しない場合は省略されます。  
文字列もしくは文字列の配列以外を指定した場合、配列中に文字列以外が含まれる場合は`reject`されます。

* ***draft*** ... 下書きかどうかを指定します。既定値は`false`(公開)です。  
ブール値以外の値を指定すると`reject`されます。

##### 戻り値

Promiseを返します。処理結果は`then()`の引数に指定する`function`オブジェクトの第一引数として渡されます。

##### 使用例

[ソースコード](./examples/post.js)

```javascript
const Blog = require('hatena-blog-api2').Blog;

const client = new Blog({
  type: 'wsse',
  userName: process.env.HATENA_USERNAME, // 'username'
  blogId: process.env.HATENA_BLOG_ID,    // 'blog id'
  apiKey: process.env.HATENA_APIKEY      // 'apikey'
});

// POST CollectionURI (/<username>/<blog_id>/atom/entry)
client.postEntry({
  title: 'テストエントリ',
  updated:new Date(2010,1,1,10,10),
  content: '# テストエントリ\r\nこれはテストです。\r\n\r\n',
})
.then(
  // resolve
  (res)=>{
    console.log('posted\n',JSON.stringify(res,null,1));
  },
  // reject
  console.error
);

```
上記の実行結果resolveにセットされるjsonデータ例
```json
{
 "entry": {
  "$": {
   "xmlns": "http://www.w3.org/2005/Atom",
   "xmlns:app": "http://www.w3.org/2007/app"
  },
  "id": {
   "_": "tag:blog.hatena.ne.jp,2013:blog-sfpgmr-12921228815731439891-10328749687243023284"
  },
  "link": [
   {
    "$": {
     "rel": "edit",
     "href": "https://blog.hatena.ne.jp/sfpgmr/sfpgmr-test.hatenablog.com/atom/entry/10328749687243023284"
    }
   },
   {
    "$": {
     "rel": "alternate",
     "type": "text/html",
     "href": "http://sfpgmr-test.hatenablog.com/entry/2010/02/01/%E3%83%86%E3%82%B9%E3%83%88%E3%82%A8%E3%83%B3%E3%83%88%E3%83%AA_1"
    }
   }
  ],
  "author": {
   "name": {
    "_": "sfpgmr"
   }
  },
  "title": {
   "_": "テストエントリ"
  },
  "updated": {
   "_": "2010-02-01T01:10:00+09:00"
  },
  "published": {
   "_": "2017-05-04T15:55:52+09:00"
  },
  "app:edited": {
   "_": "2017-05-04T15:55:52+09:00"
  },
  "summary": {
   "_": "# テストエントリ これはテストです。",
   "$": {
    "type": "text"
   }
  },
  "content": {
   "_": "# テストエントリ\r\nこれはテストです。\r\n\r\n",
   "$": {
    "type": "text/x-hatena-syntax"
   }
  },
  "hatena:formatted-content": {
   "_": "<p># テストエントリ<br />\nこれはテストです。</p>\n",
   "$": {
    "type": "text/html",
    "xmlns:hatena": "http://www.hatena.ne.jp/info/xmlns#"
   }
  },
  "app:control": {
   "app:draft": {
    "_": "no"
   }
  }
 }
}
```
#### Blog.updateEntry()

ブログ記事を更新します。

##### 書式
```javascript
  updateEntry({id,title,content,updated,categories,draft})
```
##### 引数

引数はオブジェクト'`{}`'１つのみです。  
オブジェクトのプロパティとして以下のパラメータを格納します。

* ***id*** （必須）... 記事IDを指定します。`id`を指定しない場合は`reject`されます。
* ***title*** （必須）... 記事タイトルを指定します。既定値は`''`(空白)です。`null`は空白に置き換えられます。`title`を指定しない場合は`reject`されます。
* ***content*** （必須）... 記事本文を指定します。既定値は`''`(空白)です。`null`は空白に置き換えられます。`content`を指定しない場合は`reject`されます。
* ***updated*** （必須）... 記事の公開日付を指定します。値は`Date`もしくはISO8601形式でミリ秒を省略したものを文字列で指定します。`updated`自体を指定しない、もしくは`updated`に`Date`もしくはISO8601形式の文字列出ない場合`reject`されます。
* ***categories*** ... カテゴリ文字列を文字列、もしくは文字列の配列で指定します。指定しない場合は省略されます。  
文字列もしくは文字列の配列以外を指定した場合、配列中に文字列以外が含まれる場合は`reject`されます。
* ***draft*** ... 下書きかどうかを指定します。既定値は`false`(公開)です。  
ブール値以外の値を指定すると`reject`されます。

##### 戻り値

Promiseを返します。処理結果は`then()`の引数に指定する`function`オブジェクトの第一引数として渡されます。

##### 使用例

```javascript
const Blog = require('hatena-blog-api2').Blog;

const client = new Blog({
  type: 'wsse',
  userName: process.env.HATENA_USERNAME, // 'username'
  blogId: process.env.HATENA_BLOG_ID,    // 'blog id'
  apiKey: process.env.HATENA_APIKEY      // 'apikey'
});

//process.on('unhandledRejection', console.dir);

// POST CollectionURI (/<username>/<blog_id>/atom/entry)
client.postEntry({
  title: 'テストエントリ',
  updated:new Date(2010,1,1,10,10),
  content: '# テストエントリ\r\nこれはテストです。\r\n\r\n',
  categories:['blog','hatena']
})
.then(
  // resolve
  res=>{
    console.log('#postEntryの結果\n',JSON.stringify(res,null,1));
    // idの取り出し
    const entryId = res.entry.id._.match(/^tag:[^:]+:[^-]+-[^-]+-\d+-(\d+)$/)[1];
    console.log(entryId);
    return client.updateEntry({
      id:entryId,
      title:res.entry.title._,
      content:'修正',
      updated:res.entry.updated._
    });
  }
)
.then(
  // resolve
  res=>{
    console.log('#updateEntryの結果\n',JSON.stringify(res,null,1));
  }
)
.catch(console.error);
```

#### Blog.deleteEntry()

記事を削除します。

##### 書式

```javascript
  deleteEntry(id);
```

##### 引数

* ***id*** （必須）... 記事IDを指定します。`id`を指定しない場合は`reject`されます。

##### 戻り値

Promiseを返します。処理結果は`then()`の引数に指定する`function`オブジェクトの第一引数として渡されます。値は正常終了した場合は`null`です。

##### 使用例

```javascript
const Blog = require('hatena-blog-api2').Blog;

const client = new Blog({
  type: 'wsse',
  userName: process.env.HATENA_USERNAME, // 'username'
  blogId: process.env.HATENA_BLOG_ID,    // 'blog id'
  apiKey: process.env.HATENA_APIKEY      // 'apikey'
});

//process.on('unhandledRejection', console.dir);

// POST CollectionURI (/<username>/<blog_id>/atom/entry)
client.postEntry({
  title: 'テストエントリ',
  updated:new Date(2010,1,1,10,10),
  content: '# テストエントリ\r\nこれはテストです。\r\n\r\n',
  categories:['blog','hatena']
})
.then(
  // resolve
  res=>{
    console.log('#postEntryの結果\n',JSON.stringify(res,null,1));
    // idの取り出し
    const entryId = res.entry.id._.match(/^tag:[^:]+:[^-]+-[^-]+-\d+-(\d+)$/)[1];
    console.log(entryId);
    // 記事の削除
    return client.deleteEntry(entryId);
  }
)
.then(
  // resolve
  res=>{
    console.log('#deleteEntryの結果\n',JSON.stringify(res,null,1));
  }
)
.catch(console.error);

```

#### Blog.getEntry()

記事を取得します。

##### 書式

```javascript
 getEntry(id);
```
##### 引数

* ***id*** （必須）... 記事IDを指定します。`id`を指定しない場合は`reject`されます。

##### 戻り値

Promiseを返します。処理結果は`then()`の引数に指定する`function`オブジェクトの第一引数として渡されます。

##### 使用例

```javascript
const Blog = require('hatena-blog-api2').Blog;

const client = new Blog({
  type: 'wsse',
  userName: process.env.HATENA_USERNAME, // 'username'
  blogId: process.env.HATENA_BLOG_ID,    // 'blog id'
  apiKey: process.env.HATENA_APIKEY      // 'apikey'
});

//process.on('unhandledRejection', console.dir);

// POST CollectionURI (/<username>/<blog_id>/atom/entry)
client.postEntry({
  title: 'テストエントリ',
  updated:new Date(2010,1,1,10,10),
  content: '# テストエントリ\r\nこれはテストです。\r\n\r\n',
  categories:['blog','hatena']
})
.then(
  // resolve
  res=>{
    console.log('#postEntryの結果\n',JSON.stringify(res,null,1));
    // idの取り出し
    const entryId = res.entry.id._.match(/^tag:[^:]+:[^-]+-[^-]+-\d+-(\d+)$/)[1];
    console.log(entryId);
    // エントリを取得
    return client.getEntry(entryId);
  }
)
.then(
  // resolve
  res=>{
    console.log('#getEntryの結果\n',JSON.stringify(res,null,1));
  }
)
.catch(console.error);
```
`getEntry`で返却されるJSONデータの例

```json
 {
 "entry": {
  "$": {
   "xmlns": "http://www.w3.org/2005/Atom",
   "xmlns:app": "http://www.w3.org/2007/app"
  },
  "id": {
   "_": "tag:blog.hatena.ne.jp,2013:blog-sfpgmr-12921228815731439891-10328749687243094177"
  },
  "link": [
   {
    "$": {
     "rel": "edit",
     "href": "https://blog.hatena.ne.jp/sfpgmr/sfpgmr-test.hatenablog.com/atom/entry/10328749687243094177"
    }
   },
   {
    "$": {
     "rel": "alternate",
     "type": "text/html",
     "href": "http://sfpgmr-test.hatenablog.com/entry/2010/02/01/%E3%83%86%E3%82%B9%E3%83%88%E3%82%A8%E3%83%B3%E3%83%88%E3%83%AA_10"
    }
   }
  ],
  "author": {
   "name": {
    "_": "sfpgmr"
   }
  },
  "title": {
   "_": "テストエントリ"
  },
  "updated": {
   "_": "2010-02-01T01:10:00+09:00"
  },
  "published": {
   "_": "2017-05-04T21:11:55+09:00"
  },
  "app:edited": {
   "_": "2017-05-04T21:11:55+09:00"
  },
  "summary": {
   "_": "# テストエントリ これはテストです。",
   "$": {
    "type": "text"
   }
  },
  "content": {
   "_": "# テストエントリ\r\nこれはテストです。\r\n\r\n",
   "$": {
    "type": "text/x-hatena-syntax"
   }
  },
  "hatena:formatted-content": {
   "_": "<p># テストエントリ<br />\nこれはテストです。</p>\n",
   "$": {
    "type": "text/html",
    "xmlns:hatena": "http://www.hatena.ne.jp/info/xmlns#"
   }
  },
  "category": [
   {
    "$": {
     "term": "blog"
    }
   },
   {
    "$": {
     "term": "hatena"
    }
   }
  ],
  "app:control": {
   "app:draft": {
    "_": "no"
   }
  }
 }
}
```

##### 戻り値

#### Blog.getEntries()

エントリのコレクションを取得します。AtomPub APIの制約により、1回のAPI呼び出しで取得できるエントリは10エントリまでとなっています。

##### 書式

```javascript
getEntries(page);
```

##### 引数

* ***page*** ... pageIDを指定します。このメソッドを呼び出すことで得られるpageIDを取得・設定することで、10エントリ以上の記事を連続して取得することができます。使用例を参照してください。指定しない場合は最初の10記事と、次のページがある場合はpageIDを返します。

##### 戻り値

Promiseを返します。処理結果は`then()`の引数に指定する`function`オブジェクトの第一引数として渡されます。処理結果は以下のフォーマットです。

```
{
  res:(APIのレスポンス結果のJSONデータ),
  nextPageID:(次のページのpageID)
}
```

##### 使用例

```javascript

```



## License

[MIT](LICENSE)

## 利用しているライブラリ

## 製作者

SFPGMR (Satoshi Fujiwara)

## 免責事項

* 本ライブラリのソースコード、Webページに書かれている情報は、その内容について保証するものではありません。
* 製作者は本ライブラリおよびソースコードの利用によって生じたいかなる損害にも責任を負いません。
* 本ライブラリの内容や情報は予告なく変更される場合があります。


