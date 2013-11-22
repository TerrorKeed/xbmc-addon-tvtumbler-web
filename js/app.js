var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var calendarProperties = ['episodeid', 'tvdb_season', 'tvdb_episode', 'title',
                          'art', 'show_fanart', 'show_thumbnail', 'show_tvdb_id',
                          'show_name', 'have_state'];

$(document).ready(function() {
	buildMenu();
	showShows();
});

function buildMenu()
{
	['shows', 'calendar', 'downloads', 'status'].forEach(function(item, index) {
		$('#topmenu').append($('<a id="menu_' + item + '" href="#' + item + '"></a>')
							 .text(item.toUpperCase())
							 );
	});
	
	$('#menu_shows').click(function() {
		showShows();
		return false;
	});
	
	$('#menu_calendar').click(function() {
		showCalendar();
		return false;
	});
	
	$('#menu_downloads').click(function() {
		showDownloads();
		return false;
	});
	
	$('#menu_status').click(function() {
		showStatus();
		return false;
	});
}

function selectMenu(item)
{
	$('#topmenu > a').removeClass('selected');
	$('#menu_' + item).addClass('selected');
}

function showShows()
{
	selectMenu('shows');
	var tbl = $('<table id="showtable" style="margin: 0 auto;" cellspacing="0" cellpadding="0"></table>');
	var thead = $('<thead><tr><th align="left">Title</th><th align="left">Follow</th><th align="center">Status</th><th align="center">Quality</th></tr></thead>');
	var tbody = $('<tbody></tbody>');
	$('#content').html(tbl.append(thead, tbody)).attr("class","shows loading");
	
	function newRow(d) {
//	{
//		fast_status: "Continuing"
//		followed: true
//		name: "Once Upon a Time (2011)"
//		tvdb_id: "248835"
//		tvshowid: 1152
//		wanted_quality: 3
//	}
		var tr = $('<tr class="showrow"><td align="left"></td><td align="left"></td><td align="center"></td><td align="center"></td></tr>');
		tr.children('td').each(function(index, td) {
    		switch (index) {
    		case 0:	//	Title
    			$(td).text(d.name);
    			break;
    		case 1:	//	Followed
    			if (d.followed) {
    				$(td).text('Follow');
    				$(td).attr('class', 'follow');
    			}
    			else {
    				$(td).text('Ignore');
    				$(td).attr('class', 'ignore');
    			}
    			break;
    		case 2:	//	Status
    			if (d.fast_status) {
    				$(td).text(d.fast_status);
    			}
    			break;
    		case 3:	//	Quality
    			if (d.followed) {
    				//	if we have an image for it, we use that.
    				var imgName = quality.getImage(d.wanted_quality);
    				//console.log('got image: ' + imgName);
    				var labelName = quality.getLabel(d.wanted_quality);
    				if (imgName) {
    					var img = $('<div style="position: relative; height: 20px"><img src="images/' + imgName + '" class="imgQuality" /></div>');
    					if (labelName) img.attr('title', labelName);
    					$(td).html(img);
    				}
    				else {
    					$(td).text(labelName);
    				}
    			}
    			
    			break;
    		default:
    			console.log('Too many columns in row!  Excepted 4!');
    		}
    	});
    	
    	return tr;
	}

	var shows = {};
	
	api.get_all_shows(properties=['tvshowid', 'name', 'tvdb_id',
                                  'followed', 'wanted_quality', 'fast_status'], function(err, showsdata) {
		if (err) {
			throw err;
		}
		
		//	sort the shows with our special sort function
		showsdata.sort(function(a, b) {
			var aName = a.name.toLowerCase();
			var bName = b.name.toLowerCase(); 
			if (aName.substring(0, 4) == 'the ') aName = aName.substring(4);
			if (bName.substring(0, 4) == 'the ') bName = bName.substring(4);
			return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
		});
		
		$.each(showsdata, function(index, d) {
			var tr = newRow(d);
			shows[d.tvdb_id] = {'tr': tr, 'data': d};
			tbody.append(tr);
		});
		
		//console.log(showsdata);
		$('#content').removeClass('loading');
			
	});
	
	
}

