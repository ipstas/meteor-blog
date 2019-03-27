//import moment from 'moment';
//import moment-timezone from 'moment-timezone';
import moment from 'moment';
import $ from 'jquery';
import 'jquery-ui-bundle';
//import 'meteor/aldeed:autoform-bs-datetimepicker';
import { Random } from 'meteor/random';
import {MediumEditor} from 'meteor/mediumeditor:mediumeditor';
//import MediumEditorInsert from 'medium-editor-insert-plugin';
//require('medium-editor-insert-plugin')($);
//window.MediumEditor = MediumEditor;

import {MeteorBlogCollections} from '../common/collections.js';
window.MeteorBlogCollections = MeteorBlogCollections;
import {MeteorBlogSchemas} from '../common/collections.js';
import './blog.html';
const _LocalTags = new Mongo.Collection(null);

import { hooksObject } from '../common/hooks.js';
import { hooksAddPost } from '../common/hooks.js';
AutoForm.addHooks('datePushForm', hooksObject);
AutoForm.addHooks('datePushForm', hooksAddPost);


import {setSort} from './functions';
import { datepickerInit } from './functions';
import { setSelectDate } from './functions';
import { selectDate } from './functions';
import { imgOnScroll } from './functions';
import {checkMore} from './functions';
import {dragImg} from './functions';

let editor;

const blogEditor = function(){
/* 	if (editor) {
		editor.setup(); 
		return console.warn('[blog editor] exists:', editor);
	} */
	
	editor = new MediumEditor('.mededitable', {
		placeholder: {
			text: 'Type your text',
			hideOnClick: true
		},
		autoLink: false,
		toolbar: {
			buttons: [
				'bold',
				'italic',
				{
					name: 'h1',
					action: 'append-h2',
					aria: 'header type 1',
					tagNames: ['h2'],
					contentDefault: '<b>H1</b>',
					classList: ['custom-class-h1'],
					attrs: {
						'data-custom-attr': 'attr-value-h1'
					}
				},
				{
					name: 'h2',
					action: 'append-h3',
					aria: 'header type 2',
					tagNames: ['h3'],
					contentDefault: '<b>H2</b>',
					classList: ['custom-class-h2'],
					attrs: {
						'data-custom-attr': 'attr-value-h2'
					}
				},
				'justifyCenter',
				'quote',
				'anchor',
				'image'
			]
		},
	});	
	console.log('[blog editor]', editor);
	
/*   extensions: {
    insert: new MediumInsert()
  } */
	
	//windot.meteorBlogEditor = editor;
/* 	Meteor.setTimeout(()=>{
		$('.mededitable').mediumInsert({
			editor: editor
		});	
	},500) */

	return editor;
	
}

//import {MediumEditor} from 'medium-editor';

const typeBtn = [
	{ id: 'content', color: 'info', title:'Content', val:'blogContent', },
	{ id: 'aggregated', color: 'info', title:'Aggregated', val:'blogAggregated'},
	{ id: 'edit', color: 'info', title:'Edit', val:'blogEdit', disabled: 'disabled'},
	{ id: 'queue', color: 'info', title:'Queue', val:'blogQueue'},
	{ id: 'status', color: 'info', title:'Status', val:'blogStatus'},
	{ id: 'settings', color: 'info', title:'Settings', val:'blogSettings'},
];

Template.blogIt.onCreated(function () {
	let t = Template.instance();
  t.state = new ReactiveDict();
	t.hidden = new ReactiveVar();
	t.ready = new ReactiveVar();
	t.next = new ReactiveVar(4);
	t.limit = new ReactiveVar(8);
	//if (!FlowRouter.getQueryParam('select')) FlowRouter.setQueryParams({select: 'content'});
	t.selector = new ReactiveVar();
	t.editselector = new ReactiveVar();
	t.selectTag = new ReactiveVar();
	t.mediumeditor = new ReactiveVar();
	t.autorun(()=>{
		if (!FlowRouter.getQueryParam('push')) return;
		let params = {caller: 'blogIt.onCreated', _id: FlowRouter.getQueryParam('push'), debug: Session.get('debug')};
		PostSubs.subscribe('blog', params);	
	})


});
Template.blogIt.onRendered(function () {
	let t = Template.instance();
	//t.selector.set(FlowRouter.getQueryParam('get'));
	//console.log('MediumEditor', MediumEditor);
	t.autorun(()=> {
		if (!t.mediumeditor.get()) return;
	});
});
Template.blogIt.helpers({
	typeBtn(){
		return typeBtn;
	},
	ready(){
		let t = Template.instance();
		return t.ready.get();
	},
	isAdmin(){
		return (Roles.userIsInRole(Meteor.userId(), ['admin'], 'admGroup')) ;
	},
	selector(){
		let t = Template.instance();
		//if (!FlowRouter.getQueryParam('select')) return;
		let selector = _.findWhere(typeBtn, {id: FlowRouter.getQueryParam('select')}) || typeBtn[0];
		//console.log('[selector]', selector);
		return selector;
	},
	push(){
		if (!FlowRouter.getQueryParam('push')) return; 
		var data = MeteorBlogCollections.Blog.findOne(FlowRouter.getQueryParam('push'));
		console.log('[blogIt.helpers] data', data);
		return data;
	},
});
Template.blogIt.events({
/* 	'click .newpush'(e, t) {
		t.selector.set('blogContent');
		FlowRouter.setQueryParams({select: 'content'});
		var push = MeteorBlogCollections.Blog.insert({title:'Title. That will be used in Medium only for the url', html:'click to start editing', draft: true, userId: Meteor.userId(), scheduledAt: new Date()});
		FlowRouter.setQueryParams({push: push});
	}, */
	'click .typeBtn'(e, t) {
/* 		t.selector.set(this.val);
		console.log('clicked cursor', e.target.id, this);		 */
		FlowRouter.setQueryParams({select: this.id, push: null});
	},
	'click .soon'(e,t){
		Bert.alert('this feature is coming soon', 'info');
	},
});

