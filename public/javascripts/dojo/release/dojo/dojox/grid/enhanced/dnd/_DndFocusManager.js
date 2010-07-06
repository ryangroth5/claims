/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced.dnd._DndFocusManager"]) {
	dojo._hasResource["dojox.grid.enhanced.dnd._DndFocusManager"] = true;
	dojo.provide("dojox.grid.enhanced.dnd._DndFocusManager");
	dojo.declare("dojox.grid.enhanced.dnd._DndFocusManager", null, {_rowBarNode:null, _rowBarFocusIdy:null, isRowBar:function () {
		return (!!this._rowBarNode);
	}, getRowBarNode:function (inIdx) {
		return this.grid.views.views[0].getCellNode(inIdx, 0);
	}, focusRowBar:function () {
		this.focusRowBarNode(0);
		this._focusifyCellNode(false);
	}, focusRowBarNode:function (rowIndex) {
		this._blurRowBar();
		this._focusifyCellNode(false);
		var node = this.getRowBarNode(rowIndex);
		if (!node) {
			return;
		}
		this._rowBarNode = node;
		this._rowBarFocusIdy = rowIndex;
		this._rowBarNode.tabIndex = -1;
		dojox.grid.util.fire(this._rowBarNode, "focus");
		dojo.toggleClass(this._rowBarNode, this.focusClass, true);
	}, _blurRowBar:function () {
		if (this._rowBarNode) {
			dojo.toggleClass(this._rowBarNode, this.focusClass, false);
			this._rowBarNode = this._rowBarFocusIdy = null;
		}
	}, focusNextRowBar:function () {
		var sc = this.grid.scroller, r = this._rowBarFocusIdy, rc = this.grid.rowCount - 1, row = Math.min(rc, Math.max(0, r + 1));
		var currentY = this._rowBarFocusIdy + 1;
		if (row > sc.getLastPageRow(sc.page)) {
			this.grid.setScrollTop(this.grid.scrollTop + sc.findScrollTop(row) - sc.findScrollTop(r));
		}
		this.focusRowBarNode(currentY);
		this.scrollRowBarIntoView();
	}, focusPrevRowBar:function () {
		var sc = this.grid.scroller, r = this._rowBarFocusIdy, rc = this.grid.rowCount - 1, row = Math.min(rc, Math.max(0, r - 1));
		var currentY = this._rowBarFocusIdy - 1;
		if (currentY < 0) {
			return;
		}
		if (currentY <= sc.getPageRow(sc.page)) {
			this.grid.setScrollTop(this.grid.scrollTop - sc.findScrollTop(r) - sc.findScrollTop(row));
		}
		this.focusRowBarNode(currentY);
		this.scrollRowBarIntoView();
	}, getFocusedRowIndex:function () {
		return this._rowBarFocusIdy;
	}, scrollRowBarIntoView:function () {
		this.cell = this._rowBarNode;
		this.cell.view = this.grid.views.views[0];
		this.cell.getNode = function (index) {
			return this.cell;
		};
		this.rowIndex = this._rowBarFocusIdy;
		this.scrollIntoView();
		this.cell = null;
	}, focusHeaderNode:function (inHeaderNodeIdx) {
		this._colHeadFocusIdx = inHeaderNodeIdx;
		this.focusHeader.apply(this, arguments);
	}});
}

