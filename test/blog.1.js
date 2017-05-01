import assert from 'power-assert';
import path from 'path';
import sinon from 'sinon';

import Blog from '../src/blog';

describe('blog', function() {
  beforeEach(function() {
    return this.sinon = sinon.sandbox.create();
  });

  afterEach(function() {
    return this.sinon.restore();
  });

  describe('constructor', function() {
    describe('use wsse', function() {
      describe('lowercase', function() {
        beforeEach(function() {
          return this.blog = new Blog({
            username: 'username',
            blogid: 'blog id',
            apikey: 'api key'
          });
        });

        return it('works', function() {
          assert(this.blog._type === 'wsse');
          assert(this.blog._username === 'username');
          assert(this.blog._apiKey === 'api key');
          return assert(this.blog._blogId === 'blog id');
        });
      });

      return describe('camelcase', function() {
        beforeEach(function() {
          return this.blog = new Blog({
            userName: 'username',
            apiKey: 'api key',
            blogId: 'blog id'
          });
        });

        return it('works', function() {
          assert(this.blog._type === 'wsse');
          assert(this.blog._username === 'username');
          assert(this.blog._apiKey === 'api key');
          return assert(this.blog._blogId === 'blog id');
        });
      });
    });

    return describe('use oauth', function() {
      describe('lowercase', function() {
        beforeEach(function() {
          return this.blog = new Blog({
            type: 'oauth',
            blogid: 'blog id',
            consumerkey: 'consumer key',
            consumersecret: 'consumer secret',
            accesstoken: 'access token',
            accesstokensecret: 'access token secret'
          });
        });

        return it('works', function() {
          assert(this.blog._type === 'oauth');
          assert(this.blog._blogId === 'blog id');
          assert(this.blog._consumerKey === 'consumer key');
          assert(this.blog._consumerSecret === 'consumer secret');
          assert(this.blog._accessToken === 'access token');
          return assert(this.blog._accessTokenSecret === 'access token secret');
        });
      });

      return describe('camelcase', function() {
        beforeEach(function() {
          return this.blog = new Blog({
            type: 'oauth',
            blogId: 'blog id',
            consumerKey: 'consumerKey',
            consumerSecret: 'consumerSecret',
            accessToken: 'accessToken',
            accessTokenSecret: 'accessTokenSecret'
          });
        });

        return it('works', function() {
          assert(this.blog._type === 'oauth');
          assert(this.blog._blogId === 'blog id');
          assert(this.blog._consumerKey === 'consumerKey');
          assert(this.blog._consumerSecret === 'consumerSecret');
          assert(this.blog._accessToken === 'accessToken');
          return assert(this.blog._accessTokenSecret === 'accessTokenSecret');
        });
      });
    });
  });

  describe('create', function() {
    beforeEach(function() {
      this.request = this.sinon.stub(Blog.prototype, '_request', () => null);
      return this.blog = new Blog({
        type: 'wsse',
        username: 'username',
        blogId: 'example.hatenablog.com',
        apikey: 'apikey'
      });
    });

    describe('default options', () =>
      it('works', function() {
        this.blog.create({}, () => null);
        let args = this.request.firstCall.args[0];
        assert(args.method === 'post');
        assert(args.path === '/username/example.hatenablog.com/atom/entry');
        assert(args.body.entry.title._ === '');
        assert(args.body.entry.content._ === '');
        assert(args.body.entry.updated === undefined);
        assert(args.body.entry.category === undefined);
        return assert(args.body.entry['app:control'] === undefined);
      })
    );

    return describe('all options', () =>
      it('works', function() {
        this.blog.create({
          title: 'TITLE',
          content: 'CONTENT',
          updated: '2014-08-31T12:34:56Z',
          categories: ['hatena', 'blog', 'api'],
          draft: true
        }
        , () => null);
        let args = this.request.firstCall.args[0];
        assert(args.method === 'post');
        assert(args.path === '/username/example.hatenablog.com/atom/entry');
        assert(args.body.entry.title._ === 'TITLE');
        assert(args.body.entry.content._ === 'CONTENT');
        assert(args.body.entry.updated._ === '2014-08-31T12:34:56Z');
        assert(args.body.entry.category[0].$.term === 'hatena');
        assert(args.body.entry.category[1].$.term === 'blog');
        assert(args.body.entry.category[2].$.term === 'api');
        return assert(args.body.entry['app:control']['app:draft']._ === 'yes');
      })
    );
  });

  describe('update', function() {
    beforeEach(function() {
      this.request = this.sinon.stub(Blog.prototype, '_request', () => null);
      return this.blog = new Blog({
        type: 'wsse',
        username: 'username',
        blogId: 'blog id',
        apiKey: 'api key'
      });
    });

    describe('no id options', () =>
      it('calls callback with error', function(done) {
        return this.blog.update({}, e => {
          assert(this.request.callCount === 0);
          assert(e instanceof Error);
          return done();
        });
      })
    );

    return describe('all options', () =>
      it('works', function() {
        this.blog.update({ id: 123, content: 'CONTENT', draft: true }, () => null);
        let args = this.request.firstCall.args[0];
        assert(args.method === 'put');
        assert(args.path === '/username/blog id/atom/entry/123');
        return assert(args.body.entry.content._ === 'CONTENT');
      })
    );
  });

  describe('destroy', function() {
    beforeEach(function() {
      this.request = this.sinon.stub(Blog.prototype, '_request', () => null);
      return this.blog = new Blog({
        type: 'wsse',
        username: 'username',
        blogId: 'blog id',
        apiKey: 'api key'
      });
    });

    describe('no id options', () =>
      it('calls callback with error', function(done) {
        return this.blog.destroy({}, e => {
          assert(this.request.callCount === 0);
          assert(e instanceof Error);
          return done();
        });
      })
    );

    return describe('all options', () =>
      it('works', function() {
        this.blog.destroy({ id: 123 }, () => null);
        let args = this.request.firstCall.args[0];
        assert(args.method === 'delete');
        return assert(args.path === '/username/blog id/atom/entry/123');
      })
    );
  });

  describe('show', function() {
    beforeEach(function() {
      this.request = this.sinon.stub(Blog.prototype, '_request', () => null);
      return this.blog = new Blog({
        type: 'wsse',
        username: 'username',
        blogId: 'blog id',
        apiKey: 'api key'
      });
    });

    describe('no id options', () =>
      it('calls callback with error', function(done) {
        return this.blog.show({}, e => {
          assert(this.request.callCount === 0);
          assert(e instanceof Error);
          return done();
        });
      })
    );

    return describe('all options', () =>
      it('works', function() {
        this.blog.show({ id: 123 }, () => null);
        let args = this.request.firstCall.args[0];
        assert(args.method === 'get');
        return assert(args.path === '/username/blog id/atom/entry/123');
      })
    );
  });

  describe('index', function() {
    beforeEach(function() {
      this.request = this.sinon.stub(Blog.prototype, '_request', () => null);
      return this.blog = new Blog({
        type: 'wsse',
        username: 'username',
        blogId: 'blog id',
        apiKey: 'api key'
      });
    });

    describe('no options', () =>
      it('works', function() {
        this.blog.index({}, () => null);
        let args = this.request.firstCall.args[0];
        assert(args.method === 'get');
        return assert(args.path === '/username/blog id/atom/entry');
      })
    );

    return describe('page options', () =>
      it('works', function() {
        this.blog.index({ page: 123 }, () => null);
        let args = this.request.firstCall.args[0];
        assert(args.method === 'get');
        return assert(args.path === '/username/blog id/atom/entry?page=123');
      })
    );
  });

  describe('_request', function() {
    describe('request succeed', function() {
      beforeEach(function() {
        return this.request = this.sinon.stub(Blog.prototype, '_requestPromise', () => ({then(onFulFilled) { return onFulFilled({body: '', statusCode: 200}); }}));
      });

      describe('wsse auth', function() {
        beforeEach(function() {
          return this.blog = new Blog({
            type: 'wsse',
            username: 'username',
            blogId: 'blog id',
            apiKey: 'api key'
          });
        });

        describe('callback style', () =>
          it('works', function(done) {
            return this.blog._request({
              method: 'METHOD',
              path: 'PATH',
              body: {
                feed: {
                  _: 'test'
                }
              },
              statusCode: 200
            }, (err, res) => {
              try {
                let { args } = this.request.firstCall;
                assert(args[0].method === 'METHOD');
                assert(args[0].url === 'https://blog.hatena.ne.jpPATH');
                assert(args[0].headers.Authorization != null);
                assert(args[0].headers['X-WSSE'] != null);
              } catch (e) {
                done(e);
              }
              return done(err);
            });
          })
        );

        return describe('promise style', function() {
          describe('normal case', () =>
            it('works', function(done) {
              return this.blog._request({
                method: 'METHOD',
                path: 'PATH',
                statusCode: 200
              })
                .then(() => {
                  let { args } = this.request.firstCall;
                  assert(args[0].method === 'METHOD');
                  assert(args[0].url === 'https://blog.hatena.ne.jpPATH');
                  assert(args[0].headers.Authorization != null);
                  return assert(args[0].headers['X-WSSE'] != null);
              }).then((() => done()), done);
            })
          );

          return describe('invalid status code', () =>
            it('works', function(done) {
              return this.blog._request({
                method: 'METHOD',
                path: 'PATH',
                statusCode: 201
              })
                .then(null, e => assert(e instanceof Error)).then((() => done()), done);
            })
          );
        });
      });

      return describe('oauth auth', function() {
        beforeEach(function() {
          return this.blog = new Blog({
            type: 'oauth',
            username: 'USERNAME',
            blogId: 'BLOG_ID',
            consumerKey: 'CONSUMER_KEY',
            consumerSecret: 'CONSUMER_SECRET',
            accessToken: 'ACCESS_TOKEN',
            accessTokenSecret: 'ACCESS_TOKEN_SECRET'
          });
        });

        describe('callback style', () =>
          it('works', function(done) {
            return this.blog._request({
              method: 'METHOD',
              path: 'PATH',
              statusCode: 200
            }, (err, res) => {
              let { args } = this.request.firstCall;
              assert(args[0].method === 'METHOD');
              assert(args[0].url === 'https://blog.hatena.ne.jpPATH');
              assert(args[0].oauth.consumer_key === 'CONSUMER_KEY');
              assert(args[0].oauth.consumer_secret === 'CONSUMER_SECRET');
              assert(args[0].oauth.token === 'ACCESS_TOKEN');
              assert(args[0].oauth.token_secret === 'ACCESS_TOKEN_SECRET');
              return done(err);
            });
          })
        );

        return describe('promise style', () =>
          it('works', function(done) {
            return this.blog._request({
              method: 'METHOD',
              path: 'PATH',
              statusCode: 200
            })
              .then(() => {
                let { args } = this.request.firstCall;
                assert(args[0].method === 'METHOD');
                assert(args[0].url === 'https://blog.hatena.ne.jpPATH');
                assert(args[0].oauth.consumer_key === 'CONSUMER_KEY');
                assert(args[0].oauth.consumer_secret === 'CONSUMER_SECRET');
                assert(args[0].oauth.token === 'ACCESS_TOKEN');
                return assert(args[0].oauth.token_secret === 'ACCESS_TOKEN_SECRET');
            }).then((() => done()), done);
          })
        );
      });
    });

    return describe('request failure', function() {
      beforeEach(function() {
        return this.request = this.sinon.stub(Blog.prototype, '_requestPromise', () => ({then(_, onError) { return onError(new Error()); }}));
      });

      describe('wsse auth', function() {
        beforeEach(function() {
          return this.blog = new Blog({
            type: 'wsse',
            username: 'username',
            apikey: 'apikey'
          });
        });

        describe('callback style', () =>
          it('works', function(done) {
            return this.blog._request({ method: 'METHOD', path: 'PATH' }, function(err) {
              assert(err instanceof Error);
              return done();
            });
          })
        );

        return describe('promise style', () =>
          it('works', function(done) {
            return this.blog._request({method: 'METHOD', path: 'PATH'})
              .then(null, e => assert(e instanceof Error)).then((() => done()), done);
          })
        );
      });

      return describe('oauth auth', function() {
        beforeEach(function() {
          return this.blog = new Blog({
            type: 'oauth',
            username: 'USERNAME',
            blogId: 'BLOG_ID',
            consumerKey: 'CONSUMER_KEY',
            consumerSecret: 'CONSUMER_SECRET',
            accessToken: 'ACCESS_TOKEN',
            accessTokenSecret: 'ACCESS_TOKEN_SECRET'
          });
        });

        describe('callback style', () =>
          it('works', function(done) {
            return this.blog._request({ method: 'METHOD', path: 'PATH' }, function(err) {
              assert(err instanceof Error);
              return done();
            });
          })
        );

        return describe('promise style', () =>
          it('works', function(done) {
            return this.blog._request({method: 'METHOD', path: 'PATH'})
              .then(null, e => assert(e instanceof Error)).then((() => done()), done);
          })
        );
      });
    });
  });

  describe('_requestPromise', function() {
    describe('request succeed', () =>
      it('works', function(done) {
        let params = { a: 'a', b: 1 };
        this.request = this.sinon.stub(Blog.prototype, '_rawRequest', (_, cb) => cb(null));
        let promise = Blog.prototype._requestPromise(params);
        return promise.then((() => done()), done);
      })
    );

    return describe('request failure', () =>
      it('works', function(done) {
        let params = { a: 'a', b: 1 };
        this.request = this.sinon.stub(Blog.prototype, '_rawRequest', (_, cb) => cb(new Error()));
        let promise = Blog.prototype._requestPromise(params);
        return promise
          .then(null, e => assert(e instanceof Error)).then((() => done()), done);
      })
    );
  });

  return describe('_toJson / _toXml', function() {
    describe('invalid elements', function() {
      describe('_toJson', () =>
        it('works', done =>
          Blog.prototype._toJson('<>')
            .then(null, e => assert(e instanceof Error)).then((() => done()), done)
        )
      );

      return describe('_toXml', () =>
        it('works', done =>
          Blog.prototype._toXml(1)
            .then(null, e => assert(e instanceof Error)).then((() => done()), done)
        )
      );
    });

    describe('single elements', function() {
      beforeEach(function() {
        this.xml = `\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<entry xmlns="http://purl.org/atom/ns#">
  <title>&lt;TITLE</title>
  <content mode="base64" type="&quot;TYPE">&lt;ENCODED</content>
</entry>\
`;
        return this.json = {
          entry: {
            $: {
              xmlns: 'http://purl.org/atom/ns#'
            },
            title: {
              _: '<TITLE'
            },
            content: {
              $: {
                mode: 'base64',
                type: '"TYPE'
              },
              _: '<ENCODED'
            }
          }
        };
      });

      describe('_toJson', () =>
        it('works', function(done) {
          return Blog.prototype._toJson(this.xml)
            .then(json => {
              return assert.deepEqual(json, this.json);
          }).then((() => done()), done);
        })
      );

      return describe('_toXml', () =>
        it('works', function(done) {
          return Blog.prototype._toXml(this.json)
            .then(xml => {
              return assert(xml === this.xml);
          }).then((() => done()), done);
        })
      );
    });

    return describe('multiple elements', function() {
      beforeEach(function() {
        this.xml = `\
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<entry xmlns="http://purl.org/atom/ns#">
  <title attr="ATTR1">&lt;TITLE1</title>
  <title attr="ATTR2">&lt;TITLE2</title>
</entry>\
`;
        return this.json = {
          entry: {
            $: {
              xmlns: 'http://purl.org/atom/ns#'
            },
            title:
              [{
                $: {
                  attr: 'ATTR1'
                },
                _: '<TITLE1'
              }
              , {
                $: {
                  attr: 'ATTR2'
                },
                _: '<TITLE2'
              }
              ]
          }
        };});

      describe('_toJson', () =>
        it('works', function(done) {
          return Blog.prototype._toJson(this.xml)
            .then(json => {
              return assert.deepEqual(json, this.json);
          }).then((() => done()), done);
        })
      );

      return describe('_toXml', () =>
        it('works', function(done) {
          return Blog.prototype._toXml(this.json)
            .then(xml => {
              return assert(xml === this.xml);
          }).then((() => done()), done);
        })
      );
    });
  });
});