Template.blogContent.onCreated(function () {
	let t = Template.instance();
	t.ready = new ReactiveVar();
	t.limit = new ReactiveVar(16);
	t.loaded = new ReactiveVar();
	t.sort = new ReactiveVar({createdAt: -1});
	let sub;
	
	//console.log('[blogContent.onCreated] data', t.data);
		
	t.autorun(()=>{	
		let params = {caller: 'blogContent.onCreated', blog: true, limit: t.limit.get()};
		sub = t.subscribe('blog', params);
		//console.log('[blogContent.onCreated] sub:', params, t.data);
		t.ready.set(sub.ready());
	});
});
Template.blogContent.onRendered(function () {
	let t = Template.instance();	
});
Template.blogContent.helpers({
	ready(){
		let t = Template.instance();
		return t.ready.get();
	},
	posts(){
		let t = Template.instance();
		let data = MeteorBlogCollections.Blog.find({scheduledAt: {$lt: new Date()}, draft:{$ne: true}},{sort: {createdAt: -1}});
		if (!data) t.ready.set();
		//console.log('[blogContent.helpers] data', data, this);
		return data;
	},		
	htmlCut(){
		let txt = $('img', $(this.html)).remove().end().text();
		txt = txt.substr(0,260) + '...';
		//console.log('[blogContent.helpers] htmlCut', txt, this.html);
		return txt;	
	},
	img(){
		let url;
		if (this.image && this.image.length)
			url = this.image[0];
		url = $('img', $(this.html)).attr('src') || url || 'https://res.cloudinary.com/orangry/image/upload/c_thumb,w_600,g_face/v1553633438/hundredgraphs/news.jpg';
		url = url.replace(/upload/,'upload/c_thumb,w_200,g_face');
		if (Session.get('debug')) console.log('[blogContent.helpers] img', url, this);
		return url;
	}
});
Template.blogContent.events({
	'click .mededitable'(e,t){
		//blogEditor();
	},
	'click .service'(e,t){	
		//console.log('clicked service', e, this);
		e.stopPropagation();
		var updated;
		var service = this.service || 'telegram';
		var data = MeteorBlogCollections.Blog.findOne({_id: FlowRouter.getQueryParam('push'), services: service});
		if (!data)
			updated = MeteorBlogCollections.Blog.update(FlowRouter.getQueryParam('push'),{$addToSet:{services: service}});
		else
			updated = MeteorBlogCollections.Blog.update(FlowRouter.getQueryParam('push'),{$pull:{services: service}});
		console.log('click service', service, updated, 'data:', data, MeteorBlogCollections.Blog.findOne(FlowRouter.getQueryParam('push')), 'this:', this, '\n');	
	},
	'click .schedule'(e,t){
		//e.preventDefault();
		//editor.destroy();
		var mediumtext = {title: $('#mediumtitle').text(), text: $('#mediumtext').html()};
		console.log('click schedule 2', editor, mediumtext);	
	},
	'click .remove'(e,t){
		console.log('clicked remove', e, this.valueOf());
		MeteorBlogCollections.Blog.update(FlowRouter.getQueryParam('push'),{$pull:{image: this.valueOf()}});
	},
/* 	'click .newpush'(e, t) {
		var push = MeteorBlogCollections.Blog.insert({title:'Title. That will be used in Medium only for the url',html:'start editing'});
		FlowRouter.setQueryParams({push: push});
		console.log('clicked newpush', push);
	} */
	// 'click .mededitable'(e,t){
		// if (event.target.id == 'mediumtitle')
			// MeteorBlogCollections.Blog.update(FlowRouter.getQueryParam('push'),{$set:{title: event.target.innerText}});
		// else if (event.target.id == 'mediumtext')
			// MeteorBlogCollections.Blog.update(FlowRouter.getQueryParam('push'),{$set:{html: event.target.innerHTML, text: event.target.innerText}});		
		// console.log('clicked mededitable', e,t);
	// }
});

Template.blogImage.onCreated(function () {
	let t = Template.instance();	
	let params = {caller: 'blogImage.onCreated', pushit: this._id};
	PostSubs.subscribe('blogimages', params);
});
Template.blogImage.helpers({
	img(){
		let url = '/img/loading.gif';
		let data = MeteorBlogCollections.BlogImages.findOne({pushit: this._id});
		if (data)
			url = data.url.replace(/upload/,'upload/c_thumb,w_200,g_face');
		console.log('[blogImage.helpers] img', data, this);
		return url;
	}
});

