/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._editor.plugins.FullScreen"]) {
	dojo._hasResource["dijit._editor.plugins.FullScreen"] = true;
	dojo.provide("dijit._editor.plugins.FullScreen");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dijit.form.Button");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dijit._editor", "commands", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,ko,nb,nl,pl,pt,pt-pt,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dijit._editor.plugins.FullScreen", dijit._editor._Plugin, {zIndex:500, _origState:null, _origiFrameState:null, _resizeHandle:null, isFullscreen:false, toggle:function () {
		this.button.attr("checked", !this.button.attr("checked"));
	}, _initButton:function () {
		var strings = dojo.i18n.getLocalization("dijit._editor", "commands");
		this.button = new dijit.form.ToggleButton({label:strings["fullScreen"], showLabel:false, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "FullScreen", tabIndex:"-1", onChange:dojo.hitch(this, "_setFullScreen")});
	}, setEditor:function (editor) {
		this.editor = editor;
		this._initButton();
		this.editor.addKeyHandler(dojo.keys.F11, true, true, dojo.hitch(this, function (e) {
			this.toggle();
			dojo.stopEvent(e);
			setTimeout(dojo.hitch(this, function () {
				this.editor.focus();
			}), 250);
			return true;
		}));
		this.connect(this.editor.domNode, "onkeydown", "_containFocus");
	}, _containFocus:function (e) {
		if (this.isFullscreen) {
			var ed = this.editor;
			if (!ed.isTabIndent && ed._fullscreen_oldOnKeyDown && e.keyCode === dojo.keys.TAB) {
				var f = dijit.getFocus();
				var avn = this._getAltViewNode();
				if (f.node == ed.iframe || (avn && f.node === avn)) {
					setTimeout(dojo.hitch(this, function () {
						ed.toolbar.focus();
					}), 10);
				} else {
					if (avn && dojo.style(ed.iframe, "display") === "none") {
						setTimeout(dojo.hitch(this, function () {
							dijit.focus(avn);
						}), 10);
					} else {
						setTimeout(dojo.hitch(this, function () {
							ed.focus();
						}), 10);
					}
				}
				dojo.stopEvent(e);
			} else {
				if (ed._fullscreen_oldOnKeyDown) {
					ed._fullscreen_oldOnKeyDown(e);
				}
			}
		}
	}, _resizeEditor:function () {
		var vp = dijit.getViewport();
		dojo.marginBox(this.editor.domNode, {w:vp.w, h:vp.h});
		var tBox = dojo.marginBox(this.editor.toolbar.domNode);
		var extents = dojo._getPadBorderExtents(this.editor.domNode);
		var cHeight = vp.h - (tBox.h + extents.h);
		dojo.marginBox(this.editor.iframe.parentNode, {h:cHeight});
		dojo.marginBox(this.editor.iframe, {h:cHeight});
	}, _getAltViewNode:function () {
	}, _setFullScreen:function (full) {
		var vp = dijit.getViewport();
		var ed = this.editor;
		var body = dojo.body();
		var editorParent = ed.domNode.parentNode;
		this.isFullscreen = full;
		if (full) {
			while (editorParent && editorParent !== dojo.body()) {
				dojo.addClass(editorParent, "dijitForceStatic");
				editorParent = editorParent.parentNode;
			}
			this._editorResizeHolder = this.editor.resize;
			ed.resize = function () {
			};
			ed._fullscreen_oldOnKeyDown = ed.onKeyDown;
			ed.onKeyDown = dojo.hitch(this, this._containFocus);
			this._origState = {};
			this._origiFrameState = {};
			var domNode = ed.domNode, domStyle = domNode && domNode.style || {};
			this._origState = {width:domStyle.width || "", height:domStyle.height || "", top:dojo.style(domNode, "top") || "", left:dojo.style(domNode, "left") || "", position:dojo.style(domNode, "position") || "static"};
			var iframe = ed.iframe, iframeStyle = iframe && iframe.style || {};
			var bc = dojo.style(ed.iframe, "backgroundColor");
			this._origiFrameState = {backgroundColor:bc || "transparent", width:iframeStyle.width || "auto", height:iframeStyle.height || "auto", zIndex:iframeStyle.zIndex || ""};
			dojo.style(ed.domNode, {position:"absolute", top:"0px", left:"0px", zIndex:this.zIndex, width:vp.w + "px", height:vp.h + "px"});
			dojo.style(ed.iframe, {height:"100%", width:"100%", zIndex:this.zIndex, backgroundColor:bc !== "transparent" && bc !== "rgba(0, 0, 0, 0)" ? bc : "white"});
			dojo.style(ed.iframe.parentNode, {height:"95%", width:"100%"});
			if (body.style && body.style.overflow) {
				this._oldOverflow = dojo.style(body, "overflow");
			} else {
				this._oldOverflow = "";
			}
			if (dojo.isIE && !dojo.isQuirks) {
				if (body.parentNode && body.parentNode.style && body.parentNode.style.overflow) {
					this._oldBodyParentOverflow = body.parentNode.style.overflow;
				} else {
					this._oldBodyParentOverflow = "scroll";
				}
				dojo.style(body.parentNode, "overflow", "hidden");
			}
			dojo.style(body, "overflow", "hidden");
			var resizer = function () {
				var vp = dijit.getViewport();
				if ("_prevW" in this && "_prevH" in this) {
					if (vp.w === this._prevW && vp.h === this._prevH) {
						return;
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
					this._resizeEditor();
				}), 10);
			};
			this._resizeHandle = dojo.connect(window, "onresize", this, resizer);
			this._resizeEditor();
			var dn = this.editor.toolbar.domNode;
			setTimeout(function () {
				dijit.scrollIntoView(dn);
			}, 250);
		} else {
			if (this._editorResizeHolder) {
				this.editor.resize = this._editorResizeHolder;
			}
			if (!this._origState && !this._origiFrameState) {
				return;
			}
			if (ed._fullscreen_oldOnKeyDown) {
				ed.onKeyDown = ed._fullscreen_oldOnKeyDown;
				delete ed._fullscreen_oldOnKeyDown;
			}
			if (this._resizeHandle) {
				dojo.disconnect(this._resizeHandle);
				this._resizeHandle = null;
			}
			if (this._rst) {
				clearTimeout(this._rst);
				this._rst = null;
			}
			while (editorParent && editorParent !== dojo.body()) {
				dojo.removeClass(editorParent, "dijitForceStatic");
				editorParent = editorParent.parentNode;
			}
			var self = this;
			setTimeout(function () {
				if (dojo.isIE && !dojo.isQuirks) {
					body.parentNode.style.overflow = self._oldBodyParentOverflow;
					delete self._oldBodyParentOverflow;
				}
				dojo.style(body, "overflow", self._oldOverflow);
				delete self._oldOverflow;
				dojo.style(ed.domNode, self._origState);
				dojo.style(ed.iframe.parentNode, {height:"", width:""});
				dojo.style(ed.iframe, self._origiFrameState);
				delete self._origState;
				delete self._origiFrameState;
				ed.resize();
				var pWidget = dijit.getEnclosingWidget(ed.domNode.parentNode);
				if (pWidget && pWidget.resize) {
					pWidget.resize();
				}
				dijit.scrollIntoView(self.editor.toolbar.domNode);
			}, 100);
		}
	}, destroy:function () {
		if (this._resizeHandle) {
			dojo.disconnect(this._resizeHandle);
			this._resizeHandle = null;
		}
		if (this._resizer) {
			clearTimeout(this._resizer);
			this._resizer = null;
		}
		this.inherited(arguments);
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		var name = o.args.name.toLowerCase();
		if (name === "fullscreen") {
			o.plugin = new dijit._editor.plugins.FullScreen({zIndex:("zIndex" in o.args) ? o.args.zIndex : 500});
		}
	});
}

