import {MeteorBlogCollections} from '../common/collections.js';
import {MeteorBlogSchemas} from '../common/collections.js';
import { Random } from 'meteor/random';

Meteor.methods({
	'blog.schedule'(params){
		if (new Date(params.scheduledAt) - new Date() < 0)
			throw new Meteor.Error(400, 'scheduled date can not be in the past');
		var _id = params._id;
		delete params._id;
		params.postid = params.title.replace(/ /g,'_') + '_' + Random.id(3);
		params.postid = params.postid.toLowerCase().replace(/[^a-zA-Z0-9_\-]+/g, "");
		console.log('pushit updated', params);
		MeteorBlogCollections.Blog.update(_id,{$set:params});
		var data = MeteorBlogCollections.Blog.findOne(params._id);
		console.log('pushit.schedule ini',params, 'time to start', (new Date(params.scheduledAt) - new Date())/1000, 'sec' );
		var msg = {
			title: params.title + ' posted',
			//click_action: domain,
		};
		
		try {
			if (params.scheduledAt) 
				new CronJob(new Date(params.scheduledAt), 
					async function() {
						// await Meteor.call('pushit.post',function(err,res){
							// console.log('pushit.post cron done', err, res);
						// });
						//await Meteor.call('push.msg',{username: 'stanp', msg:msg});
						await Meteor.call('pushit.medium.post', data);
						await Meteor.call('pushit.facebook.page', data);
						await Meteor.call('pushit.telegram.channel', data);
						await Meteor.call('pushit.twitter.post', data);
						console.log('pushit.schedule RUNNNING');
					},
					true, /* Start the job right now */
					'America/Chicago'
				);
		} catch (e){
			console.error('pushit.schedule cron invalid', e);
		}
	},
	'blog.settings.facebook'(params){
		
		var updated;
		console.log('\n\npushit.settings.facebook 1:', params.account, params, this.userId,  '\n\n');
		var accounts = Meteor.users.findOne({'services.facebook.accounts.id': params.account});
		console.log('\n\npushit.settings.facebook 1.5:', accounts,  '\n\n');
		var account = _.findWhere(accounts.services.facebook.accounts, {id: params.account});
		console.log('\n\npushit.settings.facebook 2:', params.account, params, this.userId, account, '\n\n');
		//updated = Meteor.users.update(this.userId,{$set:{userId: this.userId, 'services.facebook.privacy': params.privacy, 'services.facebook.account': account.name, 'services.facebook.accountId': params.account}});
		updated = PushUser.upsert(this.userId,{$set:{userId: this.userId, 'services.facebook.privacy': params.privacy, 'services.facebook.account': account.name, 'services.facebook.accountId': params.account}});
		console.log('updated user.privacy', updated);
		return {updated: updated};
	},	
	'blog.facebook.page'(params){
		params.service = 'facebook';
		var user, token, fbphoto, fbout;
		var userId = params.userId || this.userId;
		var pushuser = PushUser.findOne({userId: userId, 'services.facebook.accountId': {$exists: true}});
		var page_id = pushuser.services.facebook.accountId || '317268918690242';
		if (params.debug) console.log('\n\n**************************\npushit.facebook.page', params, '\n\n');
		user = Meteor.users.findOne(userId);
		
		if (!user || !user.services || !user.services.facebook){
			console.warn('pushit.facebook.page, but no facebook service', user);
			throw new Meteor.Error(400, 'pushit.facebook.page, but no facebook service');
		}
		
		FB.setAccessToken(user.services.facebook.accessToken);

		async function getaccounts(){
			try {
				var fbres = await FB.api(
					"/me/accounts",
					"GET",
				);
			} catch (e) {
				console.warn('pushit.facebook.page accounts error', e.response.error, e);
				throw new Meteor.Error(400, 'pushit.facebook.page accounts err', e.response.error);
				return e;
			}
			token = _.findWhere(fbres.data,{id: page_id}).access_token;
			await FB.setAccessToken(token);
			await console.log('pushit.facebook.page accounts inside:', token);
			
			if (params.image && params.image.length) {
				params.image = PushImages.findOne(params.image[0]).url;
				fbres = addphoto();
			} else
				fbres = main();
			
			await console.log('pushit.facebook.page main outside:', fbres);
			await MeteorBlogCollections.Blog.update(params._id,{$addToSet: {posted: {service: params.service, id: fbres.post_id, url: 'https://facebook.com/' + fbres.post_id, img_id: fbres.id, date:new Date()}}});
			return await fbres;
		}		
		
		async function addphoto(){
			try {
				var fbres = await FB.api(
					"/" + page_id + "/photos",
					"POST",
					{
						"url": params.image,
						"caption": params.text,
						"link": params.url,
						"privacy": {"value": 'EVERYONE'},
						"no_story": params.draft
					},
				);
			} catch (e) {
				console.error('pushit.facebook.page photo error', e);
				throw new Meteor.Error(400, 'pushit.facebook.page photo err', e);
				return e;
			}
			await console.log('pushit.facebook.page fbres photo inside:', params._id, fbres);
			//await Tours.update(params._id,{$addToSet: {social: {type: 'fb', id: fbres.id, userId: user._id, username: user.username, date:new Date()}}});
			return await fbres;
		}		
		
		async function main(){
			try {
				var fbres = await FB.api(
					"/" + page_id + "/feed",
					"POST",
					{
						"message": params.text,
						"link": params.url,
						"tags": params.tags,
						"published": params.published
					},
				);
			} catch (e) {
				console.warn('pushit.facebook.page page error', e.response.error, e);
				throw new Meteor.Error(400, 'pushit.facebook.page page err', e.response.error);
				return e;
			}
			await console.log('pushit.facebook.page fbres page inside:', params._id, fbres);
			//await Tours.update(params._id,{$addToSet: {social: {type: 'fb', id: fbres.id, userId: user._id, username: user.username, date:new Date()}}});
			return await fbres;
		}
		//
		fbout = getaccounts();
		if (params.debug) console.log('pushit.facebook.page fbout:', fbout);
		return fbout;

	},	
	'blog.telegram.channel'(params){
		console.log('\n\n\nsocial.telegram.channel params:', params);
/* 		params = params || {};
		const token = Meteor.settings.private.telegram.token;
		const bot = new TelegramBot(token, {polling: false});

		var channel_id = '@virgo360';
		var images = [];
		if (params.image)
			for (let image of params.image) { 
				image = PushImages.findOne(image).url;
				images.push(image + ' ');
			}
		params.service = 'telegram';
		params.text = '<b>' + params.title + '</b>\n' + params.text + ' \n' + images
		console.log('\n\n\npushit.telegram.channel sending', channel_id, 'text:', params.text, '\n images:', images );
		
		async function main(){
			var res = await bot.sendMessage(channel_id, params.text, {parse_mode: "HTML"});
			res.updated = await MeteorBlogCollections.Blog.update(params._id,{$addToSet: {posted: {service: params.service, id: res.message_id, date:new Date(), url: 'https://t.me/' + res.chat.username}}});
			await console.log('\n\n\nteleres inside', params, res);
			return res;
		}
		var teleres = main();
		console.log('teleres out', teleres);
		return teleres; */
	},
	'blog.twitter.post'(params){
		params = params || {};
		var media = {};
		var Twit = new Twitter({
			consumer_key: Meteor.settings.private.oAuth.twitter.consumerKey,
			consumer_secret: Meteor.settings.private.oAuth.twitter.secret,
			access_token_key: Meteor.settings.private.oAuth.twitter.token,
			access_token_secret: Meteor.settings.private.oAuth.twitter.token_secret
		});

		if (params.image && params.image.length) 
			params.image = PushImages.findOne(params.image[0]).url;
				
		params.service = 'twitter';
		//console.log('pushit.twitter.post ini', params, params.text);
		//console.log('pushit.twitter.post params.text', params.text.length);
		if (params.text.length > 110)
			params.text = params.text.slice(0,110) + ' ...more';
		params.text = params.text + ' ' + domain;
		console.log('pushit.twitter.post params.text', params.text.length, params.text);
		//return;
	
		async function main(){
			// if (params.image)
				// media = await upload();
			try {
				var res = await Twit.post('statuses/update', 
					{
						status: params.text,
						// media_ids: media.media_id_string
					}
				);
			await console.log('pushit.twitter.post res inside:', params.text, '\n', res, '\n\n');
			res.updated = await MeteorBlogCollections.Blog.update(params._id,{$addToSet: {
				posted: {service: params.service, id: res.id_str, url: 'https://twitter.com/' + res.user.name + '/' + res.id_str, date:new Date()}
			}});
			return res;
			} catch (e) {
				console.warn('pushit.twitter.post main error', e.response, e);
				throw new Meteor.Error(400, 'pushit.twitter.post main err', e.response);
				return e;
			}
		}		
		
		async function upload(){
			try {
				var fbres = await Twit.post('media/upload', 
					{media: params.image}
				);
			} catch (e) {
				console.warn('pushit.twitter.post media error', e, params.image);
				throw new Meteor.Error(400, 'pushit.twitter.post err', e);
				return e;
			}
			await console.log('pushit.twitter.post media fbres inside:', params._id, fbres);		
			return fbres;
		}
		
		var pushitres = main();
		//if (params.debug) console.log('social.twitter.post async:', fbres);
		return pushitres;
	},	
	'blog.medium.post'(params){
		//this.unblock();
		var response, user, headers, postdata, pushitres ={}, updated, service = 'medium';
		params = params || {};
		user = Meteor.users.findOne(params.userId);
		if (!user) 
			return console.warn('pushit.medium.post non existing user', params);
		if (params.draft)
			params.draft = 'draft'; 
		headers = {
			"Authorization": 'Bearer ' + user.services.medium.accessToken,
			"Content-Type": 'application/json',
			"Accept": 'application/json',
			"Accept-Charset": 'utf-8'	
		};
		var images = [];
		if (params.image)
			for (let image of params.image) { 
				image = PushImages.findOne(image).url;
				images.push('<p><img src="' + image + '"/></p>');
			}
		postdata = {
			"title": params.title,
			"contentFormat": "html",
			"content": params.html + ' ' + images,
			"tags": params.tags,
			"publishStatus": params.draft
		};	
		url = "https://api.medium.com/v1/users/" + user.services.medium.id + "/posts";
		try {
			async function  main(){
				var postres = await HTTP.post( url,{ headers: headers, data: postdata });				
				let push_update = await postres.data.data;
				push_update.service = service;
				push_update.date = new Date();				
				push_update.updated = await MeteorBlogCollections.Blog.update(params._id,{$addToSet: {posted: push_update}});
				await console.log('pushit.medium.post callback2:', params._id, '\n', push_update, '\n', '\n\n');			
				return push_update;
			}
			
			pushitres = main();
			//console.log('pushit.medium.post inside:', pushitres);
			
		} catch (err) {
			console.warn("\n\n*******************Failed to post medium medium. cons.err ", err, 'token:', user.services.medium.accessToken, '\nmedium:', user.services.medium, '\n', headers, '\n', postdata, '\n');
			throw _.extend(new Error("Failed to fetch identity from medium. ", err), {response: err.response});
		}		

		console.log('pushit.medium.post fin updated:', postdata, pushitres);
		return pushitres;
	},

	'blog.aggregate.tags'(params){
		if (Meteor.isClient) return;
		let pipeline = [
		{$facet: {
			"tags": [
				{ $unwind: "$tags" },
				{ $sortByCount: "$tags" }
			],}
		}];
/* 		pipeline = [
			{ $unwind: "$tags"},
			{ $group:{
					_id: "$tags",
					count: {$sum: 1}
			}},
			{ $sort: {count: -1}}
		]; */
		let data = MeteorBlogCollections.Blog.rawCollection().aggregate(pipeline).toArray();
		return data;
	},
	
	'social.medium.pull.tag'(params){
		if (Meteor.isClient) return;
		this.unblock;
		params = params || {};
		var res, content, json, slc = 0, string, posts, creator, doc, inserted;
		let date = new Date();
		//console.log('[social.medium.pull.tag]', params, '\n\n');

		async function main(){	
			try {
				res = await HTTP.get('https://medium.com/tag/' + params.q + '/latest',{
					params: {q: params.q, format: 'json'}
				});			
				
				content = await res.content.split('</x>')[1];
				if (await !content) {
					slc = 1;
					content = await res.content.split('window["obvInit"]')[4].split('// ]]')[0].slice(1,-1).slice(0,-1);
				}
				string = await content.slice(-1);
				if (await string != '}') {
					slc = 2;
					content = await res.content.split('window["obvInit"]')[4].split('// ]]')[0].slice(1,-1).slice(0,-1);
				}	
					
				//return await {res: res.content, content: content, slc: slc};
				//string = await content.slice(-1);
				json = await JSON.parse(content);
				let n = 0;
				
				if (json.payload)
					posts = json.payload.references.Post 
				else
					posts = json.references.Post;
				
				await _.each(posts, (post)=>{		
					if (post.detectedLanguage != 'en' && post.detectedLanguage != 'ru' && post.detectedLanguage != 'de') 
						return console.warn('[social.medium.pull.tag] lang:', post.detectedLanguage, post.title);
					else if ( MeteorBlogCollections.BlogUsers.find({creatorId: post.creatorId, ban: true},{limit: 1}).count() ) 
						return console.warn('[social.medium.pull.tag] ban:', post.creatorId, post.title);
					else if ( MeteorBlogCollections.Blog.find({id: post.id},{limit: 1}).count() ) 
						return console.warn('[social.medium.pull.tag] exists:', post.id, post.title);

					creator = MeteorBlogCollections.BlogUsers.upsert({creatorId: post.creatorId},{$set:{creatorId: post.creatorId}});
					if (creator > 1)
						MeteorBlogCollections.BlogUsers.update({creatorId: post.creatorId},{addToSet:{services: 'medium'}});

					post.updatedAt = post.updatedAt || post.createdAt;
					doc = {
						aggregated: true, 
						blacklist: false,
						id: post.id,
						postid: post.uniqueSlug,
						title: post.title,
						html: post.previewContent.subTitle,
						draft: true,
						scheduledAt: new Date(post.updatedAt),
						createdAt: new Date(post.createdAt),
						userId: post.creatorId,
						detectedLanguage: post.detectedLanguage,
						tags: _.flatten(_.pluck(post.virtuals.tags,'slug')),
					};			
					if (post.virtuals.previewImage.imageId)
						doc.image = ['https://cdn-images-1.medium.com/max/1200/' + post.virtuals.previewImage.imageId ];
					else
						doc.image = ['https://res.cloudinary.com/orangry/image/upload/c_thumb,w_600,g_face/v1553633438/hundredgraphs/news.jpg'];

					inserted = MeteorBlogCollections.Blog.insert(doc);
					if (params.debug) console.log('[social.medium.pull.tag] inserted:', post.id, post.title, inserted);
					n++;
				});
				await console.log('[social.medium.pull.tag]:', Date.now() - date, 'msec', 'posts:', (_.toArray(posts)).length, 'inserted:', n, '\n\n');
				return await {found: (_.toArray(posts)), inserted: n, posts: posts, json: json};
			} catch (e) {
				await console.warn('ERR social.medium.pull.tag error', params, e, string, '\n');
				throw new Meteor.Error('social.medium.pull.tag err', e);
				return await {err: e, res: res, json: json, posts: posts};
			}
		}
		return main();
	},		
	'social.medium.pull.article'(params){
		if (Meteor.isClient) return;
		this.unblock;
		if (!params) return;
		let res, json, out, post, user, inserted, updated, httpres;
	
		if (params.postid)
			params.url = 'https://medium.com/@' + params.creatorUser + '/' + params.postid;
			
		if (params.debug) console.log('[social.medium.pull.article] 0', params.creatorId, params.title, '\nIN', params, '\n\n**');
		
		async function main(params){
			try {
				res = await HTTP.get(params.url, {
					params: {format: 'json'}
				});
				json = await JSON.parse(res.content.split('</x>')[1]);
				post = await json.payload.value;

				await _.each(json.payload.references.User, (User)=>{			
					user = {
						creatorId: User.userId, 
						creatorUser: User.username,
						creatorName: User.name,
						creatorAvatar: User.imageId				
					}
					user._id = MeteorBlogCollections.BlogUsers.upsert({creatorId: user.creatorId},{$set: user});
					if (params.debug) console.log('[social.medium.pull.article] user:', user);
				});
				
				await _.each(post,(Post)=>{
					if (post.detectedLanguage != 'en' && post.detectedLanguage != 'ru' && post.detectedLanguage != 'de') 
						return console.warn('[social.medium.pull.article] lang:', post.detectedLanguage, post.title);
					else if (MeteorBlogCollections.BlogUsers.find({creatorId: post.creatorId, ban: true},{limit: 1}).count() ) 
						return console.warn('[social.medium.pull.article] ban:', post.creatorId, post.title);
					else if (MeteorBlogCollections.Blog.find({id: post.id},{limit: 1}).count() ) 
						return; //console.warn('[social.medium.pull.article] exists:', post.id, post.title);

					creator = MeteorBlogCollections.BlogUsers.upsert({creatorId: post.creatorId},{$set:{creatorId: post.creatorId}});
					if (creator > 1)
						MeteorBlogCollections.BlogUsers.update({creatorId: post.creatorId},{addToSet:{services: 'medium'}});

					post.updatedAt = post.updatedAt || post.createdAt;
					doc = {
						aggregated: true, 
						blacklist: false,
						id: post.id,
						postid: post.uniqueSlug,
						title: post.title,
						html: post.previewContent.subTitle,
						draft: true,
						scheduledAt: new Date(post.updatedAt),
						createdAt: new Date(post.createdAt),
						userId: post.creatorId,
						detectedLanguage: post.detectedLanguage,
						tags: _.flatten(_.pluck(post.virtuals.tags,'slug')),
					};			
					if (post.virtuals.previewImage.imageId)
						doc.image = ['https://cdn-images-1.medium.com/max/1200/' + post.virtuals.previewImage.imageId ];
					else
						doc.image = ['https://res.cloudinary.com/orangry/image/upload/c_thumb,w_600,g_face/v1553633438/hundredgraphs/news.jpg'];
					inserted = MeteorBlogCollections.Blog.insert(doc);				
				});
						
				await console.log('[social.medium.pull.article] inserted:', post.id, post.title, inserted);
				return await {inserted: inserted, post: post, json: json, user: user};
			} catch (e) {
				console.warn('[social.medium.pull.article] getPost error', e, '\nERR params:', params, '\n\n');
				return await {err: e, res: res, json: json};
			}
		}
		
		return main(params);

	},
	'social.medium.pull.story'(params){
		if (Meteor.isClient) return;
		this.unblock;
		if (!params) return;
		let res, json, out, post, updated, httpres;
	
		if (params.postid)
			params.url = 'https://medium.com/@' + params.creatorUser + '/' + params.postid;
			
		if (params.debug) console.log('[social.medium.pull.story] 0', params.creatorId, params.title, '\nIN', params, '\n\n**');
		
		async function getPost(params){
			try {
				res = await HTTP.get(params.url, {
					params: {format: 'json'}
				});
				json = await JSON.parse(res.content.split('</x>')[1]);
				out = await json.payload.value;
				return await out;
			} catch (e) {
				if (params.debug) console.warn('[social.medium.pull.story] getPost error', e, '\nERR params:', params, '\n\n');
				return await {err: e, res: res, json: json};
			}
		}

		async function getText(post){
			post.txts = _.pluck(post.paragraphs, 'text');
			post.text = '';
			post.html = '';
			for (let txt of post.txts) {
				post.txt = post.txt + txt + '\n';
				post.html = post.html + '<p>' + txt + '</p>\n';
			}
			return post;
		}		
		
		function addPost(post){		
			post.doc = {
				text: post.text,
				html: post.html,
				paragraphs: post.paragraphs,
				url: post.canonicalUrl,
			}
			let doc = _.clone(post.doc);
			post.updated = MeteorBlogCollections.Blog.update({postid: params.postid},{$set: doc});
			//if (params.debug) console.log('\n\nmedium post.paragraphs', doc, post.doc, '\nparagraphs:', post.paragraphs, '\n');
			return post;
		}	

		async function main(params){
			try {
				post = await getPost(params);
				//return res;
				post.paragraphs = await post.content.bodyModel.paragraphs;
				//post.txt = await _.pluck(post.paragraphs, 'text');
				post = await getText(post);
				post = await addPost(post);
				if (params.debug) await console.log('social.medium.pull.story main end', params, '\n');
				return post;
			} catch (e) {
				console.warn('[social.medium.pull.story] main error', e, '\nERR params:', params, post, '\n\n');
				return await {err: e, res: res, json: json};
			}
		}		
		
		return main(params);

	},
	'social.medium.pull.user'(params){
		if (Meteor.isClient) return;
		this.unblock;
		params = params || {};
		let res, json, updated, user = {};
		
		async function main(){
			try {
				res = await HTTP.get('https://medium.com/search',{
					params: {q: params.creatorId, format: 'json'}
				});
				json = await JSON.parse(res.content.split('</x>')[1]);
				user.creatorUser = await json.payload.value.users[0].username;
				user.creatorName = await json.payload.value.users[0].name;
				user.creatorAvatar = await json.payload.value.users[0].imageId;			
				updated = await MeteorBlogCollections.BlogUsers.upsert({creatorId: params.creatorId},{$set: user});
				if (params.debug) await console.log('[social.medium.pull.user]:', updated, params.creatorId, user, '\n\n');
				return await user;
			} catch (e) {
				console.warn('[social.medium.pull.user] error', e);
				//throw new Meteor.Error(400, '[social.medium.pull.user] err', e);
				return await {err: e, res: res, json: json};
			}
		}
		return main();
	},	

	//unused
	'social.medium.pull.request'(params){
		params = params || {};
		//var user, reqparams = {}, token, httpres, fbout;
		var userId = params.userId || this.userId;
		//if (params.debug) 
			console.log('\n\n**************************\nsocial.medium.pull.request', params, '\n\n');
		if (!params.action) {
			console.warn('NO action in medium pull request', params);
			throw new Meteor.Error(400, 'NO action in medium pull request', params);
			return;
		} else if (params.action == 'tag')
			Meteor.call('social.medium.pull.tag',params);
		else if (params.action = 'post')
			Meteor.call('social.medium.pull.search',params);
		//return httpres;

	},		
	'social.medium.page.feed'(params){
		params = params || {};
		params.service = 'facebook';
		var user, token, fbphoto, fbout;
		var userId = params.userId || this.userId;
		//var pushuser = PushUser.findOne({userId: userId, 'services.facebook.accountId': {$exists: true}});
		var page_id = '317268918690242';
		if (params.debug) console.log('\n\n**************************\npushit.facebook.page', params, '\n\n');
		user = Meteor.users.findOne(userId);
		
		if (!user || !user.services || !user.services.facebook){
			console.warn('pushit.facebook.page, but no facebook service', user);
			throw new Meteor.Error(400, 'pushit.facebook.page, but no facebook service');
		}
		
		FB.setAccessToken(user.services.facebook.accessToken);		
		
		console.log('social.facebook.page.feed', params);
		
		async function getpost(post_id){
			try {
				var fbres = await FB.api(
					"/" + post_id
				);
			} catch (e) {
				console.warn('social.facebook.page.feed error', e.response.error, e);
				throw new Meteor.Error(400, 'social.facebook.page.feed err', e.response.error);
				return e;
			}
			await console.log('\n\nsocial.facebook.page.feed fetched post:', fbres, '\n\n');
		}
		async function main(){
			try {
				var fbres = await FB.api(
					"/" + page_id + "/feed"
				);
			} catch (e) {
				console.warn('social.facebook.page.feed error', e.response.error, e);
				throw new Meteor.Error(400, 'social.facebook.page.feed err', e.response.error);
				return e;
			}
			await console.log('\n\nsocial.facebook.page.feed fbres inside:', fbres, '\n\n');
			await _.each(fbres.data,(post)=>{
				console.log('social.facebook.page.feed post:', post);
				getpost(post.id);
			});
			//await Tours.update(params._id,{$addToSet: {social: {type: 'fb', id: fbres.id, userId: user._id, username: user.username, date:new Date()}}});
			return await fbres;
		}
		var fbres = main();
		//if (params.debug) console.log('social.facebook.post async:', fbres);
		return fbres;

	},		
	'social.medium.pull.search'(params){
		params = params || {};
		let res, json;
		async function main(){
			try {
				res = await HTTP.get('https://medium.com/search',{
					params: {q: params.q, format: json}
				});		
				if (params.debug) console.log('calling social.medium.pull.search res:', res.content);
				
				json = await JSON.parse(res.content.split('</x>')[1]);		
				if (params.debug) console.log('calling social.medium.pull.search json:', json);
				
				await _.each(json.payload.value.posts, (post)=>{
					if ( PushIt.find({'posted.id': post.id}).count() ) {
						return console.warn('post with title', post.title, 'is in db already');
					}
					console.log('calling social.medium.pull.story for', post.creatorId, post.id, post.title);
					Meteor.call('social.medium.pull.story', post);
				});				
				await console.log('[social.medium.pull.search]:', json, '\n');
				return await json;
			}catch(e){
				console.warn('[social.medium.pull.search] error', e);
				throw new Meteor.Error(400, '[social.medium.pull.search] err', e);
				return e;			
			}
		};
		return main();
	},			
	'social.medium.pull.test'(params){
		this.unblock;
		params = params || {};
		var user, reqparams = {}, token, httpres, fbout;
		var userId = params.userId || this.userId;
		//if (params.debug) 
			console.log('\n\n**************************\nsocial.medium.pull.tag', params, '\n\n');
		//user = Meteor.users.findOne(userId);
		if (params.draft)
			params.draft = 'draft'; 		
		//console.log('social.medium.pull.tag', params);
		
		let creatorId = params.q || 'SmartHome';
		//reqparams.format = 'json' || params.format;
			
		async function main(){
			var res, json, user = {};
			try {
				var res = await HTTP.get('https://medium.com/search',{
					params: {q: creatorId, format: 'json'}
				});
				//return await res;
			} catch (e) {
				console.warn('social.medium.pull.story getUser error', e);
				throw new Meteor.Error(400, 'social.medium.pull.story getUser err', e);
				return e;
			}
			var json = await JSON.parse(res.content.split('</x>')[1]);
			//return json;
			user.creatorUser = await json.payload.value.users[0].username;
			user.creatorName = await json.payload.value.users[0].name;
			user.creatorAvatar = await json.payload.value.users[0].imageId;	
			await console.log('\n\nsocial.medium.pull.tag res inside:', json.success, json, '\n\n');
			await MeteorBlogCollections.BlogUsers.upsert({creatorId: creatorId},{$set: user});
			return await user;
		}
		httpres = main();
		console.log('\n\nsocial.medium.pull.tag res :', httpres, '\n\n');
		return httpres;

	},		
	
	'maint.lang'(params){
		this.unblock;
		let res = MeteorBlogCollections.Blog.update({detectedLanguage: {$exists: false}},{$set: {detectedLanguage: 'en'}},{multi: true});
		console.log('[maint.lang]', res);
	},		
	
});