Template.blogPost.onCreated(function () {
	window.prerenderReady = false;
	let t = Template.instance();
	t.mediumeditor = new ReactiveVar();
  
  t.subscribe('blogservice');
  t.subscribe('bloguser');
	t.ready = new ReactiveVar();
	t.limit = new ReactiveVar(16);
	t.loaded = new ReactiveVar();
	t.blog = new ReactiveVar();
	t.image = new ReactiveVar();
	t.sort = new ReactiveVar({createdAt: -1});
	
	var	sub = t.subscribe('blog',{postid: FlowRouter.getParam('postid')});
		
	t.autorun(function(computation){
		if (!sub)
			return;
		t.ready.set(sub.ready());
	});
	t.autorun(()=>{
		if (!t.ready.get()) {
			window.prerenderReady = false;
			return;
		}
		var posts = MeteorBlogCollections.Blog.findOne({postid: FlowRouter.getParam('postid')});
		if (!posts) return;
		var images = _.flatten(posts.image);
		if (Session.get('debug')) console.log('oncreated blogpost', posts, images);
		t.subscribe('blogimages',{_id: {$in: images}});
		Meteor.setTimeout(()=>{
			window.prerenderReady = true;
		},200);
	});
	//t.subscribe('feedback');
});
Template.blogPost.onRendered(function () {
	let t = Template.instance();
	t.autorun(() => {
		if (!t.blog.get()) return;
		var host = 'https://' + window.location.host;
		var data = t.blog.get();
		var image = t.image.get() || host + '/img/vr_bck2.jpg';
		data.title = data.title;
		data.description = data.text;
		var image = host + '/img/vr_bck2.jpg';
		var keywords = data.tags + "virgo, virgo360, 360, virtual, augmented, reality, panorama";
		var seo = {
			title: data.title,
			description: data.description,
			meta: {
				'name': data.title,
				'description': data.description,
				'property="og:title"': data.title,
				'property="og:description"': data.description,
				'property="og:url"': document.URL,
				'property="og:image"': image,
				'name="twitter:title"': data.title,
				'name="twitter:description"': data.description,
				'name="twitter:image"': image,
				'name="keywords"': keywords,
			}
		}
		$('meta[name=description]').remove();
		$('meta[property="og:title"]').remove();
		$('meta[property="og:description"]').remove();
		$('meta[property="og:image"]').remove();
		$('meta[property="og:url"]').remove();
		$('meta[name="twitter:title"]').remove();
		$('meta[name="twitter:description"]').remove();
		$('meta[name="twitter:image"]').remove();
		$('meta[name="keywords"]').remove();
		SEO.set(seo);
	});

});
Template.blogPost.helpers({
	typeBtn(){
		return typeBtn;
	},
/* 	ready(){
		let t = Template.instance();
		return t.ready.get();
	}, */
	isAdmin(){
		return (Roles.userIsInRole(Meteor.userId(), ['admin'], 'admGroup')) ;
	},
	post(){
		let t = Template.instance();
		var data = MeteorBlogCollections.Blog.findOne({postid: FlowRouter.getParam('postid')});
		if (Session.get('debug')) console.log('blogpost data', data, this);
		t.blog.set(data);
		let title = 'HundredGraphs, visualize your IoT data.';
		if (data)
			SEO.set({
				title: 'Blog Post. ' + data.title + ' ' + title
			});
		return data;
	},		
	img(){
		let t = Template.instance();
		var img;
		if (this.image && this.image.length)
			img = this.image[0];
		if (img && img.match('cloudinary'))
			img = img.replace(/upload/, 'upload/' + Meteor.settings.public.cloudinary.options.preview	);
		console.log('[blogPost.helpers] img', img, this, '\n'); 
		return img;
	},
	checkedDraft(){
		if (!this.draft) return 'checked';
	},
	checkedUser(){
		if (this.ban) return 'checked';
	},
	lowtag(){
		//console.log('lowtag this', this.valueOf());
		var tag = this.valueOf().toLowerCase().replace(/ /g,'-');
		//console.log('lowtag this', tag, this.valueOf());
		return tag;
	},	
	date(){
		return moment(this.scheduledAt).format('LL');
	},
	creator(){
		let t = Template.instance();
		let user, creator, call;
		
		if (!this.aggregated) {
			user = Meteor.users.findOne(this.userId);
			if (user)
				user.name = user.profile.name || user.username;
		} else {
			let params = {caller: 'blogPost.helpers', creatorId: this.userId, debug: Session.get('debug')};
			user = MeteorBlogCollections.BlogUsers.findOne({creatorId: this.userId});
			if (user && !user.creatorUser)
				call = Meteor.call('social.medium.pull.user', params, (e,r)=>{console.log('[social.medium.pull.user]', params, e, r )});			
			else if (!user)
				PostSubs.subscribe('blogusers', params);
			else 
				user.name = user.creatorName || user.creatorId;		
		}
		console.log('[blogPost.helpers] user', call, user && !user.creatorUser, user, this, '\n'); 
		return user;
	},
	original(){
		if (this.url || !this.aggregated) return this.url;		
		let t = Template.instance();
		let user = MeteorBlogCollections.BlogUsers.findOne({creatorId: this.userId});
		if (!user || !user.creatorUser) return;
		let params = {caller: 'blogPost.helpers', creatorUser: user.creatorUser, postid: this.postid, debug: Session.get('debug')};
		Meteor.call('social.medium.pull.story', params, (e,r)=>{console.log('[social.medium.pull.story]', e,r)});	
		console.log('[blogPost.helpers] original', params, this, '\n'); 

	},
	debug(){
		//var data = MeteorBlogCollections.Blog.findOne(FlowRouter.getQueryParam('push'));
		//console.log('blogpost data debug', data, this);
	}
});
Template.blogPost.events({
	'click .typeBtn'(e, t) {
		FlowRouter.setQueryParams({select: this.id, push: null});
	},
	'click .service'(e,t){	
		//console.log('clicked service', e, this);
		e.stopPropagation();
		var updated;
		var service = this.service || 'telegram';
		var data = MeteorBlogCollections.Blog.findOne({_id: FlowRouter.getQueryParam('push'), services: service});
		if (!data)
			updated = MeteorBlogCollections.Blog.update(FlowRouter.getQueryParam('push'),{$addToSet:{services: service}});
		else
			updated = MeteorBlogCollections.Blog.update(FlowRouter.getQueryParam('push'),{$pull:{services: service}});
		console.log('click service', service, updated, 'data:', data, MeteorBlogCollections.Blog.findOne(FlowRouter.getQueryParam('push')), 'this:', this, '\n');	
	},
	'click .schedule'(e,t){
		var text = $('.mededitable').each(function(){console.log(this.innerText)});
		var mediumtitle = $('#mediumtitle').text();
		var mediumtext = {html: $('#mediumtext').html(), text: $('#mediumtext')[0].innerText};
		console.log('click schedule 1', e, mediumtitle, mediumtext);	
		MeteorBlogCollections.Blog.update(FlowRouter.getQueryParam('push'),{$set:{title: mediumtitle, html: mediumtext.html, text: mediumtext.text}});
		console.log('click schedule 2', e, mediumtext);	
	},
	'click .remove'(e,t){
		console.log('clicked remove', this);
		MeteorBlogCollections.Blog.remove(this._id);
		history.go(-1);
	},	
	'click .blacklist'(e,t){
		console.log('clicked blacklist', this);
		MeteorBlogCollections.Blog.update(this._id, {$set: {blacklist: true}});
	},	
	'change #draft'(e,t){
		console.log('clicked draft', e.target.checked, this);
		MeteorBlogCollections.Blog.update(this._id, {$set: {draft: !e.target.checked}});
	},
	'click a'(){
		$('html, body').animate({scrollTop: $('body').offset().top -150 }, 'slow');		
	},
	'change #ban'(e,t){
		if (Session.get('debug')) console.log('clicked ban', this);
		let creator = MeteorBlogCollections.BlogUsers.findOne({creatorId: this.creatorId});
		if (creator) MeteorBlogCollections.BlogUsers.update({_id: creator._id},{$set:{ban:e.target.checked}});
	},
	/* 	'click .newpush'(e, t) {
		var push = MeteorBlogCollections.Blog.insert({title:'Title. That will be used in Medium only for the url',html:'start editing'});
		FlowRouter.setQueryParams({push: push});
		console.log('clicked newpush', push);
	} */
	// 'click .mededitable'(e,t){
		// if (event.target.id == 'mediumtitle')
			// MeteorBlogCollections.Blog.update(FlowRouter.getQueryParam('push'),{$set:{title: event.target.innerText}});
		// else if (event.target.id == 'mediumtext')
			// MeteorBlogCollections.Blog.update(FlowRouter.getQueryParam('push'),{$set:{html: event.target.innerHTML, text: event.target.innerText}});		
		// console.log('clicked mededitable', e,t);
	// }
});

