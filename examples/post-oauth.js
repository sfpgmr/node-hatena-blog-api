const Blog = require('../lib/').Blog;

const client = new Blog({
  type: 'oauth',
  userName: process.env.HATENA_USERNAME,
  blogId: process.env.HATENA_BLOG_ID,
  consumerKey: process.env.HATENA_CONSUMER_KEY,
  consumerSecret: process.env.HATENA_CONSUMER_SECRET,
  accessToken: process.env.HATENA_ACCESS_TOKEN,
  accessTokenSecret: process.env.HATENA_ACCESS_TOKEN_SECRET
});

client.postEntry({
  title: 'bouzuya\'s entry',
  content: 'fun is justice!'
})
.then((res)=>{
  console.log('posted.\n',JSON.stringify(res,null,1));
},console.error.bind(console));

