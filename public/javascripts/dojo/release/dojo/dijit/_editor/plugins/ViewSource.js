/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._editor.plugins.ViewSource"]) {
	dojo._hasResource["dijit._editor.plugins.ViewSource"] = true;
	dojo.provide("dijit._editor.plugins.ViewSource");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dijit.form.Button");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dijit._editor", "commands", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,ko,nb,nl,pl,pt,pt-pt,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dijit._editor.plugins.ViewSource", dijit._editor._Plugin, {stripScripts:true, stripComments:true, stripIFrames:true, readOnly:false, _fsPlugin:null, toggle:function () {
		if (dojo.isWebKit) {
			this._vsFocused = true;
		}
		this.button.attr("checked", !this.button.attr("checked"));
	}, _initButton:function () {
		var strings = dojo.i18n.getLocalization("dijit._editor", "commands");
		this.button = new dijit.form.ToggleButton({label:strings["viewSource"], showLabel:false, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "ViewSource", tabIndex:"-1", onChange:dojo.hitch(this, "_showSource")});
		if (dojo.isIE == 7) {
			this._ieFixNode = dojo.create("div", {style:{opacity:"0", zIndex:"-1000", position:"absolute", top:"-1000px"}}, dojo.body());
		}
		this.button.attr("readOnly", false);
	}, setEditor:function (editor) {
		this.editor = editor;
		this._initButton();
		this.editor.addKeyHandler(dojo.keys.F12, true, true, dojo.hitch(this, function (e) {
			this.button.focus();
			this.toggle();
			dojo.stopEvent(e);
			setTimeout(dojo.hitch(this, function () {
				this.editor.focus();
			}), 100);
		}));
	}, _showSource:function (source) {
		var ed = this.editor;
		var edPlugins = ed._plugins;
		var html;
		this._sourceShown = source;
		var self = this;
		try {
			if (!this.sourceArea) {
				this._createSourceView();
			}
			if (source) {
				ed._sourceQueryCommandEnabled = ed.queryCommandEnabled;
				ed.queryCommandEnabled = function (cmd) {
					var lcmd = cmd.toLowerCase();
					if (lcmd === "viewsource") {
						return true;
					} else {
						return false;
					}
				};
				this.editor.onDisplayChanged();
				html = ed.attr("value");
				html = this._filter(html);
				ed.attr("value", html);
				this._pluginList = [];
				this._disabledPlugins = dojo.filter(edPlugins, function (p) {
					if (p && p.button && !p.button.attr("disabled") && !(p instanceof dijit._editor.plugins.ViewSource)) {
						p._vs_updateState = p.updateState;
						p.updateState = function () {
							return false;
						};
						p.button.attr("disabled", true);
						if (p.command) {
							switch (p.command) {
							  case "bold":
							  case "italic":
							  case "underline":
							  case "strikethrough":
							  case "superscript":
							  case "subscript":
								p.button.attr("checked", false);
								break;
							  default:
								break;
							}
						}
						return true;
					}
				});
				if (this._fsPlugin) {
					this._fsPlugin._getAltViewNode = function () {
						return self.sourceArea;
					};
				}
				this.sourceArea.value = html;
				var is = dojo.marginBox(ed.iframe.parentNode);
				dojo.marginBox(this.sourceArea, {w:is.w, h:is.h});
				dojo.style(ed.iframe, "display", "none");
				dojo.style(this.sourceArea, {display:"block"});
				var resizer = function () {
					var vp = dijit.getViewport();
					if ("_prevW" in this && "_prevH" in this) {
						if (vp.w === this._prevW && vp.h === this._prevH) {
							return;
						} else {
							this._prevW = vp.w;
							this._prevH = vp.h;
						}
					} else {
						this._prevW = vp.w;
						this._prevH = vp.h;
					}
					if (this._resizer) {
						clearTimeout(this._resizer);
						delete this._resizer;
					}
					this._resizer = setTimeout(dojo.hitch(this, function () {
						delete this._resizer;
						this._resize();
					}), 10);
				};
				this._resizeHandle = dojo.connect(window, "onresize", this, resizer);
				setTimeout(dojo.hitch(this, this._resize), 100);
				this.editor.onNormalizedDisplayChanged();
			} else {
				if (!ed._sourceQueryCommandEnabled) {
					return;
				}
				dojo.disconnect(this._resizeHandle);
				delete this._resizeHandle;
				ed.queryCommandEnabled = ed._sourceQueryCommandEnabled;
				if (!this._readOnly) {
					html = this.sourceArea.value;
					html = this._filter(html);
					ed.attr("value", html);
				}
				dojo.forEach(this._disabledPlugins, function (p) {
					p.button.attr("disabled", false);
					if (p._vs_updateState) {
						p.updateState = p._vs_updateState;
					}
				});
				this._disabledPlugins = null;
				dojo.style(this.sourceArea, "display", "none");
				dojo.style(ed.iframe, "display", "block");
				delete ed._sourceQueryCommandEnabled;
				this.editor.onDisplayChanged();
			}
		}
		catch (e) {
			console.log(e);
		}
	}, _resize:function () {
		var ed = this.editor;
		var tb = dojo.position(ed.toolbar.domNode);
		var eb = dojo.position(ed.domNode);
		var extents = dojo._getPadBorderExtents(ed.domNode);
		var edb = {w:eb.w - extents.w, h:eb.h - (tb.h + extents.h)};
		if (this._fsPlugin && this._fsPlugin.isFullscreen) {
			var vp = dijit.getViewport();
			edb.w = (vp.w - extents.w);
			edb.h = (vp.h - (tb.h + extents.h));
		}
		if (dojo.isIE) {
			edb.h -= 2;
		}
		if (this._ieFixNode) {
			var _ie7zoom = -this._ieFixNode.offsetTop / 1000;
			edb.w = Math.floor((edb.w + 0.9) / _ie7zoom);
			edb.h = Math.floor((edb.h + 0.9) / _ie7zoom);
		}
		dojo.marginBox(this.sourceArea, {w:edb.w, h:edb.h});
	}, _createSourceView:function () {
		var ed = this.editor;
		var edPlugins = ed._plugins;
		this.sourceArea = dojo.create("textarea");
		if (this.readOnly) {
			dojo.attr(this.sourceArea, "readOnly", true);
			this._readOnly = true;
		}
		dojo.style(this.sourceArea, {padding:"0px", margin:"0px", borderWidth:"0px", borderStyle:"none"});
		dojo.place(this.sourceArea, ed.iframe, "before");
		dojo.style(this.sourceArea.parentNode, {padding:"0px", margin:"0px", borderWidth:"0px", borderStyle:"none"});
		if (dojo.isIE && ed.iframe.parentNode.lastChild !== ed.iframe) {
			dojo.style(ed.iframe.parentNode.lastChild, {width:"0px", height:"0px", padding:"0px", margin:"0px", borderWidth:"0px", borderStyle:"none"});
		}
		ed._viewsource_oldFocus = ed.focus;
		var self = this;
		ed.focus = function () {
			if (self._sourceShown) {
				self.setSourceAreaCaret();
			} else {
				try {
					if (this._vsFocused) {
						delete this._vsFocused;
						dijit.focus(ed.editNode);
					} else {
						ed._viewsource_oldFocus();
					}
				}
				catch (e) {
					console.log(e);
				}
			}
		};
		var i, p;
		for (i = 0; i < edPlugins.length; i++) {
			p = edPlugins[i];
			if (p && (p.declaredClass === "dijit._editor.plugins.FullScreen" || p.declaredClass === (dijit._scopeName + "._editor.plugins.FullScreen"))) {
				this._fsPlugin = p;
				break;
			}
		}
		if (this._fsPlugin) {
			this._fsPlugin._viewsource_getAltViewNode = this._fsPlugin._getAltViewNode;
			this._fsPlugin._getAltViewNode = function () {
				return self._sourceShown ? self.sourceArea : this._viewsource_getAltViewNode();
			};
		}
		this.connect(this.sourceArea, "onkeydown", dojo.hitch(this, function (e) {
			if (this._sourceShown && e.keyCode == dojo.keys.F12 && e.ctrlKey && e.shiftKey) {
				this.button.focus();
				this.button.attr("checked", false);
				setTimeout(dojo.hitch(this, function () {
					ed.focus();
				}), 100);
				dojo.stopEvent(e);
			}
		}));
	}, _stripScripts:function (html) {
		if (html) {
			html = html.replace(/<\s*script[^>]*>((.|\s)*?)<\\?\/\s*script\s*>/ig, "");
			html = html.replace(/<\s*script\b([^<>]|\s)*>?/ig, "");
			html = html.replace(/<[^>]*=(\s|)*[("|')]javascript:[^$1][(\s|.)]*[$1][^>]*>/ig, "");
		}
		return html;
	}, _stripComments:function (html) {
		if (html) {
			html = html.replace(/<!--(.|\s){1,}?-->/g, "");
		}
		return html;
	}, _stripIFrames:function (html) {
		if (html) {
			html = html.replace(/<\s*iframe[^>]*>((.|\s)*?)<\\?\/\s*iframe\s*>/ig, "");
		}
		return html;
	}, _filter:function (html) {
		if (html) {
			if (this.stripScripts) {
				html = this._stripScripts(html);
			}
			if (this.stripComments) {
				html = this._stripComments(html);
			}
			if (this.stripIFrames) {
				html = this._stripIFrames(html);
			}
		}
		return html;
	}, setSourceAreaCaret:function () {
		var win = dojo.global;
		var elem = this.sourceArea;
		dijit.focus(elem);
		if (this._sourceShown && !this.readOnly) {
			if (dojo.isIE) {
				if (this.sourceArea.createTextRange) {
					var range = elem.createTextRange();
					range.collapse(true);
					range.moveStart("character", -99999);
					range.moveStart("character", 0);
					range.moveEnd("character", 0);
					range.select();
				}
			} else {
				if (win.getSelection) {
					if (elem.setSelectionRange) {
						elem.setSelectionRange(0, 0);
					}
				}
			}
		}
	}, destroy:function () {
		if (this._ieFixNode) {
			dojo.body().removeChild(this._ieFixNode);
		}
		if (this._resizer) {
			clearTimeout(this._resizer);
			delete this._resizer;
		}
		if (this._resizeHandle) {
			dojo.disconnect(this._resizeHandle);
			delete this._resizeHandle;
		}
		this.inherited(arguments);
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		var name = o.args.name.toLowerCase();
		if (name === "viewsource") {
			o.plugin = new dijit._editor.plugins.ViewSource({readOnly:("readOnly" in o.args) ? o.args.readOnly : false, stripComments:("stripComments" in o.args) ? o.args.stripComments : true, stripScripts:("stripScripts" in o.args) ? o.args.stripScripts : true, stripIFrames:("stripIFrames" in o.args) ? o.args.stripIFrames : true});
		}
	});
}