Template.blogEdit.onCreated(function () {
	let t = Template.instance();
	t.mediumeditor = new ReactiveVar();
  
  t.subscribe('blogservice');
  t.subscribe('bloguser');
	t.ready = new ReactiveVar();
	t.limit = new ReactiveVar(16);
	t.loaded = new ReactiveVar();
	t.sort = new ReactiveVar({createdAt: -1});

	console.log('[blogEdit.onCreated] data', t.data);
	//$('#mediumtext').html('');
	if (t.data) return;
	// let params = {caller: 'blogEdit.onCreated', _id: FlowRouter.getQueryParam('push'), debug: Session.get('debug')};
	// PostSubs.subscribe('blog', params);	
});
Template.blogEdit.onRendered(function () {
	let t = Template.instance();

	//let data = MeteorBlogCollections.Blog.findOne(FlowRouter.getQueryParam('push'));
	
	t.autorun(()=>{
		if (!t.data) return;
		console.log('[blogEdit.onRendered] data', t.data);

		$('#mediumtitle').text(t.data.title);
		$('#mediumtext').html('');
		$('#mediumtext').html(t.data.html);
		blogEditor();	
		editor.subscribe('editableInput', function (event, editable) {
			console.log('editableInput', event.target.innerHTML, event, editable);
			MeteorBlogCollections.Blog.update({_id: FlowRouter.getQueryParam('push')},{$set:{html: event.target.innerHTML}});
		});		
		
	})

	

	console.log('[blogContent.onRendered] mediumeditor', $('#mediumtext').html(), editor);			
	
});
Template.blogEdit.helpers({
	ready(){
		let t = Template.instance();
		return t.ready.get();
	},
	isAdmin(){
		return (Roles.userIsInRole(Meteor.userId(), ['admin'], 'admGroup')) ;
	},
	selector(){
		//let t = Template.instance();
		//console.log('selector', t.selector.get());
		//return t.selector.get();
		return FlowRouter.getQueryParam('push');
	},
	services(){
		var data = ServiceConfiguration.configurations.find({service: {$ne: 'google'}});
		console.log('connectAccounts', data.fetch());
		return data;
	},		
	active(){
		var data = MeteorBlogCollections.Blog.findOne({_id: FlowRouter.getQueryParam('push'), services: this.service});
		console.log('active', this, data );
		if (data)
			return 'success';
		else
			return 'info';
	},	
	activetele(){
		var data = MeteorBlogCollections.Blog.findOne({_id: FlowRouter.getQueryParam('push'), services: 'telegram'});
		console.log('active', this, data );
		if (data)
			return 'success';
		else
			return 'info';
	},
	collection(){
		var data = MeteorBlogCollections.Blog;
		console.log('pushit collection', data);
		return data;
	},	
	schema(){
		var data = MeteorBlogSchemas.Blog;
		console.log('pushit schema', data);
		return data;
	},
	day(){
		return new Date(Date.now() + 1000*60*60*24);
	},
	post(){
		let t = Template.instance();
		var data = MeteorBlogCollections.Blog.findOne(FlowRouter.getQueryParam('push'));
		if (data)
			t.ready.set(true);
		else
			t.ready.set();
		console.log('pushit data', data, this);
		return data;
	},		
	dataImg(){
		
		//this.cloudenv.cloudThumb = Meteor.settings.public.CLOUDINARY_THUMB + '/';
		//this.cloudenv.cloudPreview = Meteor.settings.public.CLOUDINARY_PREVIEW + '/';
		var data = MeteorBlogCollections.BlogImages.findOne(this.valueOf());
		//if (!data) return;
		console.log('dataImg', this.valueOf()	, data, '\n\n'); 
		//return data;
		return data.url.replace(/upload/, 'upload/' + Meteor.settings.public.cloudinary.options.scaled	);
	},
	debug(){
		var data = MeteorBlogCollections.Blog.findOne(FlowRouter.getQueryParam('push'));
		console.log('pushit data debug', data, this);
	}
});
Template.blogEdit.events({
	'click .mededitable'(e,t){
		//blogEditor();
	},
	'click .service'(e,t){	
		//console.log('clicked service', e, this);
		e.stopPropagation();
		var updated;
		var service = this.service || 'telegram';
		var data = MeteorBlogCollections.Blog.findOne({_id: FlowRouter.getQueryParam('push'), services: service});
		if (!data)
			updated = MeteorBlogCollections.Blog.update(FlowRouter.getQueryParam('push'),{$addToSet:{services: service}});
		else
			updated = MeteorBlogCollections.Blog.update(FlowRouter.getQueryParam('push'),{$pull:{services: service}});
		console.log('click service', service, updated, 'data:', data, MeteorBlogCollections.Blog.findOne(FlowRouter.getQueryParam('push')), 'this:', this, '\n');	
	},
	'click .schedule'(e,t){
		//e.preventDefault();
		//editor.destroy();
		let doc = {};
		doc.title = $('#mediumtitle').text();
		doc.html = $('#mediumtext').html();	
		doc.title = doc.title.replace(/\n|\r/g,'');
		doc.postid = doc.title.replace(/[^\x00-\x7F]/g, '').replace(/\s+/g, '-') + '-' + Random.id(3);
		doc.scheduledAt = new Date($( "input[name*='scheduledAt']" ).val());
		doc.draft = $( "input[name*='draft']" ).is(':checked')
		console.log('click schedule 2', this, doc);	
		MeteorBlogCollections.Blog.update({_id: this._id},{$set: doc});
	},
	'click .remove'(e,t){
		console.log('clicked remove', e, this.valueOf());
		MeteorBlogCollections.Blog.update(FlowRouter.getQueryParam('push'),{$pull:{image: this.valueOf()}});
	},
/* 	'click .newpush'(e, t) {
		var push = MeteorBlogCollections.Blog.insert({title:'Title. That will be used in Medium only for the url',html:'start editing'});
		FlowRouter.setQueryParams({push: push});
		console.log('clicked newpush', push);
	} */
	// 'click .mededitable'(e,t){
		// if (event.target.id == 'mediumtitle')
			// MeteorBlogCollections.Blog.update(FlowRouter.getQueryParam('push'),{$set:{title: event.target.innerText}});
		// else if (event.target.id == 'mediumtext')
			// MeteorBlogCollections.Blog.update(FlowRouter.getQueryParam('push'),{$set:{html: event.target.innerHTML, text: event.target.innerText}});		
		// console.log('clicked mededitable', e,t);
	// }
});

