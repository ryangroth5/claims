/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.MenuItem"]) {
	dojo._hasResource["dijit.MenuItem"] = true;
	dojo.provide("dijit.MenuItem");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dijit._Contained");
	dojo.declare("dijit.MenuItem", [dijit._Widget, dijit._Templated, dijit._Contained], {templateString:dojo.cache("dijit", "templates/MenuItem.html", "<tr class=\"dijitReset dijitMenuItem\" dojoAttachPoint=\"focusNode\" waiRole=\"menuitem\" tabIndex=\"-1\"\n\t\tdojoAttachEvent=\"onmouseenter:_onHover,onmouseleave:_onUnhover,ondijitclick:_onClick\">\n\t<td class=\"dijitReset\" waiRole=\"presentation\">\n\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitMenuItemIcon\" dojoAttachPoint=\"iconNode\">\n\t</td>\n\t<td class=\"dijitReset dijitMenuItemLabel\" colspan=\"2\" dojoAttachPoint=\"containerNode\"></td>\n\t<td class=\"dijitReset dijitMenuItemAccelKey\" style=\"display: none\" dojoAttachPoint=\"accelKeyNode\"></td>\n\t<td class=\"dijitReset dijitMenuArrowCell\" waiRole=\"presentation\">\n\t\t<div dojoAttachPoint=\"arrowWrapper\" style=\"visibility: hidden\">\n\t\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitMenuExpand\">\n\t\t\t<span class=\"dijitMenuExpandA11y\">+</span>\n\t\t</div>\n\t</td>\n</tr>\n"), attributeMap:dojo.delegate(dijit._Widget.prototype.attributeMap, {label:{node:"containerNode", type:"innerHTML"}, iconClass:{node:"iconNode", type:"class"}}), label:"", iconClass:"", accelKey:"", disabled:false, _fillContent:function (source) {
		if (source && !("label" in this.params)) {
			this.attr("label", source.innerHTML);
		}
	}, postCreate:function () {
		dojo.setSelectable(this.domNode, false);
		var label = this.id + "_text";
		dojo.attr(this.containerNode, "id", label);
		if (this.accelKeyNode) {
			dojo.attr(this.accelKeyNode, "id", this.id + "_accel");
			label += " " + this.id + "_accel";
		}
		dijit.setWaiState(this.domNode, "labelledby", label);
	}, _onHover:function () {
		dojo.addClass(this.domNode, "dijitMenuItemHover");
		this.getParent().onItemHover(this);
	}, _onUnhover:function () {
		dojo.removeClass(this.domNode, "dijitMenuItemHover");
		this.getParent().onItemUnhover(this);
	}, _onClick:function (evt) {
		this.getParent().onItemClick(this, evt);
		dojo.stopEvent(evt);
	}, onClick:function (evt) {
	}, focus:function () {
		try {
			if (dojo.isIE == 8) {
				this.containerNode.focus();
			}
			dijit.focus(this.focusNode);
		}
		catch (e) {
		}
	}, _onFocus:function () {
		this._setSelected(true);
		this.getParent()._onItemFocus(this);
		this.inherited(arguments);
	}, _setSelected:function (selected) {
		dojo.toggleClass(this.domNode, "dijitMenuItemSelected", selected);
	}, setLabel:function (content) {
		dojo.deprecated("dijit.MenuItem.setLabel() is deprecated.  Use attr('label', ...) instead.", "", "2.0");
		this.attr("label", content);
	}, setDisabled:function (disabled) {
		dojo.deprecated("dijit.Menu.setDisabled() is deprecated.  Use attr('disabled', bool) instead.", "", "2.0");
		this.attr("disabled", disabled);
	}, _setDisabledAttr:function (value) {
		this.disabled = value;
		dojo[value ? "addClass" : "removeClass"](this.domNode, "dijitMenuItemDisabled");
		dijit.setWaiState(this.focusNode, "disabled", value ? "true" : "false");
	}, _setAccelKeyAttr:function (value) {
		this.accelKey = value;
		this.accelKeyNode.style.display = value ? "" : "none";
		this.accelKeyNode.innerHTML = value;
		dojo.attr(this.containerNode, "colSpan", value ? "1" : "2");
	}});
}

