"use strict"
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
  const entry = res.res.feed.entry;
  entry.forEach(entry=>{
      console.log(entry.title._);
    });
  if(res.nextPageID){
    ps = ps.then(client.getEntries.bind(client,res.nextPageID))
      .then(list);
  }
}

ps = ps.then(client.getEntries.bind(client))
.then(list);