Template.blogQueue.onCreated(function () {
	var tags;
	let t = Template.instance();
	
	t.ready = new ReactiveVar();
	t.limit = new ReactiveVar(16);
	t.loaded = new ReactiveVar();
	t.sort = new ReactiveVar({createdAt: -1});
	
	t.subscribe('blog',{userId: Meteor.userId()});
	
	t.autorun(function(){	
		sub = t.subscribe('blog',{
			userId: Meteor.userId(),
			posted: false,
			limit: t.limit.get(),
			sort: t.sort.get(),
			tags: tags,
			debug: Session.get('debug')
		});
		//console.log('tours.onCreated sub', sub, t.limit.get());
	})	
	t.autorun(function(){
		if (sub)
			t.ready.set(sub.ready());
		if (t.ready.get())
			t.loaded.set(MeteorBlogCollections.Blog.find().count());
		if (Session.get('debug')) console.log('pushqueue.onCreated sub ready', t.loaded.get(), t.limit.get(), t.sort.get(), t.ready.get());
	});

	t.autorun(function(){
		t.sort.set(Session.get('sort'));
	});		
	
	t.autorun(function(){
		console.log('pushqueue.onCreated', t.ready.get(), t.loaded.get(), t.sort.get());
	});	

/*   $(window).scroll(function(){	
		checkMore(t);
	}); */
	//t.subscribe('feedback');
});
Template.blogQueue.onRendered(function () {
	let t = Template.instance();
});
Template.blogQueue.helpers({
	ready(){
		let t = Template.instance();
		return t.ready.get();
	},
	isAdmin(){
		return (Roles.userIsInRole(Meteor.userId(), ['admin'], 'admGroup')) ;
	},
	push(){
		let t = Template.instance();
		var data, list, sort;
		list = {userId: Meteor.userId(), posted: {$exists: false}};		
		sort = {sort: t.sort.get()};
		tags = _LocalTags.findOne();
		if (tags && tags.tags)
			list.tags = {$in: tags.tags};
		data = MeteorBlogCollections.Blog.find(list, sort);
		return data;
	}
});
Template.blogQueue.events({
	'click .remove'(e,t){
		MeteorBlogCollections.Blog.remove(this._id);
	}
});

Template.blogStatus.onCreated(function () {
	var tags;
	let t = Template.instance();

	t.ready = new ReactiveVar();
	t.limit = new ReactiveVar(16);
	t.next = new ReactiveVar(4);
	t.loaded = new ReactiveVar();
	t.sort = new ReactiveVar({createdAt: -1});

	t.subscribe('blog',{all: true});

	t.autorun(function(){
		sub = t.subscribe('tours',{
			userId: Meteor.userId(),
			posted: true,
			limit: t.limit.get(),
			sort: t.sort.get(),
			tags: tags,
			debug: Session.get('debug')
		});
		//console.log('tours.onCreated sub', sub, t.limit.get());
	})	
	t.autorun(function(){
		if (sub)
			t.ready.set(sub.ready());
		if (t.ready.get())
			t.loaded.set(MeteorBlogCollections.Blog.find().count());
		if (Session.get('debug')) console.log('pushqueue.onCreated sub ready', t.loaded.get(), t.limit.get(), t.sort.get(), t.ready.get());
	});

	t.autorun(function(){
		t.sort.set(Session.get('sort'));
	});
	
	t.autorun(function(){
		console.log('pushqueue.onCreated', t.ready.get(), t.loaded.get(), t.sort.get());
	});

  $(window).scroll(function(){
		//checkMore(t);
	});
	//t.subscribe('feedback');
});
Template.blogStatus.onRendered(function () {
	let t = Template.instance();
});
Template.blogStatus.helpers({
	ready(){
		let t = Template.instance();
		return t.ready.get();
	},
	isAdmin(){
		return (Roles.userIsInRole(Meteor.userId(), ['admin'], 'admGroup')) ;
	},
	push(){
		let t = Template.instance();
		var data, list, sort;
		list = {};
		sort = {sort: t.sort.get()};
		tags = _LocalTags.findOne();
		if (tags && tags.tags)
			list.tags = {$in: tags.tags};
		data = MeteorBlogCollections.Blog.find(list, sort);
		console.log('pushstatus data:', data.count(), list, sort);
		return data;
	}
});
Template.blogStatus.events({

});

