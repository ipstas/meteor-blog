import moment from 'moment';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Random } from 'meteor/random';
import { tagsMassage } from '../client/functions.js';
import { usernameMassage } from '../client/functions.js';

try{
	export const hooksObject = {
		formToDoc: function(doc) {
			console.log('formToDoc hooksObject', doc, '\nthis:', this);	
			if (this.ss._schema.postid)
				doc.postid = doc?.postid || doc?.title?.replace(/[^\x00-\x7F]/g, '')?.replace(/\s+/g, '_') + '_' + Random.id(3);		
			return doc;
		},
		onError: function (doc) {
			console.log("[meteor-blog] hooksObject onError hook called with arguments", 'context:', this, '\ndoc:', doc);
			this.event.preventDefault();
			if (window.analytics)
				analytics.track('form_failed', {
					referrer: document.referrer,
					category: "engagement",
					label: this.formId
				});
		},
		onSuccess: function (doc) {
			console.log("[meteor-blog] hooksObject onSuccess on all input/update/method forms!", this, '\ndoc:', doc);
			this.event.preventDefault();
			if (window.analytics)
				analytics.track('form_submitted', {
					referrer: document.referrer,
					category: "engagement",
					label: this.formId
				});
			return false;
		},
	};
	export const hooksAddPost = {
		before: {
			// Replace `formType` with the form `type` attribute to which this hook applies
			insert: function(doc) {
				console.log("[meteor-blog] hooksAddPost before insert on hooksAddPost!", doc, this);
				return doc;
			},    
				insert: function(doc) {
				console.log("[meteor-blog] hooksAddPost before update on hooksAddPost!", doc, this);
				return doc;
			}
		},
		formToDoc: function(doc) {
			doc.title = $('#mediumtitle').text();
			doc.html = $('#mediumtext').html();
			//doc.text = $('#mediumtext').text();    
			doc.text = $('#mediumtext')[0].innerText;   
			doc.title = doc?.title?.replace(/\n|\r/g,'') || 'hooksAddPost';
			console.log('formToDoc hooksAddPost', doc, '\nthis:', this);	
			if (this.ss._schema.postid)
				doc.postid = doc?.postid || doc?.title?.replace(/[^\x00-\x7F]/g, '')?.replace(/\s+/g, '_') + '_' + Random.id(3);		
			return doc;
		},
		onSubmit: function (doc) {
			let updated;// = MeteorBlogCollections.Blog.update({_id: doc._id},{$set: doc});
			console.log("[hooksAddPost] onsubmit", updated, '\ndoc:', doc, '\nthis:', this);
			this.done();
			return false;
		}
	};
	export const hooksPullMedium = {
		onSubmit: function (doc) {
			let updated;// = MeteorBlogCollections.Blog.update({_id: doc._id},{$set: doc});
			console.log("[hooksAddPost] onsubmit", updated, '\ndoc:', doc, '\nthis:', this);
			Session.set('request', true);
			Session.setPersistent('defaultQ', doc.q);
			if (doc.action == 'tag')
				Meteor.call('social.medium.pull.tag',{q: doc.q},(e,r)=>{
					console.log('[hooksPullMedium] e:', e, '\nr', r);
					if (e || r.err) Bert.alert(doc.action + ' ' + e.error, 'danger');
					else if (r) Bert.alert('pulled ' + r.inserted + ' new articles');			
					Session.set('request');
					// if (r && r.inserted)
						// Bert.alert('received ' + r.inserted + 'new articles', 'info');
				})
			else if (doc.action == 'post')
				Meteor.call('social.medium.pull.article',{url: doc.q},(e,r)=>{
					console.log('[hooksPullMedium] e:', e, '\nr', r);
					if (e || r.err) Bert.alert(doc.action + ' ' + e.error, 'danger');
					else if (r) Bert.alert('pulled ' + r.inserted + ' new articles');				
					Session.set('request');
				})			
			else if (doc.action == 'author')
				Meteor.call('social.medium.pull.author',{author: doc.q},(e,r)=>{
					console.log('[hooksPullMedium] e:', e, '\nr', r);
					if (e || r.err) Bert.alert(doc.action + ' ' + e.error, 'danger');
					else if (r) Bert.alert('pulled ' + r.inserted + ' new articles');			
					Session.set('request');
				})		
			this.done();
			return false;
		},
	/* 	onSuccess: function (doc) {
			console.log("onSuccess hooksPullMedium", this, '\ndoc:', doc);
			this.event.preventDefault();
			if (window.analytics)
				analytics.track('blog_pulled', {
					referrer: document.referrer,
					category: "administrative",
					label: this.formId
				});
			return false;
		}, */
	};
	AutoForm.addHooks('datePushForm', hooksObject);
	AutoForm.addHooks('settingsFBForm', hooksObject);
	AutoForm.addHooks('telegramForm', hooksObject);
	AutoForm.addHooks('insertPushImagesForm', hooksObject);
	AutoForm.addHooks('updBlogPull', hooksObject);
	AutoForm.addHooks('newBlogPullAuthorTag', hooksObject);
	AutoForm.addHooks(null, hooksObject);
} catch(e){
	console.warn('[meteor.blog hooks] err:', e);
	Sentry.captureException(e);
	throw new Meteor.Error(500, e);
}	
