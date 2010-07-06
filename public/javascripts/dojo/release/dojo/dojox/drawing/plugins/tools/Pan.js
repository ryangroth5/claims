/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.drawing.plugins.tools.Pan"]) {
	dojo._hasResource["dojox.drawing.plugins.tools.Pan"] = true;
	dojo.provide("dojox.drawing.plugins.tools.Pan");
	dojo.require("dojox.drawing.plugins._Plugin");
	dojox.drawing.plugins.tools.Pan = dojox.drawing.util.oo.declare(dojox.drawing.plugins._Plugin, function (options) {
		this.domNode = options.node;
		var _scrollTimeout;
		this.toolbar = options.scope;
		this.connect(this.toolbar, "onToolClick", this, function () {
			this.onSetPan(false);
		});
		this.connect(this.button, "onClick", this, "onSetPan");
		this.connect(this.keys, "onKeyUp", this, "onKeyUp");
		this.connect(this.keys, "onKeyDown", this, "onKeyDown");
		this.connect(this.anchors, "onAnchorUp", this, "checkBounds");
		this.connect(this.stencils, "register", this, "checkBounds");
		this.connect(this.canvas, "resize", this, "checkBounds");
		this.connect(this.canvas, "setZoom", this, "checkBounds");
		this.connect(this.canvas, "onScroll", this, function () {
			if (this._blockScroll) {
				this._blockScroll = false;
				return;
			}
			_scrollTimeout && clearTimeout(_scrollTimeout);
			_scrollTimeout = setTimeout(dojo.hitch(this, "checkBounds"), 200);
		});
		this._mouseHandle = this.mouse.register(this);
	}, {selected:false, type:"dojox.drawing.plugins.tools.Pan", onPanUp:function (obj) {
		if (obj.id == this.button.id) {
			this.onSetPan(false);
		}
	}, onKeyUp:function (evt) {
		if (evt.keyCode == 32) {
			this.onSetPan(false);
		}
	}, onKeyDown:function (evt) {
		if (evt.keyCode == 32) {
			this.onSetPan(true);
		}
	}, onSetPan:function (bool) {
		if (bool === true || bool === false) {
			this.selected = !bool;
		}
		console.log("ON SET PAN:", this.selected);
		if (this.selected) {
			this.selected = false;
			this.button.deselect();
		} else {
			this.selected = true;
			this.button.select();
		}
		this.mouse.setEventMode(this.selected ? "pan" : "");
	}, onPanDrag:function (obj) {
		var x = obj.x - obj.last.x;
		var y = obj.y - obj.last.y;
		this.canvas.domNode.parentNode.scrollTop -= obj.move.y;
		this.canvas.domNode.parentNode.scrollLeft -= obj.move.x;
		this.canvas.onScroll();
	}, onStencilUp:function (obj) {
		this.checkBounds();
	}, onStencilDrag:function (obj) {
	}, checkBounds:function () {
		var log = function () {
		};
		var warn = function () {
		};
		var t = Infinity, r = -Infinity, b = -10000, l = 10000, sx = 0, sy = 0, dy = 0, dx = 0, mx = this.stencils.group ? this.stencils.group.getTransform() : {dx:0, dy:0}, sc = this.mouse.scrollOffset(), scY = sc.left ? 10 : 0, scX = sc.top ? 10 : 0, ch = this.canvas.height, cw = this.canvas.width, z = this.canvas.zoom, pch = this.canvas.parentHeight, pcw = this.canvas.parentWidth;
		this.stencils.withSelected(function (m) {
			var o = m.getBounds();
			warn("SEL BOUNDS:", o);
			t = Math.min(o.y1 + mx.dy, t);
			r = Math.max(o.x2 + mx.dx, r);
			b = Math.max(o.y2 + mx.dy, b);
			l = Math.min(o.x1 + mx.dx, l);
		});
		this.stencils.withUnselected(function (m) {
			var o = m.getBounds();
			warn("UN BOUNDS:", o);
			t = Math.min(o.y1, t);
			r = Math.max(o.x2, r);
			b = Math.max(o.y2, b);
			l = Math.min(o.x1, l);
			log("----------- B:", b, o.y2);
		});
		b *= z;
		var xscroll = 0, yscroll = 0;
		log("Bottom test", "b:", b, "z:", z, "ch:", ch, "pch:", pch, "top:", sc.top, "sy:", sy, "mx.dy:", mx.dy);
		if (b > pch || sc.top) {
			log("*bottom scroll*");
			ch = Math.max(b, pch + sc.top);
			sy = sc.top;
			xscroll += this.canvas.getScrollWidth();
		} else {
			if (!sy && ch > pch) {
				log("*bottom remove*");
				ch = pch;
			}
		}
		r *= z;
		if (r > pcw || sc.left) {
			cw = Math.max(r, pcw + sc.left);
			sx = sc.left;
			yscroll += this.canvas.getScrollWidth();
		} else {
			if (!sx && cw > pcw) {
				cw = pcw;
			}
		}
		cw += xscroll * 2;
		ch += yscroll * 2;
		this._blockScroll = true;
		this.stencils.group && this.stencils.group.applyTransform({dx:dx, dy:dy});
		this.stencils.withUnselected(function (m) {
			m.transformPoints({dx:dx, dy:dy});
		});
		this.canvas.setDimensions(cw, ch, sx, sy);
	}});
	dojox.drawing.plugins.tools.Pan.setup = {name:"dojox.drawing.plugins.tools.Pan", tooltip:"Pan Tool", iconClass:"iconPan"};
	dojox.drawing.register(dojox.drawing.plugins.tools.Pan.setup, "plugin");
}

