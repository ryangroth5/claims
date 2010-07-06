/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.action2d.MoveSlice"]) {
	dojo._hasResource["dojox.charting.action2d.MoveSlice"] = true;
	dojo.provide("dojox.charting.action2d.MoveSlice");
	dojo.require("dojox.charting.action2d.Base");
	dojo.require("dojox.gfx.matrix");
	dojo.require("dojox.lang.functional");
	dojo.require("dojox.lang.functional.scan");
	dojo.require("dojox.lang.functional.fold");
	(function () {
		var DEFAULT_SCALE = 1.05, DEFAULT_SHIFT = 7, m = dojox.gfx.matrix, gf = dojox.gfx.fx, df = dojox.lang.functional;
		dojo.declare("dojox.charting.action2d.MoveSlice", dojox.charting.action2d.Base, {defaultParams:{duration:400, easing:dojo.fx.easing.backOut, scale:DEFAULT_SCALE, shift:DEFAULT_SHIFT}, optionalParams:{}, constructor:function (chart, plot, kwArgs) {
			if (!kwArgs) {
				kwArgs = {};
			}
			this.scale = typeof kwArgs.scale == "number" ? kwArgs.scale : DEFAULT_SCALE;
			this.shift = typeof kwArgs.shift == "number" ? kwArgs.shift : DEFAULT_SHIFT;
			this.connect();
		}, process:function (o) {
			if (!o.shape || o.element != "slice" || !(o.type in this.overOutEvents)) {
				return;
			}
			if (!this.angles) {
				if (typeof o.run.data[0] == "number") {
					this.angles = df.map(df.scanl(o.run.data, "+", 0), "* 2 * Math.PI / this", df.foldl(o.run.data, "+", 0));
				} else {
					this.angles = df.map(df.scanl(o.run.data, "a + b.y", 0), "* 2 * Math.PI / this", df.foldl(o.run.data, "a + b.y", 0));
				}
			}
			var index = o.index, anim, startScale, endScale, startOffset, endOffset, angle = (this.angles[index] + this.angles[index + 1]) / 2, rotateTo0 = m.rotateAt(-angle, o.cx, o.cy), rotateBack = m.rotateAt(angle, o.cx, o.cy);
			anim = this.anim[index];
			if (anim) {
				anim.action.stop(true);
			} else {
				this.anim[index] = anim = {};
			}
			if (o.type == "onmouseover") {
				startOffset = 0;
				endOffset = this.shift;
				startScale = 1;
				endScale = this.scale;
			} else {
				startOffset = this.shift;
				endOffset = 0;
				startScale = this.scale;
				endScale = 1;
			}
			anim.action = dojox.gfx.fx.animateTransform({shape:o.shape, duration:this.duration, easing:this.easing, transform:[rotateBack, {name:"translate", start:[startOffset, 0], end:[endOffset, 0]}, {name:"scaleAt", start:[startScale, o.cx, o.cy], end:[endScale, o.cx, o.cy]}, rotateTo0]});
			if (o.type == "onmouseout") {
				dojo.connect(anim.action, "onEnd", this, function () {
					delete this.anim[index];
				});
			}
			anim.action.play();
		}, reset:function () {
			delete this.angles;
		}});
	})();
}

