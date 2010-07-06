/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.Menu"]) {
	dojo._hasResource["dijit.Menu"] = true;
	dojo.provide("dijit.Menu");
	dojo.require("dijit._Widget");
	dojo.require("dijit._KeyNavContainer");
	dojo.require("dijit._Templated");
	dojo.declare("dijit._MenuBase", [dijit._Widget, dijit._Templated, dijit._KeyNavContainer], {parentMenu:null, popupDelay:500, startup:function () {
		if (this._started) {
			return;
		}
		dojo.forEach(this.getChildren(), function (child) {
			child.startup();
		});
		this.startupKeyNavChildren();
		this.inherited(arguments);
	}, onExecute:function () {
	}, onCancel:function (closeAll) {
	}, _moveToPopup:function (evt) {
		if (this.focusedChild && this.focusedChild.popup && !this.focusedChild.disabled) {
			this.focusedChild._onClick(evt);
		} else {
			var topMenu = this._getTopMenu();
			if (topMenu && topMenu._isMenuBar) {
				topMenu.focusNext();
			}
		}
	}, _onPopupHover:function (evt) {
		if (this.currentPopup && this.currentPopup._pendingClose_timer) {
			var parentMenu = this.currentPopup.parentMenu;
			if (parentMenu.focusedChild) {
				parentMenu.focusedChild._setSelected(false);
			}
			parentMenu.focusedChild = this.currentPopup.from_item;
			parentMenu.focusedChild._setSelected(true);
			this._stopPendingCloseTimer(this.currentPopup);
		}
	}, onItemHover:function (item) {
		if (this.isActive) {
			this.focusChild(item);
			if (this.focusedChild.popup && !this.focusedChild.disabled && !this.hover_timer) {
				this.hover_timer = setTimeout(dojo.hitch(this, "_openPopup"), this.popupDelay);
			}
		}
		if (this.focusedChild) {
			this.focusChild(item);
		}
		this._hoveredChild = item;
	}, _onChildBlur:function (item) {
		this._stopPopupTimer();
		item._setSelected(false);
		var itemPopup = item.popup;
		if (itemPopup) {
			this._stopPendingCloseTimer(itemPopup);
			itemPopup._pendingClose_timer = setTimeout(function () {
				itemPopup._pendingClose_timer = null;
				if (itemPopup.parentMenu) {
					itemPopup.parentMenu.currentPopup = null;
				}
				dijit.popup.close(itemPopup);
			}, this.popupDelay);
		}
	}, onItemUnhover:function (item) {
		if (this.isActive) {
			this._stopPopupTimer();
		}
		if (this._hoveredChild == item) {
			this._hoveredChild = null;
		}
	}, _stopPopupTimer:function () {
		if (this.hover_timer) {
			clearTimeout(this.hover_timer);
			this.hover_timer = null;
		}
	}, _stopPendingCloseTimer:function (popup) {
		if (popup._pendingClose_timer) {
			clearTimeout(popup._pendingClose_timer);
			popup._pendingClose_timer = null;
		}
	}, _stopFocusTimer:function () {
		if (this._focus_timer) {
			clearTimeout(this._focus_timer);
			this._focus_timer = null;
		}
	}, _getTopMenu:function () {
		for (var top = this; top.parentMenu; top = top.parentMenu) {
		}
		return top;
	}, onItemClick:function (item, evt) {
		if (item.disabled) {
			return false;
		}
		if (typeof this.isShowingNow == "undefined") {
			this._markActive();
		}
		this.focusChild(item);
		if (item.popup) {
			this._openPopup();
		} else {
			this.onExecute();
			item.onClick(evt);
		}
	}, _openPopup:function () {
		this._stopPopupTimer();
		var from_item = this.focusedChild;
		if (!from_item) {
			return;
		}
		var popup = from_item.popup;
		if (popup.isShowingNow) {
			return;
		}
		if (this.currentPopup) {
			this._stopPendingCloseTimer(this.currentPopup);
			dijit.popup.close(this.currentPopup);
		}
		popup.parentMenu = this;
		popup.from_item = from_item;
		var self = this;
		dijit.popup.open({parent:this, popup:popup, around:from_item.domNode, orient:this._orient || (this.isLeftToRight() ? {"TR":"TL", "TL":"TR", "BR":"BL", "BL":"BR"} : {"TL":"TR", "TR":"TL", "BL":"BR", "BR":"BL"}), onCancel:function () {
			self.focusChild(from_item);
			self._cleanUp();
			from_item._setSelected(true);
			self.focusedChild = from_item;
		}, onExecute:dojo.hitch(this, "_cleanUp")});
		this.currentPopup = popup;
		popup.connect(popup.domNode, "onmouseenter", dojo.hitch(self, "_onPopupHover"));
		if (popup.focus) {
			popup._focus_timer = setTimeout(dojo.hitch(popup, function () {
				this._focus_timer = null;
				this.focus();
			}), 0);
		}
	}, _markActive:function () {
		this.isActive = true;
		dojo.addClass(this.domNode, "dijitMenuActive");
		dojo.removeClass(this.domNode, "dijitMenuPassive");
	}, onOpen:function (e) {
		this.isShowingNow = true;
		this._markActive();
	}, _markInactive:function () {
		this.isActive = false;
		dojo.removeClass(this.domNode, "dijitMenuActive");
		dojo.addClass(this.domNode, "dijitMenuPassive");
	}, onClose:function () {
		this._stopFocusTimer();
		this._markInactive();
		this.isShowingNow = false;
		this.parentMenu = null;
	}, _closeChild:function () {
		this._stopPopupTimer();
		if (this.focusedChild) {
			this.focusedChild._setSelected(false);
			this.focusedChild._onUnhover();
			this.focusedChild = null;
		}
		if (this.currentPopup) {
			dijit.popup.close(this.currentPopup);
			this.currentPopup = null;
		}
	}, _onItemFocus:function (item) {
		if (this._hoveredChild && this._hoveredChild != item) {
			this._hoveredChild._onUnhover();
		}
	}, _onBlur:function () {
		this._cleanUp();
		this.inherited(arguments);
	}, _cleanUp:function () {
		this._closeChild();
		if (typeof this.isShowingNow == "undefined") {
			this._markInactive();
		}
	}});
	dojo.declare("dijit.Menu", dijit._MenuBase, {constructor:function () {
		this._bindings = [];
	}, templateString:dojo.cache("dijit", "templates/Menu.html", "<table class=\"dijit dijitMenu dijitMenuPassive dijitReset dijitMenuTable\" waiRole=\"menu\" tabIndex=\"${tabIndex}\" dojoAttachEvent=\"onkeypress:_onKeyPress\">\n\t<tbody class=\"dijitReset\" dojoAttachPoint=\"containerNode\"></tbody>\n</table>\n"), targetNodeIds:[], contextMenuForWindow:false, leftClickToOpen:false, refocus:true, _contextMenuWithMouse:false, postCreate:function () {
		if (this.contextMenuForWindow) {
			this.bindDomNode(dojo.body());
		} else {
			dojo.forEach(this.targetNodeIds, this.bindDomNode, this);
		}
		var k = dojo.keys, l = this.isLeftToRight();
		this._openSubMenuKey = l ? k.RIGHT_ARROW : k.LEFT_ARROW;
		this._closeSubMenuKey = l ? k.LEFT_ARROW : k.RIGHT_ARROW;
		this.connectKeyNavHandlers([k.UP_ARROW], [k.DOWN_ARROW]);
	}, _onKeyPress:function (evt) {
		if (evt.ctrlKey || evt.altKey) {
			return;
		}
		switch (evt.charOrCode) {
		  case this._openSubMenuKey:
			this._moveToPopup(evt);
			dojo.stopEvent(evt);
			break;
		  case this._closeSubMenuKey:
			if (this.parentMenu) {
				if (this.parentMenu._isMenuBar) {
					this.parentMenu.focusPrev();
				} else {
					this.onCancel(false);
				}
			} else {
				dojo.stopEvent(evt);
			}
			break;
		}
	}, _iframeContentWindow:function (iframe_el) {
		var win = dijit.getDocumentWindow(this._iframeContentDocument(iframe_el)) || this._iframeContentDocument(iframe_el)["__parent__"] || (iframe_el.name && dojo.doc.frames[iframe_el.name]) || null;
		return win;
	}, _iframeContentDocument:function (iframe_el) {
		var doc = iframe_el.contentDocument || (iframe_el.contentWindow && iframe_el.contentWindow.document) || (iframe_el.name && dojo.doc.frames[iframe_el.name] && dojo.doc.frames[iframe_el.name].document) || null;
		return doc;
	}, bindDomNode:function (node) {
		node = dojo.byId(node);
		var cn;
		if (node.tagName.toLowerCase() == "iframe") {
			var iframe = node, win = this._iframeContentWindow(iframe);
			cn = dojo.withGlobal(win, dojo.body);
		} else {
			cn = (node == dojo.body() ? dojo.doc.documentElement : node);
		}
		var binding = {node:node, iframe:iframe};
		dojo.attr(node, "_dijitMenu" + this.id, this._bindings.push(binding));
		var doConnects = dojo.hitch(this, function (cn) {
			return [dojo.connect(cn, (this.leftClickToOpen) ? "onclick" : "oncontextmenu", this, function (evt) {
				this._openMyself(evt, cn, iframe);
			}), dojo.connect(cn, "onkeydown", this, "_contextKey"), dojo.connect(cn, "onmousedown", this, "_contextMouse")];
		});
		binding.connects = cn ? doConnects(cn) : [];
		if (iframe) {
			binding.onloadHandler = dojo.hitch(this, function () {
				var win = this._iframeContentWindow(iframe);
				cn = dojo.withGlobal(win, dojo.body);
				binding.connects = doConnects(cn);
			});
			if (iframe.addEventListener) {
				iframe.addEventListener("load", binding.onloadHandler, false);
			} else {
				iframe.attachEvent("onload", binding.onloadHandler);
			}
		}
	}, unBindDomNode:function (nodeName) {
		var node;
		try {
			node = dojo.byId(nodeName);
		}
		catch (e) {
			return;
		}
		var attrName = "_dijitMenu" + this.id;
		if (node && dojo.hasAttr(node, attrName)) {
			var bid = dojo.attr(node, attrName) - 1, b = this._bindings[bid];
			dojo.forEach(b.connects, dojo.disconnect);
			var iframe = b.iframe;
			if (iframe) {
				if (iframe.removeEventListener) {
					iframe.removeEventListener("load", b.onloadHandler, false);
				} else {
					iframe.detachEvent("onload", b.onloadHandler);
				}
			}
			dojo.removeAttr(node, attrName);
			delete this._bindings[bid];
		}
	}, _contextKey:function (e) {
		this._contextMenuWithMouse = false;
		if (e.keyCode == dojo.keys.F10) {
			dojo.stopEvent(e);
			if (e.shiftKey && e.type == "keydown") {
				var _e = {target:e.target, pageX:e.pageX, pageY:e.pageY};
				_e.preventDefault = _e.stopPropagation = function () {
				};
				window.setTimeout(dojo.hitch(this, function () {
					this._openMyself(_e);
				}), 1);
			}
		}
	}, _contextMouse:function (e) {
		this._contextMenuWithMouse = true;
	}, _openMyself:function (e, node, iframe) {
		if (this.leftClickToOpen && e.button > 0) {
			return;
		}
		dojo.stopEvent(e);
		var x, y;
		if (dojo.isSafari || this._contextMenuWithMouse) {
			x = e.pageX;
			y = e.pageY;
			if (iframe) {
				var od = e.target.ownerDocument, ifc = dojo.position(iframe, true), win = this._iframeContentWindow(iframe), scroll = dojo.withGlobal(win, "_docScroll", dojo);
				var cs = dojo.getComputedStyle(iframe), tp = dojo._toPixelValue, left = (dojo.isIE && dojo.isQuirks ? 0 : tp(iframe, cs.paddingLeft)) + (dojo.isIE && dojo.isQuirks ? tp(iframe, cs.borderLeftWidth) : 0), top = (dojo.isIE && dojo.isQuirks ? 0 : tp(iframe, cs.paddingTop)) + (dojo.isIE && dojo.isQuirks ? tp(iframe, cs.borderTopWidth) : 0);
				x += ifc.x + left - scroll.x;
				y += ifc.y + top - scroll.y;
			}
		} else {
			var coords = dojo.position(e.target, true);
			x = coords.x + 10;
			y = coords.y + 10;
		}
		var self = this;
		var savedFocus = dijit.getFocus(this);
		function closeAndRestoreFocus() {
			if (self.refocus) {
				dijit.focus(savedFocus);
			}
			dijit.popup.close(self);
		}
		dijit.popup.open({popup:this, x:x, y:y, onExecute:closeAndRestoreFocus, onCancel:closeAndRestoreFocus, orient:this.isLeftToRight() ? "L" : "R"});
		this.focus();
		this._onBlur = function () {
			this.inherited("_onBlur", arguments);
			dijit.popup.close(this);
		};
	}, uninitialize:function () {
		dojo.forEach(this._bindings, function (b) {
			if (b) {
				this.unBindDomNode(b.node);
			}
		}, this);
		this.inherited(arguments);
	}});
	dojo.require("dijit.MenuItem");
	dojo.require("dijit.PopupMenuItem");
	dojo.require("dijit.CheckedMenuItem");
	dojo.require("dijit.MenuSeparator");
}

