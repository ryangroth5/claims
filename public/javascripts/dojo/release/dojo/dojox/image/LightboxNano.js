/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.image.LightboxNano"]) {
	dojo._hasResource["dojox.image.LightboxNano"] = true;
	dojo.provide("dojox.image.LightboxNano");
	dojo.require("dojo.fx");
	(function (d) {
		var abs = "absolute", vis = "visibility", getViewport = function () {
			var scrollRoot = (d.doc.compatMode == "BackCompat") ? d.body() : d.doc.documentElement, scroll = dojo._docScroll();
			return {w:scrollRoot.clientWidth, h:scrollRoot.clientHeight, l:scroll.x, t:scroll.y};
		};
		d.declare("dojox.image.LightboxNano", null, {href:"", duration:500, preloadDelay:5000, constructor:function (p, n) {
			var _this = this;
			d.mixin(_this, p);
			n = _this._node = dojo.byId(n);
			if (n) {
				if (!/a/i.test(n.tagName)) {
					var a = d.create("a", {href:_this.href, "class":n.className}, n, "after");
					n.className = "";
					a.appendChild(n);
					n = a;
				}
				d.style(n, "position", "relative");
				_this._createDiv("dojoxEnlarge", n);
				d.setSelectable(n, false);
				_this._onClickEvt = d.connect(n, "onclick", _this, "_load");
			}
			if (_this.href) {
				setTimeout(function () {
					(new Image()).src = _this.href;
					_this._hideLoading();
				}, _this.preloadDelay);
			}
		}, destroy:function () {
			var a = this._connects || [];
			a.push(this._onClickEvt);
			d.forEach(a, d.disconnect);
			d.destroy(this._node);
		}, _createDiv:function (cssClass, refNode, display) {
			return d.create("div", {"class":cssClass, style:{position:abs, display:display ? "" : "none"}}, refNode);
		}, _load:function (e) {
			var _this = this;
			e && d.stopEvent(e);
			if (!_this._loading) {
				_this._loading = true;
				_this._reset();
				var i = _this._img = d.create("img", {style:{visibility:"hidden", cursor:"pointer", position:abs, top:0, left:0, zIndex:9999999}}, d.body()), ln = _this._loadingNode, n = d.query("img", _this._node)[0] || _this._node, a = d.position(n, true), c = d.contentBox(n), b = d._getBorderExtents(n);
				if (ln == null) {
					_this._loadingNode = ln = _this._createDiv("dojoxLoading", _this._node, true);
					var l = d.marginBox(ln);
					d.style(ln, {left:parseInt((c.w - l.w) / 2) + "px", top:parseInt((c.h - l.h) / 2) + "px"});
				}
				c.x = a.x - 10 + b.l;
				c.y = a.y - 10 + b.t;
				_this._start = c;
				_this._connects = [d.connect(i, "onload", _this, "_show")];
				i.src = _this.href;
			}
		}, _hideLoading:function () {
			if (this._loadingNode) {
				d.style(this._loadingNode, "display", "none");
			}
			this._loadingNode = false;
		}, _show:function () {
			var _this = this, vp = getViewport(), w = _this._img.width, h = _this._img.height, vpw = parseInt((vp.w - 20) * 0.9), vph = parseInt((vp.h - 20) * 0.9), dd = d.doc, bg = _this._bg = d.create("div", {style:{backgroundColor:"#000", opacity:0, position:abs, zIndex:9999998}}, d.body()), ln = _this._loadingNode;
			if (_this._loadingNode) {
				_this._hideLoading();
			}
			d.style(_this._img, {border:"10px solid #fff", visibility:"visible"});
			d.style(_this._node, vis, "hidden");
			_this._loading = false;
			_this._connects = _this._connects.concat([d.connect(dd, "onmousedown", _this, "_hide"), d.connect(dd, "onkeypress", _this, "_key"), d.connect(window, "onresize", _this, "_sizeBg")]);
			if (w > vpw) {
				h = h * vpw / w;
				w = vpw;
			}
			if (h > vph) {
				w = w * vph / h;
				h = vph;
			}
			_this._end = {x:(vp.w - 20 - w) / 2 + vp.l, y:(vp.h - 20 - h) / 2 + vp.t, w:w, h:h};
			_this._sizeBg();
			d.fx.combine([_this._anim(_this._img, _this._coords(_this._start, _this._end)), _this._anim(bg, {opacity:0.5})]).play();
		}, _sizeBg:function () {
			var dd = d.doc.documentElement;
			d.style(this._bg, {top:0, left:0, width:dd.scrollWidth + "px", height:dd.scrollHeight + "px"});
		}, _key:function (e) {
			d.stopEvent(e);
			this._hide();
		}, _coords:function (s, e) {
			return {left:{start:s.x, end:e.x}, top:{start:s.y, end:e.y}, width:{start:s.w, end:e.w}, height:{start:s.h, end:e.h}};
		}, _hide:function () {
			var _this = this;
			d.forEach(_this._connects, d.disconnect);
			_this._connects = [];
			d.fx.combine([_this._anim(_this._img, _this._coords(_this._end, _this._start), "_reset"), _this._anim(_this._bg, {opacity:0})]).play();
		}, _reset:function () {
			d.style(this._node, vis, "visible");
			d.forEach([this._img, this._bg], function (n) {
				d.destroy(n);
				n = null;
			});
			this._node.focus();
		}, _anim:function (node, args, onEnd) {
			return d.animateProperty({node:node, duration:this.duration, properties:args, onEnd:onEnd ? d.hitch(this, onEnd) : null});
		}, show:function (args) {
			args = args || {};
			this.href = args.href || this.href;
			var n = d.byId(args.origin), vp = getViewport();
			this._node = n || d.create("div", {style:{position:abs, width:0, hieght:0, left:(vp.l + (vp.w / 2)) + "px", top:(vp.t + (vp.h / 2)) + "px"}}, d.body());
			this._load();
			if (!n) {
				d.destroy(this._node);
			}
		}});
	})(dojo);
}

