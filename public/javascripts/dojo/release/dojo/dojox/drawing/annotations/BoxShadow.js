/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.drawing.annotations.BoxShadow"]) {
	dojo._hasResource["dojox.drawing.annotations.BoxShadow"] = true;
	dojo.provide("dojox.drawing.annotations.BoxShadow");
	dojox.drawing.annotations.BoxShadow = dojox.drawing.util.oo.declare(function (options) {
		this.stencil = options.stencil;
		this.util = options.stencil.util;
		this.mouse = options.stencil.mouse;
		this.style = options.stencil.style;
		var shadowDefaults = {size:6, mult:4, alpha:0.05, place:"BR", color:"#646464"};
		delete options.stencil;
		this.options = dojo.mixin(shadowDefaults, options);
		this.options.color = new dojo.Color(this.options.color);
		this.options.color.a = this.options.alpha;
		switch (this.stencil.shortType) {
		  case "image":
		  case "rect":
			this.method = "createForRect";
			break;
		  case "ellipse":
			this.method = "createForEllipse";
			break;
		  case "line":
			this.method = "createForLine";
			break;
		  case "path":
			this.method = "createForPath";
			break;
		  default:
			console.warn("A shadow cannot be made for Stencil type ", this.stencil.type);
		}
		if (this.method) {
			this.render();
			this.stencil.connectMult([[this.stencil, "onTransform", this, "onTransform"], [this.stencil, "render", this, "onRender"], [this.stencil, "onDelete", this, "destroy"]]);
		}
	}, {showing:true, render:function () {
		if (this.container) {
			this.container.removeShape();
		}
		this.container = this.stencil.container.createGroup();
		this.container.moveToBack();
		var o = this.options, size = o.size, mult = o.mult, d = this.method == "createForPath" ? this.stencil.points : this.stencil.data, r = d.r || 1, p = o.place, c = o.color;
		this[this.method](o, size, mult, d, r, p, c);
	}, hide:function () {
		if (this.showing) {
			this.showing = false;
			this.container.removeShape();
		}
	}, show:function () {
		if (!this.showing) {
			this.showing = true;
			this.stencil.container.add(this.container);
		}
	}, createForPath:function (o, size, mult, pts, r, p, c) {
		var sh = size * mult / 4, shy = /B/.test(p) ? sh : /T/.test(p) ? sh * -1 : 0, shx = /R/.test(p) ? sh : /L/.test(p) ? sh * -1 : 0;
		var closePath = true;
		for (var i = 1; i <= size; i++) {
			var lineWidth = i * mult;
			if (dojox.gfx.renderer == "svg") {
				var strAr = [];
				dojo.forEach(pts, function (o, i) {
					if (i == 0) {
						strAr.push("M " + (o.x + shx) + " " + (o.y + shy));
					} else {
						var cmd = o.t || "L ";
						strAr.push(cmd + (o.x + shx) + " " + (o.y + shy));
					}
				}, this);
				if (closePath) {
					strAr.push("Z");
				}
				this.container.createPath(strAr.join(", ")).setStroke({width:lineWidth, color:c, cap:"round"});
			} else {
				var pth = this.container.createPath({}).setStroke({width:lineWidth, color:c, cap:"round"});
				dojo.forEach(this.points, function (o, i) {
					if (i == 0 || o.t == "M") {
						pth.moveTo(o.x + shx, o.y + shy);
					} else {
						if (o.t == "Z") {
							closePath && pth.closePath();
						} else {
							pth.lineTo(o.x + shx, o.y + shy);
						}
					}
				}, this);
				closePath && pth.closePath();
			}
		}
	}, createForLine:function (o, size, mult, d, r, p, c) {
		var sh = size * mult / 4, shy = /B/.test(p) ? sh : /T/.test(p) ? sh * -1 : 0, shx = /R/.test(p) ? sh : /L/.test(p) ? sh * -1 : 0;
		for (var i = 1; i <= size; i++) {
			var lineWidth = i * mult;
			this.container.createLine({x1:d.x1 + shx, y1:d.y1 + shy, x2:d.x2 + shx, y2:d.y2 + shy}).setStroke({width:lineWidth, color:c, cap:"round"});
		}
	}, createForEllipse:function (o, size, mult, d, r, p, c) {
		var sh = size * mult / 8, shy = /B/.test(p) ? sh : /T/.test(p) ? sh * -1 : 0, shx = /R/.test(p) ? sh * 0.8 : /L/.test(p) ? sh * -0.8 : 0;
		for (var i = 1; i <= size; i++) {
			var lineWidth = i * mult;
			this.container.createEllipse({cx:d.cx + shx, cy:d.cy + shy, rx:d.rx - sh, ry:d.ry - sh, r:r}).setStroke({width:lineWidth, color:c});
		}
	}, createForRect:function (o, size, mult, d, r, p, c) {
		var sh = size * mult / 2, shy = /B/.test(p) ? sh : /T/.test(p) ? 0 : sh / 2, shx = /R/.test(p) ? sh : /L/.test(p) ? 0 : sh / 2;
		for (var i = 1; i <= size; i++) {
			var lineWidth = i * mult;
			this.container.createRect({x:d.x + shx, y:d.y + shy, width:d.width - sh, height:d.height - sh, r:r}).setStroke({width:lineWidth, color:c});
		}
	}, onTransform:function () {
		this.render();
	}, onRender:function () {
		this.container.moveToBack();
	}, destroy:function () {
		if (this.container) {
			this.container.removeShape();
		}
	}});
}

