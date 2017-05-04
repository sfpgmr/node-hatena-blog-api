// 20個のエントリを作成する
const Blog = require('hatena-blog-api2').Blog;

const client = new Blog({
  type: 'wsse',
  userName: process.env.HATENA_USERNAME, // 'username'
  blogId: process.env.HATENA_BLOG_ID,    // 'blog id'
  apiKey: process.env.HATENA_APIKEY      // 'apikey'
});

let ps = Promise.resolve();

for (let i = 0; i < 11; ++i) {

  ps = ps.then(() => {
    return client.postEntry({
      title: 'テストエントリ' + ('0'+i).slice(-2) ,
      updated: new Date(2010, 1, 1, 10, 10),
      content: '# テストエントリ\r\nこれはテストです。\r\n\r\n',
      categories: ['blog', 'hatena']
    });
  })

}

ps.catch(console.error);


