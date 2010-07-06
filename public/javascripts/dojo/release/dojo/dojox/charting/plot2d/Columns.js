/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.plot2d.Columns"]) {
	dojo._hasResource["dojox.charting.plot2d.Columns"] = true;
	dojo.provide("dojox.charting.plot2d.Columns");
	dojo.require("dojox.charting.plot2d.common");
	dojo.require("dojox.charting.plot2d.Base");
	dojo.require("dojox.gfx.fx");
	dojo.require("dojox.lang.utils");
	dojo.require("dojox.lang.functional");
	dojo.require("dojox.lang.functional.reversed");
	(function () {
		var df = dojox.lang.functional, du = dojox.lang.utils, dc = dojox.charting.plot2d.common, purgeGroup = df.lambda("item.purgeGroup()");
		dojo.declare("dojox.charting.plot2d.Columns", dojox.charting.plot2d.Base, {defaultParams:{hAxis:"x", vAxis:"y", gap:0, shadows:null, animate:null}, optionalParams:{minBarSize:1, maxBarSize:1}, constructor:function (chart, kwArgs) {
			this.opt = dojo.clone(this.defaultParams);
			du.updateWithObject(this.opt, kwArgs);
			du.updateWithPattern(this.opt, kwArgs, this.optionalParams);
			this.series = [];
			this.hAxis = this.opt.hAxis;
			this.vAxis = this.opt.vAxis;
			this.animate = this.opt.animate;
		}, calculateAxes:function (dim) {
			var stats = dc.collectSimpleStats(this.series);
			stats.hmin -= 0.5;
			stats.hmax += 0.5;
			this._calc(dim, stats);
			return this;
		}, render:function (dim, offsets) {
			this.dirty = this.isDirty();
			if (this.dirty) {
				dojo.forEach(this.series, purgeGroup);
				this.cleanGroup();
				var s = this.group;
				df.forEachRev(this.series, function (item) {
					item.cleanGroup(s);
				});
			}
			var t = this.chart.theme, color, stroke, fill, f, gap, width, ht = this._hScaler.scaler.getTransformerFromModel(this._hScaler), vt = this._vScaler.scaler.getTransformerFromModel(this._vScaler), baseline = Math.max(0, this._vScaler.bounds.lower), baselineHeight = vt(baseline), events = this.events();
			f = dc.calculateBarSize(this._hScaler.bounds.scale, this.opt);
			gap = f.gap;
			width = f.size;
			this.resetEvents();
			for (var i = this.series.length - 1; i >= 0; --i) {
				var run = this.series[i];
				if (!this.dirty && !run.dirty) {
					continue;
				}
				run.cleanGroup();
				var s = run.group;
				if (!run.fill || !run.stroke) {
					color = run.dyn.color = new dojo.Color(t.next("color"));
				}
				stroke = run.stroke ? run.stroke : dc.augmentStroke(t.series.stroke, color);
				fill = run.fill ? run.fill : dc.augmentFill(t.series.fill, color);
				for (var j = 0; j < run.data.length; ++j) {
					var value = run.data[j], v = typeof value == "number" ? value : value.y, vv = vt(v), height = vv - baselineHeight, h = Math.abs(height), specialColor = color, specialFill = fill, specialStroke = stroke;
					if (typeof value != "number") {
						if (value.color) {
							specialColor = new dojo.Color(value.color);
						}
						if ("fill" in value) {
							specialFill = value.fill;
						} else {
							if (value.color) {
								specialFill = dc.augmentFill(t.series.fill, specialColor);
							}
						}
						if ("stroke" in value) {
							specialStroke = value.stroke;
						} else {
							if (value.color) {
								specialStroke = dc.augmentStroke(t.series.stroke, specialColor);
							}
						}
					}
					if (width >= 1 && h >= 1) {
						var shape = s.createRect({x:offsets.l + ht(j + 0.5) + gap, y:dim.height - offsets.b - (v > baseline ? vv : baselineHeight), width:width, height:h}).setFill(specialFill).setStroke(specialStroke);
						run.dyn.fill = shape.getFill();
						run.dyn.stroke = shape.getStroke();
						if (events) {
							var o = {element:"column", index:j, run:run, plot:this, hAxis:this.hAxis || null, vAxis:this.vAxis || null, shape:shape, x:j + 0.5, y:v};
							this._connectEvents(shape, o);
						}
						if (this.animate) {
							this._animateColumn(shape, dim.height - offsets.b - baselineHeight, h);
						}
					}
				}
				run.dirty = false;
			}
			this.dirty = false;
			return this;
		}, _animateColumn:function (shape, voffset, vsize) {
			dojox.gfx.fx.animateTransform(dojo.delegate({shape:shape, duration:1200, transform:[{name:"translate", start:[0, voffset - (voffset / vsize)], end:[0, 0]}, {name:"scale", start:[1, 1 / vsize], end:[1, 1]}, {name:"original"}]}, this.animate)).play();
		}});
	})();
}

