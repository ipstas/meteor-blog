import '../common/collections.js';
import {MeteorBlogCollections} from '../common/collections.js';
import {MeteorBlogSchemas} from '../common/collections.js';

Meteor.publish('push', function(params) {
	//Push.remove({token:[]},{multi:1});
	var params = params || {};
	params.limit = params.limit || 16;
	
	var list = {userId: this.userId};
	// if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup'))
		// list = {personal: true};
	
	// data = Settings.find(list, {sort: {createdAt: -1}, limit: params.limit});
	// if (!data.count())
		
	var records = MeteorBlogCollections.Blog.find({username: {$exists: false}}).fetch();
	_.each(records, (record)=>{
		var userId = record.userId;
		var user = Meteor.users.findOne(record.userId);
		if (user)
			MeteorBlogCollections.Blog.update(record._id, {$set: {username: user.username}});
		else
			MeteorBlogCollections.Blog.update(record._id, {$set: {username: 'anonymous'}});
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
	
	var list = {};
	var options = {sort: {createdAt: -1}, limit: params.limit};
	if (params.blog)
		list = {draft: false, scheduledAt: {$lt: new Date()}};
	else if (params._id)
		list = params._id;	
	else if (params.postid)
		list = {postid: params.postid};
	else if (params.blog){
		list = {draft: {$ne: true}};	
		if (params.tag)
			list.tags = params.tag;
	}	else if (params.all && Roles.userIsInRole(this.userId, ['admin'], 'admGroup'))
		list = {};	
	else if (params.aggregated) {
		list = {aggregated: true, blacklist: false};
		options = {sort: {'posted.date': -1}, limit: params.limit};
	} else if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup'))
		list = {};
	else
		list = {userId: this.userId};
	
	var data = MeteorBlogCollections.Blog.find(list, options);
	if (params.debug) 
		console.log('publush pushit', params, this.userId, list, data.count(), '\n');

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
	else if (params.pushit)
		list = {pushit: params.pushit};
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