Template.blogSettings.onCreated(function () {
	//Meteor.subscribe('services');
  let t = Template.instance();
	t.showTele = new ReactiveVar();
	t.errorState = new ReactiveVar();
	Meteor.call('social.facebook.roles',function(err,res){
		console.log('social.facebook.roles', err, res);
	});	
});
Template.blogSettings.onRendered(function () {
	let t = Template.instance();
});
Template.blogSettings.helpers({
	services(){
		var data = ServiceConfiguration.configurations.find();
		console.log('connectAccounts', data.fetch());
		return data;
	},
	connected(){
		var data = Meteor.user();
		console.log('connected', this.service, data, this);
		if (data && data.services)
			return 	_.contains(_.keys(data.services), this.service);
	},	
	teleconnected(){
		var data = Meteor.user();
		if (data && data.services && data.services.telegram && data.services.telegram.id)
			return 	true;
	},
	errorState(){
		let t = Template.instance();
		return t.errorState.get();
	},
	facebook(){
		var data = Meteor.user().services.facebook;
		console.log('facebook', data);
		return data;
	},
	showTele(){
		let t = Template.instance();
		return t.showTele.get();
	},
	user(){
		return Meteor.user();
	},
	schema(){
		var schema =  Schemas.SettingsFacebook;
		console.log('schema', schema);
		return schema;
	},
	options(){
		var user = Meteor.user();
		//if (!user || !user.services || !user.services.facebook || !user.services.facebook.acoounts)
			//return console.warn('no user accounts', user.services.facebook);
		var options = user.services.facebook.accounts;

    var map = _.map(options, function (c) {
      return {label: c.name, value: c.id};
    });
		console.log('options', options, map);
		return map;
	}
});
Template.blogSettings.events({
	'click facebook'(e,t){
		FB.login(function(response) {
			console.log(response);
		}, {scope: 'email,user_likes,publish_actions,publish_pages'});		
	},
  'click .connectfacebook'(e,t) {
		t.errorState.set();
		Meteor.linkWithFacebook({requestPermissions: ['user_friends', 'email', 'publish_actions']}, (err, r)=> {
			console.log('linkWithFacebook', err, r);
			if (err)
				t.errorState.set(err.error);
			else
				t.errorState.set();
		});
  },
  'click .connectgoogle'(e,t) {
    Meteor.linkWithGoogle({},(err,r)=> {
			if (err)
				t.errorState.set(err.error);
			else
				t.errorState.set();
		});
  }, 
	'click .connecttwitter'(e,t) {
    Meteor.linkWithTwitter({}, (err,r)=> {
      console.log( err, r, this);
    });
  },		
	'click .connectmedium'(e,t) {
    Meteor.linkWithMedium({}, (err,r)=> {
      console.log( err, r, this);
    });
  },		
	'click .connecttelegram'(e,t) {
		t.showTele.set(!t.showTele.get());
		Meteor.call('social.telegram.getme');
		console.log( e, this);
  },	
  'click .disconnect'(e,t) {
		console.log('clicked disconnect', this.service, this);
    Meteor.call('social.unlink', {serviceName: this.service});
  }, 
	'submit'(e,t){
		e.stopPropagation();	
		console.log('submit', e, this);
		Meteor.call('social.facebook.roles',function(err,res){
			console.log('social.facebook.roles', err, res);
		});	
	}
});

