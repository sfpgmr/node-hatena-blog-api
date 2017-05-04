// all (postEntry -> getEntries -> update -> show -> destroy)

const Blog = require('../lib/').Blog; // require('hatena-blog-api')

var client = new Blog({
  type: 'wsse',
  userName: process.env.HATENA_USERNAME,
  blogId: process.env.HATENA_BLOG_ID,
  apiKey: process.env.HATENA_APIKEY
});

var entryId = null;

// POST CollectionURI (/<username>/<blog_id>/atom/entry)
client.postEntry({
  title: 'bouzuya\'s entry',
  content: 'fun is justice!',
  type:'text/plain',
  updated: new Date(2010,1,3,10,10),
  draft: true
}).then(res=>{
  console.log(res);
  // assertion
  console.log(
    'test 1 ' + (res.entry.title._ === 'bouzuya\'s entry' ? 'OK' : 'NG')
  );

  // get image id for `show()`, `update()` and `destroy()`.
  entryId = res.entry.id._.match(/^tag:[^:]+:[^-]+-[^-]+-\d+-(\d+)$/)[1];
  console.log(entryId);

  // GET CollectionURI (/<username>/<blog_id>/atom/entry)
  return client.getEntries();
})
.then(res=>{
  console.log(res);

  // PUT MemberURI (/<username>/<blog_id>/atom/entry/<entry_id>)
  return client.updateEntry({
    id: entryId,
    title: 'special bouzuya\'s entry',
    type:'text/plain',
    content: 'fun is justice!!',
    draft: true
  });
})
.then(()=>{
  console.log('updated');

  // GET MemberURI (/<username>/<blog_id>/atom/entry/<entry_id>)
  return client.getEntry({ id: entryId });
})
.then(res=>{
  console.log(res);

  // assertion
  console.log(
    'test 2 ' + (res.entry.title._ === 'special bouzuya\'s entry' ? 'OK' : 'NG')
  );

  // DELETE MemberURI (/<username>/<blog_id>/atom/entry/<entry_id>)
  return client.deleteEntry({ id: entryId });
})
.then(()=> {
  console.log('deleted');
});

