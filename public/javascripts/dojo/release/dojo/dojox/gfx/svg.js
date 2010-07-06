/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.gfx.svg"]) {
	dojo._hasResource["dojox.gfx.svg"] = true;
	dojo.provide("dojox.gfx.svg");
	dojo.require("dojox.gfx._base");
	dojo.require("dojox.gfx.shape");
	dojo.require("dojox.gfx.path");
	(function () {
		var d = dojo, g = dojox.gfx, gs = g.shape, svg = g.svg;
		var _createElementNS = function (ns, nodeType) {
			if (document.createElementNS) {
				return document.createElementNS(ns, nodeType);
			} else {
				return document.createElement(nodeType);
			}
		};
		svg.xmlns = {xlink:"http://www.w3.org/1999/xlink", svg:"http://www.w3.org/2000/svg"};
		svg.getRef = function (name) {
			if (!name || name == "none") {
				return null;
			}
			if (name.match(/^url\(#.+\)$/)) {
				return d.byId(name.slice(5, -1));
			}
			if (name.match(/^#dojoUnique\d+$/)) {
				return d.byId(name.slice(1));
			}
			return null;
		};
		svg.dasharray = {solid:"none", shortdash:[4, 1], shortdot:[1, 1], shortdashdot:[4, 1, 1, 1], shortdashdotdot:[4, 1, 1, 1, 1, 1], dot:[1, 3], dash:[4, 3], longdash:[8, 3], dashdot:[4, 3, 1, 3], longdashdot:[8, 3, 1, 3], longdashdotdot:[8, 3, 1, 3, 1, 3]};
		d.extend(g.Shape, {setFill:function (fill) {
			if (!fill) {
				this.fillStyle = null;
				this.rawNode.setAttribute("fill", "none");
				this.rawNode.setAttribute("fill-opacity", 0);
				return this;
			}
			var f;
			var setter = function (x) {
				this.setAttribute(x, f[x].toFixed(8));
			};
			if (typeof (fill) == "object" && "type" in fill) {
				switch (fill.type) {
				  case "linear":
					f = g.makeParameters(g.defaultLinearGradient, fill);
					var gradient = this._setFillObject(f, "linearGradient");
					d.forEach(["x1", "y1", "x2", "y2"], setter, gradient);
					break;
				  case "radial":
					f = g.makeParameters(g.defaultRadialGradient, fill);
					var gradient = this._setFillObject(f, "radialGradient");
					d.forEach(["cx", "cy", "r"], setter, gradient);
					break;
				  case "pattern":
					f = g.makeParameters(g.defaultPattern, fill);
					var pattern = this._setFillObject(f, "pattern");
					d.forEach(["x", "y", "width", "height"], setter, pattern);
					break;
				}
				this.fillStyle = f;
				return this;
			}
			var f = g.normalizeColor(fill);
			this.fillStyle = f;
			this.rawNode.setAttribute("fill", f.toCss());
			this.rawNode.setAttribute("fill-opacity", f.a);
			this.rawNode.setAttribute("fill-rule", "evenodd");
			return this;
		}, setStroke:function (stroke) {
			var rn = this.rawNode;
			if (!stroke) {
				this.strokeStyle = null;
				rn.setAttribute("stroke", "none");
				rn.setAttribute("stroke-opacity", 0);
				return this;
			}
			if (typeof stroke == "string" || d.isArray(stroke) || stroke instanceof d.Color) {
				stroke = {color:stroke};
			}
			var s = this.strokeStyle = g.makeParameters(g.defaultStroke, stroke);
			s.color = g.normalizeColor(s.color);
			if (s) {
				rn.setAttribute("stroke", s.color.toCss());
				rn.setAttribute("stroke-opacity", s.color.a);
				rn.setAttribute("stroke-width", s.width);
				rn.setAttribute("stroke-linecap", s.cap);
				if (typeof s.join == "number") {
					rn.setAttribute("stroke-linejoin", "miter");
					rn.setAttribute("stroke-miterlimit", s.join);
				} else {
					rn.setAttribute("stroke-linejoin", s.join);
				}
				var da = s.style.toLowerCase();
				if (da in svg.dasharray) {
					da = svg.dasharray[da];
				}
				if (da instanceof Array) {
					da = d._toArray(da);
					for (var i = 0; i < da.length; ++i) {
						da[i] *= s.width;
					}
					if (s.cap != "butt") {
						for (var i = 0; i < da.length; i += 2) {
							da[i] -= s.width;
							if (da[i] < 1) {
								da[i] = 1;
							}
						}
						for (var i = 1; i < da.length; i += 2) {
							da[i] += s.width;
						}
					}
					da = da.join(",");
				}
				rn.setAttribute("stroke-dasharray", da);
				rn.setAttribute("dojoGfxStrokeStyle", s.style);
			}
			return this;
		}, _getParentSurface:function () {
			var surface = this.parent;
			for (; surface && !(surface instanceof g.Surface); surface = surface.parent) {
			}
			return surface;
		}, _setFillObject:function (f, nodeType) {
			var svgns = svg.xmlns.svg;
			this.fillStyle = f;
			var surface = this._getParentSurface(), defs = surface.defNode, fill = this.rawNode.getAttribute("fill"), ref = svg.getRef(fill);
			if (ref) {
				fill = ref;
				if (fill.tagName.toLowerCase() != nodeType.toLowerCase()) {
					var id = fill.id;
					fill.parentNode.removeChild(fill);
					fill = _createElementNS(svgns, nodeType);
					fill.setAttribute("id", id);
					defs.appendChild(fill);
				} else {
					while (fill.childNodes.length) {
						fill.removeChild(fill.lastChild);
					}
				}
			} else {
				fill = _createElementNS(svgns, nodeType);
				fill.setAttribute("id", g._base._getUniqueId());
				defs.appendChild(fill);
			}
			if (nodeType == "pattern") {
				fill.setAttribute("patternUnits", "userSpaceOnUse");
				var img = _createElementNS(svgns, "image");
				img.setAttribute("x", 0);
				img.setAttribute("y", 0);
				img.setAttribute("width", f.width.toFixed(8));
				img.setAttribute("height", f.height.toFixed(8));
				img.setAttributeNS(svg.xmlns.xlink, "href", f.src);
				fill.appendChild(img);
			} else {
				fill.setAttribute("gradientUnits", "userSpaceOnUse");
				for (var i = 0; i < f.colors.length; ++i) {
					var c = f.colors[i], t = _createElementNS(svgns, "stop"), cc = c.color = g.normalizeColor(c.color);
					t.setAttribute("offset", c.offset.toFixed(8));
					t.setAttribute("stop-color", cc.toCss());
					t.setAttribute("stop-opacity", cc.a);
					fill.appendChild(t);
				}
			}
			this.rawNode.setAttribute("fill", "url(#" + fill.getAttribute("id") + ")");
			this.rawNode.removeAttribute("fill-opacity");
			this.rawNode.setAttribute("fill-rule", "evenodd");
			return fill;
		}, _applyTransform:function () {
			var matrix = this.matrix;
			if (matrix) {
				var tm = this.matrix;
				this.rawNode.setAttribute("transform", "matrix(" + tm.xx.toFixed(8) + "," + tm.yx.toFixed(8) + "," + tm.xy.toFixed(8) + "," + tm.yy.toFixed(8) + "," + tm.dx.toFixed(8) + "," + tm.dy.toFixed(8) + ")");
			} else {
				this.rawNode.removeAttribute("transform");
			}
			return this;
		}, setRawNode:function (rawNode) {
			var r = this.rawNode = rawNode;
			if (this.shape.type != "image") {
				r.setAttribute("fill", "none");
			}
			r.setAttribute("fill-opacity", 0);
			r.setAttribute("stroke", "none");
			r.setAttribute("stroke-opacity", 0);
			r.setAttribute("stroke-width", 1);
			r.setAttribute("stroke-linecap", "butt");
			r.setAttribute("stroke-linejoin", "miter");
			r.setAttribute("stroke-miterlimit", 4);
		}, setShape:function (newShape) {
			this.shape = g.makeParameters(this.shape, newShape);
			for (var i in this.shape) {
				if (i != "type") {
					this.rawNode.setAttribute(i, this.shape[i]);
				}
			}
			this.bbox = null;
			return this;
		}, _moveToFront:function () {
			this.rawNode.parentNode.appendChild(this.rawNode);
			return this;
		}, _moveToBack:function () {
			this.rawNode.parentNode.insertBefore(this.rawNode, this.rawNode.parentNode.firstChild);
			return this;
		}});
		dojo.declare("dojox.gfx.Group", g.Shape, {constructor:function () {
			svg.Container._init.call(this);
		}, setRawNode:function (rawNode) {
			this.rawNode = rawNode;
		}});
		g.Group.nodeType = "g";
		dojo.declare("dojox.gfx.Rect", gs.Rect, {setShape:function (newShape) {
			this.shape = g.makeParameters(this.shape, newShape);
			this.bbox = null;
			for (var i in this.shape) {
				if (i != "type" && i != "r") {
					this.rawNode.setAttribute(i, this.shape[i]);
				}
			}
			if (this.shape.r) {
				this.rawNode.setAttribute("ry", this.shape.r);
				this.rawNode.setAttribute("rx", this.shape.r);
			}
			return this;
		}});
		g.Rect.nodeType = "rect";
		g.Ellipse = gs.Ellipse;
		g.Ellipse.nodeType = "ellipse";
		g.Circle = gs.Circle;
		g.Circle.nodeType = "circle";
		g.Line = gs.Line;
		g.Line.nodeType = "line";
		dojo.declare("dojox.gfx.Polyline", gs.Polyline, {setShape:function (points, closed) {
			if (points && points instanceof Array) {
				this.shape = g.makeParameters(this.shape, {points:points});
				if (closed && this.shape.points.length) {
					this.shape.points.push(this.shape.points[0]);
				}
			} else {
				this.shape = g.makeParameters(this.shape, points);
			}
			this.bbox = null;
			this._normalizePoints();
			var attr = [], p = this.shape.points;
			for (var i = 0; i < p.length; ++i) {
				attr.push(p[i].x.toFixed(8), p[i].y.toFixed(8));
			}
			this.rawNode.setAttribute("points", attr.join(" "));
			return this;
		}});
		g.Polyline.nodeType = "polyline";
		dojo.declare("dojox.gfx.Image", gs.Image, {setShape:function (newShape) {
			this.shape = g.makeParameters(this.shape, newShape);
			this.bbox = null;
			var rawNode = this.rawNode;
			for (var i in this.shape) {
				if (i != "type" && i != "src") {
					rawNode.setAttribute(i, this.shape[i]);
				}
			}
			rawNode.setAttribute("preserveAspectRatio", "none");
			rawNode.setAttributeNS(svg.xmlns.xlink, "href", this.shape.src);
			return this;
		}});
		g.Image.nodeType = "image";
		dojo.declare("dojox.gfx.Text", gs.Text, {setShape:function (newShape) {
			this.shape = g.makeParameters(this.shape, newShape);
			this.bbox = null;
			var r = this.rawNode, s = this.shape;
			r.setAttribute("x", s.x);
			r.setAttribute("y", s.y);
			r.setAttribute("text-anchor", s.align);
			r.setAttribute("text-decoration", s.decoration);
			r.setAttribute("rotate", s.rotated ? 90 : 0);
			r.setAttribute("kerning", s.kerning ? "auto" : 0);
			r.setAttribute("text-rendering", "optimizeLegibility");
			if (!dojo.isIE) {
				r.textContent = s.text;
			} else {
				r.appendChild(document.createTextNode(s.text));
			}
			return this;
		}, getTextWidth:function () {
			var rawNode = this.rawNode, oldParent = rawNode.parentNode, _measurementNode = rawNode.cloneNode(true);
			_measurementNode.style.visibility = "hidden";
			var _width = 0, _text = _measurementNode.firstChild.nodeValue;
			oldParent.appendChild(_measurementNode);
			if (_text != "") {
				while (!_width) {
					_width = parseInt(_measurementNode.getBBox().width);
				}
			}
			oldParent.removeChild(_measurementNode);
			return _width;
		}});
		g.Text.nodeType = "text";
		dojo.declare("dojox.gfx.Path", g.path.Path, {_updateWithSegment:function (segment) {
			g.Path.superclass._updateWithSegment.apply(this, arguments);
			if (typeof (this.shape.path) == "string") {
				this.rawNode.setAttribute("d", this.shape.path);
			}
		}, setShape:function (newShape) {
			g.Path.superclass.setShape.apply(this, arguments);
			this.rawNode.setAttribute("d", this.shape.path);
			return this;
		}});
		g.Path.nodeType = "path";
		dojo.declare("dojox.gfx.TextPath", g.path.TextPath, {_updateWithSegment:function (segment) {
			g.Path.superclass._updateWithSegment.apply(this, arguments);
			this._setTextPath();
		}, setShape:function (newShape) {
			g.Path.superclass.setShape.apply(this, arguments);
			this._setTextPath();
			return this;
		}, _setTextPath:function () {
			if (typeof this.shape.path != "string") {
				return;
			}
			var r = this.rawNode;
			if (!r.firstChild) {
				var tp = _createElementNS(svg.xmlns.svg, "textPath"), tx = document.createTextNode("");
				tp.appendChild(tx);
				r.appendChild(tp);
			}
			var ref = r.firstChild.getAttributeNS(svg.xmlns.xlink, "href"), path = ref && svg.getRef(ref);
			if (!path) {
				var surface = this._getParentSurface();
				if (surface) {
					var defs = surface.defNode;
					path = _createElementNS(svg.xmlns.svg, "path");
					var id = g._base._getUniqueId();
					path.setAttribute("id", id);
					defs.appendChild(path);
					r.firstChild.setAttributeNS(svg.xmlns.xlink, "href", "#" + id);
				}
			}
			if (path) {
				path.setAttribute("d", this.shape.path);
			}
		}, _setText:function () {
			var r = this.rawNode;
			if (!r.firstChild) {
				var tp = _createElementNS(svg.xmlns.svg, "textPath"), tx = document.createTextNode("");
				tp.appendChild(tx);
				r.appendChild(tp);
			}
			r = r.firstChild;
			var t = this.text;
			r.setAttribute("alignment-baseline", "middle");
			switch (t.align) {
			  case "middle":
				r.setAttribute("text-anchor", "middle");
				r.setAttribute("startOffset", "50%");
				break;
			  case "end":
				r.setAttribute("text-anchor", "end");
				r.setAttribute("startOffset", "100%");
				break;
			  default:
				r.setAttribute("text-anchor", "start");
				r.setAttribute("startOffset", "0%");
				break;
			}
			r.setAttribute("baseline-shift", "0.5ex");
			r.setAttribute("text-decoration", t.decoration);
			r.setAttribute("rotate", t.rotated ? 90 : 0);
			r.setAttribute("kerning", t.kerning ? "auto" : 0);
			r.firstChild.data = t.text;
		}});
		g.TextPath.nodeType = "text";
		dojo.declare("dojox.gfx.Surface", gs.Surface, {constructor:function () {
			svg.Container._init.call(this);
		}, destroy:function () {
			this.defNode = null;
			this.inherited(arguments);
		}, setDimensions:function (width, height) {
			if (!this.rawNode) {
				return this;
			}
			this.rawNode.setAttribute("width", width);
			this.rawNode.setAttribute("height", height);
			return this;
		}, getDimensions:function () {
			var t = this.rawNode ? {width:g.normalizedLength(this.rawNode.getAttribute("width")), height:g.normalizedLength(this.rawNode.getAttribute("height"))} : null;
			return t;
		}});
		g.createSurface = function (parentNode, width, height) {
			var s = new g.Surface();
			s.rawNode = _createElementNS(svg.xmlns.svg, "svg");
			if (width) {
				s.rawNode.setAttribute("width", width);
			}
			if (height) {
				s.rawNode.setAttribute("height", height);
			}
			var defNode = _createElementNS(svg.xmlns.svg, "defs");
			s.rawNode.appendChild(defNode);
			s.defNode = defNode;
			s._parent = d.byId(parentNode);
			s._parent.appendChild(s.rawNode);
			return s;
		};
		svg.Font = {_setFont:function () {
			var f = this.fontStyle;
			this.rawNode.setAttribute("font-style", f.style);
			this.rawNode.setAttribute("font-variant", f.variant);
			this.rawNode.setAttribute("font-weight", f.weight);
			this.rawNode.setAttribute("font-size", f.size);
			this.rawNode.setAttribute("font-family", f.family);
		}};
		svg.Container = {_init:function () {
			gs.Container._init.call(this);
		}, add:function (shape) {
			if (this != shape.getParent()) {
				this.rawNode.appendChild(shape.rawNode);
				gs.Container.add.apply(this, arguments);
			}
			return this;
		}, remove:function (shape, silently) {
			if (this == shape.getParent()) {
				if (this.rawNode == shape.rawNode.parentNode) {
					this.rawNode.removeChild(shape.rawNode);
				}
				gs.Container.remove.apply(this, arguments);
			}
			return this;
		}, clear:function () {
			var r = this.rawNode;
			while (r.lastChild) {
				r.removeChild(r.lastChild);
			}
			var defNode = this.defNode;
			if (defNode) {
				while (defNode.lastChild) {
					defNode.removeChild(defNode.lastChild);
				}
				r.appendChild(defNode);
			}
			return gs.Container.clear.apply(this, arguments);
		}, _moveChildToFront:gs.Container._moveChildToFront, _moveChildToBack:gs.Container._moveChildToBack};
		d.mixin(gs.Creator, {createObject:function (shapeType, rawShape) {
			if (!this.rawNode) {
				return null;
			}
			var shape = new shapeType(), node = _createElementNS(svg.xmlns.svg, shapeType.nodeType);
			shape.setRawNode(node);
			this.rawNode.appendChild(node);
			shape.setShape(rawShape);
			this.add(shape);
			return shape;
		}});
		d.extend(g.Text, svg.Font);
		d.extend(g.TextPath, svg.Font);
		d.extend(g.Group, svg.Container);
		d.extend(g.Group, gs.Creator);
		d.extend(g.Surface, svg.Container);
		d.extend(g.Surface, gs.Creator);
	})();
}

