/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.plot2d.OHLC"]) {
	dojo._hasResource["dojox.charting.plot2d.OHLC"] = true;
	dojo.provide("dojox.charting.plot2d.OHLC");
	dojo.require("dojox.charting.plot2d.common");
	dojo.require("dojox.charting.plot2d.Base");
	dojo.require("dojox.lang.utils");
	dojo.require("dojox.lang.functional");
	dojo.require("dojox.lang.functional.reversed");
	(function () {
		var df = dojox.lang.functional, du = dojox.lang.utils, dc = dojox.charting.plot2d.common, purgeGroup = df.lambda("item.purgeGroup()");
		dojo.declare("dojox.charting.plot2d.OHLC", dojox.charting.plot2d.Base, {defaultParams:{hAxis:"x", vAxis:"y", gap:2, shadows:null}, optionalParams:{minBarSize:1, maxBarSize:1}, constructor:function (chart, kwArgs) {
			this.opt = dojo.clone(this.defaultParams);
			du.updateWithObject(this.opt, kwArgs);
			du.updateWithPattern(this.opt, kwArgs, this.optionalParams);
			this.series = [];
			this.hAxis = this.opt.hAxis;
			this.vAxis = this.opt.vAxis;
		}, collectStats:function (series) {
			var stats = dojo.clone(dc.defaultStats);
			for (var i = 0; i < series.length; i++) {
				var run = series[i];
				if (!run.data.length) {
					continue;
				}
				var old_vmin = stats.vmin, old_vmax = stats.vmax;
				if (!("ymin" in run) || !("ymax" in run)) {
					dojo.forEach(run.data, function (val, idx) {
						var x = val.x || idx + 1;
						stats.hmin = Math.min(stats.hmin, x);
						stats.hmax = Math.max(stats.hmax, x);
						stats.vmin = Math.min(stats.vmin, val.open, val.close, val.high, val.low);
						stats.vmax = Math.max(stats.vmax, val.open, val.close, val.high, val.low);
					});
				}
				if ("ymin" in run) {
					stats.vmin = Math.min(old_vmin, run.ymin);
				}
				if ("ymax" in run) {
					stats.vmax = Math.max(old_vmax, run.ymax);
				}
			}
			return stats;
		}, calculateAxes:function (dim) {
			var stats = this.collectStats(this.series), t;
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
					var v = run.data[j];
					var x = ht(v.x || (j + 0.5)) + offsets.l + gap, y = dim.height - offsets.b, open = vt(v.open), close = vt(v.close), high = vt(v.high), low = vt(v.low);
					if (low > high) {
						var tmp = high;
						high = low;
						low = tmp;
					}
					if (width >= 1) {
						var hl = {x1:width / 2, x2:width / 2, y1:y - high, y2:y - low}, op = {x1:0, x2:((width / 2) + ((stroke.width || 1) / 2)), y1:y - open, y2:y - open}, cl = {x1:((width / 2) - ((stroke.width || 1) / 2)), x2:width, y1:y - close, y2:y - close};
						shape = s.createGroup();
						shape.setTransform({dx:x, dy:0});
						var inner = shape.createGroup();
						inner.createLine(hl).setStroke(stroke);
						inner.createLine(op).setStroke(stroke);
						inner.createLine(cl).setStroke(stroke);
						run.dyn.fill = fill;
						run.dyn.stroke = stroke;
						if (events) {
							var o = {element:"candlestick", index:j, run:run, plot:this, hAxis:this.hAxis || null, vAxis:this.vAxis || null, shape:inner, x:x, y:y - Math.max(open, close), cx:width / 2, cy:(y - Math.max(open, close)) + (Math.max(open > close ? open - close : close - open, 1) / 2), width:width, height:Math.max(open > close ? open - close : close - open, 1), data:v};
							this._connectEvents(shape, o);
						}
					}
				}
				run.dirty = false;
			}
			this.dirty = false;
			return this;
		}});
	})();
}

