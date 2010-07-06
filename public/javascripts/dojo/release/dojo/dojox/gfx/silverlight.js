/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.gfx.silverlight"]) {
	dojo._hasResource["dojox.gfx.silverlight"] = true;
	dojo.provide("dojox.gfx.silverlight");
	dojo.require("dojox.gfx._base");
	dojo.require("dojox.gfx.shape");
	dojo.require("dojox.gfx.path");
	dojo.experimental("dojox.gfx.silverlight");
	dojox.gfx.silverlight.dasharray = {solid:"none", shortdash:[4, 1], shortdot:[1, 1], shortdashdot:[4, 1, 1, 1], shortdashdotdot:[4, 1, 1, 1, 1, 1], dot:[1, 3], dash:[4, 3], longdash:[8, 3], dashdot:[4, 3, 1, 3], longdashdot:[8, 3, 1, 3], longdashdotdot:[8, 3, 1, 3, 1, 3]};
	dojox.gfx.silverlight.fontweight = {normal:400, bold:700};
	dojox.gfx.silverlight.caps = {butt:"Flat", round:"Round", square:"Square"};
	dojox.gfx.silverlight.joins = {bevel:"Bevel", round:"Round"};
	dojox.gfx.silverlight.fonts = {serif:"Times New Roman", times:"Times New Roman", "sans-serif":"Arial", helvetica:"Arial", monotone:"Courier New", courier:"Courier New"};
	dojox.gfx.silverlight.hexColor = function (color) {
		var c = dojox.gfx.normalizeColor(color), t = c.toHex(), a = Math.round(c.a * 255);
		a = (a < 0 ? 0 : a > 255 ? 255 : a).toString(16);
		return "#" + (a.length < 2 ? "0" + a : a) + t.slice(1);
	};
	dojo.extend(dojox.gfx.Shape, {setFill:function (fill) {
		var p = this.rawNode.getHost().content, r = this.rawNode, f;
		if (!fill) {
			this.fillStyle = null;
			this._setFillAttr(null);
			return this;
		}
		if (typeof (fill) == "object" && "type" in fill) {
			switch (fill.type) {
			  case "linear":
				this.fillStyle = f = dojox.gfx.makeParameters(dojox.gfx.defaultLinearGradient, fill);
				var lgb = p.createFromXaml("<LinearGradientBrush/>");
				lgb.mappingMode = "Absolute";
				lgb.startPoint = f.x1 + "," + f.y1;
				lgb.endPoint = f.x2 + "," + f.y2;
				dojo.forEach(f.colors, function (c) {
					var t = p.createFromXaml("<GradientStop/>");
					t.offset = c.offset;
					t.color = dojox.gfx.silverlight.hexColor(c.color);
					lgb.gradientStops.add(t);
				});
				this._setFillAttr(lgb);
				break;
			  case "radial":
				this.fillStyle = f = dojox.gfx.makeParameters(dojox.gfx.defaultRadialGradient, fill);
				var rgb = p.createFromXaml("<RadialGradientBrush/>"), c = dojox.gfx.matrix.multiplyPoint(dojox.gfx.matrix.invert(this._getAdjustedMatrix()), f.cx, f.cy), pt = c.x + "," + c.y;
				rgb.mappingMode = "Absolute";
				rgb.gradientOrigin = pt;
				rgb.center = pt;
				rgb.radiusX = rgb.radiusY = f.r;
				dojo.forEach(f.colors, function (c) {
					var t = p.createFromXaml("<GradientStop/>");
					t.offset = c.offset;
					t.color = dojox.gfx.silverlight.hexColor(c.color);
					rgb.gradientStops.add(t);
				});
				this._setFillAttr(rgb);
				break;
			  case "pattern":
				this.fillStyle = null;
				this._setFillAttr(null);
				break;
			}
			return this;
		}
		this.fillStyle = f = dojox.gfx.normalizeColor(fill);
		var scb = p.createFromXaml("<SolidColorBrush/>");
		scb.color = f.toHex();
		scb.opacity = f.a;
		this._setFillAttr(scb);
		return this;
	}, _setFillAttr:function (f) {
		this.rawNode.fill = f;
	}, setStroke:function (stroke) {
		var p = this.rawNode.getHost().content, r = this.rawNode;
		if (!stroke) {
			this.strokeStyle = null;
			r.stroke = null;
			return this;
		}
		if (typeof stroke == "string" || dojo.isArray(stroke) || stroke instanceof dojo.Color) {
			stroke = {color:stroke};
		}
		var s = this.strokeStyle = dojox.gfx.makeParameters(dojox.gfx.defaultStroke, stroke);
		s.color = dojox.gfx.normalizeColor(s.color);
		if (s) {
			var scb = p.createFromXaml("<SolidColorBrush/>");
			scb.color = s.color.toHex();
			scb.opacity = s.color.a;
			r.stroke = scb;
			r.strokeThickness = s.width;
			r.strokeStartLineCap = r.strokeEndLineCap = r.strokeDashCap = dojox.gfx.silverlight.caps[s.cap];
			if (typeof s.join == "number") {
				r.strokeLineJoin = "Miter";
				r.strokeMiterLimit = s.join;
			} else {
				r.strokeLineJoin = dojox.gfx.silverlight.joins[s.join];
			}
			var da = s.style.toLowerCase();
			if (da in dojox.gfx.silverlight.dasharray) {
				da = dojox.gfx.silverlight.dasharray[da];
			}
			if (da instanceof Array) {
				da = dojo.clone(da);
				var i;
				if (s.cap != "butt") {
					for (i = 0; i < da.length; i += 2) {
						--da[i];
						if (da[i] < 1) {
							da[i] = 1;
						}
					}
					for (i = 1; i < da.length; i += 2) {
						++da[i];
					}
				}
				r.strokeDashArray = da.join(",");
			} else {
				r.strokeDashArray = null;
			}
		}
		return this;
	}, _getParentSurface:function () {
		var surface = this.parent;
		for (; surface && !(surface instanceof dojox.gfx.Surface); surface = surface.parent) {
		}
		return surface;
	}, _applyTransform:function () {
		var tm = this._getAdjustedMatrix(), r = this.rawNode;
		if (tm) {
			var p = this.rawNode.getHost().content, m = p.createFromXaml("<MatrixTransform/>"), mm = p.createFromXaml("<Matrix/>");
			mm.m11 = tm.xx;
			mm.m21 = tm.xy;
			mm.m12 = tm.yx;
			mm.m22 = tm.yy;
			mm.offsetX = tm.dx;
			mm.offsetY = tm.dy;
			m.matrix = mm;
			r.renderTransform = m;
		} else {
			r.renderTransform = null;
		}
		return this;
	}, setRawNode:function (rawNode) {
		rawNode.fill = null;
		rawNode.stroke = null;
		this.rawNode = rawNode;
	}, _moveToFront:function () {
		var c = this.parent.rawNode.children, r = this.rawNode;
		c.remove(r);
		c.add(r);
		return this;
	}, _moveToBack:function () {
		var c = this.parent.rawNode.children, r = this.rawNode;
		c.remove(r);
		c.insert(0, r);
		return this;
	}, _getAdjustedMatrix:function () {
		return this.matrix;
	}});
	dojo.declare("dojox.gfx.Group", dojox.gfx.Shape, {constructor:function () {
		dojox.gfx.silverlight.Container._init.call(this);
	}, setRawNode:function (rawNode) {
		this.rawNode = rawNode;
	}});
	dojox.gfx.Group.nodeType = "Canvas";
	dojo.declare("dojox.gfx.Rect", dojox.gfx.shape.Rect, {setShape:function (newShape) {
		this.shape = dojox.gfx.makeParameters(this.shape, newShape);
		this.bbox = null;
		var r = this.rawNode, n = this.shape;
		r.width = n.width;
		r.height = n.height;
		r.radiusX = r.radiusY = n.r;
		return this._applyTransform();
	}, _getAdjustedMatrix:function () {
		var m = this.matrix, s = this.shape, d = {dx:s.x, dy:s.y};
		return new dojox.gfx.Matrix2D(m ? [m, d] : d);
	}});
	dojox.gfx.Rect.nodeType = "Rectangle";
	dojo.declare("dojox.gfx.Ellipse", dojox.gfx.shape.Ellipse, {setShape:function (newShape) {
		this.shape = dojox.gfx.makeParameters(this.shape, newShape);
		this.bbox = null;
		var r = this.rawNode, n = this.shape;
		r.width = 2 * n.rx;
		r.height = 2 * n.ry;
		return this._applyTransform();
	}, _getAdjustedMatrix:function () {
		var m = this.matrix, s = this.shape, d = {dx:s.cx - s.rx, dy:s.cy - s.ry};
		return new dojox.gfx.Matrix2D(m ? [m, d] : d);
	}});
	dojox.gfx.Ellipse.nodeType = "Ellipse";
	dojo.declare("dojox.gfx.Circle", dojox.gfx.shape.Circle, {setShape:function (newShape) {
		this.shape = dojox.gfx.makeParameters(this.shape, newShape);
		this.bbox = null;
		var r = this.rawNode, n = this.shape;
		r.width = r.height = 2 * n.r;
		return this._applyTransform();
	}, _getAdjustedMatrix:function () {
		var m = this.matrix, s = this.shape, d = {dx:s.cx - s.r, dy:s.cy - s.r};
		return new dojox.gfx.Matrix2D(m ? [m, d] : d);
	}});
	dojox.gfx.Circle.nodeType = "Ellipse";
	dojo.declare("dojox.gfx.Line", dojox.gfx.shape.Line, {setShape:function (newShape) {
		this.shape = dojox.gfx.makeParameters(this.shape, newShape);
		this.bbox = null;
		var r = this.rawNode, n = this.shape;
		r.x1 = n.x1;
		r.y1 = n.y1;
		r.x2 = n.x2;
		r.y2 = n.y2;
		return this;
	}});
	dojox.gfx.Line.nodeType = "Line";
	dojo.declare("dojox.gfx.Polyline", dojox.gfx.shape.Polyline, {setShape:function (points, closed) {
		if (points && points instanceof Array) {
			this.shape = dojox.gfx.makeParameters(this.shape, {points:points});
			if (closed && this.shape.points.length) {
				this.shape.points.push(this.shape.points[0]);
			}
		} else {
			this.shape = dojox.gfx.makeParameters(this.shape, points);
		}
		this.bbox = null;
		this._normalizePoints();
		var p = this.shape.points, rp = [];
		for (var i = 0; i < p.length; ++i) {
			rp.push(p[i].x, p[i].y);
		}
		this.rawNode.points = rp.join(",");
		return this;
	}});
	dojox.gfx.Polyline.nodeType = "Polyline";
	dojo.declare("dojox.gfx.Image", dojox.gfx.shape.Image, {setShape:function (newShape) {
		this.shape = dojox.gfx.makeParameters(this.shape, newShape);
		this.bbox = null;
		var r = this.rawNode, n = this.shape;
		r.width = n.width;
		r.height = n.height;
		r.source = n.src;
		return this._applyTransform();
	}, _getAdjustedMatrix:function () {
		var m = this.matrix, s = this.shape, d = {dx:s.x, dy:s.y};
		return new dojox.gfx.Matrix2D(m ? [m, d] : d);
	}, setRawNode:function (rawNode) {
		this.rawNode = rawNode;
	}});
	dojox.gfx.Image.nodeType = "Image";
	dojo.declare("dojox.gfx.Text", dojox.gfx.shape.Text, {setShape:function (newShape) {
		this.shape = dojox.gfx.makeParameters(this.shape, newShape);
		this.bbox = null;
		var r = this.rawNode, s = this.shape;
		r.text = s.text;
		r.textDecorations = s.decoration === "underline" ? "Underline" : "None";
		r["Canvas.Left"] = -10000;
		r["Canvas.Top"] = -10000;
		if (!this._delay) {
			this._delay = window.setTimeout(dojo.hitch(this, "_delayAlignment"), 10);
		}
		return this;
	}, _delayAlignment:function () {
		var r = this.rawNode, s = this.shape, w = r.actualWidth, h = r.actualHeight, x = s.x, y = s.y - h * 0.75;
		switch (s.align) {
		  case "middle":
			x -= w / 2;
			break;
		  case "end":
			x -= w;
			break;
		}
		this._delta = {dx:x, dy:y};
		r["Canvas.Left"] = 0;
		r["Canvas.Top"] = 0;
		this._applyTransform();
		delete this._delay;
	}, _getAdjustedMatrix:function () {
		var m = this.matrix, d = this._delta, x;
		if (m) {
			x = d ? [m, d] : m;
		} else {
			x = d ? d : {};
		}
		return new dojox.gfx.Matrix2D(x);
	}, setStroke:function () {
		return this;
	}, _setFillAttr:function (f) {
		this.rawNode.foreground = f;
	}, setRawNode:function (rawNode) {
		this.rawNode = rawNode;
	}, getTextWidth:function () {
		return this.rawNode.actualWidth;
	}});
	dojox.gfx.Text.nodeType = "TextBlock";
	dojo.declare("dojox.gfx.Path", dojox.gfx.path.Path, {_updateWithSegment:function (segment) {
		dojox.gfx.Path.superclass._updateWithSegment.apply(this, arguments);
		var p = this.shape.path;
		if (typeof (p) == "string") {
			this.rawNode.data = p ? p : null;
		}
	}, setShape:function (newShape) {
		dojox.gfx.Path.superclass.setShape.apply(this, arguments);
		var p = this.shape.path;
		this.rawNode.data = p ? p : null;
		return this;
	}});
	dojox.gfx.Path.nodeType = "Path";
	dojo.declare("dojox.gfx.TextPath", dojox.gfx.path.TextPath, {_updateWithSegment:function (segment) {
	}, setShape:function (newShape) {
	}, _setText:function () {
	}});
	dojox.gfx.TextPath.nodeType = "text";
	dojox.gfx.silverlight.surfaces = {};
	dojox.gfx.silverlight.nullFunc = function () {
	};
	dojo.declare("dojox.gfx.Surface", dojox.gfx.shape.Surface, {constructor:function () {
		dojox.gfx.silverlight.Container._init.call(this);
	}, destroy:function () {
		window[this._onLoadName] = dojox.gfx.silverlight.nullFunc;
		delete dojox.gfx.silverlight.surfaces[this.rawNode.name];
		this.inherited(arguments);
	}, setDimensions:function (width, height) {
		this.width = dojox.gfx.normalizedLength(width);
		this.height = dojox.gfx.normalizedLength(height);
		var p = this.rawNode && this.rawNode.getHost();
		if (p) {
			p.width = width;
			p.height = height;
		}
		return this;
	}, getDimensions:function () {
		var p = this.rawNode && this.rawNode.getHost();
		var t = p ? {width:p.content.actualWidth, height:p.content.actualHeight} : null;
		if (t.width <= 0) {
			t.width = this.width;
		}
		if (t.height <= 0) {
			t.height = this.height;
		}
		return t;
	}});
	dojox.gfx.createSurface = function (parentNode, width, height) {
		if (!width && !height) {
			var pos = d.position(parentNode);
			width = width || pos.w;
			height = height || pos.h;
		}
		if (typeof width == "number") {
			width = width + "px";
		}
		if (typeof height == "number") {
			height = height + "px";
		}
		var s = new dojox.gfx.Surface();
		parentNode = dojo.byId(parentNode);
		s._parent = parentNode;
		var t = parentNode.ownerDocument.createElement("script");
		t.type = "text/xaml";
		t.id = dojox.gfx._base._getUniqueId();
		t.text = "<?xml version='1.0'?><Canvas xmlns='http://schemas.microsoft.com/client/2007' Name='" + dojox.gfx._base._getUniqueId() + "'/>";
		parentNode.parentNode.insertBefore(t, parentNode);
		s._nodes.push(t);
		var obj, pluginName = dojox.gfx._base._getUniqueId(), onLoadName = "__" + dojox.gfx._base._getUniqueId() + "_onLoad";
		s._onLoadName = onLoadName;
		window[onLoadName] = function (sender) {
			console.log("Silverlight: loaded");
			if (!s.rawNode) {
				s.rawNode = dojo.byId(pluginName).content.root;
				dojox.gfx.silverlight.surfaces[s.rawNode.name] = parentNode;
				s.onLoad(s);
				console.log("Silverlight: assigned");
			}
		};
		if (dojo.isSafari) {
			obj = "<embed type='application/x-silverlight' id='" + pluginName + "' width='" + width + "' height='" + height + " background='transparent'" + " source='#" + t.id + "'" + " windowless='true'" + " maxFramerate='60'" + " onLoad='" + onLoadName + "'" + " onError='__dojoSilverlightError'" + " /><iframe style='visibility:hidden;height:0;width:0'/>";
		} else {
			obj = "<object type='application/x-silverlight' data='data:application/x-silverlight,' id='" + pluginName + "' width='" + width + "' height='" + height + "'>" + "<param name='background' value='transparent' />" + "<param name='source' value='#" + t.id + "' />" + "<param name='windowless' value='true' />" + "<param name='maxFramerate' value='60' />" + "<param name='onLoad' value='" + onLoadName + "' />" + "<param name='onError' value='__dojoSilverlightError' />" + "</object>";
		}
		parentNode.innerHTML = obj;
		var pluginNode = dojo.byId(pluginName);
		if (pluginNode.content && pluginNode.content.root) {
			s.rawNode = pluginNode.content.root;
			dojox.gfx.silverlight.surfaces[s.rawNode.name] = parentNode;
		} else {
			s.rawNode = null;
			s.isLoaded = false;
		}
		s._nodes.push(pluginNode);
		s.width = dojox.gfx.normalizedLength(width);
		s.height = dojox.gfx.normalizedLength(height);
		return s;
	};
	__dojoSilverlightError = function (sender, err) {
		var t = "Silverlight Error:\n" + "Code: " + err.ErrorCode + "\n" + "Type: " + err.ErrorType + "\n" + "Message: " + err.ErrorMessage + "\n";
		switch (err.ErrorType) {
		  case "ParserError":
			t += "XamlFile: " + err.xamlFile + "\n" + "Line: " + err.lineNumber + "\n" + "Position: " + err.charPosition + "\n";
			break;
		  case "RuntimeError":
			t += "MethodName: " + err.methodName + "\n";
			if (err.lineNumber != 0) {
				t += "Line: " + err.lineNumber + "\n" + "Position: " + err.charPosition + "\n";
			}
			break;
		}
		console.error(t);
	};
	dojox.gfx.silverlight.Font = {_setFont:function () {
		var f = this.fontStyle, r = this.rawNode, fw = dojox.gfx.silverlight.fontweight, fo = dojox.gfx.silverlight.fonts, t = f.family.toLowerCase();
		r.fontStyle = f.style == "italic" ? "Italic" : "Normal";
		r.fontWeight = f.weight in fw ? fw[f.weight] : f.weight;
		r.fontSize = dojox.gfx.normalizedLength(f.size);
		r.fontFamily = t in fo ? fo[t] : f.family;
		if (!this._delay) {
			this._delay = window.setTimeout(dojo.hitch(this, "_delayAlignment"), 10);
		}
	}};
	dojox.gfx.silverlight.Container = {_init:function () {
		dojox.gfx.shape.Container._init.call(this);
	}, add:function (shape) {
		if (this != shape.getParent()) {
			dojox.gfx.shape.Container.add.apply(this, arguments);
			this.rawNode.children.add(shape.rawNode);
		}
		return this;
	}, remove:function (shape, silently) {
		if (this == shape.getParent()) {
			var parent = shape.rawNode.getParent();
			if (parent) {
				parent.children.remove(shape.rawNode);
			}
			dojox.gfx.shape.Container.remove.apply(this, arguments);
		}
		return this;
	}, clear:function () {
		this.rawNode.children.clear();
		return dojox.gfx.shape.Container.clear.apply(this, arguments);
	}, _moveChildToFront:dojox.gfx.shape.Container._moveChildToFront, _moveChildToBack:dojox.gfx.shape.Container._moveChildToBack};
	dojo.mixin(dojox.gfx.shape.Creator, {createObject:function (shapeType, rawShape) {
		if (!this.rawNode) {
			return null;
		}
		var shape = new shapeType();
		var node = this.rawNode.getHost().content.createFromXaml("<" + shapeType.nodeType + "/>");
		shape.setRawNode(node);
		shape.setShape(rawShape);
		this.add(shape);
		return shape;
	}});
	dojo.extend(dojox.gfx.Text, dojox.gfx.silverlight.Font);
	dojo.extend(dojox.gfx.Group, dojox.gfx.silverlight.Container);
	dojo.extend(dojox.gfx.Group, dojox.gfx.shape.Creator);
	dojo.extend(dojox.gfx.Surface, dojox.gfx.silverlight.Container);
	dojo.extend(dojox.gfx.Surface, dojox.gfx.shape.Creator);
	(function () {
		var surfaces = dojox.gfx.silverlight.surfaces;
		var mouseFix = function (s, a) {
			var ev = {target:s, currentTarget:s, preventDefault:function () {
			}, stopPropagation:function () {
			}};
			if (a) {
				try {
					ev.ctrlKey = a.ctrl;
					ev.shiftKey = a.shift;
					var p = a.getPosition(null);
					ev.x = ev.offsetX = ev.layerX = p.x;
					ev.y = ev.offsetY = ev.layerY = p.y;
					var parent = surfaces[s.getHost().content.root.name];
					var t = dojo.position(parent);
					ev.clientX = t.x + p.x;
					ev.clientY = t.y + p.y;
				}
				catch (e) {
				}
			}
			return ev;
		};
		var keyFix = function (s, a) {
			var ev = {keyCode:a.platformKeyCode, ctrlKey:a.ctrl, shiftKey:a.shift};
			return ev;
		};
		var eventNames = {onclick:{name:"MouseLeftButtonUp", fix:mouseFix}, onmouseenter:{name:"MouseEnter", fix:mouseFix}, onmouseleave:{name:"MouseLeave", fix:mouseFix}, onmouseover:{name:"MouseEnter", fix:mouseFix}, onmouseout:{name:"MouseLeave", fix:mouseFix}, onmousedown:{name:"MouseLeftButtonDown", fix:mouseFix}, onmouseup:{name:"MouseLeftButtonUp", fix:mouseFix}, onmousemove:{name:"MouseMove", fix:mouseFix}, onkeydown:{name:"KeyDown", fix:keyFix}, onkeyup:{name:"KeyUp", fix:keyFix}};
		var eventsProcessing = {connect:function (name, object, method) {
			var token, n = name in eventNames ? eventNames[name] : {name:name, fix:function () {
				return {};
			}};
			if (arguments.length > 2) {
				token = this.getEventSource().addEventListener(n.name, function (s, a) {
					dojo.hitch(object, method)(n.fix(s, a));
				});
			} else {
				token = this.getEventSource().addEventListener(n.name, function (s, a) {
					object(n.fix(s, a));
				});
			}
			return {name:n.name, token:token};
		}, disconnect:function (token) {
			this.getEventSource().removeEventListener(token.name, token.token);
		}};
		dojo.extend(dojox.gfx.Shape, eventsProcessing);
		dojo.extend(dojox.gfx.Surface, eventsProcessing);
		dojox.gfx.equalSources = function (a, b) {
			return a && b && a.equals(b);
		};
	})();
}

