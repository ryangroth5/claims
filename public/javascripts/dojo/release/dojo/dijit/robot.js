/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.robot"]) {
	dojo._hasResource["dijit.robot"] = true;
	dojo.provide("dijit.robot");
	dojo.require("dojo.robot");
	dojo.provide("dijit._base.place");
	dojo.require("dijit._base.scroll");
	dojo.require("dijit._base.window");
	dojo.mixin(doh.robot, {_position:function (n) {
		var d = dojo, p = null, M = Math.max, m = Math.min;
		d.forEach(doh.robot._getWindowChain(n), function (w) {
			d.withGlobal(w, function () {
				var p2 = d.position(n, false), b = d._getPadBorderExtents(n);
				if (!p) {
					p = p2;
				} else {
					var view;
					d.withGlobal(n.contentWindow, function () {
						view = dijit.getViewport();
					});
					p2.r = p2.x + view.w;
					p2.b = p2.y + view.h;
					p = {x:M(p.x + p2.x, p2.x) + b.l, y:M(p.y + p2.y, p2.y) + b.t, r:m(p.x + p2.x + p.w, p2.r) + b.l, b:m(p.y + p2.y + p.h, p2.b) + b.t};
					p.w = p.r - p.x;
					p.h = p.b - p.y;
				}
				n = w.frameElement;
			});
		});
		return p;
	}, _scrollIntoView:function (n) {
		var d = dojo, dr = doh.robot, p = null;
		d.forEach(dr._getWindowChain(n), function (w) {
			d.withGlobal(w, function () {
				var p2 = d.position(n, false), b = d._getPadBorderExtents(n), oldp = null;
				if (!p) {
					p = p2;
				} else {
					oldp = p;
					p = {x:p.x + p2.x + b.l, y:p.y + p2.y + b.t, w:p.w, h:p.h};
				}
				dijit.scrollIntoView(n, p);
				p2 = d.position(n, false);
				if (!oldp) {
					p = p2;
				} else {
					p = {x:oldp.x + p2.x + b.l, y:oldp.y + p2.y + b.t, w:p.w, h:p.h};
				}
				n = w.frameElement;
			});
		});
	}, _getWindowChain:function (n) {
		var cW = dijit.getDocumentWindow(n.ownerDocument);
		var arr = [cW];
		var f = cW.frameElement;
		return (cW == dojo.global || f == null) ? arr : arr.concat(doh.robot._getWindowChain(f));
	}});
}

