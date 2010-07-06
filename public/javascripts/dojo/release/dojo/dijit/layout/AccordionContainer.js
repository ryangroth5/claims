/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.layout.AccordionContainer"]) {
	dojo._hasResource["dijit.layout.AccordionContainer"] = true;
	dojo.provide("dijit.layout.AccordionContainer");
	dojo.require("dojo.fx");
	dojo.require("dijit._Container");
	dojo.require("dijit._Templated");
	dojo.require("dijit.layout.StackContainer");
	dojo.require("dijit.layout.ContentPane");
	dojo.require("dijit.layout.AccordionPane");
	dojo.declare("dijit.layout.AccordionContainer", dijit.layout.StackContainer, {duration:dijit.defaultDuration, buttonWidget:"dijit.layout._AccordionButton", _verticalSpace:0, baseClass:"dijitAccordionContainer", postCreate:function () {
		this.domNode.style.overflow = "hidden";
		this.inherited(arguments);
		dijit.setWaiRole(this.domNode, "tablist");
	}, startup:function () {
		if (this._started) {
			return;
		}
		this.inherited(arguments);
		if (this.selectedChildWidget) {
			var style = this.selectedChildWidget.containerNode.style;
			style.display = "";
			style.overflow = "auto";
			this.selectedChildWidget._buttonWidget._setSelectedState(true);
		}
	}, _getTargetHeight:function (node) {
		var cs = dojo.getComputedStyle(node);
		return Math.max(this._verticalSpace - dojo._getPadBorderExtents(node, cs).h, 0);
	}, layout:function () {
		var openPane = this.selectedChildWidget;
		var totalCollapsedHeight = 0;
		dojo.forEach(this.getChildren(), function (child) {
			totalCollapsedHeight += child._buttonWidget.getTitleHeight();
		});
		var mySize = this._contentBox;
		this._verticalSpace = mySize.h - totalCollapsedHeight;
		this._containerContentBox = {h:this._verticalSpace, w:mySize.w};
		if (openPane) {
			openPane.resize(this._containerContentBox);
		}
	}, _setupChild:function (child) {
		var cls = dojo.getObject(this.buttonWidget);
		var button = (child._buttonWidget = new cls({contentWidget:child, label:child.title, title:child.tooltip, iconClass:child.iconClass, id:child.id + "_button", parent:this}));
		child._accordionConnectHandle = this.connect(child, "attr", function (name, value) {
			if (arguments.length == 2) {
				switch (name) {
				  case "title":
				  case "iconClass":
					button.attr(name, value);
				}
			}
		});
		dojo.place(child._buttonWidget.domNode, child.domNode, "before");
		this.inherited(arguments);
	}, removeChild:function (child) {
		this.disconnect(child._accordionConnectHandle);
		delete child._accordionConnectHandle;
		child._buttonWidget.destroy();
		delete child._buttonWidget;
		this.inherited(arguments);
	}, getChildren:function () {
		return dojo.filter(this.inherited(arguments), function (child) {
			return child.declaredClass != this.buttonWidget;
		}, this);
	}, destroy:function () {
		dojo.forEach(this.getChildren(), function (child) {
			child._buttonWidget.destroy();
		});
		this.inherited(arguments);
	}, _transition:function (newWidget, oldWidget) {
		if (this._inTransition) {
			return;
		}
		this._inTransition = true;
		var animations = [];
		var paneHeight = this._verticalSpace;
		if (newWidget) {
			newWidget._buttonWidget.setSelected(true);
			this._showChild(newWidget);
			if (this.doLayout && newWidget.resize) {
				newWidget.resize(this._containerContentBox);
			}
			var newContents = newWidget.domNode;
			dojo.addClass(newContents, "dijitVisible");
			dojo.removeClass(newContents, "dijitHidden");
			var newContentsOverflow = newContents.style.overflow;
			newContents.style.overflow = "hidden";
			animations.push(dojo.animateProperty({node:newContents, duration:this.duration, properties:{height:{start:1, end:this._getTargetHeight(newContents)}}, onEnd:dojo.hitch(this, function () {
				newContents.style.overflow = newContentsOverflow;
				delete this._inTransition;
			})}));
		}
		if (oldWidget) {
			oldWidget._buttonWidget.setSelected(false);
			var oldContents = oldWidget.domNode, oldContentsOverflow = oldContents.style.overflow;
			oldContents.style.overflow = "hidden";
			animations.push(dojo.animateProperty({node:oldContents, duration:this.duration, properties:{height:{start:this._getTargetHeight(oldContents), end:1}}, onEnd:function () {
				dojo.addClass(oldContents, "dijitHidden");
				dojo.removeClass(oldContents, "dijitVisible");
				oldContents.style.overflow = oldContentsOverflow;
				if (oldWidget.onHide) {
					oldWidget.onHide();
				}
			}}));
		}
		dojo.fx.combine(animations).play();
	}, _onKeyPress:function (e, fromTitle) {
		if (this._inTransition || this.disabled || e.altKey || !(fromTitle || e.ctrlKey)) {
			if (this._inTransition) {
				dojo.stopEvent(e);
			}
			return;
		}
		var k = dojo.keys, c = e.charOrCode;
		if ((fromTitle && (c == k.LEFT_ARROW || c == k.UP_ARROW)) || (e.ctrlKey && c == k.PAGE_UP)) {
			this._adjacent(false)._buttonWidget._onTitleClick();
			dojo.stopEvent(e);
		} else {
			if ((fromTitle && (c == k.RIGHT_ARROW || c == k.DOWN_ARROW)) || (e.ctrlKey && (c == k.PAGE_DOWN || c == k.TAB))) {
				this._adjacent(true)._buttonWidget._onTitleClick();
				dojo.stopEvent(e);
			}
		}
	}});
	dojo.declare("dijit.layout._AccordionButton", [dijit._Widget, dijit._Templated], {templateString:dojo.cache("dijit.layout", "templates/AccordionButton.html", "<div dojoAttachPoint='titleNode,focusNode' dojoAttachEvent='ondijitclick:_onTitleClick,onkeypress:_onTitleKeyPress,onfocus:_handleFocus,onblur:_handleFocus,onmouseenter:_onTitleEnter,onmouseleave:_onTitleLeave'\n\t\tclass='dijitAccordionTitle' wairole=\"tab\" waiState=\"expanded-false\"\n\t\t><span class='dijitInline dijitAccordionArrow' waiRole=\"presentation\"></span\n\t\t><span class='arrowTextUp' waiRole=\"presentation\">+</span\n\t\t><span class='arrowTextDown' waiRole=\"presentation\">-</span\n\t\t><img src=\"${_blankGif}\" alt=\"\" dojoAttachPoint='iconNode' style=\"vertical-align: middle\" waiRole=\"presentation\"/>\n\t\t<span waiRole=\"presentation\" dojoAttachPoint='titleTextNode' class='dijitAccordionText'></span>\n</div>\n"), attributeMap:dojo.mixin(dojo.clone(dijit.layout.ContentPane.prototype.attributeMap), {label:{node:"titleTextNode", type:"innerHTML"}, title:{node:"titleTextNode", type:"attribute", attribute:"title"}, iconClass:{node:"iconNode", type:"class"}}), baseClass:"dijitAccordionTitle", getParent:function () {
		return this.parent;
	}, postCreate:function () {
		this.inherited(arguments);
		dojo.setSelectable(this.domNode, false);
		this.setSelected(this.selected);
		var titleTextNodeId = dojo.attr(this.domNode, "id").replace(" ", "_");
		dojo.attr(this.titleTextNode, "id", titleTextNodeId + "_title");
		dijit.setWaiState(this.focusNode, "labelledby", dojo.attr(this.titleTextNode, "id"));
	}, getTitleHeight:function () {
		return dojo.marginBox(this.titleNode).h;
	}, _onTitleClick:function () {
		var parent = this.getParent();
		if (!parent._inTransition) {
			parent.selectChild(this.contentWidget);
			dijit.focus(this.focusNode);
		}
	}, _onTitleEnter:function () {
		dojo.addClass(this.focusNode, "dijitAccordionTitle-hover");
	}, _onTitleLeave:function () {
		dojo.removeClass(this.focusNode, "dijitAccordionTitle-hover");
	}, _onTitleKeyPress:function (evt) {
		return this.getParent()._onKeyPress(evt, this.contentWidget);
	}, _setSelectedState:function (isSelected) {
		this.selected = isSelected;
		dojo[(isSelected ? "addClass" : "removeClass")](this.titleNode, "dijitAccordionTitle-selected");
		dijit.setWaiState(this.focusNode, "expanded", isSelected);
		dijit.setWaiState(this.focusNode, "selected", isSelected);
		this.focusNode.setAttribute("tabIndex", isSelected ? "0" : "-1");
	}, _handleFocus:function (e) {
		dojo.toggleClass(this.titleTextNode, "dijitAccordionFocused", e.type == "focus");
	}, setSelected:function (isSelected) {
		this._setSelectedState(isSelected);
		if (isSelected) {
			var cw = this.contentWidget;
			if (cw.onSelected) {
				cw.onSelected();
			}
		}
	}});
}

