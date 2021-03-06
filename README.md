# meteor-blog
atmosphere package for meteor blog 

It allows you to create your own blog posts locally or to pull from Medium so you don't have to write twice. 

This is very early release, expect some bugs. However we are using it extensively in few our projects, so we fix it eagerly. 

## Howto
Create 2 routes:
```javascript
import('meteor/ipstas:meteor-blog');
FlowRouter.route('/blog', {
  name: 'Blog. ' + title,
	title: 'Blog. ' + title,
  action: function(params) {
		console.log('blog', this, params);
		
		BlazeLayout.render('layout', { nav: nav, main: 'blogIt', footer: 'footer' });
		SEO.set({
			title: 'Blog. ' + title,
		});
  },
});
FlowRouter.route('/blog/post/:postid', {
  name: 'Blog Post. ' + title,
	title: 'Blog Post. ' + title,
  action(params, queryParams) {
		console.log('blogpost', this, params, queryParams);
		window.prerenderReady = false;
		BlazeLayout.render('layout', { nav: navdsk, main: 'blogPost' });
		SEO.set({
			title: 'Blog Post. ' + title,
		});
		if (window.ll) ll('tagScreen', name);
  },
});
```
You need to be an admin (set in alanning:roles), blog accepts two variants:
```javascript
(Roles.userIsInRole(userId, ['admin', 'editor'], 'admGroup') || Roles.userIsInRole(userId, ['admin', 'editor']))
```

Go to *Aggregated* first, put something like "Smart Home" and click *Submit*. It should pull at least 4-10 articles from Medium. From here you can select *Ban* (and that author will never be pulled again) or just *Hide* and this particular article will be hidden. 
Next click on the article subject and decide if you want to publish. To publish toggle *publish* and now it is published under *Content*

To create your own blog post click on *New* and then you have pretty much the same editor as Medium offers. Don't forget to schedule the time of publishing. By default the article is going to be Draft and visible to editors only
