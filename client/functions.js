import 'jquery-ui-bundle';
import 'jquery-ui-bundle/jquery-ui.css';
//import 'meteor/aldeed:autoform-bs-datetimepicker';

export const imgOnScroll = function(){
	Meteor.setTimeout(function(){
		$('img[realsrc]').each(function(i){
			var t = $(this);
			//console.log('position', t.offset(), t.offset().top, $(window).scrollTop(), $(window).height());
			if(t.offset().top - $(window).scrollTop() < $(window).height() ){
				t.attr('src', t.attr('realsrc')); // trigger the image load
				t.removeAttr('realsrc'); // so we only process this image once
				//console.log('imgOnScroll inserted ', i, this, t, t.id, t.offset().top < $(window).height());
			}
		});		
	},500);
}
export const setSelectDate = function(date){
	if (Session.get('selectDate') == null){
		$('#datepicker').val('');
		$('#datepicker').addClass('hidden');
	} else if (Session.get('selectDate') == true && $('#datepicker').hasClass('hidden')){
		$('#datepicker').removeClass('hidden');
		Session.set('selectDate', $('#datepicker').val());		
	} else if (!$('#datepicker').hasClass('hidden')) {
		$('#datepicker').addClass('hidden');
		Session.set('selectDate', false);			
	}	
	if (Session.get('debug')) console.log('setSelectDate', Session.get('selectDate'), 'datepicker:', $('#datepicker').val());
}
export const selectDate = function(startDate){
	//var startDate = new Date(); // this is the starting date that looks like ISODate("2014-10-03T04:00:00.188Z")
	if (!startDate)
		return new Date();
	else
		startDate = new Date(startDate);
	//console.log('selectDate func', startDate);
	startDate.setSeconds(0);
	startDate.setHours(0);
	startDate.setMinutes(0);

	var dateMidnight = new Date(startDate);
	dateMidnight.setHours(23);
	dateMidnight.setMinutes(59);
	dateMidnight.setSeconds(59);

	//### MONGO QUERY

	var query = {	
		$gt:startDate,
		$lt:dateMidnight
	};	
	return query;
}
export const setSort = function(){
	var sort;
	if (!Session.get('sort')){
		Session.set('sort',{createdAt: -1});
	}	else if (Session.get('sort').file) {
		sort = 'date';
		Session.set('sort',{createdAt: -1});
	} else if (Session.get('sort').createdAt){
		sort = 'filename';
		Session.set('sort',{file: 1});
	} else {
		sort = 'date';
		Session.set('sort',{createdAt: -1});		
	}
		
/* 	else if (Session.get('sort') == 'date-file')
		Session.set('sort','date');	 */
	if (Session.get('debug')) console.log('clicked sort', Session.get('sort'));
	
	Bert.alert({
		title: 'Sort',
		message: 'Sorted by '+ sort,
		type: 'info',
		style: 'growl-top-right',
	});
}

export const selectTags = function(){
	var image;
	map = function(){
		for (var i in this.tags){
			var recency = 1/(new Date() - this.createdAt);
			var score = recency * this.score;
			
			emit(this.tags[i],{'urls': [this.url], 'score': score});
		}
	}
	images = Images.find({tags:{$exists: true}}).fetch();
	_.each(images, function(image){
		_.each(image.tags, function(){
			
		});
	});
	
	var mapFn = function(){
			if( this.tags ){
					this.tags.forEach(function(value){
							if (value.match(/web/i)){
									emit('web', value);
							}
					});
			}
	};
	var reduceFn = function(key, values){
			return {result:values};
	};

	db.runCommand({
			mapreduce: 'posts',
			out: {inline:1},
			map: mapFn,
			reduce: reduceFn,
			query: {tags:/web/}
	});
}
export const dragImg = function (){

	$("#mediumimg").droppable({ accept: ".mediumdrag", 
		drop: function(e, ui) {
			var imgs = $('.drophere').find('img');
			var ids = [];
			var droppedOn = $(this);
			droppedOn.removeClass("border").removeClass("jumbotron").removeClass("over");
			var dropped = ui.draggable;
	
			console.log('droppable2', 
				'target', e.target.id, '\n',
				'draggable', ui.draggable, 'first:', ui.draggable.first(), 'alt:', ui.draggable.first().attr('alt'), '\n', 
				'img:', $(ui.draggable).find("img"), $(e.target).find("img").first(), '\n', 
				'attr:', $(ui.draggable).find("img").first().attr('alt'), $(e.target).find("img").first().attr('id'), '\n', 
				$(e.target), '\n',
				ui.draggable, '\n',
				ui.draggable.alt, '\n',
				this
			);	
			var image = ui.draggable.first().attr('alt');
			console.log('updating pushit image:', $(ui.draggable).find("img").first(), image);	
			MeteorBlogCollections.Blog.update(FlowRouter.getQueryParam('push'),{$addToSet:{image: image}});
			console.log('updating pushimages pushit:', FlowRouter.getQueryParam('push'));
			MeteorBlogCollections.BlogImages.update(image, {$addToSet: {pushit: FlowRouter.getQueryParam('push')}});
			//dropScene(params);
		}, 
		over: function(e, elem) {
			//if (Session.get('debug')) 
				console.log('over', e.target.id, e, elem, this);
			//$('#' + e.target.id).addClass("bkblsolid");
		},
		out: function(e, elem) {
			console.log('out', e, elem, this);
			//$('#' + e.target.id).removeClass("bkblsolid	");
		}
	});
	$( ".mediumdrag" ).draggable({ 
			containment: "document",
			revert: 'invalid',
	});

}
export const checkMore = function(t){
	//if (Session.get('debug')) console.log('checkMore func', t.limit.get() - t.next.get() <= t.loaded.get(), t.limit.get(), t.next.get(), t.loaded.get());
	
	return console.log('[checkMore]');
	
	if (t.limit.get() - t.next.get() <= t.loaded.get())
		Meteor.setTimeout(function(){
			if ($('#infiniteCheck').offset() && $('#infiniteCheck').offset().top - $(window).scrollTop() - $(window).height() < -20){
				t.limit.set(t.limit.get() + t.next.get());
				if (Session.get('debug')) console.log('userpanos.onRendered getting next limit 0:', t.ready.get(), t.limit.get(), t.next.get(), t.loaded.get(), $('#infiniteCheck').offset().top - $(window).scrollTop() - $(window).height());
				FlowRouter.setQueryParams({more: t.limit.get()});
			}	
		},500);
}

