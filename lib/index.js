'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var oauth = _interopDefault(require('oauth'));
var request = _interopDefault(require('request'));
var wsse = _interopDefault(require('wsse'));
var xml2js = _interopDefault(require('xml2js'));

function pad(n) {
  return ('0' + n).slice(-2);
}

// DateをISO8601形式文字列に変換する
// String.toISOString()はタイムゾーンがZとなってしまうので。。
function toISOString(d = new Date()) {
  let timezoneOffset = d.getTimezoneOffset();
  let hour = Math.abs(timezoneOffset / 60) | 0;
  let minutes = Math.abs(timezoneOffset % 60);
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
  }

  // constructor
  // params:
  //   options: (required)
  //   - type     : authentication type. default `'wsse'`
  //   - username : user name. (required)
  //   - blogId   : blog id. (required)
  //   (type 'wsse')
  //   - apikey   : wsse authentication apikey. (required)
  //   (type 'oauth')
  //   - consumerKey       : oauth consumer key. (required)
  //   - consumerSecret    : oauth consumer secret. (required)
  //   - accessToken       : oauth access token. (required)
  //   - accessTokenSecret : oauth access token secret. (required)
  constructor({
    type = 'wsse',
    userName,
    blogId,
    apiKey,
    consumerKey,
    consumerSecret,
    accessToken,
    accessTokenSecret
  }) {
    this._type = !type ? type : 'wsse';
    // 各パラメータのチェック
    if(this._type != 'oauth' && this._type != 'wsse'){
      throw new Error('constructor:typeには"wsse"もしくは"oauth"以外の値は指定できません。');
    }
    if(!userName) {
      throw new Error('constructor:userNameが空白・null・未指定です。正しいはてなブログユーザー名を指定してください。');
    }
    if(!blogId){
      throw new Error('constructor:blogIdが空白・null・未指定です。正しいはてなブログIDを指定してください。');
    }
    if(!apiKey){
      throw new Error('constructor:apiKeyが空白・null・未指定です。正しいはてなブログAPIキーを指定してください。');
    }

    if(this.type_ == 'oauth'){
      if(!consumerKey){
        throw new Error('constructor:consumerKeyが空白・null・未指定です。正しいコンシューマー・キーを指定してください。');
      }
      if(!consumerSecret){
        throw new Error('constructor:consumerSecretが空白・null・未指定です。正しいコンシューマー・シークレットを指定してください。');
      }
      if(!accessToken){
        throw new Error('constructor:accessTokenが空白・null・未指定です。正しいアクセス・トークンを指定してください。');
      }
      if(!accessTokenSecret){
        throw new Error('constructor:accessTokenSecretが空白・null・未指定です。正しいアクセス・トークン・シークレットを指定してください。');
      }
    } else {
      if(consumerKey){
        console.warn('"wsse"では使用しないconsumerKeyパラメータが指定されています。'); 
      }
      if(consumerSecret){
        console.warn('"wsse"では使用しないconsumerSecretパラメータが指定されています。');      
      }
      if(accessToken){
        console.warn('"wsse"では使用しないaccessTokenパラメータが指定されています。');      
      }
      if(accessTokenSecret){
        console.warn('"wsse"では使用しないaccessTokenSecretパラメータが指定されています。');
      }

    }

    this._userName = userName;

    this._blogId = blogId;
    this._apiKey = apiKey;
    this._consumerKey = consumerKey;
    this._consumerSecret = consumerSecret;
    this._accessToken = accessToken;
    this._accessTokenSecret = accessTokenSecret;
    this._baseUrl = 'https://blog.hatena.ne.jp';
  }

  // POST CollectionURI (/<username>/<blog_id>/atom/entry)
  // params:
  //   options: (required)
  //   - title      : 'title'. entry title.default `''`. (required)
  //   - content    : 'content'. entry content. default `''`.
  //   - type       : 'type'. entry content type . "text/html","text/markdown","text/plain"
  //   - updated    : 'updated'. default `undefined`
  //   - categories : 'category' '@term'. default `undefined`.
  //   - draft      : 'app:control' > 'app:draft'. default `undefined`.
  // returns:
  //   Promise
  postEntry({ title = '', content = '', type = 'text/plain', updated = new Date(), categories, draft = false }) {
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
            type: type || 'text/plain'
          },
          _: content
        }
      }
    };
    //
    if (updated instanceof Date)
    {
      updated = toISOString(updated);
    } else {
      !updated.match(ISO8601Format) && this._reject();
    }
    if (updated) { body.entry.updated = { _: updated }; }
    if (categories) { body.entry.category = categories.map(c => ({ $: { term: c } })); }
    if (draft ? draft : false) { body.entry['app:control'] = { 'app:draft': { _: 'yes' } }; }
    let statusCode = 201;
    return this._request({ method, path, body, statusCode });
  }


  // PUT MemberURI (/<username>/<blog_id>/atom/entry/<entry_id>)
  // params:
  //   options: (required)
  //   - id         : entry id. (required)
  //   - title      : 'title'. entry title. default `undefined`.
  //   - content    : 'content'. entry content. (required).
  //   - type       : 'type'. entry content type
  //   - updated    : 'updated'. default `undefined`
  //   - categories : 'category' '@term'. default `undefined`.
  //   - draft      : 'app:control' > 'app:draft'. default `undefined`.
  // returns:
  //   Promise
  updateEntry({ id, title, content, type, updated = new Date(), categories, draft }) {
    // パラメータチェック
    if (!id) return this._reject('options.id is required');
    if (!content) return this._reject('options.content is required');
    if (!title) return this._reject('options.title is required');
    if (!type) return this._reject('options.type is required');

    // updatedがDateの場合、ISO8601形式に変換する
    if (updated instanceof Date) updated = toISOString(updated);

    let method = 'put';
    let path = `/${this._userName}/${this._blogId}/atom/entry/${id}`;
    let body = {
      entry: {
        $: {
          xmlns: 'http://www.w3.org/2005/Atom',
          'xmlns:app': 'http://www.w3.org/2007/app'
        },
        content: {
          $: {
            type: type || 'text/plain'
          },
          _: content
        }
      }
    };
    if (title) body.entry.title = { _: title };
    if (updated) { body.entry.updated = { _: updated }; }
    if (categories != null) { body.entry.category = categories.map(c => ({ $: { term: c } })); }
    if (draft != null ? draft : false) { body.entry['app:control'] = { 'app:draft': { _: 'yes' } }; }
    let statusCode = 200;
    return this._request({ method, path, body, statusCode });
  }

  // DELETE MemberURI (/<username>/<blog_id>/atom/entry/<entry_id>)
  // params:
  //   options: (required)
  //   - id: entry id. (required)
  // returns:
  //   Promise
  deleteEntry({ id }) {
    if (id == null) { return this._reject('options.id is required'); }
    let method = 'delete';
    let path = `/${this._userName}/${this._blogId}/atom/entry/${id}`;
    let statusCode = 200;
    return this._request({ method, path, statusCode });
  }

  // GET MemberURI (/<username>/<blog_id>/atom/entry/<entry_id>)
  // params:
  //   options: (required)
  //   - id: entry id. (required)
  // returns:
  //   Promise
  getEntry({ id }) {
    if (id == null) { return this._reject('options.id is required'); }
    let method = 'get';
    let path = `/${this._userName}/${this._blogId}/atom/entry/${id}`;
    let statusCode = 200;
    return this._request({ method, path, statusCode });
  }

  // GET CollectionURI (/<username>/<blog_id>/atom/entry)
  // params:
  //   options:
  //   - page: page
  // returns:
  //   Promise
  getEntries(options) {
    let method = 'get';
    let pathWithoutQuery = `/${this._userName}/${this._blogId}/atom/entry`;
    let page = (options && options.page) ? options.page : undefined;
    let query = page ? `?page=${page}` : '';
    let path = pathWithoutQuery + query;
    let statusCode = 200;
    return this._request({ method, path, statusCode });
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
    return new Promise((function (resolve, reject) {
      return this._rawRequest(params, function (err, res) {
        if (err != null) {
          return reject(err);
        } else {
          return resolve(res);
        }
      });
    }.bind(this)));
  }

  _toJson(xml) {
    return new Promise(function (resolve, reject) {
      let parser = new xml2js.Parser({ explicitArray: false, explicitCharkey: true });
      return parser.parseString(xml, function (err, result) {
        if (err != null) {
          return reject(err);
        } else {
          return resolve(result);
        }
      });
    });
  }

  _toXml(json) {
    let builder = new xml2js.Builder();
    try {
      let xml = builder.buildObject(json);
      return Promise.resolve(xml);
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
Blog.initClass();

var index = function(options) {
  return new Blog(options);
};

exports['default'] = index;
exports.Blog = Blog;
