/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.gfx"]) {
	dojo._hasResource["dojox.gfx"] = true;
	dojo.provide("dojox.gfx");
	dojo.require("dojox.gfx.matrix");
	dojo.require("dojox.gfx._base");
	dojo.loadInit(function () {
		var gfx = dojo.getObject("dojox.gfx", true), sl, flag, match;
		if (!gfx.renderer) {
			if (dojo.config.forceGfxRenderer) {
				dojox.gfx.renderer = dojo.config.forceGfxRenderer;
				return;
			}
			var renderers = (typeof dojo.config.gfxRenderer == "string" ? dojo.config.gfxRenderer : "svg,vml,silverlight,canvas").split(",");
			var ua = navigator.userAgent, iPhoneOsBuild = 0, androidVersion = 0;
			if (dojo.isSafari >= 3) {
				if (ua.indexOf("iPhone") >= 0 || ua.indexOf("iPod") >= 0) {
					match = ua.match(/Version\/(\d(\.\d)?(\.\d)?)\sMobile\/([^\s]*)\s?/);
					if (match) {
						iPhoneOsBuild = parseInt(match[4].substr(0, 3), 16);
					}
				}
			}
			if (dojo.isWebKit) {
				if (!iPhoneOsBuild) {
					match = ua.match(/Android\s+(\d+\.\d+)/);
					if (match) {
						androidVersion = parseFloat(match[1]);
					}
				}
			}
			for (var i = 0; i < renderers.length; ++i) {
				switch (renderers[i]) {
				  case "svg":
					if (!dojo.isIE && (!iPhoneOsBuild || iPhoneOsBuild >= 1521) && !androidVersion && !dojo.isAIR) {
						dojox.gfx.renderer = "svg";
					}
					break;
				  case "vml":
					if (dojo.isIE) {
						dojox.gfx.renderer = "vml";
					}
					break;
				  case "silverlight":
					try {
						if (dojo.isIE) {
							sl = new ActiveXObject("AgControl.AgControl");
							if (sl && sl.IsVersionSupported("1.0")) {
								flag = true;
							}
						} else {
							if (navigator.plugins["Silverlight Plug-In"]) {
								flag = true;
							}
						}
					}
					catch (e) {
						flag = false;
					}
					finally {
						sl = null;
					}
					if (flag) {
						dojox.gfx.renderer = "silverlight";
					}
					break;
				  case "canvas":
					if (!dojo.isIE) {
						dojox.gfx.renderer = "canvas";
					}
					break;
				}
				if (dojox.gfx.renderer) {
					break;
				}
			}
			if (dojo.config.isDebug) {
				console.log("gfx renderer = " + dojox.gfx.renderer);
			}
		}
	});
	dojo.requireIf(dojox.gfx.renderer == "svg", "dojox.gfx.svg");
	dojo.requireIf(dojox.gfx.renderer == "vml", "dojox.gfx.vml");
	dojo.requireIf(dojox.gfx.renderer == "silverlight", "dojox.gfx.silverlight");
	dojo.requireIf(dojox.gfx.renderer == "canvas", "dojox.gfx.canvas");
}

