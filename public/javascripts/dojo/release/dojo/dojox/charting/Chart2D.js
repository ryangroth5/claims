/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.Chart2D"]) {
	dojo._hasResource["dojox.charting.Chart2D"] = true;
	dojo.provide("dojox.charting.Chart2D");
	dojo.require("dojox.gfx");
	dojo.require("dojox.lang.functional");
	dojo.require("dojox.lang.functional.fold");
	dojo.require("dojox.lang.functional.reversed");
	dojo.require("dojox.charting.Theme");
	dojo.require("dojox.charting.Series");
	dojo.require("dojox.charting.axis2d.Default");
	dojo.require("dojox.charting.plot2d.Default");
	dojo.require("dojox.charting.plot2d.Lines");
	dojo.require("dojox.charting.plot2d.Areas");
	dojo.require("dojox.charting.plot2d.Markers");
	dojo.require("dojox.charting.plot2d.MarkersOnly");
	dojo.require("dojox.charting.plot2d.Scatter");
	dojo.require("dojox.charting.plot2d.Stacked");
	dojo.require("dojox.charting.plot2d.StackedLines");
	dojo.require("dojox.charting.plot2d.StackedAreas");
	dojo.require("dojox.charting.plot2d.Columns");
	dojo.require("dojox.charting.plot2d.StackedColumns");
	dojo.require("dojox.charting.plot2d.ClusteredColumns");
	dojo.require("dojox.charting.plot2d.Bars");
	dojo.require("dojox.charting.plot2d.StackedBars");
	dojo.require("dojox.charting.plot2d.ClusteredBars");
	dojo.require("dojox.charting.plot2d.Grid");
	dojo.require("dojox.charting.plot2d.Pie");
	dojo.require("dojox.charting.plot2d.Bubble");
	dojo.require("dojox.charting.plot2d.Candlesticks");
	dojo.require("dojox.charting.plot2d.OHLC");
	(function () {
		var df = dojox.lang.functional, dc = dojox.charting, clear = df.lambda("item.clear()"), purge = df.lambda("item.purgeGroup()"), destroy = df.lambda("item.destroy()"), makeClean = df.lambda("item.dirty = false"), makeDirty = df.lambda("item.dirty = true");
		dojo.declare("dojox.charting.Chart2D", null, {constructor:function (node, kwArgs) {
			if (!kwArgs) {
				kwArgs = {};
			}
			this.margins = kwArgs.margins ? kwArgs.margins : {l:10, t:10, r:10, b:10};
			this.stroke = kwArgs.stroke;
			this.fill = kwArgs.fill;
			this.theme = null;
			this.axes = {};
			this.stack = [];
			this.plots = {};
			this.series = [];
			this.runs = {};
			this.dirty = true;
			this.coords = null;
			this.node = dojo.byId(node);
			var box = dojo.marginBox(node);
			this.surface = dojox.gfx.createSurface(this.node, box.w, box.h);
		}, destroy:function () {
			dojo.forEach(this.series, destroy);
			dojo.forEach(this.stack, destroy);
			df.forIn(this.axes, destroy);
			this.surface.destroy();
		}, getCoords:function () {
			if (!this.coords) {
				this.coords = dojo.coords(this.node, true);
			}
			return this.coords;
		}, setTheme:function (theme) {
			this.theme = theme._clone();
			this.dirty = true;
			return this;
		}, addAxis:function (name, kwArgs) {
			var axis;
			if (!kwArgs || !("type" in kwArgs)) {
				axis = new dc.axis2d.Default(this, kwArgs);
			} else {
				axis = typeof kwArgs.type == "string" ? new dc.axis2d[kwArgs.type](this, kwArgs) : new kwArgs.type(this, kwArgs);
			}
			axis.name = name;
			axis.dirty = true;
			if (name in this.axes) {
				this.axes[name].destroy();
			}
			this.axes[name] = axis;
			this.dirty = true;
			return this;
		}, getAxis:function (name) {
			return this.axes[name];
		}, removeAxis:function (name) {
			if (name in this.axes) {
				this.axes[name].destroy();
				delete this.axes[name];
				this.dirty = true;
			}
			return this;
		}, addPlot:function (name, kwArgs) {
			var plot;
			if (!kwArgs || !("type" in kwArgs)) {
				plot = new dc.plot2d.Default(this, kwArgs);
			} else {
				plot = typeof kwArgs.type == "string" ? new dc.plot2d[kwArgs.type](this, kwArgs) : new kwArgs.type(this, kwArgs);
			}
			plot.name = name;
			plot.dirty = true;
			if (name in this.plots) {
				this.stack[this.plots[name]].destroy();
				this.stack[this.plots[name]] = plot;
			} else {
				this.plots[name] = this.stack.length;
				this.stack.push(plot);
			}
			this.dirty = true;
			return this;
		}, removePlot:function (name) {
			if (name in this.plots) {
				var index = this.plots[name];
				delete this.plots[name];
				this.stack[index].destroy();
				this.stack.splice(index, 1);
				df.forIn(this.plots, function (idx, name, plots) {
					if (idx > index) {
						plots[name] = idx - 1;
					}
				});
				this.dirty = true;
			}
			return this;
		}, addSeries:function (name, data, kwArgs) {
			var run = new dc.Series(this, data, kwArgs);
			if (name in this.runs) {
				this.series[this.runs[name]].destroy();
				this.series[this.runs[name]] = run;
			} else {
				this.runs[name] = this.series.length;
				this.series.push(run);
			}
			run.name = name;
			this.dirty = true;
			if (!("ymin" in run) && "min" in run) {
				run.ymin = run.min;
			}
			if (!("ymax" in run) && "max" in run) {
				run.ymax = run.max;
			}
			return this;
		}, removeSeries:function (name) {
			if (name in this.runs) {
				var index = this.runs[name], plotName = this.series[index].plot;
				delete this.runs[name];
				this.series[index].destroy();
				this.series.splice(index, 1);
				df.forIn(this.runs, function (idx, name, runs) {
					if (idx > index) {
						runs[name] = idx - 1;
					}
				});
				this.dirty = true;
			}
			return this;
		}, updateSeries:function (name, data) {
			if (name in this.runs) {
				var run = this.series[this.runs[name]];
				run.data = data;
				run.dirty = true;
				this._invalidateDependentPlots(run.plot, false);
				this._invalidateDependentPlots(run.plot, true);
			}
			return this;
		}, resize:function (width, height) {
			var box;
			switch (arguments.length) {
			  case 0:
				box = dojo.marginBox(this.node);
				break;
			  case 1:
				box = width;
				break;
			  default:
				box = {w:width, h:height};
				break;
			}
			dojo.marginBox(this.node, box);
			this.surface.setDimensions(box.w, box.h);
			this.dirty = true;
			this.coords = null;
			return this.render();
		}, getGeometry:function () {
			var ret = {};
			df.forIn(this.axes, function (axis) {
				if (axis.initialized()) {
					ret[axis.name] = {name:axis.name, vertical:axis.vertical, scaler:axis.scaler, ticks:axis.ticks};
				}
			});
			return ret;
		}, setAxisWindow:function (name, scale, offset) {
			var axis = this.axes[name];
			if (axis) {
				axis.setWindow(scale, offset);
			}
			return this;
		}, setWindow:function (sx, sy, dx, dy) {
			if (!("plotArea" in this)) {
				this.calculateGeometry();
			}
			df.forIn(this.axes, function (axis) {
				var scale, offset, bounds = axis.getScaler().bounds, s = bounds.span / (bounds.upper - bounds.lower);
				if (axis.vertical) {
					scale = sy;
					offset = dy / s / scale;
				} else {
					scale = sx;
					offset = dx / s / scale;
				}
				axis.setWindow(scale, offset);
			});
			return this;
		}, calculateGeometry:function () {
			if (this.dirty) {
				return this.fullGeometry();
			}
			dojo.forEach(this.stack, function (plot) {
				if (plot.dirty || (plot.hAxis && this.axes[plot.hAxis].dirty) || (plot.vAxis && this.axes[plot.vAxis].dirty)) {
					plot.calculateAxes(this.plotArea);
				}
			}, this);
			return this;
		}, fullGeometry:function () {
			this._makeDirty();
			dojo.forEach(this.stack, clear);
			if (!this.theme) {
				this.setTheme(new dojox.charting.Theme(dojox.charting._def));
			}
			dojo.forEach(this.series, function (run) {
				if (!(run.plot in this.plots)) {
					var plot = new dc.plot2d.Default(this, {});
					plot.name = run.plot;
					this.plots[run.plot] = this.stack.length;
					this.stack.push(plot);
				}
				this.stack[this.plots[run.plot]].addSeries(run);
			}, this);
			dojo.forEach(this.stack, function (plot) {
				if (plot.hAxis) {
					plot.setAxis(this.axes[plot.hAxis]);
				}
				if (plot.vAxis) {
					plot.setAxis(this.axes[plot.vAxis]);
				}
			}, this);
			var dim = this.dim = this.surface.getDimensions();
			dim.width = dojox.gfx.normalizedLength(dim.width);
			dim.height = dojox.gfx.normalizedLength(dim.height);
			df.forIn(this.axes, clear);
			dojo.forEach(this.stack, function (p) {
				p.calculateAxes(dim);
			});
			var offsets = this.offsets = {l:0, r:0, t:0, b:0};
			df.forIn(this.axes, function (axis) {
				df.forIn(axis.getOffsets(), function (o, i) {
					offsets[i] += o;
				});
			});
			df.forIn(this.margins, function (o, i) {
				offsets[i] += o;
			});
			this.plotArea = {width:dim.width - offsets.l - offsets.r, height:dim.height - offsets.t - offsets.b};
			df.forIn(this.axes, clear);
			dojo.forEach(this.stack, function (plot) {
				plot.calculateAxes(this.plotArea);
			}, this);
			return this;
		}, render:function () {
			if (this.theme) {
				this.theme.clear();
			}
			if (this.dirty) {
				return this.fullRender();
			}
			this.calculateGeometry();
			df.forEachRev(this.stack, function (plot) {
				plot.render(this.dim, this.offsets);
			}, this);
			df.forIn(this.axes, function (axis) {
				axis.render(this.dim, this.offsets);
			}, this);
			this._makeClean();
			if (this.surface.render) {
				this.surface.render();
			}
			return this;
		}, fullRender:function () {
			this.fullGeometry();
			var offsets = this.offsets, dim = this.dim;
			var requiredColors = df.foldl(this.stack, "z + plot.getRequiredColors()", 0);
			this.theme.defineColors({num:requiredColors, cache:false});
			dojo.forEach(this.series, purge);
			df.forIn(this.axes, purge);
			dojo.forEach(this.stack, purge);
			this.surface.clear();
			var t = this.theme, fill = t.plotarea && t.plotarea.fill, stroke = t.plotarea && t.plotarea.stroke;
			if (fill) {
				this.surface.createRect({x:offsets.l, y:offsets.t, width:dim.width - offsets.l - offsets.r, height:dim.height - offsets.t - offsets.b}).setFill(fill);
			}
			if (stroke) {
				this.surface.createRect({x:offsets.l, y:offsets.t, width:dim.width - offsets.l - offsets.r - 1, height:dim.height - offsets.t - offsets.b - 1}).setStroke(stroke);
			}
			df.foldr(this.stack, function (z, plot) {
				return plot.render(dim, offsets), 0;
			}, 0);
			fill = this.fill ? this.fill : (t.chart && t.chart.fill);
			stroke = this.stroke ? this.stroke : (t.chart && t.chart.stroke);
			if (fill == "inherit") {
				var node = this.node, fill = new dojo.Color(dojo.style(node, "backgroundColor"));
				while (fill.a == 0 && node != document.documentElement) {
					fill = new dojo.Color(dojo.style(node, "backgroundColor"));
					node = node.parentNode;
				}
			}
			if (fill) {
				if (offsets.l) {
					this.surface.createRect({width:offsets.l, height:dim.height + 1}).setFill(fill);
				}
				if (offsets.r) {
					this.surface.createRect({x:dim.width - offsets.r, width:offsets.r + 1, height:dim.height + 1}).setFill(fill);
				}
				if (offsets.t) {
					this.surface.createRect({width:dim.width + 1, height:offsets.t}).setFill(fill);
				}
				if (offsets.b) {
					this.surface.createRect({y:dim.height - offsets.b, width:dim.width + 1, height:offsets.b + 2}).setFill(fill);
				}
			}
			if (stroke) {
				this.surface.createRect({width:dim.width - 1, height:dim.height - 1}).setStroke(stroke);
			}
			df.forIn(this.axes, function (axis) {
				axis.render(dim, offsets);
			});
			this._makeClean();
			if (this.surface.render) {
				this.surface.render();
			}
			return this;
		}, connectToPlot:function (name, object, method) {
			return name in this.plots ? this.stack[this.plots[name]].connect(object, method) : null;
		}, _makeClean:function () {
			dojo.forEach(this.axes, makeClean);
			dojo.forEach(this.stack, makeClean);
			dojo.forEach(this.series, makeClean);
			this.dirty = false;
		}, _makeDirty:function () {
			dojo.forEach(this.axes, makeDirty);
			dojo.forEach(this.stack, makeDirty);
			dojo.forEach(this.series, makeDirty);
			this.dirty = true;
		}, _invalidateDependentPlots:function (plotName, verticalAxis) {
			if (plotName in this.plots) {
				var plot = this.stack[this.plots[plotName]], axis, axisName = verticalAxis ? "vAxis" : "hAxis";
				if (plot[axisName]) {
					axis = this.axes[plot[axisName]];
					if (axis && axis.dependOnData()) {
						axis.dirty = true;
						dojo.forEach(this.stack, function (p) {
							if (p[axisName] && p[axisName] == plot[axisName]) {
								p.dirty = true;
							}
						});
					}
				} else {
					plot.dirty = true;
				}
			}
		}});
	})();
}

