import { CronJob } from 'cron';
import {MeteorBlogCollections} from '../common/collections.js';
let cron;

/* var job = new CronJob({
  cronTime: '00 30 11 * * 1-5',
  onTick: async function() {
		 
		await Meteor.call('social.twitter.apppost',function(err,res){
			console.log('cron social.twitter.apppost', err, res);
		});
		await Meteor.call('social.telegram.apppost',function(err,res){
			console.log('cron social.telegram.apppost', err, res);
		});
		console.log('cron: posting auto social');
  },
  start: false,
  timeZone: 'America/Chicago'
}); */

// var job2 = new CronJob({
  // cronTime: '00 30 11 */2 * 1-5',
  // onTick: async function() {	 
		// await Meteor.call('social.push.update',function(err,res){
			// if (err) console.warn('ERR cron social.push.update apppost', err, res);
			// console.warn('cron social.push.update apppost', err, res);
		// });
  // },
  // start: false,
  // timeZone: 'America/Chicago'
// });

const job3 = new CronJob({
  cronTime: '00 00 */6 * * *',
  onTick: async function() {
    /*
     * Runs every second weekday (Monday through Friday)
     * at 11:30:00 AM. It does not run on Saturday
     * or Sunday.
     */		 
		await Meteor.call('social.twitter.search', function(err,res){
			console.warn('\n\n*** \ncron social.twitter.search', err, res, '\n\n***');
		});
  },
  start: false,
  timeZone: 'America/Chicago'
});

const job5 = new CronJob({
	cronTime: '00 30 10 */2 * 1-5',
	//cronTime: '*/10 * * * * 1-5',
	onTick: async function() {
		/*
		 * Runs every second weekday (Monday through Friday)
		 * at 10:30:00 AM. It does not run on Saturday
		 * or Sunday.
		 */
		 
		await Meteor.call('social.medium.pull.tag',{q: 'Smart Home'},(e,r)=>{
			if (err) console.warn('ERR [cron] social.medium.pull.tag', e, r);
			console.log('[cron] social.medium.pull.tag', r, r);
		});
	},
	start: false,
	timeZone: 'America/Chicago'
});

Meteor.startup(function(){
	let job = job5.start();
	console.log('[cron] startup job:', job);
});

//console.log('[cron] imported:', job5);