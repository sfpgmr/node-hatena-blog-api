const Blog = require('hatena-blog-api2').Blog;

const client = new Blog({
  type: 'wsse',
  userName: process.env.HATENA_USERNAME, // 'username'
  blogId: process.env.HATENA_BLOG_ID,    // 'blog id'
  apiKey: process.env.HATENA_APIKEY      // 'apikey'
});

//process.on('unhandledRejection', console.dir);

// POST CollectionURI (/<username>/<blog_id>/atom/entry)
client.getEntry('10328749687243373274')
.then(
  // resolve
  res=>{
    console.log('#getEntryの結果\n',JSON.stringify(res,null,1));
  }
)
.catch(console.error);