function showCalendar()
{
	selectMenu('calendar');
	//$('#content').addClass('loading');
	
	$('#content').html('').attr("class","calendar loading");
	var table = $('<table style="margin: 0 auto" cellpadding="2"></table>');
	var thead = $('<tr></tr>');
	var tbody = $('<tr></tr>');
	table.append(thead, tbody);
	$('#content').append(table);
	//table.hide();
	
	//var tsNow = new Date().getTime();	//	timestamp in millis
	var now = new Date();
	[-1, 0, 1, 2, 3, 4, 5].forEach(function(daysFwd, index) {
		//var dt = new Date(tsNow + (daysFwd * 60 * 60 * 24 * 1000));
		var dt = new Date()
		dt.setDate(now.getDate() + daysFwd);
		var th = $('<th></th>');
		var td = $('<td valign="top"></td>');
		var isoDt = isoDate(dt);
		thead.append(th);
		tbody.append(td);
		api.get_episodes_on_date(isoDt, calendarProperties, function(err, eps) {
			//console.log(eps);
			//console.log('got eps for ' + isoDt + ' for ' + dt.toISOString());
			var headBlock = $('<div class="day_head"></div>');
			headBlock.append($('<div class="day_name"></div>').text(dayNames[dt.getDay()]));
			headBlock.append($('<div class="mon_name"></div>').text(monthNames[dt.getMonth()]));
			headBlock.append($('<div class="d_of_mon"></div>').text(dt.getDate()));
			th.append(headBlock);
			
			eps.forEach(function(ep, index) {
				//console.log(ep);
				var epBlock = $('<div class="cal_episode"></div>');
				
				var imgPath = null;
	            if (ep.art && ep.art.thumb) imgPath = ep.art.thumb;
	            else if (ep.art && ep.art['tvshow.fanart']) imgPath = ep.art['tvshow.fanart'];
	            else if (ep.show_fanart) imgPath = ep.show_fanart;
	            else if (ep.show_thumbnail) imgPath = ep.show_thumbnail;
				if (imgPath) {
					var img = $('<img src="' + makeImageUrl(imgPath) + '" class="epimg" />');
					epBlock.append(img);
				}
				
				var dlOverlay = null;
				if (ep.have_state == 'downloaded') {
					dlOverlay = $('<img src="images/downloaded_overlay.png" class="epDlOverlay" title="State: Downloaded" />');
				}
				else if (ep.have_status == 'downloading') {
					dlOverlay = $('<img src="images/downloading_overlay.png" class="epDlOverlay" title="State: Downloading" />');
				}
				if (dlOverlay) {
					epBlock.append(dlOverlay);
				}
				
				var epNum = $('<div class="epnum">' + ep.tvdb_season + 'x' + ep.tvdb_episode + '</div>');
				var epName = $('<div class="epname"></div>').text(ep.title);
				var showName = $('<div class="showname"></div>').text(ep.show_name);
				epBlock.append(epNum, epName, showName);
				epBlock.attr('title', ep.show_name + "\n" + ep.title);
				td.append(epBlock);
			});
			
			if (daysFwd == 5) {
				//	this was our last day, remove the loading icon
				$('#content').removeClass('loading');
				//table.show('slow');
			}
		});
	});
}

