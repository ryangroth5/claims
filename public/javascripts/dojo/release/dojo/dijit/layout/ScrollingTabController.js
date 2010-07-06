/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.layout.ScrollingTabController"]) {
	dojo._hasResource["dijit.layout.ScrollingTabController"] = true;
	dojo.provide("dijit.layout.ScrollingTabController");
	dojo.require("dijit.layout.TabController");
	dojo.require("dijit.Menu");
	dojo.declare("dijit.layout.ScrollingTabController", dijit.layout.TabController, {templateString:dojo.cache("dijit.layout", "templates/ScrollingTabController.html", "<div class=\"dijitTabListContainer-${tabPosition}\" style=\"visibility:hidden\">\n\t<div dojoType=\"dijit.layout._ScrollingTabControllerButton\" buttonType=\"menuBtn\" buttonClass=\"tabStripMenuButton\"\n\t\t\ttabPosition=\"${tabPosition}\" dojoAttachPoint=\"_menuBtn\" showLabel=false>&darr;</div>\n\t<div dojoType=\"dijit.layout._ScrollingTabControllerButton\" buttonType=\"leftBtn\" buttonClass=\"tabStripSlideButtonLeft\"\n\t\t\ttabPosition=\"${tabPosition}\" dojoAttachPoint=\"_leftBtn\" dojoAttachEvent=\"onClick: doSlideLeft\" showLabel=false>&larr;</div>\n\t<div dojoType=\"dijit.layout._ScrollingTabControllerButton\" buttonType=\"rightBtn\" buttonClass=\"tabStripSlideButtonRight\"\n\t\t\ttabPosition=\"${tabPosition}\" dojoAttachPoint=\"_rightBtn\" dojoAttachEvent=\"onClick: doSlideRight\" showLabel=false>&rarr;</div>\n\t<div class='dijitTabListWrapper' dojoAttachPoint='tablistWrapper'>\n\t\t<div wairole='tablist' dojoAttachEvent='onkeypress:onkeypress'\n\t\t\t\tdojoAttachPoint='containerNode' class='nowrapTabStrip'>\n\t\t</div>\n\t</div>\n</div>\n"), useMenu:true, useSlider:true, tabStripClass:"", widgetsInTemplate:true, _minScroll:5, attributeMap:dojo.delegate(dijit._Widget.prototype.attributeMap, {"class":"containerNode"}), postCreate:function () {
		this.inherited(arguments);
		var n = this.domNode;
		this.scrollNode = this.tablistWrapper;
		this._initButtons();
		if (!this.tabStripClass) {
			this.tabStripClass = "dijitTabContainer" + this.tabPosition.charAt(0).toUpperCase() + this.tabPosition.substr(1).replace(/-.*/, "") + "None";
			dojo.addClass(n, "tabStrip-disabled");
		}
		dojo.addClass(this.tablistWrapper, this.tabStripClass);
	}, onStartup:function () {
		this.inherited(arguments);
		dojo.style(this.domNode, "visibility", "visible");
		this._postStartup = true;
	}, onAddChild:function (page, insertIndex) {
		this.inherited(arguments);
		var menuItem;
		if (this.useMenu) {
			var containerId = this.containerId;
			menuItem = new dijit.MenuItem({label:page.title, onClick:dojo.hitch(this, function () {
				var container = dijit.byId(containerId);
				container.selectChild(page);
			})});
			this._menuChildren[page.id] = menuItem;
			this._menu.addChild(menuItem, insertIndex);
		}
		this.pane2handles[page.id].push(this.connect(this.pane2button[page.id], "attr", function (name, value) {
			if (this._postStartup) {
				if (arguments.length == 2 && name == "label") {
					if (menuItem) {
						menuItem.attr(name, value);
					}
					if (this._dim) {
						this.resize(this._dim);
					}
				}
			}
		}));
		dojo.style(this.containerNode, "width", (dojo.style(this.containerNode, "width") + 200) + "px");
	}, onRemoveChild:function (page, insertIndex) {
		var button = this.pane2button[page.id];
		if (this._selectedTab === button.domNode) {
			this._selectedTab = null;
		}
		if (this.useMenu && page && page.id && this._menuChildren[page.id]) {
			this._menu.removeChild(this._menuChildren[page.id]);
			this._menuChildren[page.id].destroy();
			delete this._menuChildren[page.id];
		}
		this.inherited(arguments);
	}, _initButtons:function () {
		this._menuChildren = {};
		this._btnWidth = 0;
		this._buttons = dojo.query("> .tabStripButton", this.domNode).filter(function (btn) {
			if ((this.useMenu && btn == this._menuBtn.domNode) || (this.useSlider && (btn == this._rightBtn.domNode || btn == this._leftBtn.domNode))) {
				this._btnWidth += dojo.marginBox(btn).w;
				return true;
			} else {
				dojo.style(btn, "display", "none");
				return false;
			}
		}, this);
		if (this.useMenu) {
			this._menu = new dijit.Menu({id:this.id + "_menu", targetNodeIds:[this._menuBtn.domNode], leftClickToOpen:true, refocus:false});
			this._supportingWidgets.push(this._menu);
		}
	}, _getTabsWidth:function () {
		var children = this.getChildren();
		if (children.length) {
			var leftTab = children[this.isLeftToRight() ? 0 : children.length - 1].domNode, rightTab = children[this.isLeftToRight() ? children.length - 1 : 0].domNode;
			return rightTab.offsetLeft + dojo.style(rightTab, "width") - leftTab.offsetLeft;
		} else {
			return 0;
		}
	}, _enableBtn:function (width) {
		var tabsWidth = this._getTabsWidth();
		width = width || dojo.style(this.scrollNode, "width");
		return tabsWidth > 0 && width < tabsWidth;
	}, resize:function (dim) {
		if (this.domNode.offsetWidth == 0) {
			return;
		}
		this._dim = dim;
		this.scrollNode.style.height = "auto";
		this._contentBox = dijit.layout.marginBox2contentBox(this.domNode, {h:0, w:dim.w});
		this._contentBox.h = this.scrollNode.offsetHeight;
		dojo.contentBox(this.domNode, this._contentBox);
		var enable = this._enableBtn(this._contentBox.w);
		this._buttons.style("display", enable ? "" : "none");
		this._leftBtn.layoutAlign = "left";
		this._rightBtn.layoutAlign = "right";
		this._menuBtn.layoutAlign = this.isLeftToRight() ? "right" : "left";
		dijit.layout.layoutChildren(this.domNode, this._contentBox, [this._menuBtn, this._leftBtn, this._rightBtn, {domNode:this.scrollNode, layoutAlign:"client"}]);
		if (this._selectedTab) {
			var w = this.scrollNode, sl = this._convertToScrollLeft(this._getScrollForSelectedTab());
			w.scrollLeft = sl;
		}
		this._setButtonClass(this._getScroll());
	}, _getScroll:function () {
		var sl = (this.isLeftToRight() || dojo.isIE < 8 || dojo.isQuirks || dojo.isWebKit) ? this.scrollNode.scrollLeft : dojo.style(this.containerNode, "width") - dojo.style(this.scrollNode, "width") + (dojo.isIE == 8 ? -1 : 1) * this.scrollNode.scrollLeft;
		return sl;
	}, _convertToScrollLeft:function (val) {
		if (this.isLeftToRight() || dojo.isIE < 8 || dojo.isQuirks || dojo.isWebKit) {
			return val;
		} else {
			var maxScroll = dojo.style(this.containerNode, "width") - dojo.style(this.scrollNode, "width");
			return (dojo.isIE == 8 ? -1 : 1) * (val - maxScroll);
		}
	}, onSelectChild:function (page) {
		var tab = this.pane2button[page.id];
		if (!tab || !page) {
			return;
		}
		var node = tab.domNode;
		if (node != this._selectedTab) {
			this._selectedTab = node;
			var sl = this._getScroll();
			if (sl > node.offsetLeft || sl + dojo.style(this.scrollNode, "width") < node.offsetLeft + dojo.style(node, "width")) {
				this.createSmoothScroll().play();
			}
		}
		this.inherited(arguments);
	}, _getScrollBounds:function () {
		var children = this.getChildren(), scrollNodeWidth = dojo.style(this.scrollNode, "width"), containerWidth = dojo.style(this.containerNode, "width"), maxPossibleScroll = containerWidth - scrollNodeWidth, tabsWidth = this._getTabsWidth();
		if (children.length && tabsWidth > scrollNodeWidth) {
			return {min:this.isLeftToRight() ? 0 : children[children.length - 1].domNode.offsetLeft, max:this.isLeftToRight() ? (children[children.length - 1].domNode.offsetLeft + dojo.style(children[children.length - 1].domNode, "width")) - scrollNodeWidth : maxPossibleScroll};
		} else {
			var onlyScrollPosition = this.isLeftToRight() ? 0 : maxPossibleScroll;
			return {min:onlyScrollPosition, max:onlyScrollPosition};
		}
	}, _getScrollForSelectedTab:function () {
		var w = this.scrollNode, n = this._selectedTab, scrollNodeWidth = dojo.style(this.scrollNode, "width"), scrollBounds = this._getScrollBounds();
		var pos = (n.offsetLeft + dojo.style(n, "width") / 2) - scrollNodeWidth / 2;
		pos = Math.min(Math.max(pos, scrollBounds.min), scrollBounds.max);
		return pos;
	}, createSmoothScroll:function (x) {
		if (arguments.length > 0) {
			var scrollBounds = this._getScrollBounds();
			x = Math.min(Math.max(x, scrollBounds.min), scrollBounds.max);
		} else {
			x = this._getScrollForSelectedTab();
		}
		if (this._anim && this._anim.status() == "playing") {
			this._anim.stop();
		}
		var self = this, w = this.scrollNode, anim = new dojo._Animation({beforeBegin:function () {
			if (this.curve) {
				delete this.curve;
			}
			var oldS = w.scrollLeft, newS = self._convertToScrollLeft(x);
			anim.curve = new dojo._Line(oldS, newS);
		}, onAnimate:function (val) {
			w.scrollLeft = val;
		}});
		this._anim = anim;
		this._setButtonClass(x);
		return anim;
	}, _getBtnNode:function (e) {
		var n = e.target;
		while (n && !dojo.hasClass(n, "tabStripButton")) {
			n = n.parentNode;
		}
		return n;
	}, doSlideRight:function (e) {
		this.doSlide(1, this._getBtnNode(e));
	}, doSlideLeft:function (e) {
		this.doSlide(-1, this._getBtnNode(e));
	}, doSlide:function (direction, node) {
		if (node && dojo.hasClass(node, "dijitTabBtnDisabled")) {
			return;
		}
		var sWidth = dojo.style(this.scrollNode, "width");
		var d = (sWidth * 0.75) * direction;
		var to = this._getScroll() + d;
		this._setButtonClass(to);
		this.createSmoothScroll(to).play();
	}, _setButtonClass:function (scroll) {
		var cls = "dijitTabBtnDisabled", scrollBounds = this._getScrollBounds();
		dojo.toggleClass(this._leftBtn.domNode, cls, scroll <= scrollBounds.min);
		dojo.toggleClass(this._rightBtn.domNode, cls, scroll >= scrollBounds.max);
	}});
	dojo.declare("dijit.layout._ScrollingTabControllerButton", dijit.form.Button, {baseClass:"dijitTab", buttonType:"", buttonClass:"", tabPosition:"top", templateString:dojo.cache("dijit.layout", "templates/_ScrollingTabControllerButton.html", "<div id=\"${id}-${buttonType}\" class=\"tabStripButton dijitTab ${buttonClass} tabStripButton-${tabPosition}\"\n\t\tdojoAttachEvent=\"onclick:_onButtonClick,onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\">\n\t<div role=\"presentation\" wairole=\"presentation\" class=\"dijitTabInnerDiv\" dojoattachpoint=\"innerDiv,focusNode\">\n\t\t<div role=\"presentation\" wairole=\"presentation\" class=\"dijitTabContent dijitButtonContents\" dojoattachpoint=\"tabContent\">\n\t\t\t<img src=\"${_blankGif}\"/>\n\t\t\t<span dojoAttachPoint=\"containerNode,titleNode\" class=\"dijitButtonText\"></span>\n\t\t</div>\n\t</div>\n</div>\n"), tabIndex:""});
}

