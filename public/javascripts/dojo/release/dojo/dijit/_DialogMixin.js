/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._DialogMixin"]) {
	dojo._hasResource["dijit._DialogMixin"] = true;
	dojo.provide("dijit._DialogMixin");
	dojo.declare("dijit._DialogMixin", null, {attributeMap:dijit._Widget.prototype.attributeMap, execute:function (formContents) {
	}, onCancel:function () {
	}, onExecute:function () {
	}, _onSubmit:function () {
		this.onExecute();
		this.execute(this.attr("value"));
	}, _getFocusItems:function (dialogNode) {
		var elems = dijit._getTabNavigable(dojo.byId(dialogNode));
		this._firstFocusItem = elems.lowest || elems.first || dialogNode;
		this._lastFocusItem = elems.last || elems.highest || this._firstFocusItem;
		if (dojo.isMoz && this._firstFocusItem.tagName.toLowerCase() == "input" && dojo.getNodeProp(this._firstFocusItem, "type").toLowerCase() == "file") {
			dojo.attr(dialogNode, "tabIndex", "0");
			this._firstFocusItem = dialogNode;
		}
	}});
}