Template.blogImages.onCreated(function () {
	let t = Template.instance();
  t.state = new ReactiveDict();
	t.vrloading = new ReactiveVar();
	t.showtime = new ReactiveVar();
	t.sortPano = new ReactiveVar( 'date' );
	t.selectUsed = new ReactiveVar();
	t.ready = new ReactiveVar();
	t.next = new ReactiveVar(6);
	t.limit = new ReactiveVar(6);
	t.sort = new ReactiveVar({createdAt: -1});
	t.loaded = new ReactiveVar(0);
	
	if (Session.get('sort'))
		t.sort.set(Session.get('sort'));	
	
	var sub;

	t.autorun(function(){
		var tags = [];
		if (_LocalTags.findOne() && _LocalTags.findOne().tags) 
			tags = _LocalTags.findOne().tags;
		sub = PostSubs.subscribe('blogimages',{
			caller: 'blogImages.onCreated',
			userId: Meteor.userId(),
			tags: tags,
			unused: t.selectUsed.get(),
			limit: t.limit.get(),
			sort: t.sort.get()
		});
		t.ready.set(sub.ready());
		console.log('pushimages.onCreated sub images', t.selectUsed.get(), t.loaded.get(), t.limit.get(), t.sort.get(), t.ready.get());
	})	
	t.autorun(function(){
		if (!t.ready.get())
			return;
		t.loaded.set(MeteorBlogCollections.BlogImages.find().count());
		dragImg();
		if (Session.get('debug')) console.log('pushimages.onCreated sub ready', t.selectUsed.get(), t.loaded.get(), t.limit.get(), t.sort.get(), t.ready.get());
	})
	

});
Template.blogImages.onRendered(function () {
	let t = Template.instance();
	var vrView, data;
	Session.set('selectDate', false);
	
/* 	$('#datepicker').val('');
	
	t.autorun(function(){
		if (!t.ready.get())
			return;
		
		imgOnScroll();
		data = MeteorBlogCollections.BlogImages.find({userId: Meteor.userId()},{sort: t.sort.get()});	
		//t.loaded.set(data.count());
		//console.log('userpanos.onRendered loaded data', data.count());
		
		if (!data || $('#datepicker').hasClass('hasDatepicker'))
			return console.warn('userpanos.onRendered datepicker NOT', data.count());
		
		// if (!$('#datepicker').hasClass('hidden'))
			// $('#datepicker').val(data.createdAt.toLocaleDateString());
		$('#datepicker').datepicker(
			{
				autoclose: true,
				todayHighlight: true,
			}
		);
		$('#datepicker').addClass('hasDatepicker');
			
		//$('#datepicker').datepicker('update',data.createdAt);		
		//console.log('datepicker YES', data, data.createdAt.toLocaleDateString(), $('#datepicker').val(), Session.get('selectDate')	);
	}); */
	

  $(window).scroll(function(){
		//imgOnScroll();	
		//checkMore(t);
  });

	
	// make panos selectable
	var prev = -1;
/* 	$( '#selectablePanos' ).selectable({
			filter: ".selectablePano",
			selecting: function(e, ui) { // on select
				console.log('selecting 0', e, ui, this, $(this).find('.panoId').attr('alt'));
					var curr = $(ui.selecting.tagName, e.target).index(ui.selecting); // get selecting item index
					if(e.shiftKey && prev > -1) { // if shift key was pressed and there is previous - select them all
							$(ui.selecting.tagName, e.target).slice(Math.min(prev, curr), 1 + Math.max(prev, curr)).addClass('ui-selected');
							prev = -1; // and reset prev
					} else {
							prev = curr; // othervise just save prev
					}
			},
		 selected: function(e,ui) { 
			console.log('selecting 1', e, ui, this, $(this).find('.panoId').attr('alt'));
			var result = $( "#result" ).empty();
			$( ".ui-selected", this ).each(function() {
				 var index = $( "#selectable-7 li" ).index( this );
				 result.append( " #" + ( index + 1 ) );
			});
		 },
		stop: function(e,ui) {   
			console.log('selecting 2', e, ui, this, $(this).find('.panoId').attr('alt'));
			$(".ui-selected input", this).each(function() {
				this.checked= !this.checked;
				console.log('selected2', this, $(this).find('.checkedBox'));
			});
			
		},
		cancel: ":input,option,a,.nonselectable"
	});	 */
});
Template.blogImages.onDestroyed(function () {
	//$('#datepicker').datepicker('destroy');
});
Template.blogImages.helpers({
	isMore(){
		let t = Template.instance();
		if (t.loaded.get() < 8 && t.limit.get() < 16)
			return true;
		return (t.limit.get() - t.next.get() <= t.loaded.get());
	},
	isReady() {
		let t = Template.instance();
		if (Session.get('debug')) console.log('pushimages isReady', t.ready.get(), 'vars:', t.selectUsed.get(), t.limit.get(), t.sort.get(), t.loaded.get() );
		return t.ready.get();
	},
	loaded(){
		let t = Template.instance();
		return t.loaded.get();
	},
	selectUsed(){
		let t = Template.instance();
		t.selectUsed.set(Session.get('selectUsed'));
		return t.selectUsed.get();
	},
	sorted(){
		var sort;
		//if (Session.get('sort').createdAt)
			sort = 'date';
		//else if (Session.get('sort').file)
		//	sort = 'filename';
		return sort;	
	},
	selectTag(){
		let t = Template.instance();
		var data = _LocalTags.findOne();
		if (data)
			return data.tags;
	},
	images(){
		let t = Template.instance();
		var prouser, data, sort, list, tags, images;
		if (!Meteor.userId())
			return;
		
		if (Session.get('selectDate') && prouser) 
			list = {$or: [{userId: prouser.userId}, {userId: Meteor.userId()}], createdAt: selectDate(Session.get('selectDate'))};	
		else if (prouser) 
			list = {$or: [{userId: prouser.userId}, {userId: Meteor.userId()}]};
		else 
			list = {userId: Meteor.userId()};	
		
		tags = _LocalTags.findOne();
		if (tags && tags.tags && tags.tags.length)
			list.tags = {$in: tags.tags};
		if (t.selectUsed.get())
			list.tour_id = {$exists: false};
		
		images = MeteorBlogCollections.Blog.findOne(FlowRouter.getQueryParam('push'));
		if (images && images.image && images.image.length)
			list._id = {$nin: images.image};		

		t.sort.set(Session.get('sort'));
		sort = {sort: t.sort.get()};
		
		data = MeteorBlogCollections.BlogImages.find(list,sort);
		//if (Session.get('debug')) console.log('panos', 'list:', list, 'sort:', sort, 'pro:', prouser, '\ndata:', data.count(), this, '\n\n'); 
		imgOnScroll();
		//t.loaded.set(data.count());
		return data;
	},
	tags(){
		var data = MeteorBlogCollections.BlogImages.find({userId: Meteor.userId()},{fields: {tags: 1}}).fetch();
		var alltags=[];
		_.map(_.pairs(_.countBy(_.compact(_.flatten(_.pluck(data,'tags'))))),function(obj){alltags.push({tag: obj[0], count: obj[1]})});
		alltags = _.reject(alltags,function(tag){ return tag.count < 2; });
		alltags.reverse();
		console.log('userpanos tags', alltags.length, alltags);
		return alltags;
	},
	usedTimes(){
		if (this.pushit)
			return this.pushit.length;
	},
	date(){
		return moment(this.createdAt).format('LLL');
	},
	dataImg(){
		return this.url.replace(/upload/, 'upload/' + Meteor.settings.public.cloudinary.options.scaled	);
	},
});
Template.blogImages.events({
	'click #infiniteCheck'(e,t){
		t.limit.set(t.limit.get() + t.next.get());
	},	
	'click .publish' ( e, t ) {
		
		//MeteorBlogCollections.Blog.update(FlowRouter.getQueryParam('push'),{$addToSet:{image: this._id}});
		let node = document.createElement("p");    
		node.id = this._id;
		let img = document.createElement("img");       
		let upload = 'upload/c_limit,f_auto,fl_progressive:steep,h_256,q_auto,w_512';
		img.src = this.url.replace(/upload/, upload );
		node.appendChild(img); 
		document.getElementById("mediumtext").appendChild(node);
		$('#mediumtext').find('img').addClass('img-fluid');
		$(this._id).addClass('blogImg');
		MeteorBlogCollections.BlogImages.update(this._id, {$addToSet: {pushit: FlowRouter.getQueryParam('push')}});
		console.log('click publish pushimages', this, upload, node, img);
	},	
	'click .updateTag'(e,t){
		console.log('click updateTag', this);
		var selected = []
	},
	'click .selectTags'(e,t){
		e.stopPropagation();
		var data;
		data = _LocalTags.findOne();
		console.log('clicked selectTags', this);
	},	
	'click .removeTag'(e,t){
		e.stopPropagation();
		var data = _LocalTags.findOne();
	},
	'click .remove' ( e, t ) {
		console.log('clicked remove', this._id, e.target.id, '\this:', this, e, t.data);
		MeteorBlogCollections.BlogImages.remove(this._id);
	},	
	'click .selectUsed'(e,t){
		t.selectUsed.set(!t.selectUsed.get());
	},	
	'click .viewImg' (e,t){
		console.log('viewpano', this);
		this.dataImg = this.url.replace(/upload/, 'upload/' + Meteor.settings.public.cloudinary.options.scaled	);
		Modal.show('viewpanoModal', this);
	},
});

Template.blogImagesAdd.helpers({
	collection(){
		var data = MeteorBlogCollections.BlogImages;
		console.log('pushit collection', data);
		return data;
	},	
	schema(){
		var data = MeteorBlogSchemas.BlogImages;
		console.log('pushit schema', data);
		return data;
	},	
});

