/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._HasDropDown"]) {
	dojo._hasResource["dijit._HasDropDown"] = true;
	dojo.provide("dijit._HasDropDown");
	dojo.require("dijit._base.place");
	dojo.require("dijit._Widget");
	dojo.declare("dijit._HasDropDown", null, {_buttonNode:null, _arrowWrapperNode:null, _popupStateNode:null, _aroundNode:null, dropDown:null, autoWidth:true, forceWidth:false, maxHeight:0, dropDownPosition:["below", "above"], _stopClickEvents:true, _onDropDownMouse:function (e) {
		if (e.type == "click" && !this._seenKeydown) {
			return;
		}
		this._seenKeydown = false;
		if (e.type == "mousedown") {
			this._docHandler = this.connect(dojo.doc, "onmouseup", "_onDropDownMouseup");
		}
		if (this.disabled || this.readOnly) {
			return;
		}
		if (this._stopClickEvents) {
			dojo.stopEvent(e);
		}
		this.toggleDropDown();
		if (e.type == "click" || e.type == "keypress") {
			this._onDropDownMouseup();
		}
	}, _onDropDownMouseup:function (e) {
		if (e && this._docHandler) {
			this.disconnect(this._docHandler);
		}
		var dropDown = this.dropDown, overMenu = false;
		if (e && this._opened) {
			var c = dojo.position(this._buttonNode, true);
			if (!(e.pageX >= c.x && e.pageX <= c.x + c.w) || !(e.pageY >= c.y && e.pageY <= c.y + c.h)) {
				var t = e.target;
				while (t && !overMenu) {
					if (dojo.hasClass(t, "dijitPopup")) {
						overMenu = true;
					} else {
						t = t.parentNode;
					}
				}
				if (overMenu) {
					t = e.target;
					if (dropDown.onItemClick) {
						var menuItem;
						while (t && !(menuItem = dijit.byNode(t))) {
							t = t.parentNode;
						}
						if (menuItem && menuItem.onClick && menuItem.getParent) {
							menuItem.getParent().onItemClick(menuItem, e);
						}
					}
					return;
				}
			}
		}
		if (this._opened && dropDown.focus) {
			window.setTimeout(dojo.hitch(dropDown, "focus"), 1);
		}
	}, _setupDropdown:function () {
		this._buttonNode = this._buttonNode || this.focusNode || this.domNode;
		this._popupStateNode = this._popupStateNode || this.focusNode || this._buttonNode;
		this._aroundNode = this._aroundNode || this.domNode;
		this.connect(this._buttonNode, "onmousedown", "_onDropDownMouse");
		this.connect(this._buttonNode, "onclick", "_onDropDownMouse");
		this.connect(this._buttonNode, "onkeydown", "_onDropDownKeydown");
		this.connect(this._buttonNode, "onblur", "_onDropDownBlur");
		this.connect(this._buttonNode, "onkeypress", "_onKey");
		if (this._setStateClass) {
			this.connect(this, "openDropDown", "_setStateClass");
			this.connect(this, "closeDropDown", "_setStateClass");
		}
		var defaultPos = {"after":this.isLeftToRight() ? "Right" : "Left", "before":this.isLeftToRight() ? "Left" : "Right", "above":"Up", "below":"Down", "left":"Left", "right":"Right"}[this.dropDownPosition[0]] || this.dropDownPosition[0] || "Down";
		dojo.addClass(this._arrowWrapperNode || this._buttonNode, "dijit" + defaultPos + "ArrowButton");
	}, postCreate:function () {
		this._setupDropdown();
		this.inherited(arguments);
	}, destroyDescendants:function () {
		if (this.dropDown) {
			if (!this.dropDown._destroyed) {
				this.dropDown.destroyRecursive();
			}
			delete this.dropDown;
		}
		this.inherited(arguments);
	}, _onDropDownKeydown:function (e) {
		this._seenKeydown = true;
	}, _onKeyPress:function (e) {
		if (this._opened && e.charOrCode == dojo.keys.ESCAPE && !e.shiftKey && !e.ctrlKey && !e.altKey) {
			this.toggleDropDown();
			dojo.stopEvent(e);
			return;
		}
		this.inherited(arguments);
	}, _onDropDownBlur:function (e) {
		this._seenKeydown = false;
	}, _onKey:function (e) {
		if (this.disabled || this.readOnly) {
			return;
		}
		var d = this.dropDown;
		if (d && this._opened && d.handleKey) {
			if (d.handleKey(e) === false) {
				return;
			}
		}
		if (d && this._opened && e.keyCode == dojo.keys.ESCAPE) {
			this.toggleDropDown();
			return;
		}
		if (e.keyCode == dojo.keys.DOWN_ARROW || e.keyCode == dojo.keys.ENTER || e.charOrCode == " ") {
			this._onDropDownMouse(e);
		}
	}, _onBlur:function () {
		this.closeDropDown();
		this.inherited(arguments);
	}, isLoaded:function () {
		return true;
	}, loadDropDown:function (loadCallback) {
		loadCallback();
	}, toggleDropDown:function () {
		if (this.disabled || this.readOnly) {
			return;
		}
		this.focus();
		var dropDown = this.dropDown;
		if (!dropDown) {
			return;
		}
		if (!this._opened) {
			if (!this.isLoaded()) {
				this.loadDropDown(dojo.hitch(this, "openDropDown"));
				return;
			} else {
				this.openDropDown();
			}
		} else {
			this.closeDropDown();
		}
	}, openDropDown:function () {
		var dropDown = this.dropDown;
		var ddNode = dropDown.domNode;
		var self = this;
		if (!this._preparedNode) {
			dijit.popup.moveOffScreen(ddNode);
			this._preparedNode = true;
			if (ddNode.style.width) {
				this._explicitDDWidth = true;
			}
			if (ddNode.style.height) {
				this._explicitDDHeight = true;
			}
		}
		if (this.maxHeight || this.forceWidth || this.autoWidth) {
			var myStyle = {display:"", visibility:"hidden"};
			if (!this._explicitDDWidth) {
				myStyle.width = "";
			}
			if (!this._explicitDDHeight) {
				myStyle.height = "";
			}
			dojo.style(ddNode, myStyle);
			var mb = dojo.marginBox(ddNode);
			var overHeight = (this.maxHeight && mb.h > this.maxHeight);
			dojo.style(ddNode, {overflow:overHeight ? "auto" : "hidden"});
			if (this.forceWidth) {
				mb.w = this.domNode.offsetWidth;
			} else {
				if (this.autoWidth) {
					mb.w = Math.max(mb.w, this.domNode.offsetWidth);
				} else {
					delete mb.w;
				}
			}
			if (overHeight) {
				mb.h = this.maxHeight;
				if ("w" in mb) {
					mb.w += 16;
				}
			} else {
				delete mb.h;
			}
			delete mb.t;
			delete mb.l;
			if (dojo.isFunction(dropDown.resize)) {
				dropDown.resize(mb);
			} else {
				dojo.marginBox(ddNode, mb);
			}
		}
		var retVal = dijit.popup.open({parent:this, popup:dropDown, around:this._aroundNode, orient:dijit.getPopupAroundAlignment((this.dropDownPosition && this.dropDownPosition.length) ? this.dropDownPosition : ["below"], this.isLeftToRight()), onExecute:function () {
			self.closeDropDown(true);
		}, onCancel:function () {
			self.closeDropDown(true);
		}, onClose:function () {
			dojo.attr(self._popupStateNode, "popupActive", false);
			dojo.removeClass(self._popupStateNode, "dijitHasDropDownOpen");
			self._opened = false;
			self.state = "";
		}});
		dojo.attr(this._popupStateNode, "popupActive", "true");
		dojo.addClass(self._popupStateNode, "dijitHasDropDownOpen");
		this._opened = true;
		this.state = "Opened";
		return retVal;
	}, closeDropDown:function (focus) {
		if (this._opened) {
			dijit.popup.close(this.dropDown);
			if (focus) {
				this.focus();
			}
			this._opened = false;
			this.state = "";
		}
	}});
}

