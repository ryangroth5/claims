/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._base.scroll"]) {
	dojo._hasResource["dijit._base.scroll"] = true;
	dojo.provide("dijit._base.scroll");
	dijit.scrollIntoView = function (node, pos) {
		try {
			node = dojo.byId(node);
			var doc = node.ownerDocument || dojo.doc, body = doc.body || dojo.body(), html = doc.documentElement || body.parentNode, isIE = dojo.isIE, isWK = dojo.isWebKit;
			if ((!(dojo.isMoz || isIE || isWK) || node == body || node == html) && (typeof node.scrollIntoView != "undefined")) {
				node.scrollIntoView(false);
				return;
			}
			var backCompat = doc.compatMode == "BackCompat", clientAreaRoot = backCompat ? body : html, scrollRoot = isWK ? body : clientAreaRoot, rootWidth = clientAreaRoot.clientWidth, rootHeight = clientAreaRoot.clientHeight, rtl = !dojo._isBodyLtr(), nodePos = pos || dojo.position(node), el = node.parentNode, isFixed = function (el) {
				return ((isIE <= 6 || (isIE && backCompat)) ? false : (dojo.style(el, "position").toLowerCase() == "fixed"));
			};
			if (isFixed(node)) {
				return;
			}
			while (el) {
				if (el == body) {
					el = scrollRoot;
				}
				var elPos = dojo.position(el), fixedPos = isFixed(el);
				with (elPos) {
					if (el == scrollRoot) {
						w = rootWidth, h = rootHeight;
						if (scrollRoot == html && isIE && rtl) {
							x += scrollRoot.offsetWidth - w;
						}
						if (x < 0 || !isIE) {
							x = 0;
						}
						if (y < 0 || !isIE) {
							y = 0;
						}
					} else {
						var pb = dojo._getPadBorderExtents(el);
						w -= pb.w;
						h -= pb.h;
						x += pb.l;
						y += pb.t;
					}
					with (el) {
						if (el != scrollRoot) {
							var clientSize = clientWidth, scrollBarSize = w - clientSize;
							if (clientSize > 0 && scrollBarSize > 0) {
								w = clientSize;
								if (isIE && rtl) {
									x += scrollBarSize;
								}
							}
							clientSize = clientHeight;
							scrollBarSize = h - clientSize;
							if (clientSize > 0 && scrollBarSize > 0) {
								h = clientSize;
							}
						}
						if (fixedPos) {
							if (y < 0) {
								h += y, y = 0;
							}
							if (x < 0) {
								w += x, x = 0;
							}
							if (y + h > rootHeight) {
								h = rootHeight - y;
							}
							if (x + w > rootWidth) {
								w = rootWidth - x;
							}
						}
						var l = nodePos.x - x, t = nodePos.y - Math.max(y, 0), r = l + nodePos.w - w, bot = t + nodePos.h - h;
						if (r * l > 0) {
							var s = Math[l < 0 ? "max" : "min"](l, r);
							nodePos.x += scrollLeft;
							scrollLeft += (isIE >= 8 && !backCompat && rtl) ? -s : s;
							nodePos.x -= scrollLeft;
						}
						if (bot * t > 0) {
							nodePos.y += scrollTop;
							scrollTop += Math[t < 0 ? "max" : "min"](t, bot);
							nodePos.y -= scrollTop;
						}
					}
				}
				el = (el != scrollRoot) && !fixedPos && el.parentNode;
			}
		}
		catch (error) {
			console.error("scrollIntoView: " + error);
			node.scrollIntoView(false);
		}
	};
}

