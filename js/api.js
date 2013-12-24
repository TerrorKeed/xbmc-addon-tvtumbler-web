var api = {
		
	/**
	 * Handle to the jsonrpc server.
	 */
	_server: new $.JsonRpcClient({ ajaxUrl: "http://" + window.location.hostname + ":28574/" }),
	
	/**
	 * Internal function for passing calls to the jsonrpc server.
	 * 
	 * 		@param {string} method		Method to call.
	 * 		@param {array} args			Arguments to pass.
	 * 		@param {apiCallback} callback	function(err, result) (optional)
	 */
	_call: function(method, args, callback) {
		return this._server.call(
			method, args,
			function(result) { if (callback) return callback(null, result); },
			function(error)  { 
				
				console.error('Error from jsonrpc: ' + error.message, 
						'Method: ' + method,
						'Args: ', args,
						error);
				if (callback) return callback(error); 
			}
		);
	},
	
	/**
	 *	Echo function.  Just echoes back whatever is sent in the text parameter.
	 *	Use this to test if the server is responding.
	 *
	 *		@param {*} text			The thing you want echoed back.
	 *		@param {apiCallback} cb	function(err, result); 'result' will have the same type as 'text'
	 */
	echo: function(text, cb) {
		return this._call('echo', [text], cb);
	},
	
	/**
	 *	Get the addon version running on the server.  This will be something like 
	 *	"1.2.3", whatever is set in the addon.xml
	 *
	 *		@param {Function} cb	function(err, version); where 'version' will be the version string
	 */
	get_version: function(cb) {
		return this._call('get_version', [], cb);
	},
	
	/**
	 *	Return a list of all shows (both in the xbmc library, and in the database)
	 *	Only the properties specified in the properties argument will be populated.
	 *
	 *		@param {array} properties	Array of required property names.  If null the default is used.  See
	 *									the python tvtumbler.tv.TvShow for a list of all available properties.
	 *									(but be aware that some can be quite slow to retrieve)
	 *		@param {apiCallback} cb		function(err, shows); where shows is an array of object, each a 'show'.
	 */
	get_all_shows: function(properties, cb) {
		if (properties === null) {
			properties=['tvshowid', 'name', 'tvdb_id', 'followed', 'wanted_quality', 'fanart',
						'thumbnail', 'poster', 'banner'];
		}
		return this._call('get_all_shows', [properties], cb);
	},
	
	/**
	 *	Return an array of objects with the properties of the shows with the tvdb_ids given.
 	 *
	 *		@param {array} tvdb_ids		An array of tvdb_ids.  Either ints or strings.
	 *		@param {array} properties	Array of required property names.  If null the default is used.  See
	 *									the python tvtumbler.tv.TvShow for a list of all available properties.
	 *									(but be aware that some can be quite slow to retrieve)
	 *		@param {apiCallback} cb		function(err, shows); where shows is an array of object, each a 'show'.
	 */
	get_shows: function(tvdb_ids, properties, cb) {
		if (properties === null) {
			properties=['tvshowid', 'name', 'tvdb_id', 'followed', 'wanted_quality', 'fanart',
						'thumbnail', 'poster', 'banner'];
		}
		return this._call('get_shows', [tvdb_ids, properties], cb);
	},
	
	/**
	 *	Flag a show as followed/ignored
 	 *
	 *		@param {int|string} tvdb_id		tvdb_id of show to set.
	 *		@param {boolean} followed		true => followed, false => ignored.
	 *		@param {apiCallback} cb			function(err, wasFollowed); optional callback. wasFollowed is the prev state
	 */
	set_show_followed: function(tvdb_id, followed, cb) {
		return this._call('set_show_followed', [tvdb_id, followed], cb);
	},
	
	/**
	 *	Get the current wanted_quality for a show
 	 *
	 *		@param {int|string} tvdb_id
	 *		@param {apiCallback} cb			function(err, wanted_quality); where wanted_quality is an int (one of the
	 *										python tvtumbler.quality values.
	 */
	get_show_wanted_quality: function(tvdb_id, cb) {
		return this._call('get_show_wanted_quality', [tvdb_id], cb);
	},
	
	/**
	 *	Set the wanted_quality for a show
	 *
	 *		@param {int|string} tvdb_id
	 *		@param {int} wanted_quality		The wanted_quality.  One of the python tvtumbler.quality values
	 *		@param {apiCallback} cb			function(err, prev_quality); optional callback where prev_quality is
	 *										the previous setting.
	 */
	set_show_wanted_quality: function(tvdb_id, wanted_quality, cb) {
		return this._call('set_show_wanted_quality', [tvdb_id, wanted_quality], cb);
	},
	
	/**
	 *	Get an array of running downloads from the server.
	 *	
	 *		@param {array} properties		The properties to get for each download.  See the python 
	 *										tvtumbler.comms.server for a list of available properties.
	 *										If null, defaults are used.
	 *		@param {string} sort_by			CURRENTLY_IGNORED.
	 *		@param {apiCallback} cb			function(err, downloads); where downloads is an array of objects.
	 */
	get_running_downloads: function(properties, sort_by, cb) {
		if (properties === null) {
			properties=['rowid', 'key', 'name', 'status', 'status_text', 'total_size',
						'downloaded_size', 'download_speed', 'start_time', 'source',
						'downloader'];
		}
		if (sort_by === null) {
			sort_by='start_time';
		}
		return this._call('get_running_downloads', [properties, sort_by], cb);
	},
	
	/**
	 *	Get an array of previous downloads.
	 *
	 *		@param {array} properties		An array of strings, the properties of wanted. See the python code
	 *										tvtumbler.log.get_non_running_downloads() for a list of available 
	 *										properties.  Leave set to null for defaults.
	 *		@param {int} limit				Limit the length of returned results.  If null, defaults to 30.
	 *		@param {apiCallback} cb			function(err, downloads); where downloads is an array of objects.
	 */
	get_non_running_downloads: function(properties, limit, cb) {
		if (properties === null) {
			properties=['rowid', 'key', 'name', 'final_status', 'total_size',
						'start_time', 'finish_time', 'source', 'quality'];
		}
		if (limit === null) {
			limit = 30;
		}
		return this._call('get_non_running_downloads', [properties, limit], cb);
	},
	
	/**
	 *	Does a GetSeries.php search on thetvdb.
	 *	Returns an array objects, one for each found show (may be empty), with the following properties:
	 *		'seriesid'	- the tvdb_id
	 *		'language'
	 *		'seriesname'
	 *		'overview'
	 *		'firstaired'
	 *		'network'
	 *		'imdb_id'
	 *		'zap2it_id'
	 *		'aliasnames'	- a list, if present.
	 *
	 *		@param {string} searchstring
	 *		@param {apiCallback} cb			function(err, foundShows) where foundShows is the array.
	 */
	search_series_by_name: function(searchstring, cb) {
		return this._call('search_series_by_name', [searchstring], cb);
	},
	
	/**
	 * Add a show.
	 * 
	 * 		@param {int|string} tvdb_id		tvdb_id to add.
	 * 		@param {boolean} followed		true or false.  (care: if false it will be deleted automatically later)
	 * 		@param {int} wanted_quality		One of the python tvtumbler.quality values.  Default is 3 (SDTV | SDDVD).
	 * 		@param {apiCallback} cb			Always returns true, unless the error is set. 
	 */
	add_show: function(tvdb_id, followed, wanted_quality, cb) {
		if (followed === null) {
			followed = true;
		}
		if (wanted_quality === null) {
			wanted_quality = quality.SD_COMP;
		}
		return this._call('add_show', [tvdb_id, followed, wanted_quality], cb);
	},
	
	/**
	 * Get episodes that air on a particular date.
	 * 
	 * 		@param {string} firstaired		This is an iso date format (yyyy-mm-dd) string.
	 * 		@param {array} properties		An array of strings.  The properties wanted.  See the python code
	 * 										tvtumbler.comms.server.Service for a list of possible values.  Use null
	 * 										for the defaults.
	 * 		@param {apiCallback} cb			The callback receives an array of objects, if there's no error.
	 */
	get_episodes_on_date: function(firstaired, properties, cb) {
		if (properties === null) {
			properties=['episodeid', 'tvdb_season', 'tvdb_episode', 'title',
						'art', 'show_fanart', 'show_thumbnail',
						'show_tvdb_id', 'show_name',  'have_state'
						];
		}
		return this._call('get_episodes_on_date', [firstaired, properties], cb);
	},
	
	/**
	 * Get an array of seasons for this show.
	 * 
	 * 		@param {int|string} tvdb_id		tvdb_id
	 * 		@param {apiCallback} cb			function(err, seasons) where seasons is the array.
	 */
    get_seasons: function(tvdb_id, cb) {
    	return this._call('get_seasons', [tvdb_id], cb);
    },
    
    /**
     * Get episodes in a season.
     * 
     * 		@param {int} tvdb_id			Show to search.
     * 		@param {int} tvdb_season		Season to search.  Use zero (0) for specials.
     * 		@param {array} properties		An array of strings.  The properties wanted.  See the python code
	 * 										tvtumbler.comms.server.Service for a list of possible values.  Use null
	 * 										for the defaults.
     * 		@param {apiCallback} cb			The callback receives an array of objects.
     */
    get_episodes_in_season: function(tvdb_id, tvdb_season, properties, cb) {
    	if (properties === null) {
    		properties = ['episodeid', 'tvdb_season', 'tvdb_episode', 'title', 'have_state'];
    	}
    	return this._call('get_episodes_in_season', [tvdb_id, tvdb_season, properties], cb);
    },
    
    /**
     * Refresh the episode list for a series.  Always returns True.
     */
    refresh_episodes: function(tvdb_id, cb) {
    	return this._call('refresh_episodes', [tvdb_id], cb);
    }
}

/**
 * This callback type is called `apiCallback` and is displayed as a global symbol.
 *
 * @callback apiCallback
 * @param {*} err		This will be set if an error occurred.  null otherwise.
 * @param {*} result	This is the 'return' value from jsonrpc.
 */
