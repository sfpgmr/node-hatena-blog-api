'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var oauth = _interopDefault(require('oauth'));
var request = _interopDefault(require('request'));
var wsse = _interopDefault(require('wsse'));
var xml2js = _interopDefault(require('xml2js'));

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
    type,
    username,
    userName,
    blogid,
    blogId,
    apikey,
    apiKey,
    consumerkey,
    consumerKey,
    consumersecret,
    consumerSecret,
    accesstoken,
    accessToken,
    accesstokensecret,
    accessTokenSecret
  }) {
    this._type = type != null ? type : 'wsse';
    this._username = userName != null ? userName : username;
    this._blogId = blogId != null ? blogId : blogid;
    this._apiKey = apiKey != null ? apiKey : apikey;
    this._consumerKey = consumerKey != null ? consumerKey : consumerkey;
    this._consumerSecret = consumerSecret != null ? consumerSecret : consumersecret;
    this._accessToken = accessToken != null ? accessToken : accesstoken;
    this._accessTokenSecret = accessTokenSecret != null ? accessTokenSecret : accesstokensecret;
    this._baseUrl = 'https://blog.hatena.ne.jp';
  }

  // POST CollectionURI (/<username>/<blog_id>/atom/entry)
  // params:
  //   options: (required)
  //   - title      : 'title'. entry title.default `''`.
  //   - content    : 'content'. entry content. default `''`.
  //   - type       : 'type'. entry content type
  //   - updated    : 'updated'. default `undefined`
  //   - categories : 'category' '@term'. default `undefined`.
  //   - draft      : 'app:control' > 'app:draft'. default `undefined`.
  //   callback:
  //   - err: error
  //   - res: response
  // returns:
  //   Promise
  create({ title, content, type , updated, categories, draft }, callback) {
    title = title != null ? title : '';
    content = content != null ? content : '';
    let method = 'post';
    let path = `/${this._username}/${this._blogId}/atom/entry`;
    let body = { entry: {
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
    if (updated != null) { body.entry.updated = {_: updated}; }
    if (categories != null) { body.entry.category = categories.map(c => ({$: { term: c }})); }
    if (draft != null ? draft : false) { body.entry['app:control'] = { 'app:draft': { _: 'yes' } }; }
    let statusCode = 201;
    return this._request({ method, path, body, statusCode }, callback);
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
  //   callback:
  //   - err: error
  //   - res: response
  // returns:
  //   Promise
  update({ id, title, content,type, updated, categories, draft }, callback) {
    if (id == null) { return this._reject('options.id is required', callback); }
    if (content == null) { return this._reject('options.content is required', callback); }
    let method = 'put';
    let path = `/${this._username}/${this._blogId}/atom/entry/${id}`;
    let body = { entry: {
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
    if (title) body.entry.title = {_: title};
    if (updated){ body.entry.updated = {_: updated}; }
    if (categories != null) { body.entry.category = categories.map(c => ({$: { term: c }})); }
    if (draft != null ? draft : false) { body.entry['app:control'] = { 'app:draft': { _: 'yes' } }; }
    let statusCode = 200;
    return this._request({ method, path, body, statusCode }, callback);
  }

  // DELETE MemberURI (/<username>/<blog_id>/atom/entry/<entry_id>)
  // params:
  //   options: (required)
  //   - id: entry id. (required)
  //   callback:
  //   - err: error
  //   - res: response
  // returns:
  //   Promise
  destroy({ id }, callback) {
    if (id == null) { return this._reject('options.id is required', callback); }
    let method = 'delete';
    let path = `/${this._username}/${this._blogId}/atom/entry/${id}`;
    let statusCode = 200;
    return this._request({ method, path, statusCode }, callback);
  }

  // GET MemberURI (/<username>/<blog_id>/atom/entry/<entry_id>)
  // params:
  //   options: (required)
  //   - id: entry id. (required)
  //   callback:
  //   - err: error
  //   - res: response
  // returns:
  //   Promise
  show({ id }, callback) {
    if (id == null) { return this._reject('options.id is required', callback); }
    let method = 'get';
    let path = `/${this._username}/${this._blogId}/atom/entry/${id}`;
    let statusCode = 200;
    return this._request({ method, path, statusCode }, callback);
  }

  // GET CollectionURI (/<username>/<blog_id>/atom/entry)
  // params:
  //   options:
  //   - page: page
  //   callback:
  //   - err: error
  //   - res: response
  // returns:
  //   Promise
  index(options, callback) {
    !callback && (callback = ()=>{}); 
    let method = 'get';
    let pathWithoutQuery = `/${this._username}/${this._blogId}/atom/entry`;
    let page = options != null ? options.page : undefined;
    let query = ((page != null) ? `?page=${page}` : '');
    let path = pathWithoutQuery + query;
    let statusCode = 200;
    return this._request({ method, path, statusCode }, callback);
  }

  _reject(message, callback) {
    let e;
    try {
      e = new Error(message);
      if (callback != null) { callback(e); }
      return Promise.reject(e);
    } catch (error) {
      return Promise.reject(e);
    }
  }

  _request({ method, path, body, statusCode }, callback) {
    callback = callback != null ? callback : (function() {});
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
      let token = wsse().getUsernameToken(this._username, this._apiKey, {nonceBase64: true});
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
      }).then(function(json) {
        callback && callback(null, json);
        return json;})
      .then(null, function(err) {
        callback && callback(err);
        throw err;
    });
  }

  _requestPromise(params) {
    return new Promise((function(resolve, reject) {
      return this._rawRequest(params, function(err, res) {
        if (err != null) {
          return reject(err);
        } else {
          return resolve(res);
        }
      });
    }.bind(this)));
  }

  _toJson(xml) {
    return new Promise(function(resolve, reject) {
      let parser = new xml2js.Parser({explicitArray: false, explicitCharkey: true});
      return parser.parseString(xml, function(err, result) {
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
