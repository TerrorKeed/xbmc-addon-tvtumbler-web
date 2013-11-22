/**
 * 	This file is part of TvTumbler.
 *
 *	This is a duplication of much of the quality python code.
 *	And yes, it's very lame in places, but js just doesn't do objects without this crap.
 *
 *	@author: Dermot Buckley
 *	@copyright: Copyright (c) 2013, Dermot Buckley
 *	@license: GPL
 *	@contact: info@tvtumbler.com
 */


var quality = {
	SDTV: 				1,			//	1
	SDDVD: 				1 << 1,		//	2
	HDTV:				1 << 2, 	//	4
	RAWHDTV:			1 << 3,		//	8  -- 720p/1080i mpeg2 (trollhd releases)
	FULLHDTV: 			1 << 4,		// 16 -- 1080p HDTV (QCF releases)
	HDWEBDL: 			1 << 5,		// 32
	FULLHDWEBDL: 		1 << 6,		// 64 -- 1080p web-dl
	HDBLURAY: 			1 << 7,		// 128
	FULLHDBLURAY:		1 << 8,		//	256

	UNKNOWN_QUALITY:	1 << 15,	// 32768
	                  	
	/**
	 * These are image files in the 'images' folder.
	 */
	getImage: function(forQuality) {
		//console.log('getImage ' + forQuality + '- ' + (this.SDTV | this.SDDVD) + ' - ' + this.SD_COMP);
		if (forQuality === this.SD_COMP) {
			return '50px-480.png';
		}
		if (forQuality === this.HD_COMP) {
			return '50px-1080.png';
		}
		if (forQuality === this.HD720P_COMP) {
			return '50px-720.png';
		}
		if (forQuality === this.HD1080P_COMP) {
			return '50px-1080_n.png';
		}
		if (forQuality === this.ANY) {
			return '50px-ANY.png';
		}
		return null;
	},
	
	getLabel: function(forQuality) {
		if (this.quality_strings[forQuality]) {
			return this.quality_strings[forQuality];
		}
		return null;
	},
};

quality.SD_COMP = quality.SDTV | quality.SDDVD;
quality.HD_COMP = quality.HDTV | quality.RAWHDTV | quality.FULLHDTV | quality.HDWEBDL | quality.FULLHDWEBDL | quality.HDBLURAY | quality.FULLHDBLURAY;
quality.HD720P_COMP = quality.HDTV | quality.HDWEBDL | quality.HDBLURAY;
quality.HD1080P_COMP = quality.FULLHDTV | quality.FULLHDWEBDL | quality.FULLHDBLURAY;
quality.ANY = quality.SDTV | quality.SDDVD | quality.HDTV | quality.RAWHDTV | quality.FULLHDTV | quality.HDWEBDL | quality.FULLHDWEBDL | quality.HDBLURAY | quality.FULLHDBLURAY | quality.UNKNOWN_QUALITY;

quality.quality_strings = {}; 

// basic qualities
quality.quality_strings[quality.UNKNOWN_QUALITY] = "Unknown";
quality.quality_strings[quality.SDTV] = "SD TV";
quality.quality_strings[quality.SDDVD] = "SD DVD";
quality.quality_strings[quality.HDTV] = "HD TV";
quality.quality_strings[quality.RAWHDTV] = "RawHD TV";
quality.quality_strings[quality.FULLHDTV] = "1080p HD TV";
quality.quality_strings[quality.HDWEBDL] = "720p WEB-DL";
quality.quality_strings[quality.FULLHDWEBDL] = "1080p WEB-DL";
quality.quality_strings[quality.HDBLURAY] = "720p BluRay";
quality.quality_strings[quality.FULLHDBLURAY] = "1080p BluRay";

// composites
quality.quality_strings[quality.SD_COMP] = 'SD';
quality.quality_strings[quality.HD_COMP] = 'HD';
quality.quality_strings[quality.HD720P_COMP] = 'HD720p';
quality.quality_strings[quality.HD1080P_COMP] = 'HD1080p';
quality.quality_strings[quality.ANY] = 'ANY';
