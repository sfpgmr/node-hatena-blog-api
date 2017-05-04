const Blog = require('../lib/').Blog; // require('hatena-blog-api')

var client = new Blog({
  type: 'wsse',
  userName: process.env.HATENA_USERNAME,
  blogId: process.env.HATENA_BLOG_ID,
  apiKey: process.env.HATENA_APIKEY
});

client.postEntry({
  title: 'bouzuya\'s entry',
  content: 'fun is justice!',
  updated: '2014-08-31T12:34:56+09:00',
  categories: ['hatena'],
  draft: true
})
.then((res)=>{
  console.log('posted.\n',JSON.stringify(res,null,1));
},
console.error.bind(console));