function showDownloads()
{
	selectMenu('downloads');
	var tbl = $('<table id="dltable" style="margin: 0 auto;" cellspacing="0" cellpadding="0"></table>');
	var thead = $('<thead><tr><th align="left">Date</th><th align="left">Title</th><th align="left">Status</th><th align="right">Size</th><th align="center">Source</th></tr></thead>');
	var tbody = $('<tbody></tbody>');
	$('#content').html(tbl.append(thead, tbody)).attr("class","downloads loading");
	
	function newRow() {
		return $('<tr class="dlrow"><td align="left"></td><td align="left"></td><td align="left"></td><td align="right"></td><td align="center"></td></tr>');
	}
	
	function updateRow(tr, d, running) {
		tr.children('td').each(function(index, td) {
    		switch (index) {
    		case 0:	//	Date
    			$(td).text(timestampAsTime(d.start_time));
    			break;
    		case 1:	//	Title
    			$(td).text(d.name);
    			break;
    		case 2:	//	Status
    			if (running) {
    				$(td).text(d.status_text);
    				$(td).attr('class', 'Running');
    			}
    			else {
    				$(td).text(d.final_status + ' (' + timedeltaFormat(d.start_time, d.finish_time) + ')');
    				$(td).attr('class', d.final_status);
    			}
    			break;
    		case 3:	//	Size
    			if (running) {
    				$(td).text(humanFileSize(d.downloaded_size)  + '/' + humanFileSize(d.total_size, '?'));
    			}
    			else {
    				$(td).text(humanFileSize(d.total_size, ''));
    			}
    			break;
    		case 4:	//	Source
    			$(td).text(d.source);
    			break;
    		default:
    			console.log('Too many columns in row!  Excepted 5!');
    		}
    	});
    	
    	return tr;
	}

    //var full_refresh = false;
	var num_running = -1;
	var dls = {};
	var timerHandle = null;
	
	function refreshData() {
		if (!$('#dltable') || !jQuery.contains(document.documentElement, $('#dltable')[0])) {
//			if the table is gone, we return and stop the time
			console.log('download table is gone.  stopping');
			clearInterval(timerHandle);
			return;
		}
		api.get_running_downloads(null, null, function(err, rds) {
			if (err) {
				throw err;
			}
			
			$.each(rds, function(index, rd) {
				var rowid = rd.rowid;
				
				if (!dls[rowid]) {
					var tr = newRow();
					tbody.append(tr);
					dls[rowid] = { 'data': rd, 'tr': tr };
				}
				else {
					dls[rowid].data = rd;
				}
				
				updateRow(dls[rowid].tr, dls[rowid].data, true);
			});
			
			//	if the number of running downloads has changed, we need to refresh finished downloads
			//	also.
			if (num_running !== rds.length) {
				num_running = rds.length;
				api.get_non_running_downloads(null, 100, function(err, nrds) {
					if (err) {
						throw err;
					}
					
					$.each(nrds, function(index, nrd) {
						var rowid = nrd.rowid;
						
						if (!dls[rowid]) {
							var tr = newRow();
							tbody.append(tr);
							dls[rowid] = { 'data': nrd, 'tr': tr };
						}
						else {
							dls[rowid].data = nrd;
						}
						
						updateRow(dls[rowid].tr, dls[rowid].data, false);
					});
				});
			}
			
			$('#content').removeClass('loading');
		});
	}
	
	refreshData();
	timerHandle = setInterval(refreshData, 4800);
}

function showStatus()
{
	selectMenu('status');
	$('#content').html('<div style="margin-top: 100px; text-align: center; font-size: 30px; color: #444">Not Implemented</div>')
	 			 .attr("class","status");
}


/**
 * Returns an iso date representation of dt.
 * 
 * @param {Date} dt
 * @return {string}	YYYY-MM-DD.
 */
function isoDate(dt) {
	//	doesn't work, returns a UTC date.
	//	return dt.toISOString().substring(0, 10);	
	/*//	use this instead...
    function pad(number) {
        if ( number < 10 ) return '0' + number;
        return number;
    }
    return dt.getFullYear() + '-' + pad( dt.getMonth() + 1 ) + '-' + pad( dt.getDate() );*/
	
	//	moment makes this all very simple
	return moment(dt).format('YYYY-MM-DD');
}

function timestampAsTime(ts) 
{
    dt = moment.unix(ts);
    last_midnight = moment({hour: 0, minute: 0});
    last_week = moment(last_midnight).subtract('days', 7);
    if (dt.isAfter(last_midnight)) {
        _fmt = 'HH:mm';
    }
    else if (dt.isAfter(last_week)) {
        _fmt = 'ddd HH:mm';
    }
    else {
        _fmt = 'YYYY-MM-DD';
    }
    return dt.format(_fmt);
}

function humanFileSize(bytes, zero_as, si) {
	zero_as = typeof zero_as !== 'undefined' ? zero_as : '0';
	si = typeof si !== 'undefined' ? si : false;
	
    var thresh = si ? 1000 : 1024;
    if(bytes < thresh) return bytes + ' B';
    var units = si ? ['kB','MB','GB','TB','PB','EB','ZB','YB'] : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(bytes >= thresh);
    return bytes.toFixed(1) + units[u];
}

function timedeltaFormat(start_ts, end_ts) {
    secs = end_ts - start_ts;
    if (secs < 90) {
    	return Math.round(secs)  + ' secs';
    }
    if (secs < 5400) {	//	1.5 hrs
    	return Math.round(secs/60) + ' mins';
    }
    if (secs < 86400) {	//	24 hrs
    	var div = Math.floor(secs/3600);
    	var rem = Math.round((secs%3600)/60);
    	return div + ' h ' + rem + ' m';
    }
    return Math.round(secs/3600) + ' hours';
}

/**
 * Turn an xbmc image path into a browser one.
 * 
 * @param {string} xbmcUrl
 * @returns {String}
 */
function makeImageUrl(xbmcUrl) {
	return '/image/' + encodeURIComponent(xbmcUrl);
}
