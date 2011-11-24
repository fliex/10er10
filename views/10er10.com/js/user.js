define(["js/d10.rest"],function(rest) {

	function user () {
		var infos = null;
		var orderPlaylists = function(playlists) {
			var pl = [];
			$.each(playlists,function(k,v) {
				var inserted = false;
				$.each(pl,function(pk,pv) {
					if ( v.name < pv.name ) {
						inserted = true;
						pl.splice(pk,0,v);
						return false;
					}
				});
				if ( !inserted )	{
					pl.push(v);
				}
			});
			return pl;
		};

		$(document).bind('user.infos',function(e,data) { 
			debug(data);
			infos = data;
			infos.playlists = orderPlaylists(infos.playlists);	
			
		});
		$(document).bind('rplAppendSuccess',function(e,data) {
			infos.playlists = jQuery.map(infos.playlists, function(n, i){
		if ( n._id == data.playlist._id )	return data.playlist;
				else																				return n;
		});
		});
		
		$(document).bind('rplCreationSuccess',function(e,data) {
			var newlist = [] ;
			var set = false;
			for ( var index in infos.playlists ) {
				if ( infos.playlists[index].name > data.playlist.name && !set ) {
					newlist[ newlist.length ] = data.playlist;
					set=true;
				}
				newlist[ newlist.length ] = infos.playlists[index];
			}
			if ( !set ) {
				newlist[ newlist.length ] = data.playlist;
			}
			infos.playlists = newlist;
		});

	$(document).bind('rplRenameSuccess',function(e,playlist) {
		for ( var index in infos.playlists ) {
		if ( infos.playlists[index]._id == playlist._id ) {
			infos.playlists[index].name = playlist.name;
			break;
		}
		}
	});

	$(document).bind('rplDropSuccess',function(e,playlist) {
		var newlist = [] ;
		for ( var index in infos.playlists ) {
		if ( infos.playlists[index]._id != playlist._id) {
			newlist[ newlist.length ] = infos.playlists[index];
		}
		}
		infos.playlists = newlist;
	});

	
		this.refresh_infos = function () {
			rest.user.infos(
				{
					load: function(err,resp) {
						if (!err) {
							$(document).trigger("user.infos",resp);
						}
					}
				}
			);
		}
		
		this.got_infos = function () {
			if ( infos == null )	return false;
			return true;
		}

		this.get_preferences = function () {
			if ( infos == null || !infos.preferences  )	return false;
			return infos.preferences;
		}
		
		this.set_preference = function(name, value) {
			if ( name == "hiddenExtendedInfos" ) {
				
				value = value ? "true" : "false";
				rest.user.setPreference("hiddenExtendedInfos",value, {
					load: function(err,resp) {
						if ( err ) return ;
						$.proxy(this.refresh_infos,this);
					}
				});
			}
		};
		
		this.get_playlists = function () {
			if ( infos == null || ! infos.playlists )	return [] ;
			return infos.playlists;
		}
		this.playlist_exists = function (name) {
			var pl = this.get_playlists();
			for ( var index in pl ) {
				if ( pl[index].name == name ) {
					return true;
				}
			}
			return false;
		}
		
		this.get_invites_count = function() {
			if ( infos == null )  return 0;
			if ( !infos.user ) return 0;
			if ( !infos.user.invites )  return 0;
			return parseInt(infos.user.invites);
		}
	
		this.id = function() {
			if ( infos == null )  return 0;
			return infos.user._id;
		};
	
	}

	var u = new user();
	return u;

});
