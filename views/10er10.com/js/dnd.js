(function($){

var dnd = function() {

  var dragging = null;

  var containers = [];

  this.setDragItem = function(item) { 
// 	  debug("dnd start got ",item.length," items ");
	  dragging = item; dragging.addClass("dragging").toggleClass("selected",true).css("opacity",0.5);}
  this.getDragItem = function() { return dragging ; }
  this.removeDragItem = function() {
	  if ( dragging == null ) {
// 		  debug("dragging is null");
		  return;
	  }
// 	  debug("dnd stop ",dragging.length," items ");
	  dragging.removeClass("dragging").removeClass("selected").css("opacity",1); dragging = null ; }

	this.onDragDefault = function(e) {
		var song = $(this);
		if ( $("span.review",this).length ) { return false; }
		song.toggleClass("selected",true);
		var dt = e.originalEvent.dataTransfer;
		dt.effectAllowed = "copy";
		dt.setData('text','playlist');
		dt.setDragImage( $('#songitem img')[0], 0, 0);
		d10.dnd.setDragItem( song.closest(".list").find(".song.selected") );
	};

  // options
  // copyDrop : song comes from another area than list
  // moveDrop : song comes from list
  // dragenter : other things to do on dragenter
  // dragleave : other things to do on dragleave
  this.dropTarget = function(container, list, options  ) {
    var settings = {
      "copyDrop": function(){},
      "moveDrop": function(){},
      "dragenter": function(){},
      "dragleave": function(){},
 "containerHeight": function() { /*debug(container, container.height());*/return container.height(); }
    };
    $.extend(settings,options);

	var currentDnDposition = null;
	
	var onDnd = function (e) {
		if ( dragging == null ) { return ; }
		var song = $(e.target).closest('div.song');
		if ( dragging.includes(song) ) {
			$("div.song",list).removeClass("hover");
			return true;
		}
		
		if ( !song.length ) {
			$("div.song",list).removeClass("hover");
			var containerHeight = settings.containerHeight();
			if ( container.offset().top + (containerHeight  / 2) > e.pageY ) {
				$("div.song.hover",list).removeClass("hover");
				container.toggleClass("hovertop",true).toggleClass("hoverbottom",false);
				debug("before");
			} else {
				container.toggleClass("hoverbottom",true).toggleClass("hovertop",false);
				debug("after");
			}
			return false;
		} else {
			var othersongs = $("div.song", list).filter(function(index) {
				return this === song.get(0);
			});
			othersongs.toggleClass("hover",false);
			song.toggleClass("hover",true);
			container.toggleClass("hovertop hoverbottom",false);
			return false;
		}
	};


    container
      .bind("dragenter",onDnd)
      .bind("dragover",onDnd)
      .bind("dragleave",function(e) {
		debug("dragleave");
		
		if ( container.hasClass("hoverbottom") ) { currentDnDposition = "bottom"; } 
		else if ( container.hasClass("hovertop") ) { currentDnDposition = "top"; } 
		else { currentDnDposition = null; }
		  
        $("div.song.hover",list).removeClass("hover");
		
		
        container.removeClass("hovertop hoverbottom");
      })
      .bind("drop",function(e) {
		debug("drop called");
		e.originalEvent.preventDefault();
		var target = $(e.target).closest('div.song');
		if ( !target.length ) target = container;
		if ( ! dragging || !dragging.length ) {
			return false;
		}
        
        

		var infos = {"wantedNode": null};
		
		if ( currentDnDposition == "bottom" && $("div.song",list).length ) {
			infos.wantedNode = $("div.song",list).last();
		} else if ( currentDnDposition == null &&  target.hasClass("song") ) {
			infos.wantedNode = target;
		}
		
		// chrome is buggy with dnd, do we have to unset special css styles here... :-(
		$("div.song.hover",list).removeClass("hover");
		container.removeClass("hovertop hoverbottom");
			
			// check if song is part of the own list
        
        if ( list.children().includes( dragging.get(0) ) ) {
			debug("in move",dragging,target,infos);
			if ( infos.wantedNode && dragging.includes( infos.wantedNode.get(0) ) ) {
				debug("move skipped : target is in dragging");
				// we're in a move drop but the target is in the dragged items
				return false;
			}
			return settings.moveDrop.call(list,dragging,target, infos);
        } else {
			debug("in copy",dragging,target,infos);
			return settings.copyDrop.call(list,dragging,target, infos);
        }
// 				return true;
      });
  };

};

if ( !window.d10.mustache ) {
        window.d10.mustache = Mustache;
}

if ( !window.d10.mustacheView ) {
        window.d10.mustacheView = function (a,b,c) {
                return window.d10.mustache.to_html( window.d10.localcache.getTemplate(a), b, c );
        }
}


window.d10.dnd = new dnd();
window.d10.loadView = function (name,doc) {
  if ( typeof doc != 'object' ) doc = {};
  return $.sprintf(window.d10.localcache.getTemplate(name),doc);
}
window.d10.song_template = function (doc) {
  var d = new Date(1970,1,1,0,0,doc.duration);
  doc.human_length = d.getMinutes()+':'+d.getSeconds();
  return window.d10.mustacheView('song_template',doc);
}

window.d10.isValidEmailAddress = function (emailAddress) {
  return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/.test(emailAddress);
};

window.d10.microtime = function() {
  return new Date().getTime() / 1000;
};

window.d10.time = function() {
  return parseInt(this.microtime(),10);
};

window.d10.routeEncode = function ( segments ) {
	var back = "/";
	if ( $.isArray(segments) ) {
		for ( var index in segments ) {
			back+=encodeURIComponent(segments[index])+"/";
		}
		return back.replace(/\/$/,"");
	} else if ( $.isPlainObject(segments) ) {
		for ( var index in segments ) {
			back+=encodeURIComponent(index)+"/"+encodeURIComponent(segments[index])+"/";
		}
		return back.replace(/\/$/,"");
	} else if ( typeof segments == "string" ) {
		return segments;
	}
	return back;
};

window.d10.routeDecode = function ( route ) {
	if ( typeof route != "string" ) {
		return route;
	}
	route = route.replace(/^\//,"");
	var segments = route.split("/");
	for ( var index in segments ) {
		segments[index] = decodeURIComponent(segments[index]);
	}
	return segments;
};

var jobWorker = function(url,onresponse) {
	var worker = new Worker(url);
	var callbacks = {};
	var running = this.running = false;
	this.sendJob = function(job,data,options) {
// 		debug("got sendJob...");
		running = true;
		var settings = { "success": function() {}, "error": function() {}, "complete": function() {} };
		callbacks = {};
		$.extend(callbacks,settings,options);
// 		debug("posting message",job,data);
		worker.postMessage( JSON.stringify({"job": job,"data": data}) );
	};
	worker.onmessage = function(e) {
// 		debug("jobworker message",e);
		var data = null;
		try {
			data = JSON.parse(e.data);
			if ( !data ) { return sendError("parsererror"); }
		} catch(e) { return sendError("parsererror"); }
		if ( data.error ) { return sendError(data.error,data.message); }
		sendSuccess(data);
	};
	
	worker.onerror = function(e) { sendError("worker",e.message); };
	
	var sendError = function (err,data) {
		onresponse("error",err,data);
// 		debug("job worker error",callbacks);
		callbacks.error ? callbacks.error(err,data): '';
		callbacks.complete ? callbacks.complete(err,data): '';
		callbacks = {};
		running = false;
	};
	
	var sendSuccess = function (data) {
		onresponse("success",data);
// 		debug("job worker success",callbacks);
		callbacks.success ? callbacks.success(data) : '';;
		callbacks.complete ? callbacks.complete(data) : '';;
		callbacks = {};
		running = false;
	};
  
};

var jobs = function(url, count) {
  var workers = [];
  var dedicatedData = [];
  var i = 0;
  for ( i=1;i<=count;i++) {
    workers.push(
    new jobWorker (url,function() {})
    );
    dedicatedData.push({"queue": []});
  }
  
  this.push = function (job, data, options) {
	  debug("push new job",job,data,options);
    if ( dedicated[job] ) {
      return sendDedicated(job,data,options);
    }
    for ( i=0; i<count;i++ ) {
      if ( workers[i].running == false ) {
        workers[i].sendJob(job,data,options);
        return true;
      }
    }
//     debug("JOBS: no worker available, job dropped ! ",job,data,options);
    return false;
  };
  
  var dedicated = {
    "player": count-1,
    "enablePing": count-1
  };
  var dedicatedInterval = null;
  
  var sendDedicated = function(job,data,options) {
    var index = dedicated[job];
    dedicatedData[index].queue.push({"job":job,"data":data,"options":options});
    dedicatedIteration();
  };

  var queueTimeout = null;
  var dedicatedIteration = function () {
	if ( queueTimeout ) return ;
	
	var iterate = function () {
		debug("dedicated worker iteration starts");
		var skipped = 0;
		for ( var index in dedicatedData ) {
			if ( !workers[index].running ) {
				if ( dedicatedData[index].queue.length ) {
					var a = dedicatedData[index].queue.pop();
					workers[index].sendJob(a.job,a.data,a.options);
				}
			}
		}
		for ( var index in dedicatedData ) {
			if ( dedicatedData[index].queue.length ) {
				queueTimeout = setTimeout(iterate,1000);
				return;
			}
		}
		queueTimeout = null;
	};
	queueTimeout = setTimeout(iterate,1000);
  };
};

window.d10.fn.jobs = jobs;

window.d10.dump = function () {
	var back = {};
	back.sessioncache = d10.sessioncache.dump();
	back.player = d10.player.dump();
	return back;
}

})(jQuery);