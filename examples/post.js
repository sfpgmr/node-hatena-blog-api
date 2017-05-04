const Blog = require('../lib/').Blog; // require('hatena-blog-api')

const client = new Blog({
  type: 'wsse',
  userName: process.env.HATENA_USERNAME, // 'username'
  blogId: process.env.HATENA_BLOG_ID,    // 'blog id'
  apiKey: process.env.HATENA_APIKEY      // 'apikey'
});

// POST CollectionURI (/<username>/<blog_id>/atom/entry)
client.postEntry({
  title: 'bouzuya\'s entry',
  updated:new Date(2010,1,1,10,10),
  content: '# fun is justice!\r\nこれはテストです。\r\n\r\n',
})
.then((res)=>{
  console.log('posted\n',JSON.stringify(res,null,1));
},console.error.bind(console));


