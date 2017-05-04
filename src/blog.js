import request from 'request';
import wsse from 'wsse';
import xml2js from 'xml2js';

function pad(n) {
  return ('0' + n).slice(-2);
}

const toString = Object.prototype.toString;

// 型判定
function isString(v) {
  return toString.call(v) == '[object String]';
}

function isDate(v) {
  return toString.call(v) == '[object Date]';
}

function isArray(v) {
  return toString.call(v) == '[object Array]';
}

function isBoolean(v) {
  return toString.call(v) == '[object Boolean]';
}

// DateをISO8601形式文字列に変換する
// String.toISOString()はタイムゾーンがZとなってしまうので。。
function toISOString(d = new Date()) {
  const timezoneOffset = d.getTimezoneOffset();
  const hour = Math.abs(timezoneOffset / 60) | 0;
  const minutes = Math.abs(timezoneOffset % 60);
  let tzstr = 'Z';
  if (timezoneOffset < 0) {
    tzstr = `+${pad(hour)}:${pad(minutes)}`;
  } else if (timezoneOffset > 0) {
    tzstr = `-${pad(hour)}:${pad(minutes)}`;
  }
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}${tzstr}`;
}

// ISO8601形式かどうかをチェックする正規表現
var ISO8601Format = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)$/;

// Hatena::Blog AtomPub API wrapper
//
// - GET    CollectionURI       (/<username>/<blog_id>/atom/entry)
//   => Blog#index
// - POST   CollectionURI       (/<username>/<blog_id>/atom/entry)
//   => Blog#create
// - GET    MemberURI           (/<username>/<blog_id>/atom/entry/<entry_id>)
//   => Blog#show
// - PUT    MemberURI           (/<username>/<blog_id>/atom/entry/<entry_id>)
//   => Blog#update
// - DELETE MemberURI           (/<username>/<blog_id>/atom/entry/<entry_id>)
//   => Blog#destroy
// - GET    ServiceDocumentURI  (/<username>/<blog_id>/atom)
//   => None
// - GET    CategoryDocumentURI (/<username>/<blog_id>/atom/category)
//   => None
class Blog {
  static initClass() {
    this.prototype._rawRequest = request;
    this.prototype._xmlBuilder = new xml2js.Builder();
    this.prototype._xmlParser
      = new xml2js.Parser({
        explicitArray: false,
        explicitCharkey: true
      });
  }

  // コンストラクタ
  constructor({
    type = 'wsse',// 認証タイプ : 'wsse'もしくは'oauth'のいずれかを指定する。
    // type 'wsse','oauth'両方に必要な設定（必須）
    userName,// はてなブログのユーザーIDを指定する。
    blogId,// はてなブログIDを指定する。
    apiKey,// はてなブログのAPIキーを指定する。
    // type 'oauth'のみ必須となる設定（必須）
    consumerKey,// コンシューマー・キー
    consumerSecret,// コンシューマー・シークレット
    accessToken,// アクセス・トークン
    accessTokenSecret// アクセストークン・シークレット
  }) {
    this._type = type;
    // 各パラメータのチェック
    if (this._type != 'oauth' && this._type != 'wsse') {
      throw new Error('constructor:typeには"wsse"もしくは"oauth"以外の値は指定できません。');
    }
    if (!userName) {
      throw new Error('constructor:userNameが空白・null・未指定です。正しいはてなブログユーザー名を指定してください。');
    }
    if (!blogId) {
      throw new Error('constructor:blogIdが空白・null・未指定です。正しいはてなブログIDを指定してください。');
    }
    if (!apiKey) {
      throw new Error('constructor:apiKeyが空白・null・未指定です。正しいはてなブログAPIキーを指定してください。');
    }

    if (this.type_ == 'oauth') {
      if (!consumerKey) {
        throw new Error('constructor:consumerKeyが空白・null・未指定です。正しいコンシューマー・キーを指定してください。');
      }
      if (!consumerSecret) {
        throw new Error('constructor:consumerSecretが空白・null・未指定です。正しいコンシューマー・シークレットを指定してください。');
      }
      if (!accessToken) {
        throw new Error('constructor:accessTokenが空白・null・未指定です。正しいアクセス・トークンを指定してください。');
      }
      if (!accessTokenSecret) {
        throw new Error('constructor:accessTokenSecretが空白・null・未指定です。正しいアクセス・トークン・シークレットを指定してください。');
      }
    } else {
      if (consumerKey) {
        console.warn('"wsse"では使用しないconsumerKeyパラメータが指定されています。');
      }
      if (consumerSecret) {
        console.warn('"wsse"では使用しないconsumerSecretパラメータが指定されています。');
      }
      if (accessToken) {
        console.warn('"wsse"では使用しないaccessTokenパラメータが指定されています。');
      }
      if (accessTokenSecret) {
        console.warn('"wsse"では使用しないaccessTokenSecretパラメータが指定されています。');
      }
    }

    this._userName = userName;

    this._blogId = blogId;;
    this._apiKey = apiKey;
    this._consumerKey = consumerKey;
    this._consumerSecret = consumerSecret;
    this._accessToken = accessToken;
    this._accessTokenSecret = accessTokenSecret;
    this._baseUrl = 'https://blog.hatena.ne.jp';
  }

  // POST CollectionURI (/<username>/<blog_id>/atom/entry)
  // 戻り値:
  //   Promise
  postEntry({
     title = '',// タイトル文字列
    content = '',// 記事本文
    updated = new Date(), // 日付
    categories,// カテゴリ 
    draft = false // 下書きかどうか
  }) {
    const method = 'post';
    const path = `/${this._userName}/${this._blogId}/atom/entry`;
    title = !title ? '' : title;
    content = !content ? '' : content;
    const body = {
      entry: {
        $: {
          xmlns: 'http://www.w3.org/2005/Atom',
          'xmlns:app': 'http://www.w3.org/2007/app'
        },
        title: {
          _: title
        },
        content: {
          $: {
            type: 'text/plain'
          },
          _: content
        }
      }
    };
    // 日付文字列のチェック
    if (isDate(updated)) {
      // DateはISO8601文字列に変換
      updated = toISOString(updated);
    } else if (!updated.match(ISO8601Format)) {
      return this._reject('postEntry:updatedの日付フォーマットに誤りがあります。指定できるのはDateオブジェクトかISO8601文字列のみです。');
    }
    // categoriesのチェック
    if (categories) {
      if (!isArray(categories)) {
        if (isString(categories)) {
          categories = [categories];
        } else {
          return this._reject('postEntry:categoriesに文字列もしくは文字配列以外の値が指定されています。指定できるのは文字列か、文字配列のみです。');
        }
      } else {
        for (let i = 0, e = categories.length; i < e; ++i) {
          if (!isString(categories[i])) {
            return this._reject('postEntry:categoriesの配列中に文字列でないものが含まれています。配列に含めることができるのは文字列のみです。');
          }
        }
      }
    }


    // draftのチェック
    if (!isBoolean(draft)) {
      return this._reject('postEntry:draftにブール値以外の値が含まれています。')
    }

    if (updated) { body.entry.updated = { _: updated }; }
    if (categories) {
      body.entry.category
        = categories.map(c => ({ $: { term: c } }));
    }
    if (draft ? draft : false)
    { body.entry['app:control'] = { 'app:draft': { _: 'yes' } }; }

    let statusCode = 201;
    // requestの発行。結果はプロミスで返却される
    return this._request({ method, path, body, statusCode });
  }

  // PUT MemberURI (/<username>/<blog_id>/atom/entry/<entry_id>)
  // returns:
  //   Promise
  updateEntry({
    id,// エントリID(必須)
    title,// タイトル(必須)
    content,// 記事本体(必須)
    updated,// 更新日付(必須)
    categories,// カテゴリ(オプション)
    draft = false //下書きがどうか(既定:false(公開))
  }) {
    if (!id) return this._rejectRequired('updateEntry', 'id');
    if (!content) return this._rejectRequired('updateEntry', 'content');
    if (!title) return this._rejectRequired('updateEntry', 'title');
    if (!updated) return this._rejectRequired('updateEntry', 'updated');

    // updatedのチェック
    if (isDate(updated)) {
      // DateはISO8601文字列に変換
      updated = toISOString(updated);
    } else if (!updated.match(ISO8601Format)) {
      return this._reject('updateEntry:updatedの日付フォーマットに誤りがあります。指定できるのはDateオブジェクトかISO8601文字列のみです。');
    }
    // categoriesのチェック
    if (categories) {
      if (!isArray(categories)) {
        if (isString(categories)) {
          categories = [categories];
        } else {
          return this._reject('postEntry:categoriesに文字列もしくは文字配列以外の値が指定されています。指定できるのは文字列か、文字配列のみです。');
        }
      } else {
        for (let i = 0, e = categories.length; i < e; ++i) {
          if (!isString(categories[i])) {
            return this._reject('postEntry:categoriesの配列中に文字列でないものが含まれています。配列に含めることができるのは文字列のみです。');
          }
        }
      }
    }

    // draftのチェック
    if (!isBoolean(draft)) {
      return this._reject('postEntry:draftにブール値以外の値が含まれています。')
    }


    title = !title ? '' : title;
    content = !content ? '' : content;

    const method = 'put';
    const path = `/${this._userName}/${this._blogId}/atom/entry/${id}`;
    const body = {
      entry: {
        $: {
          xmlns: 'http://www.w3.org/2005/Atom',
          'xmlns:app': 'http://www.w3.org/2007/app'
        },
        content: {
          $: {
            type: 'text/plain'
          },
          _: content
        }
      }
    };
    title && (body.entry.title = { _: title });
    body.entry.updated = { _: updated };
    if (categories != null) {
      body.entry.category
        = categories.map(c => ({ $: { term: c } }));
    }
    if (draft != null ? draft : false) {
      body.entry['app:control'] = { 'app:draft': { _: 'yes' } };
    }
    console.log(body);
    let statusCode = 200;
    return this._request({ method, path, body, statusCode });
  }

  // DELETE MemberURI (/<username>/<blog_id>/atom/entry/<entry_id>)
  // params:
  //   options: (required)
  //   - id: entry id. (required)
  // returns:
  //   Promise
  deleteEntry(id) {
    if (id == null) { return this._rejectRequired('deleteEntry', 'id'); }
    let method = 'delete';
    let path = `/${this._userName}/${this._blogId}/atom/entry/${id}`;
    let statusCode = 200;
    return this._request({ method, path, statusCode });
  }

  // GET MemberURI (/<username>/<blog_id>/atom/entry/<entry_id>)
  // returns:
  //   Promise
  getEntry(id) {
    if (id == null) { return this._rejectRequired('getEntry', 'id'); }
    let method = 'get';
    let path = `/${this._userName}/${this._blogId}/atom/entry/${id}`;
    let statusCode = 200;
    return this._request({ method, path, statusCode });
  }

  // GET CollectionURI (/<username>/<blog_id>/atom/entry)
  // returns:
  //   Promise
  getEntries(page) {
    const method = 'get';
    const pathWithoutQuery = `/${this._userName}/${this._blogId}/atom/entry`;
    const query = page ? `?page=${page}` : '';
    const path = pathWithoutQuery + query;
    const statusCode = 200;
    console.log(path);
    return this._request({ method, path, statusCode })
      .then(res => {
        const results = { res: res };
        // 前のページのPage IDを取り出す
        const next = res.feed.link.filter((d) => d.$.rel == 'next');
        if (next && next[0]) {
          const regexp = /\?page\=([0-9]*)$/;
          const maches = regexp.exec(next[0].$.href);
          const nextPageID = maches[1].trim();
          if(nextPageID) results.nextPageID = nextPageID;
        }
        return results;
      });
  }

  _reject(message) {
    let e;
    try {
      e = new Error(message);
      return Promise.reject(e);
    } catch (error) {
      return Promise.reject(e);
    }
  }

  _rejectRequired(methodName, paramStr) {
    return this._reject(`${methodName}:{}.${paramStr}が指定されていません。{}.${paramStr}は必須項目です。`);
  }


  _request({ method, path, body, statusCode }) {
    let params = {};
    params.method = method;
    params.url = this._baseUrl + path;
    if (this._type === 'oauth') {
      params.oauth = {
        consumer_key: this._consumerKey,
        consumer_secret: this._consumerSecret,
        token: this._accessToken,
        token_secret: this._accessTokenSecret
      };
    } else { // @_type is 'wsse'
      let token = wsse().getUsernameToken(this._userName, this._apiKey, { nonceBase64: true });
      params.headers = {
        'Authorization': 'WSSE profile="UsernameToken"',
        'X-WSSE': `UsernameToken ${token}`
      };
    }
    let promise = (body != null) ? this._toXml(body) : Promise.resolve(null);
    return promise
      .then(body => {
        if (body != null) { params.body = body; }
        return this._requestPromise(params);
      }).then(res => {
        if (res.statusCode !== statusCode) {
          throw new Error(`HTTP status code is ${res.statusCode}`);
        }
        return this._toJson(res.body);
      });
  }

  _requestPromise(params) {
    return new Promise(( (resolve, reject) => {
      return this._rawRequest(params, function (err, res) {
        if (err != null) {
          return reject(err);
        } else {
          return resolve(res);
        }
      });
    }));
  }

  _toJson(xml) {
    return new Promise((resolve, reject) =>{
      // let parser = new xml2js.Parser({ explicitArray: false, explicitCharkey: true });
      return this._xmlParser.parseString(xml,  (err, result)=> {
        if (err != null) {
          return reject(err);
        } else {
          return resolve(result);
        }
      });
    });
  }

  _toXml(json) {
    try {
      let xml = this._xmlBuilder.buildObject(json);
      return Promise.resolve(xml);
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
Blog.initClass();

export default Blog;
