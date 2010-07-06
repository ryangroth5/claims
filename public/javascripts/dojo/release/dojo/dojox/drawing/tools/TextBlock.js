/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.drawing.tools.TextBlock"]) {
	dojo._hasResource["dojox.drawing.tools.TextBlock"] = true;
	dojo.provide("dojox.drawing.tools.TextBlock");
	dojo.require("dojox.drawing.stencil.Text");
	(function () {
		var conEdit;
		dojo.addOnLoad(function () {
			conEdit = dojo.byId("conEdit");
			if (!conEdit) {
				console.error("A contenteditable div is missing from the main document. See 'dojox.drawing.tools.TextBlock'");
			} else {
				conEdit.parentNode.removeChild(conEdit);
			}
		});
		dojox.drawing.tools.TextBlock = dojox.drawing.util.oo.declare(dojox.drawing.stencil.Text, function (options) {
			if (options.data) {
				var d = options.data;
				var w = !d.width ? this.style.text.minWidth : d.width == "auto" ? "auto" : Math.max(d.width, this.style.text.minWidth);
				var h = this._lineHeight;
				if (d.text && w == "auto") {
					var o = this.measureText(this.cleanText(d.text, false), w);
					w = o.w;
					h = o.h;
				} else {
					this._text = "";
				}
				this.points = [{x:d.x, y:d.y}, {x:d.x + w, y:d.y}, {x:d.x + w, y:d.y + h}, {x:d.x, y:d.y + h}];
				if (d.showEmpty || d.text) {
					this.editMode = true;
					dojo.disconnect(this._postRenderCon);
					this._postRenderCon = null;
					this.connect(this, "render", this, "onRender", true);
					if (d.showEmpty) {
						this._text = d.text || "";
						this.edit();
					} else {
						if (d.text && d.editMode) {
							this._text = "";
							this.edit();
						} else {
							if (d.text) {
								this.render(d.text);
							}
						}
					}
					setTimeout(dojo.hitch(this, function () {
						this.editMode = false;
					}), 100);
				}
			} else {
				this.connectMouse();
				this._postRenderCon = dojo.connect(this, "render", this, "_onPostRender");
			}
		}, {draws:true, baseRender:false, type:"dojox.drawing.tools.TextBlock", selectOnExec:true, showEmpty:false, onDrag:function (obj) {
			if (!this.parentNode) {
				this.showParent(obj);
			}
			var s = this._startdrag, e = obj.page;
			this._box.left = (s.x < e.x ? s.x : e.x);
			this._box.top = s.y;
			this._box.width = (s.x < e.x ? e.x - s.x : s.x - e.x) + this.style.text.pad;
			dojo.style(this.parentNode, this._box.toPx());
		}, onUp:function (obj) {
			if (!this._downOnCanvas) {
				return;
			}
			this._downOnCanvas = false;
			var c = dojo.connect(this, "render", this, function () {
				dojo.disconnect(c);
				this.onRender(this);
			});
			this.editMode = true;
			this.showParent(obj);
			this.created = true;
			this.createTextField();
			this.connectTextField();
		}, showParent:function (obj) {
			if (this.parentNode) {
				return;
			}
			var x = obj.pageX || 10;
			var y = obj.pageY || 10;
			this.parentNode = dojo.doc.createElement("div");
			this.parentNode.id = this.id;
			var d = this.style.textMode.create;
			this._box = {left:x, top:y, width:obj.width || 1, height:obj.height && obj.height > 8 ? obj.height : this._lineHeight, border:d.width + "px " + d.style + " " + d.color, position:"absolute", zIndex:500, toPx:function () {
				var o = {};
				for (var nm in this) {
					o[nm] = typeof (this[nm]) == "number" && nm != "zIndex" ? this[nm] + "px" : this[nm];
				}
				return o;
			}};
			dojo.style(this.parentNode, this._box);
			document.body.appendChild(this.parentNode);
		}, createTextField:function (txt) {
			var d = this.style.textMode.edit;
			this._box.border = d.width + "px " + d.style + " " + d.color;
			this._box.height = "auto";
			this._box.width = Math.max(this._box.width, this.style.text.minWidth * this.mouse.zoom);
			dojo.style(this.parentNode, this._box.toPx());
			this.parentNode.appendChild(conEdit);
			dojo.style(conEdit, {height:txt ? "auto" : this._lineHeight + "px", fontSize:(this.textSize / this.mouse.zoom) + "px", fontFamily:this.style.text.family});
			conEdit.innerHTML = txt || "";
			return conEdit;
		}, connectTextField:function () {
			if (this._textConnected) {
				return;
			}
			this._textConnected = true;
			this.mouse.setEventMode("TEXT");
			this.keys.editMode(true);
			var kc1, kc2, kc3, kc4, self = this, _autoSet = false, exec = function () {
				dojo.forEach([kc1, kc2, kc3, kc4], function (c) {
					dojo.disconnect(c);
				});
				self._textConnected = false;
				self.keys.editMode(false);
				self.mouse.setEventMode();
				self.execText();
			};
			kc1 = dojo.connect(conEdit, "keyup", this, function (evt) {
				if (dojo.trim(conEdit.innerHTML) && !_autoSet) {
					dojo.style(conEdit, "height", "auto");
					_autoSet = true;
				} else {
					if (dojo.trim(conEdit.innerHTML).length < 2 && _autoSet) {
						dojo.style(conEdit, "height", this._lineHeight + "px");
						_autoSet = false;
					}
				}
				if (evt.keyCode == 13 || evt.keyCode == 27) {
					dojo.stopEvent(evt);
					exec();
				}
			});
			kc2 = dojo.connect(conEdit, "keydown", this, function (evt) {
				if (evt.keyCode == 13 || evt.keyCode == 27) {
					dojo.stopEvent(evt);
				}
			});
			kc3 = dojo.connect(document, "mouseup", this, function (evt) {
				if (!this._onAnchor && evt.target.id != "conEdit") {
					dojo.stopEvent(evt);
					exec();
				} else {
					conEdit.blur();
					setTimeout(function () {
						conEdit.focus();
					}, 200);
				}
			});
			this.createAnchors();
			kc4 = dojo.connect(this.mouse, "setZoom", this, function (evt) {
				exec();
			});
			conEdit.focus();
			this.onDown = function () {
			};
			this.onDrag = function () {
			};
			var self = this;
			setTimeout(dojo.hitch(this, function () {
				conEdit.focus();
				this.onUp = function () {
					if (!self._onAnchor && this.parentNode) {
						self.disconnectMouse();
						exec();
						self.onUp = function () {
						};
					}
				};
			}), 500);
		}, execText:function () {
			var d = dojo.marginBox(this.parentNode);
			var w = Math.max(d.w, this.style.text.minWidth);
			var txt = this.cleanText(conEdit.innerHTML, true);
			conEdit.innerHTML = "";
			conEdit.blur();
			this.destroyAnchors();
			var o = this.measureText(txt, w);
			var sc = this.mouse.scrollOffset();
			var org = this.mouse.origin;
			var x = this._box.left + sc.left - org.x;
			var y = this._box.top + sc.top - org.y;
			x *= this.mouse.zoom;
			y *= this.mouse.zoom;
			w *= this.mouse.zoom;
			o.h *= this.mouse.zoom;
			this.points = [{x:x, y:y}, {x:x + w, y:y}, {x:x + w, y:y + o.h}, {x:x, y:y + o.h}];
			this.editMode = false;
			console.log("EXEC TEXT::::", this._postRenderCon);
			if (!o.text) {
				this._text = "";
				this._textArray = [];
			}
			this.render(o.text);
			this.onChangeText(txt);
		}, edit:function () {
			this.editMode = true;
			console.log("EDIT TEXT:", this._text, " ", this._text.replace("/n", " "));
			if (this.parentNode || !this.points) {
				return;
			}
			var d = this.pointsToData();
			var sc = this.mouse.scrollOffset();
			var org = this.mouse.origin;
			var obj = {pageX:(d.x) / this.mouse.zoom - sc.left + org.x, pageY:(d.y) / this.mouse.zoom - sc.top + org.y, width:d.width / this.mouse.zoom, height:d.height / this.mouse.zoom};
			this.remove(this.shape, this.hit);
			this.showParent(obj);
			this.createTextField(this._text.replace("/n", " "));
			this.connectTextField();
			if (this._text) {
				this.setSelection(conEdit, "end");
			}
		}, cleanText:function (txt, removeBreaks) {
			var replaceHtmlCodes = function (str) {
				var chars = {"&lt;":"<", "&gt;":">", "&amp;":"&"};
				for (var nm in chars) {
					str = str.replace(new RegExp(nm, "gi"), chars[nm]);
				}
				return str;
			};
			if (removeBreaks) {
				dojo.forEach(["<br>", "<br/>", "<br />", "\\n", "\\r"], function (br) {
					txt = txt.replace(new RegExp(br, "gi"), " ");
				});
			}
			txt = txt.replace(/&nbsp;/g, " ");
			txt = replaceHtmlCodes(txt);
			txt = dojo.trim(txt);
			txt = txt.replace(/\s{2,}/g, " ");
			return txt;
		}, measureText:function (str, width) {
			var r = "(<br\\s*/*>)|(\\n)|(\\r)";
			this.showParent({width:width || "auto", height:"auto"});
			this.createTextField(str);
			var txt = "";
			var el = conEdit;
			el.innerHTML = "X";
			var h = dojo.marginBox(el).h;
			el.innerHTML = str;
			if (!width || new RegExp(r, "gi").test(str)) {
				txt = str.replace(new RegExp(r, "gi"), "\n");
				el.innerHTML = str.replace(new RegExp(r, "gi"), "<br/>");
			} else {
				if (dojo.marginBox(el).h == h) {
					txt = str;
				} else {
					var ar = str.split(" ");
					var strAr = [[]];
					var line = 0;
					el.innerHTML = "";
					while (ar.length) {
						var word = ar.shift();
						el.innerHTML += word + " ";
						if (dojo.marginBox(el).h > h) {
							line++;
							strAr[line] = [];
							el.innerHTML = word + " ";
						}
						strAr[line].push(word);
					}
					dojo.forEach(strAr, function (ar, i) {
						strAr[i] = ar.join(" ");
					});
					txt = strAr.join("\n");
					el.innerHTML = txt.replace("\n", "<br/>");
				}
			}
			var dim = dojo.marginBox(el);
			conEdit.parentNode.removeChild(conEdit);
			dojo.destroy(this.parentNode);
			this.parentNode = null;
			return {h:dim.h, w:dim.w, text:txt};
		}, _downOnCanvas:false, onDown:function (obj) {
			this._startdrag = {x:obj.pageX, y:obj.pageY};
			dojo.disconnect(this._postRenderCon);
			this._postRenderCon = null;
			this._downOnCanvas = true;
		}, createAnchors:function () {
			this._anchors = {};
			var self = this;
			var d = this.style.anchors, b = d.width, w = d.size - b * 2, h = d.size - b * 2, p = (d.size) / 2 * -1 + "px";
			var s = {position:"absolute", width:w + "px", height:h + "px", backgroundColor:d.fill, border:b + "px " + d.style + " " + d.color};
			if (dojo.isIE) {
				s.paddingLeft = w + "px";
				s.fontSize = w + "px";
			}
			var ss = [{top:p, left:p}, {top:p, right:p}, {bottom:p, right:p}, {bottom:p, left:p}];
			for (var i = 0; i < 4; i++) {
				var isLeft = (i == 0) || (i == 3);
				var id = this.util.uid(isLeft ? "left_anchor" : "right_anchor");
				var a = dojo.create("div", {id:id}, this.parentNode);
				dojo.style(a, dojo.mixin(dojo.clone(s), ss[i]));
				var md, mm, mu;
				var md = dojo.connect(a, "mousedown", this, function (evt) {
					isLeft = evt.target.id.indexOf("left") > -1;
					self._onAnchor = true;
					var orgX = evt.pageX;
					var orgW = this._box.width;
					dojo.stopEvent(evt);
					mm = dojo.connect(document, "mousemove", this, function (evt) {
						var x = evt.pageX;
						if (isLeft) {
							this._box.left = x;
							this._box.width = orgW + orgX - x;
						} else {
							this._box.width = x + orgW - orgX;
						}
						dojo.style(this.parentNode, this._box.toPx());
					});
					mu = dojo.connect(document, "mouseup", this, function (evt) {
						orgX = this._box.left;
						orgW = this._box.width;
						dojo.disconnect(mm);
						dojo.disconnect(mu);
						self._onAnchor = false;
						conEdit.focus();
						dojo.stopEvent(evt);
					});
				});
				this._anchors[id] = {a:a, cons:[md]};
			}
		}, destroyAnchors:function () {
			for (var n in this._anchors) {
				dojo.forEach(this._anchors[n].con, dojo.disconnect, dojo);
				dojo.destroy(this._anchors[n].a);
			}
		}, setSelection:function (node, what) {
			console.warn("setSelection:");
			if (dojo.doc.selection) {
				var r = dojo.body().createTextRange();
				r.moveToElementText(node);
				r.collapse(false);
				r.select();
			} else {
				var getAllChildren = function (node, children) {
					children = children || [];
					for (var i = 0; i < node.childNodes.length; i++) {
						var n = node.childNodes[i];
						if (n.nodeType == 3) {
							children.push(n);
						} else {
							if (n.tagName && n.tagName.toLowerCase() == "img") {
								children.push(n);
							}
						}
						if (n.childNodes && n.childNodes.length) {
							getAllChildren(n, children);
						}
					}
					return children;
				};
				console.log("ff node:", node);
				node.focus();
				var selection = dojo.global.getSelection();
				selection.removeAllRanges();
				console.log(1);
				var r = dojo.doc.createRange();
				r.selectNodeContents(node);
				console.log(2);
				var nodes = getAllChildren(node);
				console.log(3);
				if (what == "end") {
					console.log("len:", nodes[nodes.length - 1].textContent.length);
					r.setStart(nodes[nodes.length - 1], nodes[nodes.length - 1].textContent.length);
					r.setEnd(nodes[nodes.length - 1], nodes[nodes.length - 1].textContent.length);
				} else {
					if (what == "beg" || what == "start") {
						r.setStart(nodes[0], 0);
						r.setEnd(nodes[0], 0);
					} else {
						if (what == "all") {
							r.setStart(nodes[0], 0);
							r.setEnd(nodes[nodes.length - 1], nodes[nodes.length - 1].textContent.length);
						}
					}
				}
				selection.addRange(r);
				console.log("sel ", what, " on ", node);
			}
		}});
		dojox.drawing.tools.TextBlock.setup = {name:"dojox.drawing.tools.TextBlock", tooltip:"Text Tool", iconClass:"iconText"};
		dojox.drawing.register(dojox.drawing.tools.TextBlock.setup, "tool");
	})();
}

