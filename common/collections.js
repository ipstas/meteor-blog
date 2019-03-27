//import 'bootstrap-datepicker';
import SimpleSchema from 'simpl-schema';
SimpleSchema.extendOptions(['autoform', 'index', 'unique', 'denyInsert', 'denyUpdate']);

import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
//import 'meteor/aldeed:autoform-bs-datetimepicker';
//import 'eonasdan-bootstrap-datetimepicker';

export const MeteorBlogCollections = {};
export const MeteorBlogSchemas = {};

MeteorBlogCollections.Blog = new Mongo.Collection('pkg_meteor_blog');
MeteorBlogCollections.BlogImages = new Mongo.Collection('pkg_meteor_blogimages');
MeteorBlogCollections.BlogUsers = new Mongo.Collection('pkg_meteor_blogusers');
MeteorBlogCollections.BlogServices = new Mongo.Collection('pkg_meteor_blogservices');
MeteorBlogCollections.BlogTags = new Mongo.Collection('pkg_meteor_blogtags');


MeteorBlogSchemas.BlogServices = new SimpleSchema({
  'type': {
    type: String,
  },  
	'text': {
    type: String,
  },	
	'services': {
    type: String,
  },
  'createdAt': {
    type: Date,
    label: 'Date',
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      }
    },
    autoform: {
			omit: true,
    }
  },  
	'scheduledAt': {
    type: Date,
    label: 'Date',
  },
	"userId": {
    type: String,
		optional: true,
    regEx: SimpleSchema.RegEx.Id,
    autoValue: function () {
      if (Meteor.isClient && this.isInsert) {
        return Meteor.userId();
      }
    },
	},
});
MeteorBlogCollections.BlogServices.attachSchema(MeteorBlogSchemas.BlogService);
MeteorBlogCollections.BlogServices.allow({
  insert: function (userId, doc) {
		if (Roles.userIsInRole(userId, ['admin'], 'admGroup')) 
			return true;
  },
  update: function (userId, doc) {
		if (Roles.userIsInRole(userId, ['admin'], 'admGroup')) 
			return true;
  },
  remove: function (userId, doc) {
		if (Roles.userIsInRole(userId, ['admin'], 'admGroup')) 
			return true;
  }
});

MeteorBlogSchemas.BlogUsers = new SimpleSchema({
	services: {
		type: Array,
		optional: true,
	},
	'services.$': {
		type: Object,
		optional: true,
		blackbox: true
	},
	createdAt: {
		type: Date,
		optional: true,
		label: 'Date',
		autoValue: function () {
			if (this.isInsert) {
				return new Date();
			}
		},
		autoform: {
			omit: true,
		}
	},  
	creatorId: {
		type: String,
		unique: true,
	},
	creatorUser: {
		type: String,
		optional: true
	},
	creatorName: {
		type: String,
		optional: true,
	},
	creatorAvatar: {
		type: String,
		optional: true,
	},
	creatorString: {
		type: String,
		optional: true,
	},
	ban: {
		type: Boolean,
		optional: true,
	},
});
//MeteorBlogSchemas.BlogUser.attachSchema(MeteorBlogSchemas.SchemasPushService);
MeteorBlogCollections.BlogUsers.allow({
  insert: function (userId, doc) {
		if (Roles.userIsInRole(userId, ['admin'], 'admGroup')) 
			return true;
  },
  update: function (userId, doc) {
		if (Roles.userIsInRole(userId, ['admin'], 'admGroup')) 
			return true;
  },
  remove: function (userId, doc) {
		if (Roles.userIsInRole(userId, ['admin'], 'admGroup')) 
			return true;
  }
});

MeteorBlogSchemas.Blog = new SimpleSchema({
	_id:{
		type: String,
	},
	blacklist:{
		type: Boolean,
		optional: true,
	},
	id: {
		type: String,
		index: true,
		optional: true,
	},  
	title: {
		type: String,
	},  
	postid: {
		type: String,
		index: true,
		optional: true,
	},    
	type: {
		type: String,
		optional: true,
	},  
	text: {
		type: String,
		optional: true,
	},
	html: {
		type: String,
		optional: true,
	},
	url: {
		type: String,
		optional: true,	
	},
	image: {
		type: Array,
		optional: true,
	},		
	'image.$': {
		type: String,
		optional: true,
	},	
	tags: {
		type: Array,
		optional: true,
		autoform: {
			type: 'tags'
		}
	}, 
	'tags.$': {
		type: String,
		optional: true,
	},
	draft: {
		type: Boolean,
		optional: true,
	},			
	aggregated: {
		type: Boolean,
		optional: true,
	},			
	paragraphs: {
		type: Array,
		blackbox: true,
		optional: true
	},
	'paragraphs.$': {
		type: Object,
		blackbox: true,
		optional: true
	},
	services: {
		type: Array,
		optional: true,
	},	
	'services.$': {
		type: String,
		optional: true,
	},
	scheduledAt: {
		type: Date,
		label: 'Date',
		optional: true,
/* 		autoform: {
			afFieldInput: {
				type: "bootstrap-datepicker"
				//type: "datetimepicker",
			}
		} */
	},	
	userId: {
		type: String,
		index: true,
		optional: true,
		//regEx: SimpleSchema.RegEx.Id,
		autoValue: function () {
			if (Meteor.isClient && this.isInsert) {
				return Meteor.userId();
			}
		},
	},
	createdAt: {
		type: Date,
		index: -1,
		label: 'Date',
		autoValue: function () {
			if (this.isInsert) {
				return new Date();
			}
		},
		autoform: {
			omit: true,
		}
	},
});
MeteorBlogCollections.Blog.attachSchema(MeteorBlogSchemas.Blog);
MeteorBlogCollections.Blog.allow({
  insert: function (userId, doc) {
		if (Roles.userIsInRole(userId, ['admin'], 'admGroup')) 
			return true;
  },
  update: function (userId, doc) {
		if (Roles.userIsInRole(userId, ['admin'], 'admGroup')) 
			return true;
  },
  remove: function (userId, doc) {
		if (Roles.userIsInRole(userId, ['admin'], 'admGroup')) 
			return true;
  }
});

