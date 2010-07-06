/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.gfx.vml"]) {
	dojo._hasResource["dojox.gfx.vml"] = true;
	dojo.provide("dojox.gfx.vml");
	dojo.require("dojox.gfx._base");
	dojo.require("dojox.gfx.shape");
	dojo.require("dojox.gfx.path");
	dojo.require("dojox.gfx.arc");
	(function () {
		var d = dojo, g = dojox.gfx, m = g.matrix, gs = g.shape, vml = g.vml;
		vml.xmlns = "urn:schemas-microsoft-com:vml";
		vml.text_alignment = {start:"left", middle:"center", end:"right"};
		vml._parseFloat = function (str) {
			return str.match(/^\d+f$/i) ? parseInt(str) / 65536 : parseFloat(str);
		};
		vml._bool = {"t":1, "true":1};
		d.extend(g.Shape, {setFill:function (fill) {
			if (!fill) {
				this.fillStyle = null;
				this.rawNode.filled = "f";
				return this;
			}
			var i, f, fo, a, s;
			if (typeof fill == "object" && "type" in fill) {
				switch (fill.type) {
				  case "linear":
					var matrix = this._getRealMatrix();
					s = [];
					f = g.makeParameters(g.defaultLinearGradient, fill);
					a = f.colors;
					this.fillStyle = f;
					d.forEach(a, function (v, i, a) {
						a[i].color = g.normalizeColor(v.color);
					});
					if (a[0].offset > 0) {
						s.push("0 " + a[0].color.toHex());
					}
					for (i = 0; i < a.length; ++i) {
						s.push(a[i].offset.toFixed(8) + " " + a[i].color.toHex());
					}
					i = a.length - 1;
					if (a[i].offset < 1) {
						s.push("1 " + a[i].color.toHex());
					}
					fo = this.rawNode.fill;
					fo.colors.value = s.join(";");
					fo.method = "sigma";
					fo.type = "gradient";
					var fc1 = matrix ? m.multiplyPoint(matrix, f.x1, f.y1) : {x:f.x1, y:f.y1}, fc2 = matrix ? m.multiplyPoint(matrix, f.x2, f.y2) : {x:f.x2, y:f.y2};
					fo.angle = (m._radToDeg(Math.atan2(fc2.x - fc1.x, fc2.y - fc1.y)) + 180) % 360;
					fo.on = true;
					break;
				  case "radial":
					f = g.makeParameters(g.defaultRadialGradient, fill);
					this.fillStyle = f;
					var l = parseFloat(this.rawNode.style.left), t = parseFloat(this.rawNode.style.top), w = parseFloat(this.rawNode.style.width), h = parseFloat(this.rawNode.style.height), c = isNaN(w) ? 1 : 2 * f.r / w;
					a = [];
					if (f.colors[0].offset > 0) {
						a.push({offset:1, color:g.normalizeColor(f.colors[0].color)});
					}
					d.forEach(f.colors, function (v, i) {
						a.push({offset:1 - v.offset * c, color:g.normalizeColor(v.color)});
					});
					i = a.length - 1;
					while (i >= 0 && a[i].offset < 0) {
						--i;
					}
					if (i < a.length - 1) {
						var q = a[i], p = a[i + 1];
						p.color = d.blendColors(q.color, p.color, q.offset / (q.offset - p.offset));
						p.offset = 0;
						while (a.length - i > 2) {
							a.pop();
						}
					}
					i = a.length - 1, s = [];
					if (a[i].offset > 0) {
						s.push("0 " + a[i].color.toHex());
					}
					for (; i >= 0; --i) {
						s.push(a[i].offset.toFixed(8) + " " + a[i].color.toHex());
					}
					fo = this.rawNode.fill;
					fo.colors.value = s.join(";");
					fo.method = "sigma";
					fo.type = "gradientradial";
					if (isNaN(w) || isNaN(h) || isNaN(l) || isNaN(t)) {
						fo.focusposition = "0.5 0.5";
					} else {
						fo.focusposition = ((f.cx - l) / w).toFixed(8) + " " + ((f.cy - t) / h).toFixed(8);
					}
					fo.focussize = "0 0";
					fo.on = true;
					break;
				  case "pattern":
					f = g.makeParameters(g.defaultPattern, fill);
					this.fillStyle = f;
					fo = this.rawNode.fill;
					fo.type = "tile";
					fo.src = f.src;
					if (f.width && f.height) {
						fo.size.x = g.px2pt(f.width);
						fo.size.y = g.px2pt(f.height);
					}
					fo.alignShape = "f";
					fo.position.x = 0;
					fo.position.y = 0;
					fo.origin.x = f.width ? f.x / f.width : 0;
					fo.origin.y = f.height ? f.y / f.height : 0;
					fo.on = true;
					break;
				}
				this.rawNode.fill.opacity = 1;
				return this;
			}
			this.fillStyle = g.normalizeColor(fill);
			fo = this.rawNode.fill;
			if (!fo) {
				fo = this.rawNode.ownerDocument.createElement("v:fill");
			}
			fo.method = "any";
			fo.type = "solid";
			fo.opacity = this.fillStyle.a;
			this.rawNode.fillcolor = this.fillStyle.toHex();
			this.rawNode.filled = true;
			return this;
		}, setStroke:function (stroke) {
			if (!stroke) {
				this.strokeStyle = null;
				this.rawNode.stroked = "f";
				return this;
			}
			if (typeof stroke == "string" || d.isArray(stroke) || stroke instanceof d.Color) {
				stroke = {color:stroke};
			}
			var s = this.strokeStyle = g.makeParameters(g.defaultStroke, stroke);
			s.color = g.normalizeColor(s.color);
			var rn = this.rawNode;
			rn.stroked = true;
			rn.strokecolor = s.color.toCss();
			rn.strokeweight = s.width + "px";
			if (rn.stroke) {
				rn.stroke.opacity = s.color.a;
				rn.stroke.endcap = this._translate(this._capMap, s.cap);
				if (typeof s.join == "number") {
					rn.stroke.joinstyle = "miter";
					rn.stroke.miterlimit = s.join;
				} else {
					rn.stroke.joinstyle = s.join;
				}
				rn.stroke.dashstyle = s.style == "none" ? "Solid" : s.style;
			}
			return this;
		}, _capMap:{butt:"flat"}, _capMapReversed:{flat:"butt"}, _translate:function (dict, value) {
			return (value in dict) ? dict[value] : value;
		}, _applyTransform:function () {
			if (this.fillStyle && this.fillStyle.type == "linear") {
				this.setFill(this.fillStyle);
			}
			var matrix = this._getRealMatrix();
			if (!matrix) {
				return this;
			}
			var skew = this.rawNode.skew;
			if (typeof skew == "undefined") {
				for (var i = 0; i < this.rawNode.childNodes.length; ++i) {
					if (this.rawNode.childNodes[i].tagName == "skew") {
						skew = this.rawNode.childNodes[i];
						break;
					}
				}
			}
			if (skew) {
				skew.on = "f";
				var mt = matrix.xx.toFixed(8) + " " + matrix.xy.toFixed(8) + " " + matrix.yx.toFixed(8) + " " + matrix.yy.toFixed(8) + " 0 0", offset = Math.floor(matrix.dx).toFixed() + "px " + Math.floor(matrix.dy).toFixed() + "px", s = this.rawNode.style, l = parseFloat(s.left), t = parseFloat(s.top), w = parseFloat(s.width), h = parseFloat(s.height);
				if (isNaN(l)) {
					l = 0;
				}
				if (isNaN(t)) {
					t = 0;
				}
				if (isNaN(w) || !w) {
					w = 1;
				}
				if (isNaN(h) || !h) {
					h = 1;
				}
				var origin = (-l / w - 0.5).toFixed(8) + " " + (-t / h - 0.5).toFixed(8);
				skew.matrix = mt;
				skew.origin = origin;
				skew.offset = offset;
				skew.on = true;
			}
			return this;
		}, _setDimensions:function (width, height) {
			return this;
		}, setRawNode:function (rawNode) {
			rawNode.stroked = "f";
			rawNode.filled = "f";
			this.rawNode = rawNode;
		}, _moveToFront:function () {
			this.rawNode.parentNode.appendChild(this.rawNode);
			return this;
		}, _moveToBack:function () {
			var r = this.rawNode, p = r.parentNode, n = p.firstChild;
			p.insertBefore(r, n);
			if (n.tagName == "rect") {
				n.swapNode(r);
			}
			return this;
		}, _getRealMatrix:function () {
			return this.parentMatrix ? new g.Matrix2D([this.parentMatrix, this.matrix]) : this.matrix;
		}});
		dojo.declare("dojox.gfx.Group", g.Shape, {constructor:function () {
			vml.Container._init.call(this);
		}, _applyTransform:function () {
			var matrix = this._getRealMatrix();
			for (var i = 0; i < this.children.length; ++i) {
				this.children[i]._updateParentMatrix(matrix);
			}
			return this;
		}, _setDimensions:function (width, height) {
			var r = this.rawNode, rs = r.style, bs = this.bgNode.style;
			rs.width = width;
			rs.height = height;
			r.coordsize = width + " " + height;
			bs.width = width;
			bs.height = height;
			for (var i = 0; i < this.children.length; ++i) {
				this.children[i]._setDimensions(width, height);
			}
			return this;
		}});
		g.Group.nodeType = "group";
		dojo.declare("dojox.gfx.Rect", gs.Rect, {setShape:function (newShape) {
			var shape = this.shape = g.makeParameters(this.shape, newShape);
			this.bbox = null;
			var r = Math.min(1, (shape.r / Math.min(parseFloat(shape.width), parseFloat(shape.height)))).toFixed(8);
			var parent = this.rawNode.parentNode, before = null;
			if (parent) {
				if (parent.lastChild !== this.rawNode) {
					for (var i = 0; i < parent.childNodes.length; ++i) {
						if (parent.childNodes[i] === this.rawNode) {
							before = parent.childNodes[i + 1];
							break;
						}
					}
				}
				parent.removeChild(this.rawNode);
			}
			if (d.isIE > 7) {
				var node = this.rawNode.ownerDocument.createElement("v:roundrect");
				node.arcsize = r;
				node.style.display = "inline-block";
				this.rawNode = node;
			} else {
				this.rawNode.arcsize = r;
			}
			if (parent) {
				if (before) {
					parent.insertBefore(this.rawNode, before);
				} else {
					parent.appendChild(this.rawNode);
				}
			}
			var style = this.rawNode.style;
			style.left = shape.x.toFixed();
			style.top = shape.y.toFixed();
			style.width = (typeof shape.width == "string" && shape.width.indexOf("%") >= 0) ? shape.width : shape.width.toFixed();
			style.height = (typeof shape.width == "string" && shape.height.indexOf("%") >= 0) ? shape.height : shape.height.toFixed();
			return this.setTransform(this.matrix).setFill(this.fillStyle).setStroke(this.strokeStyle);
		}});
		g.Rect.nodeType = "roundrect";
		dojo.declare("dojox.gfx.Ellipse", gs.Ellipse, {setShape:function (newShape) {
			var shape = this.shape = g.makeParameters(this.shape, newShape);
			this.bbox = null;
			var style = this.rawNode.style;
			style.left = (shape.cx - shape.rx).toFixed();
			style.top = (shape.cy - shape.ry).toFixed();
			style.width = (shape.rx * 2).toFixed();
			style.height = (shape.ry * 2).toFixed();
			return this.setTransform(this.matrix);
		}});
		g.Ellipse.nodeType = "oval";
		dojo.declare("dojox.gfx.Circle", gs.Circle, {setShape:function (newShape) {
			var shape = this.shape = g.makeParameters(this.shape, newShape);
			this.bbox = null;
			var style = this.rawNode.style;
			style.left = (shape.cx - shape.r).toFixed();
			style.top = (shape.cy - shape.r).toFixed();
			style.width = (shape.r * 2).toFixed();
			style.height = (shape.r * 2).toFixed();
			return this;
		}});
		g.Circle.nodeType = "oval";
		dojo.declare("dojox.gfx.Line", gs.Line, {constructor:function (rawNode) {
			if (rawNode) {
				rawNode.setAttribute("dojoGfxType", "line");
			}
		}, setShape:function (newShape) {
			var shape = this.shape = g.makeParameters(this.shape, newShape);
			this.bbox = null;
			this.rawNode.path.v = "m" + shape.x1.toFixed() + " " + shape.y1.toFixed() + "l" + shape.x2.toFixed() + " " + shape.y2.toFixed() + "e";
			return this.setTransform(this.matrix);
		}});
		g.Line.nodeType = "shape";
		dojo.declare("dojox.gfx.Polyline", gs.Polyline, {constructor:function (rawNode) {
			if (rawNode) {
				rawNode.setAttribute("dojoGfxType", "polyline");
			}
		}, setShape:function (points, closed) {
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
			if (p.length > 0) {
				attr.push("m");
				attr.push(p[0].x.toFixed(), p[0].y.toFixed());
				if (p.length > 1) {
					attr.push("l");
					for (var i = 1; i < p.length; ++i) {
						attr.push(p[i].x.toFixed(), p[i].y.toFixed());
					}
				}
			}
			attr.push("e");
			this.rawNode.path.v = attr.join(" ");
			return this.setTransform(this.matrix);
		}});
		g.Polyline.nodeType = "shape";
		dojo.declare("dojox.gfx.Image", gs.Image, {setShape:function (newShape) {
			var shape = this.shape = g.makeParameters(this.shape, newShape);
			this.bbox = null;
			this.rawNode.firstChild.src = shape.src;
			return this.setTransform(this.matrix);
		}, _applyTransform:function () {
			var matrix = this._getRealMatrix(), rawNode = this.rawNode, s = rawNode.style, shape = this.shape;
			if (matrix) {
				matrix = m.multiply(matrix, {dx:shape.x, dy:shape.y});
			} else {
				matrix = m.normalize({dx:shape.x, dy:shape.y});
			}
			if (matrix.xy == 0 && matrix.yx == 0 && matrix.xx > 0 && matrix.yy > 0) {
				s.filter = "";
				s.width = Math.floor(matrix.xx * shape.width);
				s.height = Math.floor(matrix.yy * shape.height);
				s.left = Math.floor(matrix.dx);
				s.top = Math.floor(matrix.dy);
			} else {
				var ps = rawNode.parentNode.style;
				s.left = "0px";
				s.top = "0px";
				s.width = ps.width;
				s.height = ps.height;
				matrix = m.multiply(matrix, {xx:shape.width / parseInt(s.width), yy:shape.height / parseInt(s.height)});
				var f = rawNode.filters["DXImageTransform.Microsoft.Matrix"];
				if (f) {
					f.M11 = matrix.xx;
					f.M12 = matrix.xy;
					f.M21 = matrix.yx;
					f.M22 = matrix.yy;
					f.Dx = matrix.dx;
					f.Dy = matrix.dy;
				} else {
					s.filter = "progid:DXImageTransform.Microsoft.Matrix(M11=" + matrix.xx + ", M12=" + matrix.xy + ", M21=" + matrix.yx + ", M22=" + matrix.yy + ", Dx=" + matrix.dx + ", Dy=" + matrix.dy + ")";
				}
			}
			return this;
		}, _setDimensions:function (width, height) {
			var r = this.rawNode, f = r.filters["DXImageTransform.Microsoft.Matrix"];
			if (f) {
				var s = r.style;
				s.width = width;
				s.height = height;
				return this._applyTransform();
			}
			return this;
		}});
		g.Image.nodeType = "rect";
		dojo.declare("dojox.gfx.Text", gs.Text, {constructor:function (rawNode) {
			if (rawNode) {
				rawNode.setAttribute("dojoGfxType", "text");
			}
			this.fontStyle = null;
		}, _alignment:{start:"left", middle:"center", end:"right"}, setShape:function (newShape) {
			this.shape = g.makeParameters(this.shape, newShape);
			this.bbox = null;
			var r = this.rawNode, s = this.shape, x = s.x, y = s.y.toFixed(), path;
			switch (s.align) {
			  case "middle":
				x -= 5;
				break;
			  case "end":
				x -= 10;
				break;
			}
			path = "m" + x.toFixed() + "," + y + "l" + (x + 10).toFixed() + "," + y + "e";
			var p = null, t = null, c = r.childNodes;
			for (var i = 0; i < c.length; ++i) {
				var tag = c[i].tagName;
				if (tag == "path") {
					p = c[i];
					if (t) {
						break;
					}
				} else {
					if (tag == "textpath") {
						t = c[i];
						if (p) {
							break;
						}
					}
				}
			}
			if (!p) {
				p = r.ownerDocument.createElement("v:path");
				r.appendChild(p);
			}
			if (!t) {
				t = r.ownerDocument.createElement("v:textpath");
				r.appendChild(t);
			}
			p.v = path;
			p.textPathOk = true;
			t.on = true;
			var a = vml.text_alignment[s.align];
			t.style["v-text-align"] = a ? a : "left";
			t.style["text-decoration"] = s.decoration;
			t.style["v-rotate-letters"] = s.rotated;
			t.style["v-text-kern"] = s.kerning;
			t.string = s.text;
			return this.setTransform(this.matrix);
		}, _setFont:function () {
			var f = this.fontStyle, c = this.rawNode.childNodes;
			for (var i = 0; i < c.length; ++i) {
				if (c[i].tagName == "textpath") {
					c[i].style.font = g.makeFontString(f);
					break;
				}
			}
			this.setTransform(this.matrix);
		}, _getRealMatrix:function () {
			var matrix = g.Shape.prototype._getRealMatrix.call(this);
			if (matrix) {
				matrix = m.multiply(matrix, {dy:-g.normalizedLength(this.fontStyle ? this.fontStyle.size : "10pt") * 0.35});
			}
			return matrix;
		}, getTextWidth:function () {
			var rawNode = this.rawNode, _display = rawNode.style.display;
			rawNode.style.display = "inline";
			var _width = g.pt2px(parseFloat(rawNode.currentStyle.width));
			rawNode.style.display = _display;
			return _width;
		}});
		g.Text.nodeType = "shape";
		g.path._calcArc = function (alpha) {
			var cosa = Math.cos(alpha), sina = Math.sin(alpha), p2 = {x:cosa + (4 / 3) * (1 - cosa), y:sina - (4 / 3) * cosa * (1 - cosa) / sina};
			return {s:{x:cosa, y:-sina}, c1:{x:p2.x, y:-p2.y}, c2:p2, e:{x:cosa, y:sina}};
		};
		dojo.declare("dojox.gfx.Path", g.path.Path, {constructor:function (rawNode) {
			if (rawNode && !rawNode.getAttribute("dojoGfxType")) {
				rawNode.setAttribute("dojoGfxType", "path");
			}
			this.vmlPath = "";
			this.lastControl = {};
		}, _updateWithSegment:function (segment) {
			var last = d.clone(this.last);
			g.Path.superclass._updateWithSegment.apply(this, arguments);
			var path = this[this.renderers[segment.action]](segment, last);
			if (typeof this.vmlPath == "string") {
				this.vmlPath += path.join("");
				this.rawNode.path.v = this.vmlPath + " r0,0 e";
			} else {
				Array.prototype.push.apply(this.vmlPath, path);
			}
		}, setShape:function (newShape) {
			this.vmlPath = [];
			this.lastControl.type = "";
			g.Path.superclass.setShape.apply(this, arguments);
			this.vmlPath = this.vmlPath.join("");
			this.rawNode.path.v = this.vmlPath + " r0,0 e";
			return this;
		}, _pathVmlToSvgMap:{m:"M", l:"L", t:"m", r:"l", c:"C", v:"c", qb:"Q", x:"z", e:""}, renderers:{M:"_moveToA", m:"_moveToR", L:"_lineToA", l:"_lineToR", H:"_hLineToA", h:"_hLineToR", V:"_vLineToA", v:"_vLineToR", C:"_curveToA", c:"_curveToR", S:"_smoothCurveToA", s:"_smoothCurveToR", Q:"_qCurveToA", q:"_qCurveToR", T:"_qSmoothCurveToA", t:"_qSmoothCurveToR", A:"_arcTo", a:"_arcTo", Z:"_closePath", z:"_closePath"}, _addArgs:function (path, segment, from, upto) {
			var n = segment instanceof Array ? segment : segment.args;
			for (var i = from; i < upto; ++i) {
				path.push(" ", n[i].toFixed());
			}
		}, _adjustRelCrd:function (last, segment, step) {
			var n = segment instanceof Array ? segment : segment.args, l = n.length, result = new Array(l), i = 0, x = last.x, y = last.y;
			if (typeof x != "number") {
				result[0] = x = n[0];
				result[1] = y = n[1];
				i = 2;
			}
			if (typeof step == "number" && step != 2) {
				var j = step;
				while (j <= l) {
					for (; i < j; i += 2) {
						result[i] = x + n[i];
						result[i + 1] = y + n[i + 1];
					}
					x = result[j - 2];
					y = result[j - 1];
					j += step;
				}
			} else {
				for (; i < l; i += 2) {
					result[i] = (x += n[i]);
					result[i + 1] = (y += n[i + 1]);
				}
			}
			return result;
		}, _adjustRelPos:function (last, segment) {
			var n = segment instanceof Array ? segment : segment.args, l = n.length, result = new Array(l);
			for (var i = 0; i < l; ++i) {
				result[i] = (last += n[i]);
			}
			return result;
		}, _moveToA:function (segment) {
			var p = [" m"], n = segment instanceof Array ? segment : segment.args, l = n.length;
			this._addArgs(p, n, 0, 2);
			if (l > 2) {
				p.push(" l");
				this._addArgs(p, n, 2, l);
			}
			this.lastControl.type = "";
			return p;
		}, _moveToR:function (segment, last) {
			return this._moveToA(this._adjustRelCrd(last, segment));
		}, _lineToA:function (segment) {
			var p = [" l"], n = segment instanceof Array ? segment : segment.args;
			this._addArgs(p, n, 0, n.length);
			this.lastControl.type = "";
			return p;
		}, _lineToR:function (segment, last) {
			return this._lineToA(this._adjustRelCrd(last, segment));
		}, _hLineToA:function (segment, last) {
			var p = [" l"], y = " " + last.y.toFixed(), n = segment instanceof Array ? segment : segment.args, l = n.length;
			for (var i = 0; i < l; ++i) {
				p.push(" ", n[i].toFixed(), y);
			}
			this.lastControl.type = "";
			return p;
		}, _hLineToR:function (segment, last) {
			return this._hLineToA(this._adjustRelPos(last.x, segment), last);
		}, _vLineToA:function (segment, last) {
			var p = [" l"], x = " " + last.x.toFixed(), n = segment instanceof Array ? segment : segment.args, l = n.length;
			for (var i = 0; i < l; ++i) {
				p.push(x, " ", n[i].toFixed());
			}
			this.lastControl.type = "";
			return p;
		}, _vLineToR:function (segment, last) {
			return this._vLineToA(this._adjustRelPos(last.y, segment), last);
		}, _curveToA:function (segment) {
			var p = [], n = segment instanceof Array ? segment : segment.args, l = n.length, lc = this.lastControl;
			for (var i = 0; i < l; i += 6) {
				p.push(" c");
				this._addArgs(p, n, i, i + 6);
			}
			lc.x = n[l - 4];
			lc.y = n[l - 3];
			lc.type = "C";
			return p;
		}, _curveToR:function (segment, last) {
			return this._curveToA(this._adjustRelCrd(last, segment, 6));
		}, _smoothCurveToA:function (segment, last) {
			var p = [], n = segment instanceof Array ? segment : segment.args, l = n.length, lc = this.lastControl, i = 0;
			if (lc.type != "C") {
				p.push(" c");
				this._addArgs(p, [last.x, last.y], 0, 2);
				this._addArgs(p, n, 0, 4);
				lc.x = n[0];
				lc.y = n[1];
				lc.type = "C";
				i = 4;
			}
			for (; i < l; i += 4) {
				p.push(" c");
				this._addArgs(p, [2 * last.x - lc.x, 2 * last.y - lc.y], 0, 2);
				this._addArgs(p, n, i, i + 4);
				lc.x = n[i];
				lc.y = n[i + 1];
			}
			return p;
		}, _smoothCurveToR:function (segment, last) {
			return this._smoothCurveToA(this._adjustRelCrd(last, segment, 4), last);
		}, _qCurveToA:function (segment) {
			var p = [], n = segment instanceof Array ? segment : segment.args, l = n.length, lc = this.lastControl;
			for (var i = 0; i < l; i += 4) {
				p.push(" qb");
				this._addArgs(p, n, i, i + 4);
			}
			lc.x = n[l - 4];
			lc.y = n[l - 3];
			lc.type = "Q";
			return p;
		}, _qCurveToR:function (segment, last) {
			return this._qCurveToA(this._adjustRelCrd(last, segment, 4));
		}, _qSmoothCurveToA:function (segment, last) {
			var p = [], n = segment instanceof Array ? segment : segment.args, l = n.length, lc = this.lastControl, i = 0;
			if (lc.type != "Q") {
				p.push(" qb");
				this._addArgs(p, [lc.x = last.x, lc.y = last.y], 0, 2);
				lc.type = "Q";
				this._addArgs(p, n, 0, 2);
				i = 2;
			}
			for (; i < l; i += 2) {
				p.push(" qb");
				this._addArgs(p, [lc.x = 2 * last.x - lc.x, lc.y = 2 * last.y - lc.y], 0, 2);
				this._addArgs(p, n, i, i + 2);
			}
			return p;
		}, _qSmoothCurveToR:function (segment, last) {
			return this._qSmoothCurveToA(this._adjustRelCrd(last, segment, 2), last);
		}, _arcTo:function (segment, last) {
			var p = [], n = segment.args, l = n.length, relative = segment.action == "a";
			for (var i = 0; i < l; i += 7) {
				var x1 = n[i + 5], y1 = n[i + 6];
				if (relative) {
					x1 += last.x;
					y1 += last.y;
				}
				var result = g.arc.arcAsBezier(last, n[i], n[i + 1], n[i + 2], n[i + 3] ? 1 : 0, n[i + 4] ? 1 : 0, x1, y1);
				for (var j = 0; j < result.length; ++j) {
					p.push(" c");
					var t = result[j];
					this._addArgs(p, t, 0, t.length);
				}
				last.x = x1;
				last.y = y1;
			}
			this.lastControl.type = "";
			return p;
		}, _closePath:function () {
			this.lastControl.type = "";
			return ["x"];
		}});
		g.Path.nodeType = "shape";
		dojo.declare("dojox.gfx.TextPath", g.Path, {constructor:function (rawNode) {
			if (rawNode) {
				rawNode.setAttribute("dojoGfxType", "textpath");
			}
			this.fontStyle = null;
			if (!("text" in this)) {
				this.text = d.clone(g.defaultTextPath);
			}
			if (!("fontStyle" in this)) {
				this.fontStyle = d.clone(g.defaultFont);
			}
		}, setText:function (newText) {
			this.text = g.makeParameters(this.text, typeof newText == "string" ? {text:newText} : newText);
			this._setText();
			return this;
		}, setFont:function (newFont) {
			this.fontStyle = typeof newFont == "string" ? g.splitFontString(newFont) : g.makeParameters(g.defaultFont, newFont);
			this._setFont();
			return this;
		}, _setText:function () {
			this.bbox = null;
			var r = this.rawNode, s = this.text, p = null, t = null, c = r.childNodes;
			for (var i = 0; i < c.length; ++i) {
				var tag = c[i].tagName;
				if (tag == "path") {
					p = c[i];
					if (t) {
						break;
					}
				} else {
					if (tag == "textpath") {
						t = c[i];
						if (p) {
							break;
						}
					}
				}
			}
			if (!p) {
				p = this.rawNode.ownerDocument.createElement("v:path");
				r.appendChild(p);
			}
			if (!t) {
				t = this.rawNode.ownerDocument.createElement("v:textpath");
				r.appendChild(t);
			}
			p.textPathOk = true;
			t.on = true;
			var a = vml.text_alignment[s.align];
			t.style["v-text-align"] = a ? a : "left";
			t.style["text-decoration"] = s.decoration;
			t.style["v-rotate-letters"] = s.rotated;
			t.style["v-text-kern"] = s.kerning;
			t.string = s.text;
		}, _setFont:function () {
			var f = this.fontStyle, c = this.rawNode.childNodes;
			for (var i = 0; i < c.length; ++i) {
				if (c[i].tagName == "textpath") {
					c[i].style.font = g.makeFontString(f);
					break;
				}
			}
		}});
		g.TextPath.nodeType = "shape";
		dojo.declare("dojox.gfx.Surface", gs.Surface, {constructor:function () {
			vml.Container._init.call(this);
		}, setDimensions:function (width, height) {
			this.width = g.normalizedLength(width);
			this.height = g.normalizedLength(height);
			if (!this.rawNode) {
				return this;
			}
			var cs = this.clipNode.style, r = this.rawNode, rs = r.style, bs = this.bgNode.style, ps = this._parent.style, i;
			ps.width = width;
			ps.height = height;
			cs.width = width;
			cs.height = height;
			cs.clip = "rect(0px " + width + "px " + height + "px 0px)";
			rs.width = width;
			rs.height = height;
			r.coordsize = width + " " + height;
			bs.width = width;
			bs.height = height;
			for (i = 0; i < this.children.length; ++i) {
				this.children[i]._setDimensions(width, height);
			}
			return this;
		}, getDimensions:function () {
			var t = this.rawNode ? {width:g.normalizedLength(this.rawNode.style.width), height:g.normalizedLength(this.rawNode.style.height)} : null;
			if (t.width <= 0) {
				t.width = this.width;
			}
			if (t.height <= 0) {
				t.height = this.height;
			}
			return t;
		}});
		g.createSurface = function (parentNode, width, height) {
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
			var s = new g.Surface(), p = d.byId(parentNode), c = s.clipNode = p.ownerDocument.createElement("div"), r = s.rawNode = p.ownerDocument.createElement("v:group"), cs = c.style, rs = r.style;
			if (d.isIE > 7) {
				rs.display = "inline-block";
			}
			s._parent = p;
			s._nodes.push(c);
			p.style.width = width;
			p.style.height = height;
			cs.position = "absolute";
			cs.width = width;
			cs.height = height;
			cs.clip = "rect(0px " + width + " " + height + " 0px)";
			rs.position = "absolute";
			rs.width = width;
			rs.height = height;
			r.coordsize = (width === "100%" ? width : parseFloat(width)) + " " + (height === "100%" ? height : parseFloat(height));
			r.coordorigin = "0 0";
			var b = s.bgNode = r.ownerDocument.createElement("v:rect"), bs = b.style;
			bs.left = bs.top = 0;
			bs.width = rs.width;
			bs.height = rs.height;
			b.filled = b.stroked = "f";
			r.appendChild(b);
			c.appendChild(r);
			p.appendChild(c);
			s.width = g.normalizedLength(width);
			s.height = g.normalizedLength(height);
			return s;
		};
		vml.Container = {_init:function () {
			gs.Container._init.call(this);
		}, add:function (shape) {
			if (this != shape.getParent()) {
				this.rawNode.appendChild(shape.rawNode);
				if (!shape.getParent()) {
					shape.setFill(shape.getFill());
					shape.setStroke(shape.getStroke());
				}
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
			while (r.firstChild != r.lastChild) {
				if (r.firstChild != this.bgNode) {
					r.removeChild(r.firstChild);
				}
				if (r.lastChild != this.bgNode) {
					r.removeChild(r.lastChild);
				}
			}
			return gs.Container.clear.apply(this, arguments);
		}, _moveChildToFront:gs.Container._moveChildToFront, _moveChildToBack:gs.Container._moveChildToBack};
		dojo.mixin(gs.Creator, {createGroup:function () {
			var node = this.createObject(g.Group, null);
			var r = node.rawNode.ownerDocument.createElement("v:rect");
			r.style.left = r.style.top = 0;
			r.style.width = node.rawNode.style.width;
			r.style.height = node.rawNode.style.height;
			r.filled = r.stroked = "f";
			node.rawNode.appendChild(r);
			node.bgNode = r;
			return node;
		}, createImage:function (image) {
			if (!this.rawNode) {
				return null;
			}
			var shape = new g.Image(), doc = this.rawNode.ownerDocument, node = doc.createElement("v:rect");
			node.stroked = "f";
			node.style.width = this.rawNode.style.width;
			node.style.height = this.rawNode.style.height;
			var img = doc.createElement("v:imagedata");
			node.appendChild(img);
			shape.setRawNode(node);
			this.rawNode.appendChild(node);
			shape.setShape(image);
			this.add(shape);
			return shape;
		}, createRect:function (rect) {
			if (!this.rawNode) {
				return null;
			}
			var shape = new g.Rect, node = this.rawNode.ownerDocument.createElement("v:roundrect");
			if (d.isIE > 7) {
				node.style.display = "inline-block";
			}
			shape.setRawNode(node);
			this.rawNode.appendChild(node);
			shape.setShape(rect);
			this.add(shape);
			return shape;
		}, createObject:function (shapeType, rawShape) {
			if (!this.rawNode) {
				return null;
			}
			var shape = new shapeType(), node = this.rawNode.ownerDocument.createElement("v:" + shapeType.nodeType);
			shape.setRawNode(node);
			this.rawNode.appendChild(node);
			switch (shapeType) {
			  case g.Group:
			  case g.Line:
			  case g.Polyline:
			  case g.Image:
			  case g.Text:
			  case g.Path:
			  case g.TextPath:
				this._overrideSize(node);
			}
			shape.setShape(rawShape);
			this.add(shape);
			return shape;
		}, _overrideSize:function (node) {
			var s = this.rawNode.style, w = s.width, h = s.height;
			node.style.width = w;
			node.style.height = h;
			node.coordsize = parseInt(w) + " " + parseInt(h);
		}});
		d.extend(g.Group, vml.Container);
		d.extend(g.Group, gs.Creator);
		d.extend(g.Surface, vml.Container);
		d.extend(g.Surface, gs.Creator);
	})();
}

