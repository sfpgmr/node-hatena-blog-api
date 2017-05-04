const Blog = require('../lib/').Blog; // require('hatena-blog-api')

var client = new Blog({
  type: 'wsse',
  userName: process.env.HATENA_USERNAME,
  blogId: process.env.HATENA_BLOG_ID,
  apiKey: process.env.HATENA_APIKEY
});

// テスト1
client.postEntry({
  title: 'テストエントリ１（オプションを設定）',
  content: '# テスト\r\nこれはテストエントリです。',
  updated: '2014-08-31T12:34:56+09:00',
  categories: ['hatena','blog'],
  draft: true
})
.then(res=>{
  console.log('posted.\n',JSON.stringify(res,null,1));
},
console.error.bind(console))
// テスト2
.then(()=>
client.postEntry({
  title: 'テストエントリ２（オプションを設定）',
  content: '# テスト\r\nこれはテストエントリ２です。',
  updated: new Date(),
  categories: 'hatena',
  draft: true
}))
.then(res=>{
  console.log('posted.\n',JSON.stringify(res,null,1));
},
console.error.bind(console))
// テスト3 エラーを発生
.then(()=>
client.postEntry({
  title: 'テストエントリ３（オプションを設定）',
  content: '# テスト\r\nこれはテストエントリ３です。',
  updated: '2012/09/30',
  categories: 1,
  draft: true
}))
.then(res=>{
  console.log('posted.\n',JSON.stringify(res,null,1));
},
console.error.bind(console));
