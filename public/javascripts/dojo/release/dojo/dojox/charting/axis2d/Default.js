/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.axis2d.Default"]) {
	dojo._hasResource["dojox.charting.axis2d.Default"] = true;
	dojo.provide("dojox.charting.axis2d.Default");
	dojo.require("dojox.charting.scaler.linear");
	dojo.require("dojox.charting.axis2d.common");
	dojo.require("dojox.charting.axis2d.Base");
	dojo.require("dojo.colors");
	dojo.require("dojo.string");
	dojo.require("dojox.gfx");
	dojo.require("dojox.lang.functional");
	dojo.require("dojox.lang.utils");
	(function () {
		var dc = dojox.charting, df = dojox.lang.functional, du = dojox.lang.utils, g = dojox.gfx, lin = dc.scaler.linear, labelGap = 4;
		dojo.declare("dojox.charting.axis2d.Default", dojox.charting.axis2d.Base, {defaultParams:{vertical:false, fixUpper:"none", fixLower:"none", natural:false, leftBottom:true, includeZero:false, fixed:true, majorLabels:true, minorTicks:true, minorLabels:true, microTicks:false, htmlLabels:true}, optionalParams:{min:0, max:1, from:0, to:1, majorTickStep:4, minorTickStep:2, microTickStep:1, labels:[], labelFunc:null, maxLabelSize:0, stroke:{}, majorTick:{}, minorTick:{}, microTick:{}, font:"", fontColor:""}, constructor:function (chart, kwArgs) {
			this.opt = dojo.delegate(this.defaultParams, kwArgs);
			du.updateWithPattern(this.opt, kwArgs, this.optionalParams);
		}, dependOnData:function () {
			return !("min" in this.opt) || !("max" in this.opt);
		}, clear:function () {
			delete this.scaler;
			delete this.ticks;
			this.dirty = true;
			return this;
		}, initialized:function () {
			return "scaler" in this && !(this.dirty && this.dependOnData());
		}, setWindow:function (scale, offset) {
			this.scale = scale;
			this.offset = offset;
			return this.clear();
		}, getWindowScale:function () {
			return "scale" in this ? this.scale : 1;
		}, getWindowOffset:function () {
			return "offset" in this ? this.offset : 0;
		}, _groupLabelWidth:function (labels, font) {
			if (labels[0]["text"]) {
				labels = df.map(labels, function (label) {
					return label.text;
				});
			}
			var s = labels.join("<br>");
			return dojox.gfx._base._getTextBox(s, {font:font}).w || 0;
		}, calculate:function (min, max, span, labels) {
			if (this.initialized()) {
				return this;
			}
			var o = this.opt;
			this.labels = "labels" in o ? o.labels : labels;
			this.scaler = lin.buildScaler(min, max, span, o);
			var tsb = this.scaler.bounds;
			if ("scale" in this) {
				o.from = tsb.lower + this.offset;
				o.to = (tsb.upper - tsb.lower) / this.scale + o.from;
				if (!isFinite(o.from) || isNaN(o.from) || !isFinite(o.to) || isNaN(o.to) || o.to - o.from >= tsb.upper - tsb.lower) {
					delete o.from;
					delete o.to;
					delete this.scale;
					delete this.offset;
				} else {
					if (o.from < tsb.lower) {
						o.to += tsb.lower - o.from;
						o.from = tsb.lower;
					} else {
						if (o.to > tsb.upper) {
							o.from += tsb.upper - o.to;
							o.to = tsb.upper;
						}
					}
					this.offset = o.from - tsb.lower;
				}
				this.scaler = lin.buildScaler(min, max, span, o);
				tsb = this.scaler.bounds;
				if (this.scale == 1 && this.offset == 0) {
					delete this.scale;
					delete this.offset;
				}
			}
			var minMinorStep = 0, ta = this.chart.theme.axis, taFont = "font" in o ? o.font : ta.font, size = taFont ? g.normalizedLength(g.splitFontString(taFont).size) : 0;
			if (this.vertical) {
				if (size) {
					minMinorStep = size + labelGap;
				}
			} else {
				if (size) {
					var labelWidth, i;
					if (o.labelFunc && o.maxLabelSize) {
						labelWidth = o.maxLabelSize;
					} else {
						if (this.labels) {
							labelWidth = this._groupLabelWidth(this.labels, taFont);
						} else {
							var labelLength = Math.ceil(Math.log(Math.max(Math.abs(tsb.from), Math.abs(tsb.to))) / Math.LN10), t = [];
							if (tsb.from < 0 || tsb.to < 0) {
								t.push("-");
							}
							t.push(dojo.string.rep("9", labelLength));
							var precision = Math.floor(Math.log(tsb.to - tsb.from) / Math.LN10);
							if (precision > 0) {
								t.push(".");
								for (i = 0; i < precision; ++i) {
									t.push("9");
								}
							}
							labelWidth = dojox.gfx._base._getTextBox(t.join(""), {font:taFont}).w;
						}
					}
					minMinorStep = labelWidth + labelGap;
				}
			}
			this.scaler.minMinorStep = minMinorStep;
			this.ticks = lin.buildTicks(this.scaler, o);
			return this;
		}, getScaler:function () {
			return this.scaler;
		}, getTicks:function () {
			return this.ticks;
		}, getOffsets:function () {
			var o = this.opt;
			var offsets = {l:0, r:0, t:0, b:0}, labelWidth, a, b, c, d, gl = dc.scaler.common.getNumericLabel, offset = 0, ta = this.chart.theme.axis, taFont = "font" in o ? o.font : ta.font, taMajorTick = "majorTick" in o ? o.majorTick : ta.majorTick, taMinorTick = "minorTick" in o ? o.minorTick : ta.minorTick, size = taFont ? g.normalizedLength(g.splitFontString(taFont).size) : 0, s = this.scaler;
			if (!s) {
				return offsets;
			}
			var ma = s.major, mi = s.minor;
			if (this.vertical) {
				if (size) {
					if (o.labelFunc && o.maxLabelSize) {
						labelWidth = o.maxLabelSize;
					} else {
						if (this.labels) {
							labelWidth = this._groupLabelWidth(this.labels, taFont);
						} else {
							labelWidth = this._groupLabelWidth([gl(ma.start, ma.prec, o), gl(ma.start + ma.count * ma.tick, ma.prec, o), gl(mi.start, mi.prec, o), gl(mi.start + mi.count * mi.tick, mi.prec, o)], taFont);
						}
					}
					offset = labelWidth + labelGap;
				}
				offset += labelGap + Math.max(taMajorTick.length, taMinorTick.length);
				offsets[o.leftBottom ? "l" : "r"] = offset;
				offsets.t = offsets.b = size / 2;
			} else {
				if (size) {
					offset = size + labelGap;
				}
				offset += labelGap + Math.max(taMajorTick.length, taMinorTick.length);
				offsets[o.leftBottom ? "b" : "t"] = offset;
				if (size) {
					if (o.labelFunc && o.maxLabelSize) {
						labelWidth = o.maxLabelSize;
					} else {
						if (this.labels) {
							labelWidth = this._groupLabelWidth(this.labels, taFont);
						} else {
							labelWidth = this._groupLabelWidth([gl(ma.start, ma.prec, o), gl(ma.start + ma.count * ma.tick, ma.prec, o), gl(mi.start, mi.prec, o), gl(mi.start + mi.count * mi.tick, mi.prec, o)], taFont);
						}
					}
					offsets.l = offsets.r = labelWidth / 2;
				}
			}
			if (labelWidth) {
				this._cachedLabelWidth = labelWidth;
			}
			return offsets;
		}, render:function (dim, offsets) {
			if (!this.dirty) {
				return this;
			}
			var o = this.opt;
			var start, stop, axisVector, tickVector, labelOffset, labelAlign, ta = this.chart.theme.axis, taStroke = "stroke" in o ? o.stroke : ta.stroke, taMajorTick = "majorTick" in o ? o.majorTick : ta.majorTick, taMinorTick = "minorTick" in o ? o.minorTick : ta.minorTick, taMicroTick = "microTick" in o ? o.microTick : ta.minorTick, taFont = "font" in o ? o.font : ta.font, taFontColor = "fontColor" in o ? o.fontColor : ta.fontColor, tickSize = Math.max(taMajorTick.length, taMinorTick.length), size = taFont ? g.normalizedLength(g.splitFontString(taFont).size) : 0;
			if (this.vertical) {
				start = {y:dim.height - offsets.b};
				stop = {y:offsets.t};
				axisVector = {x:0, y:-1};
				if (o.leftBottom) {
					start.x = stop.x = offsets.l;
					tickVector = {x:-1, y:0};
					labelAlign = "end";
				} else {
					start.x = stop.x = dim.width - offsets.r;
					tickVector = {x:1, y:0};
					labelAlign = "start";
				}
				labelOffset = {x:tickVector.x * (tickSize + labelGap), y:size * 0.4};
			} else {
				start = {x:offsets.l};
				stop = {x:dim.width - offsets.r};
				axisVector = {x:1, y:0};
				labelAlign = "middle";
				if (o.leftBottom) {
					start.y = stop.y = dim.height - offsets.b;
					tickVector = {x:0, y:1};
					labelOffset = {y:tickSize + labelGap + size};
				} else {
					start.y = stop.y = offsets.t;
					tickVector = {x:0, y:-1};
					labelOffset = {y:-tickSize - labelGap};
				}
				labelOffset.x = 0;
			}
			this.cleanGroup();
			try {
				var s = this.group, c = this.scaler, t = this.ticks, canLabel, f = lin.getTransformerFromModel(this.scaler), forceHtmlLabels = (dojox.gfx.renderer == "canvas"), labelType = forceHtmlLabels || this.opt.htmlLabels && !dojo.isIE && !dojo.isOpera ? "html" : "gfx", dx = tickVector.x * taMajorTick.length, dy = tickVector.y * taMajorTick.length;
				s.createLine({x1:start.x, y1:start.y, x2:stop.x, y2:stop.y}).setStroke(taStroke);
				dojo.forEach(t.major, function (tick) {
					var offset = f(tick.value), elem, x = start.x + axisVector.x * offset, y = start.y + axisVector.y * offset;
					s.createLine({x1:x, y1:y, x2:x + dx, y2:y + dy}).setStroke(taMajorTick);
					if (tick.label) {
						elem = dc.axis2d.common.createText[labelType](this.chart, s, x + labelOffset.x, y + labelOffset.y, labelAlign, tick.label, taFont, taFontColor, this._cachedLabelWidth);
						if (labelType == "html") {
							this.htmlElements.push(elem);
						}
					}
				}, this);
				dx = tickVector.x * taMinorTick.length;
				dy = tickVector.y * taMinorTick.length;
				canLabel = c.minMinorStep <= c.minor.tick * c.bounds.scale;
				dojo.forEach(t.minor, function (tick) {
					var offset = f(tick.value), elem, x = start.x + axisVector.x * offset, y = start.y + axisVector.y * offset;
					s.createLine({x1:x, y1:y, x2:x + dx, y2:y + dy}).setStroke(taMinorTick);
					if (canLabel && tick.label) {
						elem = dc.axis2d.common.createText[labelType](this.chart, s, x + labelOffset.x, y + labelOffset.y, labelAlign, tick.label, taFont, taFontColor, this._cachedLabelWidth);
						if (labelType == "html") {
							this.htmlElements.push(elem);
						}
					}
				}, this);
				dx = tickVector.x * taMicroTick.length;
				dy = tickVector.y * taMicroTick.length;
				dojo.forEach(t.micro, function (tick) {
					var offset = f(tick.value), elem, x = start.x + axisVector.x * offset, y = start.y + axisVector.y * offset;
					s.createLine({x1:x, y1:y, x2:x + dx, y2:y + dy}).setStroke(taMicroTick);
				}, this);
			}
			catch (e) {
			}
			this.dirty = false;
			return this;
		}});
	})();
}

