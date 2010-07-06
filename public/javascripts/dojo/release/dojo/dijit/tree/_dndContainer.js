/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.tree._dndContainer"]) {
	dojo._hasResource["dijit.tree._dndContainer"] = true;
	dojo.provide("dijit.tree._dndContainer");
	dojo.require("dojo.dnd.common");
	dojo.require("dojo.dnd.Container");
	dojo.declare("dijit.tree._dndContainer", null, {constructor:function (tree, params) {
		this.tree = tree;
		this.node = tree.domNode;
		dojo.mixin(this, params);
		this.map = {};
		this.current = null;
		this.containerState = "";
		dojo.addClass(this.node, "dojoDndContainer");
		this.events = [dojo.connect(this.node, "onmouseenter", this, "onOverEvent"), dojo.connect(this.node, "onmouseleave", this, "onOutEvent"), dojo.connect(this.tree, "_onNodeMouseEnter", this, "onMouseOver"), dojo.connect(this.tree, "_onNodeMouseLeave", this, "onMouseOut"), dojo.connect(this.node, "ondragstart", dojo, "stopEvent"), dojo.connect(this.node, "onselectstart", dojo, "stopEvent")];
	}, getItem:function (key) {
		var node = this.selection[key], ret = {data:dijit.getEnclosingWidget(node), type:["treeNode"]};
		return ret;
	}, destroy:function () {
		dojo.forEach(this.events, dojo.disconnect);
		this.node = this.parent = null;
	}, onMouseOver:function (widget, evt) {
		this.current = widget.rowNode;
		this.currentWidget = widget;
	}, onMouseOut:function (widget, evt) {
		this.current = null;
		this.currentWidget = null;
	}, _changeState:function (type, newState) {
		var prefix = "dojoDnd" + type;
		var state = type.toLowerCase() + "State";
		dojo.removeClass(this.node, prefix + this[state]);
		dojo.addClass(this.node, prefix + newState);
		this[state] = newState;
	}, _addItemClass:function (node, type) {
		dojo.addClass(node, "dojoDndItem" + type);
	}, _removeItemClass:function (node, type) {
		dojo.removeClass(node, "dojoDndItem" + type);
	}, onOverEvent:function () {
		this._changeState("Container", "Over");
	}, onOutEvent:function () {
		this._changeState("Container", "");
	}});
}

