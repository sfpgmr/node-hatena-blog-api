// エントリのコレクションをすべて取り出すサンプル
const Blog = require('hatena-blog-api2').Blog;

const client = new Blog({
  type: 'wsse',
  userName: process.env.HATENA_USERNAME, // 'username'
  blogId: process.env.HATENA_BLOG_ID,    // 'blog id'
  apiKey: process.env.HATENA_APIKEY      // 'apikey'
});

let ps = Promise.resolve();

function list(res){
  console.log(res.nextPageID,res.res.feed.link);
  const entry = res.res.feed.entry;
  if(entry){
    if(entry.forEach){
      entry.forEach(entry=>{
          console.log(entry.title._);
        });
    } else {
      console.log(entry.title._);
    }
  } else {
    console.log(res.res.feed);
  } 
  if(res.nextPageID){
    ps = ps.then(client.getEntries.bind(client,res.nextPageID))
      .then(list);
  }
}

ps = ps.then(client.getEntries.bind(client))
.then(list);
// client.getEntries('1493937391')
// .then(res=>{
//   console.log(res.nextPageID,res.res.feed.link,res);
//   res.res.feed.entry && res.res.feed.entry.forEach(entry=>{
//     console.log(entry.title);
//   });
// });


