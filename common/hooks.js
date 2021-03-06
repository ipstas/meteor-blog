import moment from 'moment';
import { AutoForm } from 'meteor/aldeed:autoform';
import { Random } from 'meteor/random';
import { tagsMassage } from '../client/functions.js';
import { usernameMassage } from '../client/functions.js';

export const hooksObject = {
  onError: function (doc) {
    console.log("onError hook called with arguments", 'context:', this, '\ndoc:', doc);
		this.event.preventDefault();
		if (window.analytics)
			analytics.track('form_failed', {
				referrer: document.referrer,
				category: "engagement",
				label: this.formId
			});
  },
	onSuccess: function (doc) {
		console.log("onSuccess on all input/update/method forms!", this, '\ndoc:', doc);
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
			console.log("before insert on hooksAddPost!", doc, this);
			return doc;
    },    
		insert: function(doc) {
			console.log("before update on hooksAddPost!", doc, this);
			return doc;
    }
  },
  formToDoc: function(doc) {
		doc.title = $('#mediumtitle').text();
		doc.html = $('#mediumtext').html();
		//doc.text = $('#mediumtext').text();    
		doc.text = $('#mediumtext')[0].innerText;   
		doc.title = doc.title.replace(/\n|\r/g,'');
		doc.postid = doc.title.replace(/[^\x00-\x7F]/g, '').replace(/\s+/g, '-') + '-' + Random.id(3);
		console.log('formToDoc hooksAddPost', doc, '\nthis:', this);
		
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
AutoForm.addHooks(null, hooksObject);