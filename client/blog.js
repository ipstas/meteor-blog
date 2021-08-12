//import moment from 'moment';
//import moment-timezone from 'moment-timezone';
import moment from 'moment';
import $ from 'jquery';
import 'jquery-ui-bundle';
//import {FlowRouterSEO} from 'meteor/tomwasd:flow-router-seo';
//const SEO = new  FlowRouterSEO;
//import 'meteor/aldeed:autoform-bs-datetimepicker';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import {MediumEditor} from 'meteor/mediumeditor:mediumeditor';
//import MediumEditorInsert from 'medium-editor-insert-plugin';
//require('medium-editor-insert-plugin')($);
//window.MediumEditor = MediumEditor;

import {MeteorBlogCollections} from '../common/collections.js';
window.MeteorBlogCollections = MeteorBlogCollections;
import {MeteorBlogSchemas} from '../common/collections.js';
import '../client/blog.html';
const _LocalTags = new Mongo.Collection(null);

import { hooksObject } from '../common/hooks.js';
import { hooksAddPost } from '../common/hooks.js';
import { hooksPullMedium } from '../common/hooks.js';
AutoForm.addHooks('datePushForm', hooksObject);
AutoForm.addHooks('pullMediumForm', hooksPullMedium);

//import {infCheck} from './functions';
//import {checkMore} from './functions';

import {setSort} from './functions';
import { datepickerInit } from './functions';
import { setSelectDate } from './functions';
import { selectDate } from './functions';
import { imgOnScroll } from './functions';

import {dragImg} from './functions';

const initcount = 6;
const increment = 3;

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
		diffLeft: 10,
		diffTop: 10,
		firstButtonClass: 'medium-editor-button-first',
		lastButtonClass: 'medium-editor-button-last',
		relativeContainer: null,
		standardizeSelectionStart: false,
		//static: true,
		//align: 'center',
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
				'orderedlist',
				'unorderedlist',
				'indent',
				'outdent',
				'justifyLeft',
				'justifyCenter',
				'justifyRight',
				'removeFormat',
				'quote',
				'anchor',
				'image',
				'html'
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
	{ id: 'edit', color: 'info', title:'New', val:'blogEdit'},
	{ id: 'queue', color: 'info', title:'Queue', val:'blogQueue'},
	{ id: 'status', color: 'info', title:'Status', val:'blogStatus'},
	{ id: 'settings', color: 'info', title:'Settings', val:'blogSettings'},
];

Template.blogIt.onCreated(function () {
	window.prerenderReady = false;
	let t = Template.instance();
  // t.state = new ReactiveDict();
	// t.hidden = new ReactiveVar();
	// t.ready = new ReactiveVar();
	// t.next = new ReactiveVar(4);
	// t.limit = new ReactiveVar(8);
	//if (!FlowRouter.getQueryParam('select')) FlowRouter.setQueryParams({select: 'content'});
	t.selector = new ReactiveVar();
	t.editselector = new ReactiveVar();
	t.selectTag = new ReactiveVar();
	t.mediumeditor = new ReactiveVar();
	t.autorun(()=>{
		if (!FlowRouter.getQueryParam('post')) return;
		let params = {caller: 'blogIt.onCreated', _id: FlowRouter.getQueryParam('post'), debug: Session.get('debug')};
		PostSubs.subscribe('blog', params);	
	})

	if (Session.get('debug')) console.log('[blogIt.onCreated] data', t.data);

});
Template.blogIt.onRendered(function () {
	let t = Template.instance();
});
Template.blogIt.helpers({
	typeBtn(){
		return typeBtn;
	},
	ready(){
		let t = Template.instance();
		return t.ready.get();
	},
	selector(){
		let t = Template.instance();
		let selector = _.findWhere(typeBtn, {id: FlowRouter.getQueryParam('select')}) || typeBtn[0];
		//console.log('[selector]', selector);
		return selector;
	},
	data(){
		if (!FlowRouter.getQueryParam('post')) return; 
		//var data = MeteorBlogCollections.Blog.findOne({_id: FlowRouter.getQueryParam('post')});
		var data = {_id: FlowRouter.getQueryParam('post')};
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
		console.log('[blogIt.events] clicked cursor', e.target.id, this);		
		if (this.id == 'edit'){
			e.preventDefault();
			let inserted = MeteorBlogCollections.Blog.insert({
				postid: Random.id(5),
				title:'Title. Make it nice and meaningful', 
				html:'click to start editing', 
				draft: true, 
				userId: Meteor.userId(), 
				scheduledAt: new Date()
			});
			FlowRouter.setQueryParams({select: 'edit', post: inserted});		
			console.log('[blogIt.events] typeBtn', this, inserted);
		} else if (this._id == 'content')
			FlowRouter.setQueryParams({select: null, post: null});	
			
	},
	'click .soon'(e,t){
		Bert.alert('this feature is coming soon', 'info');
	},
});

