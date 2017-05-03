# hatena-blog-api

このライブラリは非公式なNode.js用のHatena::Blog AtomPub APIのラッパーです。
bouzuyaさんのnode-hatena-blog-apiをベースにcoffeeからes6に変換し、いくつか修正を加えています。
https://github.com/bouzuya/node-hatena-blog-api

## Installation

$ npm install https://github.com/sfpgmr/node-hatena-blog-api

## Usage

See [`examples/`](examples/).

### Coding style (Promise Only)

```javascript
var blog = /* ... */;
var client = /* ... */;
var options = /* ... */;

client.create(options).then(()=>{
  console.log('uploaded');
}, (err) => {
  console.error(err);
});
```

### Configuration (WSSE/OAuth)

#### WSSE

See ["How to use Hatena WSSE"](http://developer.hatena.ne.jp/ja/documents/auth/apis/wsse).

- username ... Your username.
- blogId ... Your blod id.
- apiKey ... See [AtomPub API key](http://blog.hatena.ne.jp/my/config/detail).

#### OAuth

See ["How to use Hatena OAuth"](http://developer.hatena.ne.jp/ja/documents/auth/apis/oauth).

Application scope is "read_private" and "write_private".

```javascript
var blog = require('hatena-blog-api');

var client = blog({
  type: 'oauth',
  blogId: 'blog id',
  consumerKey: 'consumer key',
  consumerSecret: 'consumer secret',
  accessToken: 'access token',
  accessTokenSecret: 'access token secret'
});

// ...
```

## API Docs

 [Hatena::Blog AtomPub API](http://developer.hatena.ne.jp/ja/documents/blog/apis/atom), [`test/`](test/) and [`examples/`](examples/).

## License

[MIT](LICENSE)


