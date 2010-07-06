/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["zstaff.grid.RowBar"]) {
	dojo._hasResource["zstaff.grid.RowBar"] = true;
	dojo.require("dojox.grid._grid.rowbar");
	dojo.provide("zstaff.grid.RowBar");
	dojo.declare("zstaff.grid.RowBar", dojox.GridRowView, {buildRowContent:function (inRowIndex, inRowNode) {
		var w = this.contentNode.offsetWidth - this.padBorderWidth;
		var slf = this;
		inRowNode.innerHTML = "<table style=\"width:" + w + "px;\" role=\"wairole:presentation\"><tr><td class=\"dojoxGrid-rowbar-inner\"><input name=\"v" + inRowIndex + "\" type=\"checkbox\"></td></tr></table>";
	}, doStyleRowNode:function (inRowIndex, inRowNode) {
		slf = this;
		dojo.query("input[type=\"checkbox\"]", inRowNode).forEach(function (e, scope) {
			e.checked = slf.grid.selection.isSelected(inRowIndex) == true;
		});
		this.inherited("doStyleRowNode", arguments);
	}, doContentEvent:function (e) {
		if (this.content.decorateEvent(e)) {
			if (e.type != "click") {
				this.grid.onContentEvent(e);
			} else {
				this.grid.selection.clickSelect(e.rowIndex, true, false);
			}
		}
	}});
}