MeteorBlogSchemas.BlogImages = new SimpleSchema({
	id:{
		type: String,
		optional: true,
	},
	url: {
		type: String,
		autoform: {
			afFieldInput: {
				type: 'cloudinary'
			}
		}
	},
	cloud: {
		type: String,
		optional: true,
	},
	tags: {
		type: Array,
		optional: true,
		autoform: {
			type: 'tags'
		}
	},
	'tags.$': {
		type: String,
		optional: true,
	},
	posts: {
		optional: true,
		type: Array,
	},
	'posts.$': {
		type: String,
		optional: true,
	},  
	createdAt: {
		type: Date,
		label: 'Date',
		autoValue: function () {
			if (this.isInsert) {
				return new Date();
			}
		},
		autoform: {
			omit: true,
		}
	},  
	userId: {
		type: String,
		optional: true,
		regEx: SimpleSchema.RegEx.Id,
		autoValue: function () {
			console.log('[MeteorBlogSchemas.BlogImages] userId:', this, Meteor.isClient, this.isInsert, Meteor.userId());
			return Meteor.userId();
		},
	},
});
MeteorBlogCollections.BlogImages.attachSchema(MeteorBlogSchemas.BlogImages);
MeteorBlogCollections.BlogImages.allow({
  insert: function (userId, doc) {
		if (Roles.userIsInRole(userId, ['admin'], 'admGroup')) 
			return true;
  },
  update: function (userId, doc) {
		if (Roles.userIsInRole(userId, ['admin'], 'admGroup')) 
			return true;
  },
  remove: function (userId, doc) {
		if (Roles.userIsInRole(userId, ['admin'], 'admGroup')) 
			return true;
  }
});

MeteorBlogSchemas.BlogPullMedium = new SimpleSchema({ 
	'q': {
		type: String,
		label: 'Search value',	
		optional: true,		
	},	
	'action': {
		type: String,
		optional: true,		
		allowedValues: ['tag','post'],
		autoform: {
			type: 'select', 
		}
	},	
});		
/* MeteorBlogSchemas.BlogTags = new SimpleSchema({
	id:{
		type: String,
		optional: true,
	},
	url: {
		type: String,
		autoform: {
			afFieldInput: {
				type: 'cloudinary'
			}
		}
	},
	cloud: {
		type: String,
		optional: true,
	},
	tags: {
		type: Array,
		optional: true,
		autoform: {
			type: 'tags'
		}
	},
	'tags.$': {
		type: String,
		optional: true,
	},
	pushit: {
		optional: true,
		type: Array,
	},
	'pushit.$': {
		type: String,
		optional: true,
	},  
	'createdAt': {
		type: Date,
		label: 'Date',
		autoValue: function () {
			if (this.isInsert) {
				return new Date();
			}
		},
		autoform: {
			omit: true,
		}
	},  
	"userId": {
		type: String,
		optional: true,
		regEx: SimpleSchema.RegEx.Id,
		autoValue: function () {
			if (Meteor.isClient && this.isInsert) {
				return Meteor.userId();
			}
		},
	},
});
MeteorBlogCollections.BlogTags.attachSchema(MeteorBlogSchemas.BlogTags);
MeteorBlogCollections.BlogTags.allow({
  insert: function (userId, doc) {
		if (Roles.userIsInRole(userId, ['admin'], 'admGroup')) 
			return true;
  },
  update: function (userId, doc) {
		if (Roles.userIsInRole(userId, ['admin'], 'admGroup')) 
			return true;
  },
  remove: function (userId, doc) {
		if (Roles.userIsInRole(userId, ['admin'], 'admGroup')) 
			return true;
  }
});

 */
