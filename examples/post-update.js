const Blog = require('hatena-blog-api2').Blog;

const client = new Blog({
  type: 'wsse',
  userName: process.env.HATENA_USERNAME, // 'username'
  blogId: process.env.HATENA_BLOG_ID,    // 'blog id'
  apiKey: process.env.HATENA_APIKEY      // 'apikey'
});

function wait(ms = 500){
  return new Promise((resolve,reject)=>{
    setTimeout(resolve,ms);
  });
}

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
    const entryId = client.getEntryID(res.entry);
    console.log(entryId);
    // ポストしたデータの更新
    return wait(1000).then(client.updateEntry.bind(client,{
      id:entryId,
      title:res.entry.title._,
      content:'修正',
      updated:res.entry.updated._
    }));
  }
)
.then(
  // resolve
  res=>{
    console.log('#updateEntryの結果\n',JSON.stringify(res,null,1));
  }
)
.catch(console.error);


