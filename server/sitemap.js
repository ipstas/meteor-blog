import { sitemaps } from 'meteor/gadicohen:sitemaps';
import {MeteorBlogCollections} from '../common/collections.js';

sitemaps.add('/sitemapBlog.xml', function() {
	let posts = MeteorBlogCollections.Blog.find({draft:{$ne: true}},{sort: {createdAt: -1}});
	console.log('[sitemapBlog] started', new Date());
	let pages = [];
	for (let post of posts){
		let img;
		if (post.image && post.image.length)
			img = post.image[0];
		else
			img = 'https://res.cloudinary.com/orangry/image/upload/c_thumb,w_600,g_face/v1553633438/hundredgraphs/news.jpg';
		
		let page = {page: '/blog/' + post.postid, lastmod: new Date(), changefreq: 'daily', images: [{loc: img}]};
		pages.push(page);
		console.log('[sitemapBlog.xml] page push:', post.title, 'pict:', img);
	}	
	console.log('[sitemapBlog.xml] pages:', pages.length);
  return pages;
});