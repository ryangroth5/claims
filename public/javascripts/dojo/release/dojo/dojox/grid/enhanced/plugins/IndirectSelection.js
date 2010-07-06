/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced.plugins.IndirectSelection"]) {
	dojo._hasResource["dojox.grid.enhanced.plugins.IndirectSelection"] = true;
	dojo.provide("dojox.grid.enhanced.plugins.IndirectSelection");
	dojo.require("dojox.grid.cells.dijit");
	dojo.require("dojox.grid.cells._base");
	dojo.declare("dojox.grid.enhanced.plugins.IndirectSelection", null, {constructor:function (inGrid) {
		this.grid = inGrid;
		dojo.connect(inGrid.layout, "setStructure", dojo.hitch(inGrid.layout, this.addRowSelectCell));
	}, addRowSelectCell:function () {
		if (!this.grid.indirectSelection || this.grid.selectionMode == "none") {
			return;
		}
		var rowSelectCellAdded = false, inValidFields = ["get", "formatter", "field", "fields"], defaultCellDef = {type:dojox.grid.cells.DijitMultipleRowSelector, name:"", editable:true, width:"30px", styles:"text-align: center;"};
		dojo.forEach(this.structure, dojo.hitch(this, function (view) {
			var cells = view.cells;
			if (cells && cells.length > 0 && !rowSelectCellAdded) {
				var firstRow = cells[0];
				if (firstRow[0] && firstRow[0]["isRowSelector"]) {
					console.debug("addRowSelectCell() - row selector cells already added, return.");
					rowSelectCellAdded = true;
					return;
				}
				var selectDef, cellType = this.grid.selectionMode == "single" ? dojox.grid.cells.DijitSingleRowSelector : dojox.grid.cells.DijitMultipleRowSelector;
				if (!dojo.isObject(this.grid.indirectSelection)) {
					selectDef = dojo.mixin(defaultCellDef, {type:cellType});
				} else {
					selectDef = dojo.mixin(defaultCellDef, this.grid.indirectSelection, {type:cellType, editable:true});
					dojo.forEach(inValidFields, function (field) {
						if (field in selectDef) {
							delete selectDef[field];
						}
					});
				}
				cells.length > 1 && (selectDef["rowSpan"] = cells.length);
				dojo.forEach(this.cells, function (cell, i) {
					if (cell.index >= 0) {
						cell.index += 1;
					} else {
						console.debug("Error:IndirectSelection.addRowSelectCell()-  cell " + i + " has no index!");
					}
				});
				var rowSelectCell = this.addCellDef(0, 0, selectDef);
				rowSelectCell.index = 0;
				firstRow.unshift(rowSelectCell);
				this.cells.unshift(rowSelectCell);
				this.grid.rowSelectCell = rowSelectCell;
				rowSelectCellAdded = true;
			}
		}));
		this.cellCount = this.cells.length;
	}});
	dojo.declare("dojox.grid.cells._SingleRowSelectorMixin", null, {alwaysEditing:true, widgetMap:{}, widget:null, isRowSelector:true, defaultValue:false, formatEditing:function (inDatum, inRowIndex) {
		this.needFormatNode(inDatum, inRowIndex);
	}, _formatNode:function (inDatum, inRowIndex) {
		this.formatNode(inDatum, inRowIndex);
	}, setValue:function (inRowIndex, inValue) {
		return;
	}, get:function (inRowIndex) {
		var widget = this.widgetMap[this.view.id] ? this.widgetMap[this.view.id][inRowIndex] : null;
		var value = widget ? widget.attr("checked") : "";
		return value;
	}, _fireSelectionChanged:function () {
		dojo.publish(this.grid.rowSelectionChangedTopic, [this]);
	}, _selectionChanged:function (obj) {
		if (obj == this) {
			return;
		}
		for (var i in this.widgetMap[this.view.id]) {
			var idx = new Number(i);
			var widget = this.widgetMap[this.view.id][idx];
			var value = !!this.grid.selection.selected[idx];
			widget.attr("checked", value);
		}
		this.defaultValue = false;
		this.grid.edit.isEditing() && this.grid.edit.apply();
	}, _toggleSingleRow:function (idx, value) {
		var widget;
		dojo.hitch(this.grid.selection, dojox.grid.Selection.prototype[value ? "addToSelection" : "deselect"])(idx);
		if (this.widgetMap[this.view.id] && (widget = this.widgetMap[this.view.id][idx])) {
			widget.attr("checked", value);
		}
		this._fireSelectionChanged();
	}, inIndirectSelectionMode:function () {
	}, toggleAllSelection:function () {
	}});
	dojo.declare("dojox.grid.cells._MultipleRowSelectorMixin", null, {swipeStartRowIndex:-1, swipeMinRowIndex:-1, swipeMaxRowIndex:-1, toSelect:false, lastClickRowIdx:-1, toggleAllTrigerred:false, _inDndSelection:false, domousedown:function (e) {
		if (e.target.tagName == "INPUT") {
			this._startSelection(e.rowIndex);
		}
		dojo.stopEvent(e);
	}, domousemove:function (e) {
		this._updateSelection(e, 0);
	}, onRowMouseOver:function (e) {
		this._updateSelection(e, 0);
		if (this.grid.dnd) {
			this._inDndSelection = this.grid.select.isInSelectingMode("row");
		}
	}, domouseup:function (e) {
		dojo.isIE && this.view.content.decorateEvent(e);
		var inSwipeSelection = e.cellIndex >= 0 && (this.inIndirectSelectionMode() || this._inDndSelection) && !this.grid.edit.isEditRow(e.rowIndex);
		inSwipeSelection && this._focusEndingCell(e.rowIndex, e.cellIndex);
		this._finisheSelect();
	}, dokeyup:function (e) {
		if (!e.shiftKey) {
			this._finisheSelect();
		}
	}, _startSelection:function (rowIndex) {
		this.swipeStartRowIndex = this.swipeMinRowIndex = this.swipeMaxRowIndex = rowIndex;
		this.toSelect = !this.widgetMap[this.view.id][rowIndex].attr("checked");
	}, _updateSelection:function (e, delta) {
		if (this.swipeStartRowIndex < 0) {
			return;
		}
		var byKey = delta != 0;
		var deltaRow = e.rowIndex - this.swipeStartRowIndex + delta;
		deltaRow > 0 && (this.swipeMaxRowIndex < e.rowIndex + delta) && (this.swipeMaxRowIndex = e.rowIndex + delta);
		deltaRow < 0 && (this.swipeMinRowIndex > e.rowIndex + delta) && (this.swipeMinRowIndex = e.rowIndex + delta);
		if (this.swipeMinRowIndex != this.swipeMaxRowIndex) {
			for (var i in this.widgetMap[this.view.id]) {
				var idx = new Number(i);
				var inRange = (idx >= (deltaRow > 0 ? this.swipeStartRowIndex : e.rowIndex + delta) && idx <= (deltaRow > 0 ? e.rowIndex + delta : this.swipeStartRowIndex));
				var outOfRange = (idx >= this.swipeMinRowIndex && idx <= this.swipeMaxRowIndex);
				if (inRange && !(deltaRow == 0 && !this.toSelect)) {
					(this.widgetMap[this.view.id][idx]).attr("checked", this.toSelect);
					dojo.hitch(this.grid.selection, dojox.grid.Selection.prototype[this.toSelect ? "addToSelection" : "deselect"])(idx);
				} else {
					if (outOfRange && !byKey) {
						(this.widgetMap[this.view.id][idx]).attr("checked", !this.toSelect);
						dojo.hitch(this.grid.selection, dojox.grid.Selection.prototype[!this.toSelect ? "addToSelection" : "deselect"])(idx);
					}
				}
			}
		}
		this._fireSelectionChanged();
	}, swipeSelectionByKey:function (e, delta) {
		if (this.swipeStartRowIndex < 0) {
			this.swipeStartRowIndex = e.rowIndex;
			if (delta > 0) {
				this.swipeMaxRowIndex = e.rowIndex + delta;
				this.swipeMinRowIndex = e.rowIndex;
			} else {
				this.swipeMinRowIndex = e.rowIndex + delta;
				this.swipeMaxRowIndex = e.rowIndex;
			}
			this.toSelect = this.widgetMap[this.view.id][e.rowIndex].attr("checked");
		}
		this._updateSelection(e, delta);
	}, _finisheSelect:function () {
		this.swipeStartRowIndex = -1;
		this.swipeMinRowIndex = -1;
		this.swipeMaxRowIndex = -1;
		this.toSelect = false;
	}, inIndirectSelectionMode:function () {
		return this.swipeStartRowIndex >= 0;
	}, toggleAllSelection:function (checked) {
		for (var i in this.widgetMap[this.view.id]) {
			var idx = new Number(i);
			var widget = this.widgetMap[this.view.id][idx];
			widget.attr("checked", checked);
			dojo.hitch(this.grid.selection, dojox.grid.Selection.prototype[checked ? "addToSelection" : "deselect"])(idx);
		}
		!checked && this.grid.selection.deselectAll();
		this.defaultValue = checked;
		this.toggleAllTrigerred = true;
		this._fireSelectionChanged();
	}});
	dojo.declare("dojox.grid.cells.DijitSingleRowSelector", [dojox.grid.cells._Widget, dojox.grid.cells._SingleRowSelectorMixin], {widgetClass:dijit.form.RadioButton, constructor:function () {
		dojo.subscribe(this.grid.rowSelectionChangedTopic, this, this._selectionChanged);
		dojo.subscribe(this.grid.sortRowSelectionChangedTopic, this, this._selectionChanged);
		this.grid.indirectSelector = this;
	}, formatNode:function (inDatum, inRowIndex) {
		if (!this.widgetClass) {
			return inDatum;
		}
		!this.widgetMap[this.view.id] && (this.widgetMap[this.view.id] = {});
		var currWidget = this.widgetMap[this.view.id][inRowIndex];
		var cellNode = this.getNode(inRowIndex);
		if (!cellNode) {
			return;
		}
		var noAttachedWidget = !cellNode.firstChild || (currWidget && currWidget.domNode != cellNode.firstChild);
		var inNode = noAttachedWidget && !cellNode.firstChild ? cellNode.appendChild(dojo.create("div")) : cellNode.firstChild;
		if (!currWidget || dojo.isIE) {
			!this.widgetProps && (this.widgetProps = {});
			this.widgetProps.name = "select_" + this.view.id;
			var value = this.getDefaultValue(currWidget, inRowIndex);
			this.widget = currWidget = this.createWidget(inNode, inDatum, inRowIndex);
			this.widgetMap[this.view.id][inRowIndex] = currWidget;
			this.widget.attr("checked", value);
			dojo.connect(currWidget, "_onClick", dojo.hitch(this, function (e) {
				this._selectRow(e, inRowIndex);
			}));
			dojo.connect(currWidget.domNode, "onkeyup", dojo.hitch(this, function (e) {
				e.keyCode == dojo.keys.SPACE && this._selectRow(e, inRowIndex, true);
			}));
			dojo.hitch(this.grid.selection, dojox.grid.Selection.prototype[value ? "addToSelection" : "deselect"])(inRowIndex);
		} else {
			this.widget = currWidget;
			dojo.addClass(this.widget.domNode, "dojoxGridWidgetHidden");
			noAttachedWidget && this.attachWidget(inNode, inDatum, inRowIndex);
		}
		this.grid.rowHeightChanged(inRowIndex);
		dojo.removeClass(this.widget.domNode, "dojoxGridWidgetHidden");
		(inRowIndex == this.grid.lastRenderingRowIdx) && dojo.removeClass(this.grid.domNode, "dojoxGridSortInProgress");
	}, getDefaultValue:function (widget, inRowIndex) {
		var value = widget ? widget.attr("checked") : this.defaultValue;
		if (!widget) {
			if (this.grid.nestedSorting) {
				value = value || this.grid.getStoreSelectedValue(inRowIndex);
			}
			value = this.grid.selection.isSelected(inRowIndex) ? true : value;
		}
		return value;
	}, focus:function (inRowIndex) {
		var widget = this.widgetMap[this.view.id][inRowIndex];
		if (widget) {
			setTimeout(dojo.hitch(widget, function () {
				dojox.grid.util.fire(this, "focus");
			}), 0);
		}
	}, _focusEndingCell:function (inRowIndex, cellIndex) {
		var cell = this.grid.getCell(cellIndex);
		this.grid.focus.setFocusCell(cell, inRowIndex);
		this.grid.isDndSelectEnable && this.grid.focus._blurRowBar();
	}, _selectRow:function (e, inRowIndex, preChange) {
		if (dojo.isMoz && preChange) {
			return;
		}
		dojo.stopEvent(e);
		this._focusEndingCell(inRowIndex, 0);
		var value = !this.grid.selection.selected[inRowIndex];
		this.grid.selection.deselectAll();
		this.grid.selection.addToSelection(inRowIndex);
		if (!dojo.isMoz) {
			var widget = this.widgetMap[this.view.id][inRowIndex];
			widget.attr("checked", true);
		}
		this._fireSelectionChanged();
	}, toggleRow:function (idx, value) {
		var currSelectIdx = dojo.hitch(this.grid.selection, dojox.grid.Selection.prototype.getFirstSelected)();
		if (idx != currSelectIdx && !value || idx == currSelectIdx && value) {
			return;
		}
		var widget;
		if (idx != currSelectIdx && value && this.widgetMap[this.view.id] && (widget = this.widgetMap[this.view.id][currSelectIdx])) {
			widget.attr("checked", false);
		}
		this.grid.selection.deselectAll();
		this._toggleSingleRow(idx, value);
	}, setDisabled:function (idx, disabled) {
		if (this.widgetMap[this.view.id]) {
			var widget = this.widgetMap[this.view.id][idx];
			widget && widget.attr("disabled", disabled);
		}
	}});
	dojo.declare("dojox.grid.cells.DijitMultipleRowSelector", [dojox.grid.cells.DijitSingleRowSelector, dojox.grid.cells._MultipleRowSelectorMixin], {widgetClass:dijit.form.CheckBox, constructor:function () {
		dojo.connect(dojo.doc, "onmouseup", this, "domouseup");
		this.grid.indirectSelector = this;
	}, _selectRow:function (e, inRowIndex, preChange) {
		dojo.stopEvent(e);
		this._focusEndingCell(inRowIndex, 0);
		var delta = inRowIndex - this.lastClickRowIdx;
		if (this.lastClickRowIdx >= 0 && !e.ctrlKey && !e.altKey && e.shiftKey) {
			var newValue = this.widgetMap[this.view.id][inRowIndex].attr("checked");
			newValue = preChange ? !newValue : newValue;
			for (var i in this.widgetMap[this.view.id]) {
				var idx = new Number(i);
				var inRange = (idx >= (delta > 0 ? this.lastClickRowIdx : inRowIndex) && idx <= (delta > 0 ? inRowIndex : this.lastClickRowIdx));
				if (inRange) {
					var widget = this.widgetMap[this.view.id][idx];
					widget.attr("checked", newValue);
					dojo.hitch(this.grid.selection, dojox.grid.Selection.prototype[newValue ? "addToSelection" : "deselect"])(idx);
				}
			}
		} else {
			var value = !this.grid.selection.selected[inRowIndex];
			var widget = this.widgetMap[this.view.id][inRowIndex];
			widget.attr("checked", value);
			dojo.hitch(this.grid.selection, dojox.grid.Selection.prototype[value ? "addToSelection" : "deselect"])(inRowIndex);
		}
		this.lastClickRowIdx = inRowIndex;
		this._fireSelectionChanged();
	}, toggleRow:function (idx, value) {
		this._toggleSingleRow(idx, value);
	}});
}

