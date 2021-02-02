import '../common/collections.js';
import {MeteorBlogCollections} from '../common/collections.js';
import {MeteorBlogSchemas} from '../common/collections.js';


Meteor.publish('blogeditors', function(params) {	
	var params = params || {};
	params.limit = params.limit || 100;
/* 	if (!Roles.userIsInRole(this.userId, ['admin'], 'admGroup'))
		return []; */
	
	const list = {$or: [{roles: 'admin'}, {roles:'editor'}]};

	var data = Meteor.users.find(list, {sort: {createdAt: -1}, limit: params.limit, fields: {services: 0}});
	//var data = Meteor.users.find(list);
	if (params.debug) console.log('[publush] blogeditors', this.userId, list, data.count(),'\n');
	return data;
});
Meteor.publish('blogsettings', function(params) {	
	var data = MeteorBlogCollections.BlogSettings.find();
	if (params.debug) console.log('[publush] blogsettings', this.userId, data.count(),'\n');
	return data;
});
Meteor.publish('blogpush', function(params) {
	//Push.remove({token:[]},{multi:1});
	var params = params || {};
	params.limit = params.limit || 16;
	
	var list = {userId: this.userId};
	var records, userId, user;
	// if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup'))
		// list = {personal: true};
	
	// data = Settings.find(list, {sort: {createdAt: -1}, limit: params.limit});
	// if (!data.count())
	

	
	records = MeteorBlogCollections.Blog.find({username: {$exists: false}}).fetch();
	_.each(records, (record)=>{
		try{
			userId = record.userId;
			user = Meteor.users.findOne(record.userId);
			if (user)
				MeteorBlogCollections.Blog.update(record._id, {$set: {username: user.username}});
			else
				MeteorBlogCollections.Blog.update(record._id, {$set: {username: 'anonymous'}});
		} catch(e){
			console.warn('[meteor blog] err:', e, '\nrecord:', record, '\nuser:', userId, user, '\n');
		}
	});
	var userId = this.userId || params.userId;
	if (!Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) 
		params.all = false;
	
	if (params.all)
		list = {};
	else
		list = {userId: params.userId};
	
	var data = MeteorBlogCollections.Blog.find(list, {sort: {createdAt: -1}, limit: params.limit});
	if (data.count())
		console.log('publush blog', this.userId, data.fetch()[0].username, list, data.count(),'\n');
	return data;		


});
Meteor.publish('blog', function(params) {
	var params = params || {};
	params.limit = params.limit || 16;
	params.languages = params.languages || ['en'];
	params.languages.push('en', '');
	
	var list = {};
	var options = {sort: {scheduledAt: -1}, limit: params.limit};
	if (params.blog) {
		list = {draft: false, scheduledAt: {$lt: new Date}, $or: [{detectedLanguage: {$in: params.languages}}, {detectedLanguage:{ $exists : false }}]};
		if (params.tag)
			list.tags = params.tag;
	} else if (params.aggregated) {
		list = {aggregated: true, draft: true, blacklist: false};
	} else if (params._id)
		list = params._id;	
	else if (params.postid)
		list = {postid: params.postid};
	else if (params.all && Roles.userIsInRole(this.userId, ['admin'], 'admGroup'))
		list = {};	
	else if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup'))
		list = {};
	else 
		list = {userId: this.userId};

	
	var data = MeteorBlogCollections.Blog.find(list, options);
	if (params.debug) 
		console.log('[publish] blog', params, this.userId, '\nlist:', list, data.count(), '\n');

	return data;
});
Meteor.publish('blogusers', function(params) {	
	var params = params || {};
	params.limit = params.limit || 16;
	
	var list = {};	
	if (params._id)
		list = {_id: params._id};
	else if (params.creatorId)
		list = {creatorId: params.creatorId};

	var data = MeteorBlogCollections.BlogUsers.find(list, {sort: {createdAt: -1}, limit: params.limit});
	if (params.debug) console.log('[publush] blogusers', this.userId, list, data.count(),'\n');
	return data;
});

Meteor.publish('blogimages', function(params) {	
	var params = params || {};
	params.limit = params.limit || 16;
	
	var list = {};	
	if (params._id)
		list = {_id: params._id};
	else if (params.posts)
		list = {posts: {$in: params.posts}};
	else
		list = {userId: this.userId};

	var data = MeteorBlogCollections.BlogImages.find(list, {sort: {createdAt: -1}, limit: params.limit});
	if (params.debug) console.log('[publush] pushimages', this.userId, list, data.count(),'\n');
	return data;
});
Meteor.publish('blogservice', function(params) {
	var params = params || {};
	params.limit = params.limit || 16;
	var list = {userId: this.userId};
		
/* 	var pushs = MeteorBlogCollections.Blog.find({username: {$exists: false}}).fetch();
	_.each(pushs, (push)=>{
		var userId = push.userId;
		var user = Meteor.users.findOne(push.userId);
		if (user)
			MeteorBlogCollections.Blog.update(push._id, {$set: {username: user.username}});		
		else
			MeteorBlogCollections.Blog.update(push._id, {$set: {username: 'anonymous'}});
	}); */
	var userId = this.userId || params.userId;
	if (!Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) 
		params.all = false;
	
	if (params.all)
		list = {};
	else
		list = {userId: params.userId};
	
	var data = MeteorBlogCollections.BlogServices.find(list, {sort: {createdAt: -1}, limit: params.limit});
	console.log('publush push', this.userId, list, data.count(),'\n');
	return data;
});
