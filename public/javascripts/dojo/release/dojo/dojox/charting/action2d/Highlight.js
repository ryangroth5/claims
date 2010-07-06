/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.action2d.Highlight"]) {
	dojo._hasResource["dojox.charting.action2d.Highlight"] = true;
	dojo.provide("dojox.charting.action2d.Highlight");
	dojo.require("dojox.charting.action2d.Base");
	dojo.require("dojox.color");
	(function () {
		var DEFAULT_SATURATION = 100, DEFAULT_LUMINOSITY1 = 75, DEFAULT_LUMINOSITY2 = 50, c = dojox.color, cc = function (color) {
			return function () {
				return color;
			};
		}, hl = function (color) {
			var a = new c.Color(color), x = a.toHsl();
			if (x.s == 0) {
				x.l = x.l < 50 ? 100 : 0;
			} else {
				x.s = DEFAULT_SATURATION;
				if (x.l < DEFAULT_LUMINOSITY2) {
					x.l = DEFAULT_LUMINOSITY1;
				} else {
					if (x.l > DEFAULT_LUMINOSITY1) {
						x.l = DEFAULT_LUMINOSITY2;
					} else {
						x.l = x.l - DEFAULT_LUMINOSITY2 > DEFAULT_LUMINOSITY1 - x.l ? DEFAULT_LUMINOSITY2 : DEFAULT_LUMINOSITY1;
					}
				}
			}
			return c.fromHsl(x);
		};
		dojo.declare("dojox.charting.action2d.Highlight", dojox.charting.action2d.Base, {defaultParams:{duration:400, easing:dojo.fx.easing.backOut}, optionalParams:{highlight:"red"}, constructor:function (chart, plot, kwArgs) {
			var a = kwArgs && kwArgs.highlight;
			this.colorFun = a ? (dojo.isFunction(a) ? a : cc(a)) : hl;
			this.connect();
		}, process:function (o) {
			if (!o.shape || !(o.type in this.overOutEvents)) {
				return;
			}
			var runName = o.run.name, index = o.index, anim, startFill, endFill;
			if (runName in this.anim) {
				anim = this.anim[runName][index];
			} else {
				this.anim[runName] = {};
			}
			if (anim) {
				anim.action.stop(true);
			} else {
				var color = o.shape.getFill();
				if (!color || !(color instanceof dojo.Color)) {
					return;
				}
				this.anim[runName][index] = anim = {start:color, end:this.colorFun(color)};
			}
			var start = anim.start, end = anim.end;
			if (o.type == "onmouseout") {
				var t = start;
				start = end;
				end = t;
			}
			anim.action = dojox.gfx.fx.animateFill({shape:o.shape, duration:this.duration, easing:this.easing, color:{start:start, end:end}});
			if (o.type == "onmouseout") {
				dojo.connect(anim.action, "onEnd", this, function () {
					if (this.anim[runName]) {
						delete this.anim[runName][index];
					}
				});
			}
			anim.action.play();
		}});
	})();
}

