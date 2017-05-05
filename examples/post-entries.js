// 20個のエントリを作成する
const Blog = require('hatena-blog-api2').Blog;

const client = new Blog({
  type: 'wsse',
  userName: process.env.HATENA_USERNAME, // 'username'
  blogId: process.env.HATENA_BLOG_ID,    // 'blog id'
  apiKey: process.env.HATENA_APIKEY      // 'apikey'
});

let ps = Promise.resolve();

function wait(ms = 500){
  return new Promise((resolve,reject)=>{
    setTimeout(resolve,ms);
  });
}

for (let i = 1; i < 32; ++i) {

  ps = ps.then(() => {
    return client.postEntry({
      title: 'テストエントリ' + ('0'+i).slice(-2) ,
      updated: new Date(2010, 1, i, 10, 10),
      content: '# テストエントリ\r\nこれはテストです。\r\n\r\n',
      categories: ['blog', 'hatena']
    });
  }).then((res)=>{
    console.log(`###### Test Entry ${i}: ID:${client.getEntryID(res.entry)}  ######\n`,JSON.stringify(res.entry.link,null,1));
    // 500ms位のウェイトを入れないとリスト表示で異常が発生する（リストが歯抜けになる）
    return wait(1000);
  });

}

ps.catch(console.error);


