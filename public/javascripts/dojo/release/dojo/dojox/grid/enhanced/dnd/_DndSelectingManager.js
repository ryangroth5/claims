/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced.dnd._DndSelectingManager"]) {
	dojo._hasResource["dojox.grid.enhanced.dnd._DndSelectingManager"] = true;
	dojo.provide("dojox.grid.enhanced.dnd._DndSelectingManager");
	dojo.require("dojox.grid.util");
	dojo.require("dojox.grid._Builder");
	dojo.require("dojox.grid.enhanced.dnd._DndGrid");
	dojo.require("dojox.grid.enhanced.dnd._DndBuilder");
	dojo.require("dojox.grid.enhanced.dnd._DndRowSelector");
	dojo.require("dojox.grid.enhanced.dnd._DndFocusManager");
	dojo.declare("dojox.grid.enhanced.dnd._DndSelectingManager", null, {typeSelectingMode:[], selectingDisabledTypes:[], drugSelectionStart:null, drugCurrentPoint:null, drugMode:null, keepState:false, extendSelect:false, headerNodes:null, selectedCells:null, selectedColumns:[], selectedClass:"dojoxGridRowSelected", autoScrollRate:1000, constructor:function (inGrid) {
		this.grid = inGrid;
		this.typeSelectingMode = [];
		this.selectingDisabledTypes = [];
		this.selectedColumns = [];
		this.drugSelectionStart = new Object();
		this.drugCurrentPoint = new Object();
		this.resetStartPoint();
		this.extendGridForDnd(inGrid);
		this.selectedCells = [];
		dojo.connect(this.grid, "_onFetchComplete", dojo.hitch(this, "refreshColumnSelection"));
		dojo.connect(this.grid.scroller, "scroll", dojo.hitch(this, "refreshColumnSelection"));
		dojo.subscribe(this.grid.rowSelectionChangedTopic, dojo.hitch(this, function (publisher) {
			try {
				if (publisher.grid == this.grid && publisher != this) {
					this.cleanCellSelection();
				}
			}
			catch (e) {
				console.debug(e);
			}
		}));
	}, extendGridForDnd:function (inGrid) {
		var _ctr = inGrid.constructor;
		inGrid.mixin(inGrid, dojo.hitch(new dojox.grid.enhanced.dnd._DndGrid(this)));
		inGrid.constructor = _ctr;
		inGrid.mixin(inGrid.focus, new dojox.grid.enhanced.dnd._DndFocusManager());
		inGrid.mixin(inGrid.selection, {clickSelect:function () {
		}});
		dojo.forEach(inGrid.views.views, function (view) {
			inGrid.mixin(view.content, new dojox.grid.enhanced.dnd._DndBuilder());
			inGrid.mixin(view.header, new dojox.grid.enhanced.dnd._DndHeaderBuilder());
			if (view.declaredClass == "dojox.grid._RowSelector") {
				inGrid.mixin(view, new dojox.grid.enhanced.dnd._DndRowSelector());
			}
			dojox.grid.util.funnelEvents(view.contentNode, view, "doContentEvent", ["mouseup"]);
			dojox.grid.util.funnelEvents(view.headerNode, view, "doHeaderEvent", ["mouseup"]);
		});
		dojo.forEach(this.grid.dndDisabledTypes, function (type) {
			this.disableSelecting(type);
		}, this);
		this.disableFeatures();
	}, disableFeatures:function () {
		if (this.selectingDisabledTypes["cell"]) {
			this.cellClick = function () {
			};
			this.drugSelectCell = function () {
			};
		}
		if (this.selectingDisabledTypes["row"]) {
			this.drugSelectRow = function () {
			};
		}
		if (this.selectingDisabledTypes["col"]) {
			this.selectColumn = function () {
			};
			this.drugSelectColumn = function () {
			};
		}
	}, disableSelecting:function (type) {
		this.selectingDisabledTypes[type] = true;
	}, isInSelectingMode:function (type) {
		return !!this.typeSelectingMode[type];
	}, setInSelectingMode:function (type, isEnable) {
		this.typeSelectingMode[type] = isEnable;
	}, getSelectedRegionInfo:function () {
		var selectedIdx = [], type = "";
		if (this.selectedColumns.length > 0) {
			type = "col";
			dojo.forEach(this.selectedColumns, function (item, index) {
				!!item && selectedIdx.push(index);
			});
		} else {
			if (this.grid.selection.getSelectedCount() > 0) {
				type = "row";
				selectedIdx = dojox.grid.Selection.prototype.getSelected.call(this.grid.selection);
			}
		}
		return {"selectionType":type, "selectedIdx":selectedIdx};
	}, clearInSelectingMode:function () {
		this.typeSelectingMode = [];
	}, getHeaderNodes:function () {
		return this.headerNodes == null ? dojo.query("[role*='columnheader']", this.grid.viewsHeaderNode) : this.headerNode;
	}, _range:function (inFrom, inTo, func) {
		var s = (inFrom >= 0 ? inFrom : inTo), e = inTo;
		if (s > e) {
			e = s;
			s = inTo;
		}
		for (var i = s; i <= e; i++) {
			func(i);
		}
	}, cellClick:function (inColIndex, inRowIndex) {
		if (inColIndex > this.exceptColumnsTo) {
			this.grid.selection.clear();
			this.publishRowChange();
			var cellNode = this.getCellNode(inColIndex, inRowIndex);
			this.cleanAll();
			this.addCellToSelection(cellNode);
		}
	}, setDrugStartPoint:function (inColIndex, inRowIndex) {
		this.drugSelectionStart.colIndex = inColIndex;
		this.drugSelectionStart.rowIndex = inRowIndex;
		this.drugCurrentPoint.colIndex = inColIndex;
		this.firstOut = true;
		var moveHandler = dojo.connect(dojo.doc, "onmousemove", dojo.hitch(this, function (e) {
			this.outRangeValue = e.clientY - dojo.coords(this.grid.domNode).y - this.grid.domNode.offsetHeight;
			if (this.outRangeValue > 0) {
				if (this.drugSelectionStart.colIndex == -1) {
					if (!this.outRangeY) {
						this.autoRowScrollDrug(e);
					}
				} else {
					if (this.drugSelectionStart.rowIndex == -1) {
					} else {
						this.autoCellScrollDrug(e);
					}
				}
			} else {
				this.firstOut = true;
				this.outRangeY = false;
			}
		}));
		var upHandler = dojo.connect(dojo.doc, "onmouseup", dojo.hitch(this, function (e) {
			this.outRangeY = false;
			dojo.disconnect(upHandler);
			dojo.disconnect(moveHandler);
			this.grid.onMouseUp(e);
		}));
	}, autoRowScrollDrug:function (e) {
		this.outRangeY = true;
		this.autoSelectNextRow();
	}, autoSelectNextRow:function () {
		if (this.grid.select.outRangeY) {
			this.grid.scrollToRow(this.grid.scroller.firstVisibleRow + 1);
			this.drugSelectRow(this.drugCurrentPoint.rowIndex + 1);
			setTimeout(dojo.hitch(this, "autoSelectNextRow", this.drugCurrentPoint.rowIndex + 1), this.getAutoScrollRate());
		}
	}, autoCellScrollDrug:function (e) {
		var mouseOnCol = null;
		dojo.forEach(this.getHeaderNodes(), function (node) {
			var coord = dojo.coords(node);
			if (e.clientX >= coord.x && e.clientX <= coord.x + coord.w) {
				mouseOnCol = Number(node.attributes.getNamedItem("idx").value);
			}
		});
		if (mouseOnCol != this.drugCurrentPoint.colIndex || this.firstOut) {
			if (!this.firstOut) {
				this.colChanged = true;
				this.drugCurrentPoint.colIndex = mouseOnCol;
			}
			this.firstOut = false;
			this.outRangeY = true;
			dojo.hitch(this, "autoSelectCellInNextRow")();
		}
	}, autoSelectCellInNextRow:function () {
		if (this.grid.select.outRangeY) {
			this.grid.scrollToRow(this.grid.scroller.firstVisibleRow + 1);
			this.drugSelectCell(this.drugCurrentPoint.colIndex, this.drugCurrentPoint.rowIndex + 1);
			if (this.grid.select.colChanged) {
				this.grid.select.colChanged = false;
			} else {
				setTimeout(dojo.hitch(this, "autoSelectCellInNextRow", this.drugCurrentPoint.rowIndex + 1), this.getAutoScrollRate());
			}
		}
	}, getAutoScrollRate:function () {
		return this.autoScrollRate;
	}, resetStartPoint:function () {
		if (this.drugSelectionStart.colIndex == -1 && this.drugSelectionStart.rowIndex == -1) {
			return;
		}
		this.lastDrugSelectionStart = dojo.clone(this.drugSelectionStart);
		this.drugSelectionStart.colIndex = -1;
		this.drugSelectionStart.rowIndex = -1;
	}, restorLastDragPoint:function () {
		this.drugSelectionStart = dojo.clone(this.lastDrugSelectionStart);
	}, drugSelectCell:function (inColumnIndex, inRowIndex) {
		this.cleanAll();
		this.drugCurrentPoint.columnIndex = inColumnIndex;
		this.drugCurrentPoint.rowIndex = inRowIndex;
		var fromRow, toRow, fromCol, toCol;
		if (inRowIndex < this.drugSelectionStart.rowIndex) {
			fromRow = inRowIndex;
			toRow = this.drugSelectionStart.rowIndex;
		} else {
			fromRow = this.drugSelectionStart.rowIndex;
			toRow = inRowIndex;
		}
		if (inColumnIndex < this.drugSelectionStart.colIndex) {
			fromCol = inColumnIndex;
			toCol = this.drugSelectionStart.colIndex;
		} else {
			fromCol = this.drugSelectionStart.colIndex;
			toCol = inColumnIndex;
		}
		for (var i = fromCol; i <= toCol; i++) {
			this.addColumnRangeToSelection(i, fromRow, toRow);
		}
	}, selectColumn:function (columnIndex) {
		this.addColumnToSelection(columnIndex);
	}, drugSelectColumn:function (currentColumnIndex) {
		this.selectColumnRange(this.drugSelectionStart.colIndex, currentColumnIndex);
	}, drugSelectColumnToMax:function (dir) {
		if (dir == "left") {
			this.selectColumnRange(this.drugSelectionStart.colIndex, 0);
		} else {
			this.selectColumnRange(this.drugSelectionStart.colIndex, this.getHeaderNodes().length - 1);
		}
	}, selectColumnRange:function (startIndex, endIndex) {
		if (!this.keepState) {
			this.cleanAll();
		}
		this._range(startIndex, endIndex, dojo.hitch(this, "addColumnToSelection"));
	}, addColumnToSelection:function (columnIndex) {
		this.selectedColumns[columnIndex] = true;
		dojo.toggleClass(this.getHeaderNodes()[columnIndex], "dojoxGridHeaderSelected", true);
		this._rangCellsInColumn(columnIndex, -1, Number.POSITIVE_INFINITY, this.addCellToSelection);
	}, addColumnRangeToSelection:function (columnIndex, from, to) {
		var viewManager = this.grid.views;
		var columnCellNodes = [];
		var dndManager = this;
		dojo.forEach(viewManager.views, function (view) {
			dojo.forEach(this.getViewRowNodes(view.rowNodes), function (rowNode, rowIndex) {
				if (!rowNode) {
					return;
				}
				if (rowIndex >= from && rowIndex <= to) {
					dojo.forEach(rowNode.firstChild.rows[0].cells, function (cell) {
						if (cell && cell.attributes && (idx = cell.attributes.getNamedItem("idx")) && Number(idx.value) == columnIndex) {
							dndManager.addCellToSelection(cell);
						}
					});
				}
			}, this);
		}, this);
	}, _rangCellsInColumn:function (columnIndex, from, to, func) {
		var viewManager = this.grid.views;
		var columnCellNodes = [];
		var dndManager = this;
		dojo.forEach(viewManager.views, function (view) {
			dojo.forEach(this.getViewRowNodes(view.rowNodes), function (rowNode, rowIndex) {
				if (!rowNode) {
					return;
				}
				if (rowIndex >= from && rowIndex <= to) {
					dojo.forEach(rowNode.firstChild.rows[0].cells, function (cell) {
						if (cell && cell.attributes && (idx = cell.attributes.getNamedItem("idx")) && Number(idx.value) == columnIndex) {
							func(cell, dndManager);
						}
					});
				}
			}, this);
		}, this);
	}, drugSelectRow:function (inRowIndex) {
		this.drugCurrentPoint.rowIndex = inRowIndex;
		this.cleanCellSelection();
		this.clearDrugDivs();
		var selection = this.grid.selection;
		selection._beginUpdate();
		if (!this.keepState) {
			selection.deselectAll();
		}
		selection.selectRange(this.drugSelectionStart.rowIndex, inRowIndex);
		selection._endUpdate();
		this.publishRowChange();
	}, drugSelectRowToMax:function (dir) {
		if (dir == "up") {
			this.drugSelectRow(0);
		} else {
			this.drugSelectRow(this.grid.rowCount);
		}
	}, getCellNode:function (inCellIndex, inRowIndex) {
		var rowNodes = [], cellNode = null;
		var viewManager = this.grid.views;
		for (var i = 0, v, n; (v = viewManager.views[i]) && (n = v.getRowNode(inRowIndex)); i++) {
			rowNodes.push(n);
		}
		dojo.forEach(rowNodes, dojo.hitch(function (rowNode, viewIndex) {
			if (cellNode) {
				return;
			}
			var cells = dojo.query("[idx='" + inCellIndex + "']", rowNode);
			if (cells && cells[0]) {
				cellNode = cells[0];
			}
		}));
		return cellNode;
	}, addCellToSelection:function (cellNode, dndManager) {
		if (!dndManager) {
			dndManager = this;
		}
		dndManager.selectedCells[dndManager.selectedCells.length] = cellNode;
		dojo.toggleClass(cellNode, dndManager.selectedClass, true);
	}, isColSelected:function (inColIndex) {
		return this.selectedColumns[inColIndex];
	}, isRowSelected:function (inRowIndex) {
		return this.grid.selection.selected[inRowIndex];
	}, isContinuousSelection:function (selected) {
		var preSelectedIdx = -1;
		for (var i = 0; i < selected.length; i++) {
			if (!selected[i]) {
				continue;
			}
			if (preSelectedIdx < 0 || i - preSelectedIdx == 1) {
				preSelectedIdx = i;
			} else {
				if (i - preSelectedIdx >= 2) {
					return false;
				}
			}
		}
		return preSelectedIdx >= 0 ? true : false;
	}, cleanCellSelection:function () {
		dojo.forEach(this.selectedCells, dojo.hitch(this, "removeCellSelectedState"));
		this.selectedCells = [];
		dojo.forEach(this.selectedColumns, function (selected, index) {
			if (selected) {
				dojo.toggleClass(this.getHeaderNodes()[index], "dojoxGridHeaderSelected", false);
			}
		}, this);
		this.selectedColumns = [];
		this.grid.edit.isEditing() && this.grid.edit.apply();
	}, removeCellSelectedState:function (cell) {
		dojo.toggleClass(cell, this.selectedClass, false);
	}, cleanAll:function () {
		this.cleanCellSelection();
		this.grid.selection.clear();
		this.publishRowChange();
	}, refreshColumnSelection:function () {
		dojo.forEach(this.selectedColumns, dojo.hitch(this, function (selectedColumn, colIndex) {
			if (selectedColumn) {
				this.grid.select.addColumnToSelection(colIndex);
			}
		}));
	}, inSelectedArea:function (inColIndex, inRowIndex) {
		return this.selectedColumns[inColIndex] || this.gird.selection.selecteded[inRowIndex];
	}, publishRowChange:function () {
		dojo.publish(this.grid.rowSelectionChangedTopic, [this]);
	}, getViewRowNodes:function (viewRowNodes) {
		var rowNodes = [];
		for (i in viewRowNodes) {
			rowNodes.push(viewRowNodes[i]);
		}
		return rowNodes;
	}, getFirstSelected:function () {
		return dojo.hitch(this.grid.selection, dojox.grid.Selection.prototype.getFirstSelected)();
	}, getLastSelected:function () {
		var selected = this.grid.selection.selected;
		for (var i = selected.length - 1; i >= 0; i--) {
			if (selected[i]) {
				return i;
			}
		}
		return -1;
	}});
}

