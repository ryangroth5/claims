/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._base.sniff"]) {
	dojo._hasResource["dijit._base.sniff"] = true;
	dojo.provide("dijit._base.sniff");
	(function () {
		var d = dojo, html = d.doc.documentElement, ie = d.isIE, opera = d.isOpera, maj = Math.floor, ff = d.isFF, boxModel = d.boxModel.replace(/-/, ""), classes = {dj_ie:ie, dj_ie6:maj(ie) == 6, dj_ie7:maj(ie) == 7, dj_ie8:maj(ie) == 8, dj_iequirks:ie && d.isQuirks, dj_opera:opera, dj_khtml:d.isKhtml, dj_webkit:d.isWebKit, dj_safari:d.isSafari, dj_chrome:d.isChrome, dj_gecko:d.isMozilla, dj_ff3:maj(ff) == 3};
		classes["dj_" + boxModel] = true;
		for (var p in classes) {
			if (classes[p]) {
				if (html.className) {
					html.className += " " + p;
				} else {
					html.className = p;
				}
			}
		}
		dojo._loaders.unshift(function () {
			if (!dojo._isBodyLtr()) {
				html.className += " dijitRtl";
				for (var p in classes) {
					if (classes[p]) {
						html.className += " " + p + "-rtl";
					}
				}
			}
		});
	})();
}

