Package.describe({
  name: 'ipstas:meteor-blog',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.8.0.2');
  api.use('ecmascript');
  api.mainModule('client.js','client');//,{lazy: true});
  api.mainModule('server.js','server');//,{lazy: true});
	//api.mainModule('common.js',['client','server']);//,{lazy: true});
	
	Npm.depends({
		//'bootstrap-datepicker': '1.8.0',
		//'cloudinary': '1.13.2',
		//'medium-editor': '5.23.3',
		'jquery-ui-bundle': '1.12.1-migrate',
		//'medium-editor-insert-plugin': '2.5.1'
		//'eonasdan-bootstrap-datetimepicker': '4.17.47'
	});
	
	api.use([
		'ecmascript',
		'check',
		'mongo',
		'templating',
		'blaze',
		'underscore',
		'aldeed:autoform',
		//'aldeed:autoform-bs-datetimepicker',
		//'aldeed:autoform-bs-datepicker',
		'mediumeditor:mediumeditor'
	]);
	
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('ipstas-meteor-blog');
  api.mainModule('ipstas-meteor-blog-tests.js');
});
