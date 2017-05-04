const Blog = require('hatena-blog-api2').Blog;

const client = new Blog({
  type: 'wsse',
  userName: process.env.HATENA_USERNAME, // 'username'
  blogId: process.env.HATENA_BLOG_ID,    // 'blog id'
  apiKey: process.env.HATENA_APIKEY      // 'apikey'
});
  
//process.on('unhandledRejection', console.dir);

// POST CollectionURI (/<username>/<blog_id>/atom/entry)
console.log('#01 通常のポスト')
client.postEntry({
  title: 'テストエントリ',
  updated:new Date(2010,1,1,10,10),
  content: '# テストエントリ\r\nこれはテストです。\r\n\r\n',
  categories:['blog','hatena']

})
.then(
  // resolve
  (res)=>{
    console.log('posted\n',JSON.stringify(res,null,1));
  },
  console.error
)
// エラーが発生するかどうかのテスト1
.then(()=>{
  console.log('#02 updatedに日付でない文字列が入っている。');
  return client.postEntry({
  title: 'テストエントリ',
  updated:'日付でない文字列',
  content: '# テストエントリ\r\nこれはテストです。\r\n\r\n'
})})
.then(
  // resolve
  (res)=>{
    console.log('posted\n',JSON.stringify(res,null,1));
  },
  // reject
  console.error
)
// エラーが発生するかどうかのテスト2
.then(()=>{
  console.log('#03 categoriesに文字列以外の値を含む');
  return client.postEntry({
  title: 'テストエントリ',
  content: '# テストエントリ\r\nこれはテストです。\r\n\r\n',
  categories:[1,'data']// 文字列以外の値を含む
})})
.then(
  // resolve
  (res)=>{
    console.log('posted\n',JSON.stringify(res,null,1));
  },
  // reject
  console.error
)
// エラーが発生するかどうかのテスト4
.then(()=>{
  console.log('#04 draftにブール値以外の値を含む');
  return client.postEntry({
  title: 'テストエントリ',
  content: '# テストエントリ\r\nこれはテストです。\r\n\r\n',
  draft:2
})})
.then(
  // resolve
  (res)=>{
    console.log('posted\n',JSON.stringify(res,null,1));
  },
  // reject
  console.error
)