Template.blogAggregated.onCreated(function () {
	window.prerenderReady = false;
	let t = Template.instance();
	t.mediumeditor = new ReactiveVar();
  
  t.subscribe('blogservice');
  t.subscribe('bloguser');
	t.user = new ReactiveVar();
	t.ready = new ReactiveVar();
	t.limit = new ReactiveVar(16);
	t.next = new ReactiveVar(16);
	t.loaded = new ReactiveVar();
	t.sort = new ReactiveVar({createdAt: -1});
	
	var list;
	
	t.autorun(()=>{
		var list, sub;
		if (FlowRouter.getQueryParam('select') == 'aggregated')
			list = {aggregated: true};
		else
			list = {blog: true};
		list.limit = t.limit.get();
		list.sort = t.sort.get();
		//list.tags = tags;
		list.debug = Session.get('debug');
		var sub = t.subscribe('blog', list);
		t.ready.set(sub.ready());
	});
	
	t.autorun(()=>{
		if (!t.ready.get())
			return;
		var posts = MeteorBlogCollections.Blog.find();
		if (!posts.count()) return;
		t.loaded.set(posts.count());
		var images = _.flatten(posts.fetch().image);
		if (!images || !images.length) return;
		console.log('oncreated posts', posts.count(), images);
		t.subscribe('blogimages',{_id: {$in: images}});
	});
	t.autorun(()=>{
		if (!t.loaded.get())
			return;
		window.prerenderReady = true;
	});
	//t.subscribe('feedback');
});
Template.blogAggregated.onRendered(function () {
	let t = Template.instance();	
	t.autorun(() => {
		if (!t.user.get()) return;
		var host = 'https://' + window.location.host;
		var data = {};
		data.title = '360 Virtual Tours blog';
		data.description = 'ALl you need to know about 360 photography and 360 Virtual Tours: the Blog';
		var image = host + '/img/vr_bck2.jpg';
		var seo = {
			title: data.title,
			description: data.profile.description,
			meta: {
				'name': data.title,
				'description': data.description,
				'property="og:title"': data.title,
				'property="og:description"': data.description,
				'property="og:url"': document.URL,
				'property="og:image"': image,
				'name="twitter:title"': data.title,
				'name="twitter:description"': data.description,
				'name="twitter:image"': image,
			}
		}
		$('meta[name=description]').remove();
		$('meta[property="og:title"]').remove();
		$('meta[property="og:description"]').remove();
		$('meta[property="og:image"]').remove();
		$('meta[property="og:url"]').remove();
		$('meta[name="twitter:title"]').remove();
		$('meta[name="twitter:description"]').remove();
		$('meta[name="twitter:image"]').remove();
		SEO.set(seo);
	});
	
  $(window).scroll(function(){	
		//checkMore(t);
	});
});
Template.blogAggregated.helpers({
	ready(){
		let t = Template.instance();
		return t.ready.get();
	},	
	selector(){
		//let t = Template.instance();
		//console.log('selector', t.selector.get());
		//return t.selector.get();
		return FlowRouter.getQueryParam('push');
	},
	services(){
		var data = ServiceConfiguration.configurations.find({service: {$ne: 'google'}});
		console.log('connectAccounts', data.fetch());
		return data;
	},		
	posts(){
		var aggr, data, list, sort, site;
		sort = {sort: {createdAt: -1}};
		list = {aggregated: true, draft: true};
		data = MeteorBlogCollections.Blog.find(list, sort);
		if (Session.get('debug')) console.log('[blogAggregated.helpers] data', data.count(), data.fetch(), this);
		return data;
	},		
	ready(){
		let t = Template.instance();
		return t.ready.get();
	},	
	htmlCut(){
		let txt = $('img', $(this.html)).remove().end().text();
		txt = txt.substr(0,260) + '...';
		console.log('[blogContent.helpers] htmlCut', txt, this.html);
		return txt;	
	},
	img(){
		let url;
		if (!this.image || !this.image.length) 
			url = 'https://res.cloudinary.com/orangry/image/upload/c_thumb,w_600,g_face/v1553633438/hundredgraphs/news.jpg';
		else 
			url = this.image[0];
			
		console.log('[blogContent.helpers] img', url, this.image, this);
		return url;
	},
	schema(){
		return MeteorBlogSchemas.BlogPullMedium
	},
	formdefault(){
		formdefault = {};
		formdefault.q = 'Smart Home';
		formdefault.action = 'tag';
		return formdefault;
	},
	debug(){
		if (Session.get('debug')) console.log('blog data debug', this);
	}
});
Template.blogAggregated.events({
	'click .service'(e,t){	
		//console.log('clicked service', e, this);
		e.stopPropagation();
		var updated;
		var service = this.service || 'telegram';
		var data = MeteorBlogCollections.Blog.findOne({_id: FlowRouter.getQueryParam('push'), services: service});
		if (!data)
			updated = MeteorBlogCollections.Blog.update(FlowRouter.getQueryParam('push'),{$addToSet:{services: service}});
		else
			updated = MeteorBlogCollections.Blog.update(FlowRouter.getQueryParam('push'),{$pull:{services: service}});
		if (Session.get('debug')) console.log('click service', service, updated, 'data:', data, MeteorBlogCollections.Blog.findOne(FlowRouter.getQueryParam('push')), 'this:', this, '\n');	
	},
	'click .schedule'(e,t){
		var text = $('.mededitable').each(function(){console.log(this.innerText)});
		var mediumtitle = $('#mediumtitle').text();
		var mediumtext = {html: $('#mediumtext').html(), text: $('#mediumtext')[0].innerText};
		if (Session.get('debug')) console.log('click schedule 1', e, mediumtitle, mediumtext);	
		MeteorBlogCollections.Blog.update(FlowRouter.getQueryParam('push'),{$set:{title: mediumtitle, html: mediumtext.html, text: mediumtext.text}});
		console.log('click schedule 2', e, mediumtext);	
	},
	'click .ban'(e,t){
		if (Session.get('debug')) console.log('clicked remove', this);
		let creator = MeteorBlogCollections.BlogUsers.findOne({creatorId: this.creatorId});
		if (creator) MeteorBlogCollections.BlogUsers.update({_id: creator._id},{$set:{ban:true}});
	},
	'click .remove'(e,t){
		if (Session.get('debug')) console.log('clicked remove', this);
		//MeteorBlogCollections.Blog.remove({_id: this._id});
		MeteorBlogCollections.Blog.update({_id: this._id},{$set: {blacklist: true}});
	},
	'click .newpush'(e, t) {
		FlowRouter.go('/pushit');
		FlowRouter.setQueryParams({select: 'content'});
		var push = MeteorBlogCollections.Blog.insert({title:'Title. That will be used in Medium only for the url', html:'click to start editing', draft: true});
		FlowRouter.setQueryParams({push: push});
		$('html, body').animate({scrollTop: $('body').offset().top -150 }, 'slow');
	},
	'click a'(){
		$('html, body').animate({scrollTop: $('body').offset().top -150 }, 'slow');		
	}
});

