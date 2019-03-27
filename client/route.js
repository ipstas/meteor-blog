import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
SEO = new FlowRouterSEO();

import './blog.js';

// Set up all routes in the app
/* FlowRouter.route('/blog', {
  name: title,
  action: function(params, queryParams) {
		console.log('landing', landing);
		BlazeLayout.render('layout', { nav: navdsk, main: 'coming' });
		import('/imports/ui/pages/landing.js').then(function (api) {
			//api.magic();
			console.log('[routes] landing lazy', this, api);
			BlazeLayout.render('layoutLanding', { nav: nav, main: 'landing' });
			SEO.set({
				title: title,
			});
		})
  },
}); */