Template.blogTags.onCreated(function () {
	window.prerenderReady = false;
	let t = Template.instance();
  t.tags = new ReactiveVar();
	Meteor.call('blog.aggregate.tags',(e,r)=>{		
		if(e) return console.warn('[blog.aggregate.tags] err', e);
		t.tags.set(r[0].tags);
		//console.log('[blog.aggregate.tags]', e,r, r[0].tags, t.tags.get());
	});
	
});
Template.blogTags.onRendered(function () {

});
Template.blogTags.helpers({
	tags(){
		let t = Template.instance();
		//console.log('[blogTags.helpers] tags:', t.tags.get());
		return _.first(t.tags.get(), 20);
	},
});
Template.blogTags.events({
	'click .soon'(e,t){
		Bert.alert('this feature is coming soon', 'info');
	},
});

Template.blogContent.onCreated(function () {
	window.prerenderReady = false;
	
	let t = Template.instance();
	t.ready = new ReactiveVar();
	t.limit = new ReactiveVar(initcount);
	t.next = new ReactiveVar(increment);
	t.count = new ReactiveVar(0);
	t.loaded = new ReactiveVar();
	t.sort = new ReactiveVar({createdAt: -1});
	let sub;
	
	if (Session.get('debug')) console.log('[blogContent.onCreated] data', t.data, t.count.get(), t.limit.get());
		
	t.autorun(()=> {
		if (!t.ready.get()) return;
		var limit = parseInt(FlowRouter.getQueryParam('more')) || initcount;
		if (limit > t.limit.get())
			t.limit.set(limit);
	});
	t.autorun(()=>{	
		let params = {caller: 'blogContent.onCreated', blog: true, tag: FlowRouter.getQueryParam('tag'), limit: t.limit.get(), debug: Session.get('debug'), languages: navigator.languages};
		sub = PostSubs.subscribe('blog', params);
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
	tag(){
		return FlowRouter.getQueryParam('tag');
	},
	request(){
		return Session.get('request');
	},
	posts(){
		let t = Template.instance();
		let tag = FlowRouter.getQueryParam('tag');
		let list = {scheduledAt: {$lt: new Date()}, draft:{$ne: true}};
		if (tag)
			list.tags = tag;
		let data = MeteorBlogCollections.Blog.find(list,{sort: {scheduledAt: -1}});
		if (data.count()) 
			window.IS_RENDERED = true;

		if (data.count() > t.count.get())
			t.count.set(data.count());	

		return data;
	},		
	htmlCut(){
		let txt = $('img', $(this.html)).remove().end().text();
		txt = txt.substr(0,260) + '...';
		//console.log('[blogContent.helpers] htmlCut', txt, this.html);
		return txt;	
	},
	img(){
		window.IS_RENDERED = true;
		let url;
		if (this.image && this.image.length)
			url = this.image[0];
		url = $('img', $(this.html)).attr('src') || url || 'https://res.cloudinary.com/orangry/image/upload/c_thumb,w_600,g_face/v1553633438/hundredgraphs/news.jpg';
		//if (Session.get('debug')) console.log('[blogContent.helpers] img', url, this);
		return url;
	},
	showMore(){
		let t = Template.instance();
		if (!t.ready.get()) return;
		if (Session.get('debug')) 
			console.log('[blogContent.helpers] showMore:', t.limit.get() <= t.count.get(), 'limit:', t.limit.get(), 'count:', t.count.get());
		return t.limit.get() <= t.count.get();
	},
	more(){
		let t = Template.instance();
		let more = parseInt(FlowRouter.getQueryParam('more')) || t.limit.get(); 
		more = more + t.next.get();
		console.log('[blogContent.helpers] more', parseInt(FlowRouter.getQueryParam('more')) || t.limit.get(), more, this);
		return more;
	},
	showMoreClass(){
		let t = Template.instance();
		if (!t.ready.get()) return;
		if (Session.get('debug')) 
			console.log('[blogContent.helpers] showMore:', t.limit.get() <= t.count.get(), 'limit:', t.limit.get(), 'count:', t.count.get());
		if (t.limit.get() <= t.count.get());
			return 'loadMore pointer'
		return 'disabled text-muted'
	},
	debug(){
		console.log('[blogContent.helpers] debug', this);
	}
});
Template.blogContent.events({
	'click .nohref'(e,t){
		//e.preventDefault();
		//e.stopPropagation();
	},
	'click .loadMore'(e,t){
		//e.preventDefault();
		//e.stopPropagation();
		if (Session.get('debug')) console.log('clicked more', FlowRouter.getQueryParam('more'), t.next.get(), t.count.get());
		let more =  parseInt(FlowRouter.getQueryParam('more')) || t.limit.get(); 
		FlowRouter.setQueryParams({more: more + t.next.get()});
		Meteor.setTimeout(()=>{
			//window.scrollTo(0,document.body.scrollHeight);
			$('html, body').animate({scrollTop: $(window).scrollTop() + window.innerHeight / 3}, 'slow');
		},500)
	},	
	'click .pullMore'(e,t){
		e.preventDefault();
		e.stopPropagation();
		if (Session.get('debug')) console.log('clicked pullMore', this);
		Session.set('request', true);		
		Meteor.call('social.medium.pull.tag',{q: this.valueOf()},(e,r)=>{
			if (e) Bert.alert(doc.action + ' ' + e.error, 'danger');
			console.log('[hooksPullMedium] e:', e, '\nr', r);
			if (r && r.inserted){	
				Bert.alert('received ' + r.inserted + 'new articles', 'success');
				FlowRouter.go('/blog?select=aggregated');
			} else
				Bert.alert('No new articles', 'info');
			Session.set('request');
		})		
	},
});

Template.blogImage.onCreated(function () {
	window.prerenderReady = false;
	let t = Template.instance();	
	let params = {caller: 'blogImage.onCreated', posts: [this._id]};
	PostSubs.subscribe('blogimages', params);
});
Template.blogImage.helpers({
	img(){
		let url = '/img/loading.gif';
		let data = MeteorBlogCollections.BlogImages.findOne({posts: this._id});
		if (data)
			url = data.url.replace(/upload/,'upload/c_thumb,w_200,g_face');
		console.log('[blogImage.helpers] img', data, this);
		return url;
	}
});

Template.blogPost.onCreated(function () {
	window.prerenderReady = false;
	$("html, body").animate({ scrollTop: 0 }, "slow");
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
		var keywords = data.tags;
/* 		var seo = {
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
		SEO.set(seo); */
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
		return (Roles.userIsInRole(Meteor.userId(), ['admin', 'editor'], 'admGroup')) ;
	},
	post(){
		let t = Template.instance();
		var data = MeteorBlogCollections.Blog.findOne({postid: FlowRouter.getParam('postid')});
		if (Session.get('debug')) console.log('blogpost data', data, this);
		t.blog.set(data);
		let title = 'HundredGraphs, visualize your IoT data.';
		if (data){
/* 			SEO.set({
				title: 'Blog @HundredGraphs. ' + data.title + ' ' + title
			});		 */
			window.prerenderReady = true;
		}

		return data;
	},		
	author(){
		return this.userId == Meteor.userId();
	},
	img(){
		let t = Template.instance();
		var img;
		if (this.image && this.image.length)
			img = this.image[0];
		if (img && img.match('cloudinary'))
			img = img.replace(/upload/, 'upload/' + Meteor.settings.public.cloudinary.options.preview	);
		console.log('[blogPost.helpers] img', img, this, '\n'); 
		window.IS_RENDERED = true;
		return img;
	},
	checkedDraft(){
		if (!this.draft) return 'checked';
	},
	checkedUser(){
		if (this.ban) return 'checked';
	},
	checkedHide(){
		if (this.blacklist) return 'checked';
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
	'click .schedule'(e,t){
		var text = $('.mededitable').each(function(){console.log(this.innerText)});
		var mediumtitle = $('#mediumtitle').text();
		var mediumtext = {html: $('#mediumtext').html(), text: $('#mediumtext')[0].innerText};
		console.log('click schedule 1', e, mediumtitle, mediumtext);	
		MeteorBlogCollections.Blog.update({_id: this._id},{$set:{title: mediumtitle, html: mediumtext.html, text: mediumtext.text}});
		console.log('click schedule 2', e, mediumtext);	
	},
	'click .remove'(e,t){
		console.log('clicked remove', this);
		MeteorBlogCollections.Blog.remove({_id: this._id});
		history.go(-1);
	},	
	'click .blacklist'(e,t){
		console.log('clicked blacklist', this);
		MeteorBlogCollections.Blog.update({_id: this._id}, {$set: {blacklist: true}});
	},	
	'change #draft'(e,t){
		console.log('clicked draft', e.target.checked, this);
		doc.postid = doc.title.replace(/[^\x00-\x7F]/g, '').replace(/\s+/g, '_') + '_' + Random.id(3);
		MeteorBlogCollections.Blog.update({_id: this._id}, {$set: {draft: !e.target.checked}});
	},
	'click a'(){
		$('html, body').animate({scrollTop: $('body').offset().top -150 }, 'slow');		
	},
	'change #ban'(e,t){
		if (Session.get('debug')) console.log('clicked ban', this);
		let creator = MeteorBlogCollections.BlogUsers.findOne({creatorId: this.creatorId});
		if (creator) MeteorBlogCollections.BlogUsers.update({_id: creator._id},{$set:{ban:e.target.checked}});
	},
	'change #hide'(e,t){
		if (Session.get('debug')) console.log('clicked remove', this);
		MeteorBlogCollections.Blog.update({_id: this._id},{$set: {blacklist: true}});
	},
});

Template.blogPostContent.onCreated(function () {
	window.prerenderReady = false;
	let t = Template.instance();
	t.ready = new ReactiveVar();
	t.limit = new ReactiveVar(16);
	t.loaded = new ReactiveVar();
	t.sort = new ReactiveVar({createdAt: -1});
	let sub;
	
	//console.log('[blogContent.onCreated] data', t.data);
		
	t.autorun(()=>{	
		let params = {caller: 'blogContent.onCreated', blog: true, tag: FlowRouter.getQueryParam('tag'), limit: 4};
		sub = t.subscribe('blog', params);
		//console.log('[blogContent.onCreated] sub:', params, t.data);
		t.ready.set(sub.ready());
	});
});
Template.blogPostContent.onRendered(function () {
	let t = Template.instance();	
});
Template.blogPostContent.helpers({
	markup(){
		console.log('[blogPostContent] markup', this);
		if (this.metadata)
			return 'markImg';
		else if (this.type == 3)
			return 'h2'
		else if (this.type == 4)
			return 'text-muted h6 '
		else if (this.markups.length && this.markups[0].type == 1)
			return 'h3'
	
	},
	img(){
		console.log('[blogPostContent] img', this);
		if (!this.aggregated)
			return;
		let url = 'https://cdn-images-1.medium.com/max/1000/' + this.id;
		return url;
	}
});
Template.blogPostContent.events({
	'click .up'(e,t){
		Bert.alert('coming soon');
	},
	'click .down'(e,t){
		Bert.alert('coming soon');
	},
});

Template.blogBottom.onCreated(function () {
	window.prerenderReady = false;
	let t = Template.instance();
	t.ready = new ReactiveVar();
	t.limit = new ReactiveVar(16);
	t.loaded = new ReactiveVar();
	t.sort = new ReactiveVar({createdAt: -1});
	let sub;
	
	//console.log('[blogContent.onCreated] data', t.data);
		
	t.autorun(()=>{	
		let params = {caller: 'blogContent.onCreated', blog: true, tag: FlowRouter.getQueryParam('tag'), limit: 4};
		sub = t.subscribe('blog', params);
		//console.log('[blogContent.onCreated] sub:', params, t.data);
		t.ready.set(sub.ready());
	});
});
Template.blogBottom.onRendered(function () {
	let t = Template.instance();	
});
Template.blogBottom.helpers({
	ready(){
		let t = Template.instance();
		return t.ready.get();
	},
	tag(){
		return FlowRouter.getQueryParam('tag');
	},
	posts(){
		let t = Template.instance();
		let data = MeteorBlogCollections.Blog.find({postid: {$ne: FlowRouter.getParam('postid')}, scheduledAt: {$lt: new Date()}, draft:{$ne: true}},{sort: {createdAt: -1}, limit: 3});
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
Template.blogBottom.events({
	'click .up'(e,t){
		Bert.alert('coming soon');
	},
	'click .down'(e,t){
		Bert.alert('coming soon');
	},
});

Template.blogEdit.onCreated(function () {
	window.prerenderReady = false;
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
	let params = {caller: 'blogEdit.onCreated', _id: t.data._id, debug: Session.get('debug')};
	PostSubs.subscribe('blog', params);	
});
Template.blogEdit.onRendered(function () {
	let t = Template.instance();
	
	t.autorun((computation)=>{
		//if (!t.data) return;
		let self = MeteorBlogCollections.Blog.findOne({_id: t.data._id});
		if(!self) return;
		let set;
		//console.log('[blogEdit.onRendered] data:', self, $('#mediumtitle'));
		$('#mediumtitle').text(self.title);
		$('#mediumtext').html(self.html);
		blogEditor();	
		editor.subscribe('editableInput', function (event, editable) {
			if ($(event.target).hasClass('mediumtitle'))
				set = {title: event.target.innerText}
			else
				set = {html: event.target.innerHTML}
			if (self.postid.length <= 5) {
				set.postid = set.title || self.title
				set.postid = set.postid.replace(/[^\x00-\x7F]/g, '').replace(/\s+/g, '_') + '_' + self._id;
				$('input[name=postid]').val(set.postid);
			}
			console.log('[blogEdit.onRendered] editableInput:', self.postid, self.postid.length, '\nself:', self, '\nevent:', $(event.target).hasClass('mediumtitle'), event.target.innerHTML, event, editable);
			MeteorBlogCollections.Blog.update({_id: self._id},{$set: set});
		});				
		computation.stop();
	})

	console.log('[blogEdit.onRendered] mediumeditor', $('#mediumtext').html(), editor);			
	
});
Template.blogEdit.helpers({
	ready(){
		let t = Template.instance();
		return t.ready.get();
	},
	isAdmin(){
		return (Roles.userIsInRole(Meteor.userId(), ['admin', 'editor'], 'admGroup')) ;
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
		return MeteorBlogCollections.Blog;
	},	
	schema(){
		var data = MeteorBlogSchemas.Blog;
		//console.log('pushit schema', data);
		return data;
	},
	day(){
		return new Date(Date.now() + 1000*60*60*24);
	},
	post(){
		let post = MeteorBlogCollections.Blog.findOne(this._id);
		return post;
	},		
	debug(){
		console.log('[blogEdit.helpers] debug:', this);
	}
});
Template.blogEdit.events({
	'click .mededitable'(e,t){
		//blogEditor();
	},
	'click img'(e,t){
		console.log('[blogEdit.events] img', this, e)
		//if (e.currentTarget.id != 'mediumtext') return;
		
		let target = $(e.target);   
		target.addClass('img-fluid');
		target.parents('p').css({'text-align': 'center'}).addClass('w-100');
		if (target.hasClass('w-50'))
			target.removeClass('w-50').addClass('w-75');
		else if (target.hasClass('w-75'))
			target.removeClass('w-75').addClass('w-100');
		else if (target.hasClass('w-100'))
			target.removeClass('w-100').addClass('w-50');
		else
			target.addClass('w-50');
		console.log('[blogEdit.events] 2 img', this, target, e.target);
	},
	'click .service'(e,t){	
		//console.log('clicked service', e, this);
		e.stopPropagation();
		var updated;
		var service = this.service || 'telegram';
		var data = MeteorBlogCollections.Blog.findOne({_id: this._id, services: service});
		if (!data)
			updated = MeteorBlogCollections.Blog.update({_id: this._id},{$addToSet:{services: service}});
		else
			updated = MeteorBlogCollections.Blog.update({_id: this._id},{$pull:{services: service}});
		console.log('click service', service, updated, 'data:', data, MeteorBlogCollections.Blog.findOne(this._id), 'this:', this, '\n');	
	},
	'click .schedule'(e,t){
		//e.preventDefault();
		//editor.destroy();
		let doc = {};
		doc.title = $('#mediumtitle').text();
		doc.html = $('#mediumtext').html();	
		doc.title = doc.title.replace(/\n|\r/g,'');
		if (doc?.postid?.length <= 5)
			doc.postid = doc.postid || doc.title.replace(/[^\x00-\x7F]/g, '').replace(/\s+/g, '_') + '_' + Random.id(3);
		doc.scheduledAt = new Date($( "input[name*='scheduledAt']" ).val());
		doc.draft = $( "input[name*='draft']" ).is(':checked')
		console.log('click schedule 2', this, doc);	
		console.log('clicked schedule', this);
		MeteorBlogCollections.Blog.update({_id: this._id},{$set: doc});
	},
	'click .remove'(e,t){
		console.log('clicked remove', this, e, this.valueOf());
		MeteorBlogCollections.Blog.update({_id: this._id},{$pull:{image: this.valueOf()}});
	},
});

Template.blogQueue.onCreated(function () {
	window.prerenderReady = false;
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
		return (Roles.userIsInRole(Meteor.userId(), ['admin', 'editor'], 'admGroup')) ;
	},
	posts(){
		let t = Template.instance();
		var data, list, sort;
		list = {userId: Meteor.userId(), posted: {$exists: false}};		
		sort = {sort: t.sort.get()};
		tags = _LocalTags.findOne();
		if (tags && tags.tags)
			list.tags = {$in: tags.tags};
		data = MeteorBlogCollections.Blog.find(list, sort);
		console.log('[blogQueue.helpers] posts', data.fetch());
		return data;
	},
	state(){
		if (this.draft)
			return 'draft';
		else if (this.scheduledAt > new Date())
			return 'scheduled';
		else
			return 'published';
	},
	htmlCut(){
		let txt = $('img', $(this.html)).remove().end().text();
		txt = txt.substr(0,260) + '...';
		//console.log('[blogContent.helpers] htmlCut', txt, this.html);
		return txt;	
	},
	localdate(){
		console.log('localdate this.createdAt', this?.scheduledAt, this?.scheduledAt?.toLocaleDateString("en-US"));
		return this?.scheduledAt?.toLocaleDateString("en-US");
	},
	bgColor(){
		if (this.scheduledAt < new Date() && !this.draft)
			return 'bg-success'
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
		return (Roles.userIsInRole(Meteor.userId(), ['admin', 'editor'], 'admGroup')) ;
	},
	posts(){
		let t = Template.instance();
		var data, list, sort;
		list = {aggregated: {$ne: true}};
		sort = {sort: {scheduledAt: -1}};
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


Template.blogSocial.onCreated(function () {
	//Meteor.subscribe('services');
  let t = Template.instance();
	t.showTele = new ReactiveVar();
	t.errorState = new ReactiveVar();
	Meteor.call('social.facebook.roles',function(err,res){
		console.log('social.facebook.roles', err, res);
	});	
});
Template.blogSocial.onRendered(function () {
	let t = Template.instance();
});
Template.blogSocial.helpers({
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
Template.blogSocial.events({
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
	window.prerenderReady = false;
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
		//console.log('pushimages.onCreated sub images', t.selectUsed.get(), t.loaded.get(), t.limit.get(), t.sort.get(), t.ready.get());
	})	
	t.autorun(function(){
		if (!t.ready.get()) return;
		t.loaded.set(MeteorBlogCollections.BlogImages.find().count());
		dragImg();
		//if (Session.get('debug')) console.log('pushimages.onCreated sub ready', t.selectUsed.get(), t.loaded.get(), t.limit.get(), t.sort.get(), t.ready.get());
	})
	
	console.log('[blogImages.onCreated] data', t.data);

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
	ready() {
		let t = Template.instance();
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

		t.sort.set(Session.get('sort'));
		sort = {sort: t.sort.get()};		

		images = this.images;
		if (images && images.image && images.image.length)
			list._id = {$nin: images.image};		

		
		data = MeteorBlogCollections.BlogImages.find(list,sort);
		//if (Session.get('debug')) console.log('[blogImages.helpers] images list:', data.count(), list, 'sort:', sort, '\nthis:', this, '\n'); 
		
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
		if (Session.get('debug')) console.log('[blogImages.helpers] dataImg:', this, '\n'); 
		return this.image.url.replace(/upload/, 'upload/' + Meteor.settings.public.cloudinary.options.scaled	);
	},
	debug(){
		console.log('[blogImages.helpers] debug:', this);
	}
});
Template.blogImages.events({
	'click #infiniteCheck'(e,t){
		t.limit.set(t.limit.get() + t.next.get());
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

Template.blogImageInside.onCreated(function () {
	window.prerenderReady = false;
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
		//console.log('pushimages.onCreated sub images', t.selectUsed.get(), t.loaded.get(), t.limit.get(), t.sort.get(), t.ready.get());
	})	
	t.autorun(function(){
		if (!t.ready.get())
			return;
		t.loaded.set(MeteorBlogCollections.BlogImages.find().count());
		dragImg();
		//if (Session.get('debug')) console.log('pushimages.onCreated sub ready', t.selectUsed.get(), t.loaded.get(), t.limit.get(), t.sort.get(), t.ready.get());
	})
	

});
Template.blogImageInside.onRendered(function () {
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
Template.blogImageInside.onDestroyed(function () {
	//$('#datepicker').datepicker('destroy');
});
Template.blogImageInside.helpers({
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
		//console.log('[blogImage.helpers] usedTimes', this);
		if (this.posts)
			return this.pushit.length;
	},
	date(){
		return moment(this.createdAt).format('LLL');
	},
	dataImg(){
		//if (Session.get('debug')) console.log('[blogImageInside.helpers] dataImg:', this, '\n'); 
		return this.image.url.replace(/upload/, 'upload/' + Meteor.settings.public.cloudinary.options.scaled	);
	},
});
Template.blogImageInside.events({
	'click #infiniteCheck'(e,t){
		t.limit.set(t.limit.get() + t.next.get());
	},	
	'click .publish' ( e, t ) {
		let node, img, upload, updated;
		node = document.createElement("p");    
		node.id = this._id;
		img = document.createElement("img");       
		//upload = 'upload/'+ Meteor.settings.public.cloudinary.options.smaller;
		upload = 'upload/h_200,q_auto,f_auto,dpr_auto,e_improve,fl_progressive:steep/c_scale,w_auto';
		console.log('[blogImageInside.events] publish 0', updated, this, upload, node, img);
		img.src = this.image.url.replace(/upload/, upload );
		node.appendChild(img); 
		document.getElementById("mediumtext").appendChild(node);
		$('#mediumtext').find('img').addClass('img-fluid');
		$(this._id).addClass('blogImg');
		updated = MeteorBlogCollections.BlogImages.update({_id: this._id}, {$addToSet: {posts: this.post._id}});
		console.log('[blogImageInside.events] publish', updated, this, upload, node, img);
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
		//console.log('[blogImagesAdd.helpers] MeteorBlogCollections.BlogImages collection', data);
		return data;
	},	
	schema(){
		var data = MeteorBlogSchemas.BlogImages;
		//console.log('[blogImagesAdd.helpers] MeteorBlogSchemas.BlogImages schema', data);
		return data;
	},	
});

Template.blogAggregated.onCreated(function () {
	window.prerenderReady = false;
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
	t.request = new ReactiveVar();
	
	var sub, list;
	
	t.autorun(()=>{
		list = {aggregated: true};
		list.limit = t.limit.get();
		list.sort = t.sort.get();
		list.debug = Session.get('debug');
		sub = t.subscribe('blog', list);
		t.ready.set(sub.ready());
	});
	
	t.autorun(()=>{
		if (!t.loaded.get())
			return;
		window.IS_RENDERED = true;
	});

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
/* 		var seo = {
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
		SEO.set(seo); */
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
		//console.log('[blogContent.helpers] htmlCut', txt, this.html);
		return txt;	
	},
	img(){
		let url;
		if (!this.image || !this.image.length) 
			url = 'https://res.cloudinary.com/orangry/image/upload/c_thumb,w_600,g_face/v1553633438/hundredgraphs/news.jpg';
		else 
			url = this.image[0];
			
		//console.log('[blogContent.helpers] img', url, this.image, this);
		return url;
	},
	schema(){
		return MeteorBlogSchemas.BlogPullMedium
	},
	doc(){
		formdefault = {};
		formdefault.q = Session.get('defaultQ');
		formdefault.action = 'tag';
		return formdefault;
	},
	request(){
		return Session.get('request');
	},
	debug(){
		if (Session.get('debug')) console.log('blog data debug', this);
	}
});
Template.blogAggregated.events({
	'click .banIt'(e,t){
		if (Session.get('debug')) console.log('clicked banIt', this);
		let creator = MeteorBlogCollections.BlogUsers.findOne({creatorId: this.creatorId});
		if (creator) MeteorBlogCollections.BlogUsers.update({_id: creator._id},{$set:{ban:true}});
		MeteorBlogCollections.Blog.update({_id: this._id},{$set: {blacklist: true}});
	},
	'click .hideIt'(e,t){
		if (Session.get('debug')) console.log('clicked hideIt', this);
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
	},
/* 	'submit'(e,t){
		console.log('[blogAggregated.events] submit', e, this);
	} */
});

Template.blogSettings.onCreated(function () {
  let t = Template.instance();
	t.editRecord = new ReactiveVar();3
	t.autorun(function(){
		PostSubs.subscribe('blogeditors',{
			caller: 'blogSettings.onCreated',
			all: true,
			debug: Session.get('debug')
		});		
		PostSubs.subscribe('blogsettings',{
			caller: 'blogSettings.onCreated',
			all: true,
			debug: Session.get('debug')
		});
	})	
});
Template.blogSettings.onRendered(function () {
	let t = Template.instance();
});
Template.blogSettings.helpers({
	editors(){
		const list = {$or: [{roles: 'admin'}, {roles:'editor'}]};
		const data = Meteor.users.find(list, {sort: {createdAt: -1}});
		return data;
	},
	settings(){
		const data = MeteorBlogCollections.BlogSettings.findOne();
		return data;
	},
	editRecord(){
		let t = Template.instance();
		//console.log('editRecord', t.editRecord.get());
		return t.editRecord.get();
	},
	collection(){
		return MeteorBlogCollections.BlogSettings;
	},
	schema(){
		return MeteorBlogSchemas.BlogSettings
	},
});
Template.blogSettings.events({
	'click .editRecord'(e, t) {
		console.log('[landing.js] editRecord', this);
		t.editRecord.set(!t.editRecord.get());
	},
	'submit'(e,t){
		t.editRecord.set();
	},
});


