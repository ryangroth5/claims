/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced.plugins.NestedSorting"]) {
	dojo._hasResource["dojox.grid.enhanced.plugins.NestedSorting"] = true;
	dojo.provide("dojox.grid.enhanced.plugins.NestedSorting");
	dojo.declare("dojox.grid.enhanced.plugins.NestedSorting", null, {sortAttrs:[], _unarySortCell:{}, _minColWidth:63, _widthDelta:23, _minColWidthUpdated:false, _sortTipMap:{}, _overResizeWidth:3, storeItemSelected:"storeItemSelectedAttr", exceptionalSelectedItems:[], _a11yText:{"dojoxGridDescending":"&#9662;", "dojoxGridAscending":"&#9652;", "dojoxGridAscendingTip":"&#1784;", "dojoxGridDescendingTip":"&#1783;", "dojoxGridUnsortedTip":"x"}, constructor:function (inGrid) {
		inGrid.mixin(inGrid, this);
		dojo.forEach(inGrid.views.views, function (view) {
			dojo.connect(view, "renderHeader", dojo.hitch(view, inGrid._initSelectCols));
			dojo.connect(view.header, "domousemove", view.grid, "_sychronizeResize");
		});
		inGrid.getSortProps = inGrid._getDsSortAttrs;
		dojo.connect(inGrid, "_onFetchComplete", inGrid, "updateNewRowSelection");
		if (inGrid.indirectSelection && inGrid.rowSelectCell.toggleAllSelection) {
			dojo.connect(inGrid.rowSelectCell, "toggleAllSelection", inGrid, "allSelectionToggled");
		}
		dojo.subscribe(inGrid.rowSelectionChangedTopic, inGrid, inGrid._selectionChanged);
		inGrid.focus.destroy();
		inGrid.focus = new dojox.grid.enhanced.plugins._NestedSortingFocusManager(inGrid);
		dojo.connect(inGrid.views, "render", inGrid, "initAriaInfo");
	}, setSortIndex:function (inIndex, inAsc, e) {
		if (!this.nestedSorting) {
			this.inherited(arguments);
		} else {
			if (this.dnd && !this.dndRowConn) {
				this.dndRowConn = dojo.connect(this.select, "startMoveRows", dojo.hitch(this, this.clearSort));
			}
			this.retainLastRowSelection();
			this.inSorting = true;
			this._toggleProgressTip(true, e);
			this._updateSortAttrs(e, inAsc);
			this.focus.addSortFocus(e);
			if (this.canSort()) {
				this.sort();
				this.edit.info = {};
				this.update();
			}
			this._toggleProgressTip(false, e);
			this.inSorting = false;
		}
	}, _updateSortAttrs:function (e, inAsc) {
		var existing = false;
		var unarySort = !!e.unarySortChoice;
		if (unarySort) {
			var cellSortInfo = this.getCellSortInfo(e.cell);
			var asc = (this.sortAttrs.length > 0 && cellSortInfo["sortPos"] != 1) ? cellSortInfo["unarySortAsc"] : this._getNewSortState(cellSortInfo["unarySortAsc"]);
			if (asc && asc != 0) {
				this.sortAttrs = [{attr:e.cell.field, asc:asc, cell:e.cell, cellNode:e.cellNode}];
				this._unarySortCell = {cell:e.cell, node:e.cellNode};
			} else {
				this.sortAttrs = [];
				this._unarySortCell = null;
			}
		} else {
			this.setCellSortInfo(e, inAsc);
		}
	}, getCellSortInfo:function (cell) {
		if (!cell) {
			return false;
		}
		var cellSortInfo = null;
		var _sortAttrs = this.sortAttrs;
		dojo.forEach(_sortAttrs, function (attr, index, attrs) {
			if (attr && attr["attr"] == cell.field && attr["cell"] == cell) {
				cellSortInfo = {unarySortAsc:attrs[0] ? attrs[0]["asc"] : undefined, nestedSortAsc:attr["asc"], sortPos:index + 1};
			}
		});
		return cellSortInfo ? cellSortInfo : {unarySortAsc:_sortAttrs && _sortAttrs[0] ? _sortAttrs[0]["asc"] : undefined, nestedSortAsc:undefined, sortPos:-1};
	}, setCellSortInfo:function (e, inAsc) {
		var cell = e.cell;
		var existing = false;
		var delAttrs = [];
		var _sortAttrs = this.sortAttrs;
		dojo.forEach(_sortAttrs, dojo.hitch(this, function (attr, index) {
			if (attr && attr["attr"] == cell.field) {
				var si = inAsc ? inAsc : this._getNewSortState(attr["asc"]);
				if (si == 1 || si == -1) {
					attr["asc"] = si;
				} else {
					if (si == 0) {
						delAttrs.push(index);
					} else {
						throw new Exception("Illegal nested sorting status - " + si);
					}
				}
				existing = true;
			}
		}));
		var minus = 0;
		dojo.forEach(delAttrs, function (delIndex) {
			_sortAttrs.splice((delIndex - minus++), 1);
		});
		if (!existing) {
			var si = inAsc ? inAsc : 1;
			if (si != 0) {
				_sortAttrs.push({attr:cell.field, asc:si, cell:e.cell, cellNode:e.cellNode});
			}
		}
		if (delAttrs.length > 0) {
			this._unarySortCell = {cell:_sortAttrs[0]["cell"], node:_sortAttrs[0]["cellNode"]};
		}
	}, _getDsSortAttrs:function () {
		var dsSortAttrs = [];
		var si = null;
		dojo.forEach(this.sortAttrs, function (attr) {
			if (attr && (attr["asc"] == 1 || attr["asc"] == -1)) {
				dsSortAttrs.push({attribute:attr["attr"], descending:(attr["asc"] == -1)});
			}
		});
		return dsSortAttrs.length > 0 ? dsSortAttrs : null;
	}, _getNewSortState:function (si) {
		return si ? (si == 1 ? -1 : (si == -1 ? 0 : 1)) : 1;
	}, sortStateInt2Str:function (si) {
		if (!si) {
			return "Unsorted";
		}
		switch (si) {
		  case 1:
			return "Ascending";
		  case -1:
			return "Descending";
		  default:
			return "Unsorted";
		}
	}, clearSort:function () {
		dojo.query("[id*='Sort']", this.viewsHeaderNode).forEach(function (region) {
			dojo.addClass(region, "dojoxGridUnsorted");
		});
		this.sortAttrs = [];
		this.focus.clearHeaderFocus();
	}, _getNestedSortHeaderContent:function (inCell) {
		var n = inCell.name || inCell.grid.getCellName(inCell);
		if (inCell.grid.pluginMgr.isFixedCell(inCell)) {
			return ["<div class=\"dojoxGridCellContent\">", n, "</div>"].join("");
		}
		var cellSortInfo = inCell.grid.getCellSortInfo(inCell);
		var _sortAttrs = inCell.grid.sortAttrs;
		var inNestedSort = (_sortAttrs && _sortAttrs.length > 1 && cellSortInfo["sortPos"] >= 1);
		var inUnarySort = (_sortAttrs && _sortAttrs.length == 1 && cellSortInfo["sortPos"] == 1);
		var _grid = inCell.grid;
		var ret = ["<div class=\"dojoxGridSortRoot\">", "<div class=\"dojoxGridSortWrapper\">", "<span id=\"selectSortSeparator" + inCell.index + "\" class=\"dojoxGridSortSeparatorOff\"></span>", "<span class=\"dojoxGridNestedSortWrapper\" tabindex=\"-1\">", "<span id=\"" + inCell.view.id + "SortPos" + inCell.index + "\" class=\"dojoxGridSortPos " + (inNestedSort ? "" : "dojoxGridSortPosOff") + "\">" + (inNestedSort ? cellSortInfo["sortPos"] : "") + "</span>", "<span id=\"nestedSortCol" + inCell.index + "\" class=\"dojoxGridSort dojoxGridNestedSort " + (inNestedSort ? ("dojoxGrid" + _grid.sortStateInt2Str(cellSortInfo["nestedSortAsc"])) : "dojoxGridUnsorted") + "\">", _grid._a11yText["dojoxGrid" + _grid.sortStateInt2Str(cellSortInfo["nestedSortAsc"])] || ".", "</span>", "</span>", "<span id=\"SortSeparator" + inCell.index + "\" class=\"dojoxGridSortSeparatorOff\"></span>", "<span class=\"dojoxGridUnarySortWrapper\" tabindex=\"-1\"><span id=\"unarySortCol" + inCell.index + "\" class=\"dojoxGridSort dojoxGridUnarySort " + (inUnarySort ? ("dojoxGrid" + _grid.sortStateInt2Str(cellSortInfo["unarySortAsc"])) : "dojoxGridUnsorted") + "\">", _grid._a11yText["dojoxGrid" + _grid.sortStateInt2Str(cellSortInfo["unarySortAsc"])] || ".", "</span></span>", "</div>", "<div tabindex=\"-1\" id=\"selectCol" + inCell.index + "\" class=\"dojoxGridHeaderCellSelectRegion\"><span id=\"caption" + inCell.index + "\">" + n + "<span></div>", "</div>"];
		return ret.join("");
	}, addHoverSortTip:function (e) {
		this._sortTipMap[e.cellIndex] = true;
		var cellSortInfo = this.getCellSortInfo(e.cell);
		if (!cellSortInfo) {
			return;
		}
		var elements = this._getCellElements(e.cellNode);
		if (!elements) {
			return;
		}
		var _sortAttrs = this.sortAttrs;
		var notSorted = !_sortAttrs || _sortAttrs.length < 1;
		var inUnarySort = (_sortAttrs && _sortAttrs.length == 1 && cellSortInfo["sortPos"] == 1);
		dojo.addClass(elements["selectSortSeparator"], "dojoxGridSortSeparatorOn");
		if (notSorted || inUnarySort) {
			this._addHoverUnarySortTip(elements, cellSortInfo, e);
		} else {
			this._addHoverNestedSortTip(elements, cellSortInfo, e);
			this.updateMinColWidth(elements["nestedSortPos"]);
		}
		var selectRegion = elements["selectRegion"];
		this._fixSelectRegion(selectRegion);
		if (!dijit.hasWaiRole(selectRegion)) {
			dijit.setWaiState(selectRegion, "label", "Column " + (e.cellIndex + 1) + " " + e.cell.field);
		}
		this._toggleHighlight(e.sourceView, e);
		this.focus._updateFocusBorder();
	}, _addHoverUnarySortTip:function (elements, cellSortInfo, e) {
		dojo.addClass(elements["nestedSortWrapper"], "dojoxGridUnsorted");
		var stateStr = this.sortStateInt2Str(this._getNewSortState(cellSortInfo["unarySortAsc"]));
		dijit.setWaiState(elements["unarySortWrapper"], "label", "Column " + (e.cellIndex + 1) + " " + e.cell.field + " - Choose " + stateStr.toLowerCase() + " single sort");
		var className = "dojoxGrid" + stateStr + "Tip";
		dojo.addClass(elements["unarySortChoice"], className);
		elements["unarySortChoice"].innerHTML = this._a11yText[className];
		this._addTipInfo(elements["unarySortWrapper"], this._composeSortTip(stateStr, "singleSort"));
	}, _addHoverNestedSortTip:function (elements, cellSortInfo, e) {
		var nestedSortPos = elements["nestedSortPos"];
		var unarySortWrapper = elements["unarySortWrapper"];
		var nestedSortWrapper = elements["nestedSortWrapper"];
		var _sortAttrs = this.sortAttrs;
		dojo.removeClass(nestedSortWrapper, "dojoxGridUnsorted");
		var stateStr = this.sortStateInt2Str(this._getNewSortState(cellSortInfo["nestedSortAsc"]));
		dijit.setWaiState(nestedSortWrapper, "label", "Column " + (e.cellIndex + 1) + " " + e.cell.field + " - Choose " + stateStr.toLowerCase() + " nested sort");
		var className = "dojoxGrid" + stateStr + "Tip";
		this._addA11yInfo(elements["nestedSortChoice"], className);
		this._addTipInfo(nestedSortWrapper, this._composeSortTip(stateStr, "nestedSort"));
		stateStr = this.sortStateInt2Str(cellSortInfo["unarySortAsc"]);
		dijit.setWaiState(unarySortWrapper, "label", "Column " + (e.cellIndex + 1) + " " + e.cell.field + " - Choose " + stateStr.toLowerCase() + " single sort");
		className = "dojoxGrid" + stateStr + "Tip";
		this._addA11yInfo(elements["unarySortChoice"], className);
		this._addTipInfo(unarySortWrapper, this._composeSortTip(stateStr, "singleSort"));
		dojo.addClass(elements["sortSeparator"], "dojoxGridSortSeparatorOn");
		dojo.removeClass(nestedSortPos, "dojoxGridSortPosOff");
		if (cellSortInfo["sortPos"] < 1) {
			nestedSortPos.innerHTML = (_sortAttrs ? _sortAttrs.length : 0) + 1;
			if (!this._unarySortInFocus() && _sortAttrs && _sortAttrs.length == 1) {
				var unaryNode = this._getUnaryNode();
				unaryNode.innerHTML = "1";
				dojo.removeClass(unaryNode, "dojoxGridSortPosOff");
				dojo.removeClass(unaryNode.parentNode, "dojoxGridUnsorted");
				this._fixSelectRegion(this._getCellElements(unaryNode)["selectRegion"]);
			}
		}
	}, _unarySortInFocus:function () {
		return this._unarySortCell.cell && this.focus.headerCellInFocus(this._unarySortCell.cell.index);
	}, _composeSortTip:function (state, type) {
		state = state.toLowerCase();
		if (state == "unsorted") {
			return this._nls[state];
		} else {
			var tip = dojo.string.substitute(this._nls["sortingState"], [this._nls[type], this._nls[state]]);
			return tip;
		}
	}, _addTipInfo:function (node, text) {
		dojo.attr(node, "title", text);
		dojo.query("span", node).forEach(function (n) {
			dojo.attr(n, "title", text);
		});
	}, _addA11yInfo:function (node, className) {
		dojo.addClass(node, className);
		node.innerHTML = this._a11yText[className];
	}, removeHoverSortTip:function (e) {
		if (!this._sortTipMap[e.cellIndex]) {
			return;
		}
		var cellSortInfo = this.getCellSortInfo(e.cell);
		if (!cellSortInfo) {
			return;
		}
		var elements = this._getCellElements(e.cellNode);
		if (!elements) {
			return;
		}
		var nestedSortChoice = elements.nestedSortChoice;
		var unarySortChoice = elements.unarySortChoice;
		var unarySortWrapper = elements.unarySortWrapper;
		var nestedSortWrapper = elements.nestedSortWrapper;
		this._toggleHighlight(e.sourceView, e, true);
		function _removeTipClass(nodes) {
			dojo.forEach(nodes, function (node) {
				var newClasses = dojo.trim((" " + node["className"] + " ").replace(/\sdojoxGrid\w+Tip\s/g, " "));
				if (node["className"] != newClasses) {
					node["className"] = newClasses;
				}
			});
		}
		_removeTipClass([nestedSortChoice, unarySortChoice]);
		unarySortChoice.innerHTML = this._a11yText["dojoxGrid" + this.sortStateInt2Str(cellSortInfo["unarySortAsc"])] || ".";
		nestedSortChoice.innerHTML = this._a11yText["dojoxGrid" + this.sortStateInt2Str(cellSortInfo["nestedSortAsc"])] || ".";
		dojo.removeClass(elements["selectSortSeparator"], "dojoxGridSortSeparatorOn");
		dojo.removeClass(elements["sortSeparator"], "dojoxGridSortSeparatorOn");
		if (cellSortInfo["sortPos"] == 1 && this.focus.isNavHeader() && !this.focus.headerCellInFocus(e.cellIndex)) {
			dojo.removeClass(elements["nestedSortWrapper"], "dojoxGridUnsorted");
		}
		var _sortAttrs = this.sortAttrs;
		if (!isNaN(cellSortInfo["sortPos"]) && cellSortInfo["sortPos"] < 1) {
			elements["nestedSortPos"].innerHTML = "";
			dojo.addClass(nestedSortWrapper, "dojoxGridUnsorted");
			if (!this.focus._focusBorderBox && _sortAttrs && _sortAttrs.length == 1) {
				var unaryNode = this._getUnaryNode();
				unaryNode.innerHTML = "";
				dojo.addClass(unaryNode, "dojoxGridSortPosOff");
				this._fixSelectRegion(this._getCellElements(unaryNode)["selectRegion"]);
			}
		}
		this._fixSelectRegion(elements["selectRegion"]);
		dijit.removeWaiState(nestedSortWrapper, "label");
		dijit.removeWaiState(unarySortWrapper, "label");
		if (cellSortInfo["sortPos"] >= 0) {
			var singleSort = (_sortAttrs.length == 1);
			var node = singleSort ? unarySortWrapper : nestedSortWrapper;
			this._setSortRegionWaiState(singleSort, e.cellIndex, e.cell.field, cellSortInfo["sortPos"], node);
		}
		this.focus._updateFocusBorder();
		this._sortTipMap[e.cellIndex] = false;
	}, _getUnaryNode:function () {
		for (var i = 0; i < this.views.views.length; i++) {
			var n = dojo.byId(this.views.views[i].id + "SortPos" + this._unarySortCell.cell.index);
			if (n) {
				return n;
			}
		}
	}, _fixSelectRegion:function (selectRegion) {
		var sortWrapper = selectRegion.previousSibling;
		var parentBox = dojo.contentBox(selectRegion.parentNode);
		var selectRegionBox = dojo.marginBox(selectRegion);
		var sortWrapperBox = dojo.marginBox(sortWrapper);
		if (dojo.isIE && !dojo._isBodyLtr()) {
			var w = 0;
			dojo.forEach(sortWrapper.childNodes, function (node) {
				w += dojo.marginBox(node).w;
			});
			sortWrapperBox.w = w;
			sortWrapperBox.l = (sortWrapperBox.t = 0);
			dojo.marginBox(sortWrapper, sortWrapperBox);
		}
		if (selectRegionBox.w != (parentBox.w - sortWrapperBox.w)) {
			selectRegionBox.w = parentBox.w - sortWrapperBox.w;
			if (!dojo.isWebKit) {
				dojo.marginBox(selectRegion, selectRegionBox);
			} else {
				selectRegionBox.h = dojo.contentBox(parentBox).h;
				dojo.style(selectRegion, "width", (selectRegionBox.w - 4) + "px");
			}
		}
	}, updateMinColWidth:function (nestedSortPos) {
		if (this._minColWidthUpdated) {
			return;
		}
		var oldValue = nestedSortPos.innerHTML;
		nestedSortPos.innerHTML = dojo.query(".dojoxGridSortWrapper", this.viewsHeaderNode).length;
		var sortWrapper = nestedSortPos.parentNode.parentNode;
		this._minColWidth = dojo.marginBox(sortWrapper).w + this._widthDelta;
		nestedSortPos.innerHTML = oldValue;
		this._minColWidthUpdated = true;
	}, getMinColWidth:function () {
		return this._minColWidth;
	}, _initSelectCols:function () {
		var selectRegions = dojo.query(".dojoxGridHeaderCellSelectRegion", this.headerContentNode);
		var unarySortWrappers = dojo.query(".dojoxGridUnarySortWrapper", this.headerContentNode);
		var nestedSortWrappers = dojo.query(".dojoxGridNestedSortWrapper", this.headerContentNode);
		selectRegions.concat(unarySortWrappers).concat(nestedSortWrappers).forEach(function (region) {
			dojo.connect(region, "onmousemove", dojo.hitch(this.grid, this.grid._toggleHighlight, this));
			dojo.connect(region, "onmouseout", dojo.hitch(this.grid, this.grid._removeActiveState));
		}, this);
		this.grid._fixHeaderCellStyle(selectRegions, this);
		if (dojo.isIE && !dojo._isBodyLtr()) {
			this.grid._fixAllSelectRegion();
		}
	}, _fixHeaderCellStyle:function (selectRegions, cellView) {
		dojo.forEach(selectRegions, dojo.hitch(this, function (selectRegion) {
			var selectRegionBox = dojo.marginBox(selectRegion), elements = this._getCellElements(selectRegion), sortWrapper = elements.sortWrapper;
			sortWrapper.style.height = selectRegionBox.h + "px";
			sortWrapper.style.lineHeight = selectRegionBox.h + "px";
			var selectSortSeparator = elements["selectSortSeparator"], sortSeparator = elements["sortSeparator"];
			sortSeparator.style.height = selectSortSeparator.style.height = selectRegionBox.h * 3 / 5 + "px";
			sortSeparator.style.marginTop = selectSortSeparator.style.marginTop = selectRegionBox.h * 1 / 5 + "px";
			cellView.header.overResizeWidth = this._overResizeWidth;
		}));
	}, _fixAllSelectRegion:function () {
		var nodes = dojo.query(".dojoxGridHeaderCellSelectRegion", this.viewsHeaderNode);
		dojo.forEach(nodes, dojo.hitch(this, function (node) {
			this._fixSelectRegion(node);
		}));
	}, _toggleHighlight:function (cellView, e, allOff) {
		if (!e.target || !e.type || !e.type.match(/mouse|contextmenu/)) {
			return;
		}
		var elements = this._getCellElements(e.target);
		if (!elements) {
			return;
		}
		var selectRegion = elements["selectRegion"];
		var nestedSortWrapper = elements["nestedSortWrapper"];
		var unarySortWrapper = elements["unarySortWrapper"];
		dojo.removeClass(selectRegion, "dojoxGridSelectRegionHover");
		dojo.removeClass(nestedSortWrapper, "dojoxGridSortHover");
		dojo.removeClass(unarySortWrapper, "dojoxGridSortHover");
		if (!allOff && !cellView.grid._inResize(cellView)) {
			var info = this._getSortEventInfo(e);
			if (info.selectChoice) {
				dojo.addClass(selectRegion, "dojoxGridSelectRegionHover");
			} else {
				if (info.nestedSortChoice) {
					dojo.addClass(nestedSortWrapper, "dojoxGridSortHover");
				} else {
					if (info.unarySortChoice) {
						dojo.addClass(unarySortWrapper, "dojoxGridSortHover");
					}
				}
			}
		}
	}, _removeActiveState:function (e) {
		if (!e.target || !e.type || !e.type.match(/mouse|contextmenu/)) {
			return;
		}
		var node = this._getChoiceRegion(e.target, this._getSortEventInfo(e));
		node && dojo.removeClass(node, this.headerCellActiveClass);
	}, _toggleProgressTip:function (on, e) {
		var tipNodes = [this.domNode, e ? e.cellNode : null];
		setTimeout(function () {
			dojo.forEach(tipNodes, function (node) {
				if (node) {
					if (on && !dojo.hasClass(node, "dojoxGridSortInProgress")) {
						dojo.addClass(node, "dojoxGridSortInProgress");
					} else {
						if (!on && dojo.hasClass(node, "dojoxGridSortInProgress")) {
							dojo.removeClass(node, "dojoxGridSortInProgress");
						}
					}
				}
			});
		}, 0.1);
	}, _getSortEventInfo:function (e) {
		var _isRegionTypeByCSS = function (node, css) {
			return dojo.hasClass(node, css) || (node.parentNode && dojo.hasClass(node.parentNode, css));
		};
		return {selectChoice:_isRegionTypeByCSS(e.target, "dojoxGridHeaderCellSelectRegion"), unarySortChoice:_isRegionTypeByCSS(e.target, "dojoxGridUnarySortWrapper"), nestedSortChoice:_isRegionTypeByCSS(e.target, "dojoxGridNestedSortWrapper")};
	}, ignoreEvent:function (e) {
		return !(e.nestedSortChoice || e.unarySortChoice || e.selectChoice);
	}, doheaderclick:function (e) {
		if (this.nestedSorting) {
			if (e.selectChoice) {
				this.onHeaderCellSelectClick(e);
			} else {
				if ((e.unarySortChoice || e.nestedSortChoice) && !this._inResize(e.sourceView)) {
					this.onHeaderCellSortClick(e);
				}
			}
			return;
		}
		this.inherited(arguments);
	}, onHeaderCellSelectClick:function (e) {
	}, onHeaderCellSortClick:function (e) {
		this.setSortIndex(e.cell.index, null, e);
	}, _sychronizeResize:function (e) {
		if (!e.cell || e.cell.isRowSelector || this.focus.headerCellInFocus(e.cellIndex)) {
			return;
		}
		if (!this._inResize(e.sourceView)) {
			this.addHoverSortTip(e);
		} else {
			var idx = e.cellIndex;
			if (!this._sortTipMap[e.cellIndex]) {
				e.cellIndex = this._sortTipMap[idx + 1] ? (idx + 1) : (this._sortTipMap[idx - 1] ? (idx - 1) : idx);
				e.cellNode = e.cellNode.parentNode.childNodes[e.cellIndex];
			}
			this.removeHoverSortTip(e);
		}
	}, _getCellElements:function (node) {
		try {
			while (node && node.nodeName.toLowerCase() != "th") {
				node = node.parentNode;
			}
			if (!node) {
				return null;
			}
			var ns = dojo.query(".dojoxGridSortRoot", node);
			if (ns.length != 1) {
				return null;
			}
			var n = ns[0];
			return {"selectSortSeparator":dojo.query("[id^='selectSortSeparator']", n)[0], "nestedSortPos":dojo.query(".dojoxGridSortPos", n)[0], "nestedSortChoice":dojo.query("[id^='nestedSortCol']", n)[0], "sortSeparator":dojo.query("[id^='SortSeparator']", n)[0], "unarySortChoice":dojo.query("[id^='unarySortCol']", n)[0], "selectRegion":dojo.query(".dojoxGridHeaderCellSelectRegion", n)[0], "sortWrapper":dojo.query(".dojoxGridSortWrapper", n)[0], "unarySortWrapper":dojo.query(".dojoxGridUnarySortWrapper", n)[0], "nestedSortWrapper":dojo.query(".dojoxGridNestedSortWrapper", n)[0], "sortRoot":n, "headCellNode":node};
		}
		catch (e) {
			console.debug("NestedSorting._getCellElemets() error:" + e);
		}
		return null;
	}, _getChoiceRegion:function (target, choiceInfo) {
		var node, elements = this._getCellElements(target);
		if (!elements) {
			return;
		}
		choiceInfo.unarySortChoice && (node = elements["unarySortWrapper"]);
		choiceInfo.nestedSortChoice && (node = elements["nestedSortWrapper"]);
		choiceInfo.selectChoice && (node = elements["selectRegion"]);
		return node;
	}, _inResize:function (view) {
		return view.header.moverDiv || dojo.hasClass(view.headerNode, "dojoxGridColResize") || dojo.hasClass(view.headerNode, "dojoxGridColNoResize");
	}, retainLastRowSelection:function () {
		dojo.forEach(this._by_idx, function (o, idx) {
			if (!o || !o.item) {
				return;
			}
			var selected = !!this.selection.isSelected(idx);
			o.item[this.storeItemSelected] = [selected];
			if (this.indirectSelection && this.rowSelectCell.toggleAllTrigerred && selected != this.toggleAllValue) {
				this.exceptionalSelectedItems.push(o.item);
			}
		}, this);
		this.selection.clear();
		dojo.publish(this.sortRowSelectionChangedTopic, [this]);
	}, updateNewRowSelection:function (items, req) {
		dojo.forEach(items, function (item, idx) {
			if (this.indirectSelection && this.rowSelectCell.toggleAllTrigerred) {
				if (dojo.indexOf(this.exceptionalSelectedItems, item) < 0) {
					item[this.storeItemSelected] = [this.toggleAllValue];
				}
			}
			item[this.storeItemSelected] && item[this.storeItemSelected][0] && this.selection.addToSelection(req.start + idx);
		}, this);
		dojo.publish(this.sortRowSelectionChangedTopic, [this]);
		if (dojo.isMoz && this._by_idx.length == 0) {
			this.update();
		}
	}, allSelectionToggled:function (checked) {
		this.exceptionalSelectedItems = [];
		this.toggleAllValue = this.rowSelectCell.defaultValue;
	}, _selectionChanged:function (obj) {
		obj == this.select && (this.toggleAllValue = false);
	}, getStoreSelectedValue:function (rowIdx) {
		var data = this._by_idx[rowIdx];
		return data && data.item && !!(data.item[this.storeItemSelected] && data.item[this.storeItemSelected][0]);
	}, initAriaInfo:function () {
		var _sortAttrs = this.sortAttrs;
		dojo.forEach(_sortAttrs, dojo.hitch(this, function (attr, index) {
			var cellNode = attr.cell.getHeaderNode();
			var elements = this._getCellElements(cellNode);
			if (!elements) {
				return;
			}
			var selectRegion = elements["selectRegion"];
			dijit.setWaiState(selectRegion, "label", "Column " + (attr.cell.index + 1) + " " + attr.attr);
			var singleSort = (_sortAttrs.length == 1);
			var sortState = this.sortStateInt2Str(attr.asc).toLowerCase();
			var node = singleSort ? elements["unarySortWrapper"] : elements["nestedSortWrapper"];
			dijit.setWaiState(node, "sort", sortState);
			this._setSortRegionWaiState(singleSort, attr.cell.index, attr.attr, index + 1, node);
		}));
	}, _setSortRegionWaiState:function (singleSort, cellIdx, field, sortPos, node) {
		if (sortPos < 0) {
			return;
		}
		var sortType = singleSort ? "single sort" : "nested sort";
		var ariaValue = "Column " + (cellIdx + 1) + " " + field + " " + sortType + " " + (!singleSort ? (" sort position " + sortPos) : "");
		dijit.setWaiState(node, "label", ariaValue);
	}, _inPage:function (rowIndex) {
		return rowIndex < this._bop || rowIndex >= this._eop;
	}});
	dojo.declare("dojox.grid.enhanced.plugins._NestedSortingFocusManager", dojox.grid._FocusManager, {lastHeaderFocus:{cellNode:null, regionIdx:-1}, currentHeaderFocusEvt:null, cssMarkers:["dojoxGridHeaderCellSelectRegion", "dojoxGridNestedSortWrapper", "dojoxGridUnarySortWrapper"], _focusBorderBox:null, _initColumnHeaders:function () {
		var headerNodes = this._findHeaderCells();
		dojo.forEach(headerNodes, dojo.hitch(this, function (headerNode) {
			var selectRegion = dojo.query(".dojoxGridHeaderCellSelectRegion", headerNode);
			var sortRegions = dojo.query("[class*='SortWrapper']", headerNode);
			selectRegion = selectRegion.concat(sortRegions);
			selectRegion.length == 0 && (selectRegion = [headerNode]);
			dojo.forEach(selectRegion, dojo.hitch(this, function (node) {
				this._connects.push(dojo.connect(node, "onfocus", this, "doColHeaderFocus"));
				this._connects.push(dojo.connect(node, "onblur", this, "doColHeaderBlur"));
			}));
		}));
	}, focusHeader:function (leadingDir, delayed, ignoreRegionPos) {
		if (!this.isNavHeader()) {
			this.inherited(arguments);
		} else {
			var headerNodes = this._findHeaderCells();
			this._colHeadNode = headerNodes[this._colHeadFocusIdx];
			delayed && (this.lastHeaderFocus.cellNode = this._colHeadNode);
		}
		if (!this._colHeadNode) {
			return;
		}
		if (this.grid.indirectSelection && this._colHeadFocusIdx == 0) {
			this._colHeadNode = this._findHeaderCells()[++this._colHeadFocusIdx];
		}
		var focusRegionIdx = ignoreRegionPos ? 0 : (this.lastHeaderFocus.regionIdx >= 0 ? this.lastHeaderFocus.regionIdx : (leadingDir ? 2 : 0));
		var focusRegion = dojo.query("." + this.cssMarkers[focusRegionIdx], this._colHeadNode)[0] || this._colHeadNode;
		this.grid.addHoverSortTip(this.currentHeaderFocusEvt = this._mockEvt(focusRegion));
		this.lastHeaderFocus.regionIdx = focusRegionIdx;
		focusRegion && dojox.grid.util.fire(focusRegion, "focus");
	}, focusSelectColEndingHeader:function (e) {
		if (!e || !e.cellNode) {
			return;
		}
		this._colHeadFocusIdx = e.cellIndex;
		this.focusHeader(null, false, true);
	}, _delayedHeaderFocus:function () {
		this.isNavHeader() && this.focusHeader(null, true);
	}, _setActiveColHeader:function (colHeaderNode, colFocusIdx, prevColFocusIdx) {
		dojo.attr(this.grid.domNode, "aria-activedescendant", colHeaderNode.id);
		this._colHeadNode = colHeaderNode;
		this._colHeadFocusIdx = colFocusIdx;
	}, doColHeaderFocus:function (e) {
		this.lastHeaderFocus.cellNode = this._colHeadNode;
		if (e.target == this._colHeadNode) {
			this._scrollHeader(this.getHeaderIndex());
		} else {
			var focusView = this.getFocusView(e);
			if (!focusView) {
				return;
			}
			focusView.header.baseDecorateEvent(e);
			this._addFocusBorder(e.target);
			this._colHeadFocusIdx = e.cellIndex;
			this._colHeadNode = this._findHeaderCells()[this._colHeadFocusIdx];
			this._colHeadNode && this.getHeaderIndex() != -1 && this._scrollHeader(this._colHeadFocusIdx);
		}
		this._focusifyCellNode(false);
		this.grid.isDndSelectEnable && this.grid.focus._blurRowBar();
		this.grid.addHoverSortTip(this.currentHeaderFocusEvt = this._mockEvt(e.target));
		if (dojo.isIE && !dojo._isBodyLtr()) {
			this.grid._fixAllSelectRegion();
		}
	}, doColHeaderBlur:function (e) {
		this.inherited(arguments);
		this._removeFocusBorder();
		if (!this.isNavCellRegion) {
			var focusView = this.getFocusView(e);
			if (!focusView) {
				return;
			}
			focusView.header.baseDecorateEvent(e);
			this.grid.removeHoverSortTip(e);
			this.lastHeaderFocus.cellNode = this._colHeadNode;
		}
	}, getFocusView:function (e) {
		var focusView;
		dojo.forEach(this.grid.views.views, function (view) {
			if (!focusView) {
				var viewBox = dojo.coords(view.domNode), targetBox = dojo.coords(e.target);
				var inRange = targetBox.x >= viewBox.x && targetBox.x <= (viewBox.x + viewBox.w);
				inRange && (focusView = view);
			}
		});
		return (this.focusView = focusView);
	}, _mockEvt:function (region) {
		var cell = this.grid.getCell(this._colHeadFocusIdx);
		return {target:region, cellIndex:this._colHeadFocusIdx, cell:cell, cellNode:this._colHeadNode, clientX:-1, sourceView:cell.view};
	}, navHeader:function (e) {
		var offset = e.ctrlKey ? 0 : (e.keyCode == dojo.keys.LEFT_ARROW) ? -1 : 1;
		!dojo._isBodyLtr() && (offset *= -1);
		this.focusView.header.baseDecorateEvent(e);
		dojo.forEach(this.cssMarkers, dojo.hitch(this, function (css, index) {
			if (dojo.hasClass(e.target, css)) {
				var newPos = index + offset, region, nextRegion;
				do {
					region = dojo.query("." + this.cssMarkers[newPos], e.cellNode)[0];
					if (region && dojo.style(region.lastChild || region.firstChild, "display") != "none") {
						nextRegion = region;
						break;
					}
					newPos += offset;
				} while (newPos >= 0 && newPos < this.cssMarkers.length);
				if (nextRegion && newPos >= 0 && newPos < this.cssMarkers.length) {
					if (e.ctrlKey) {
						return;
					}
					dojo.isIE && (this.grid._sortTipMap[e.cellIndex] = false);
					this.navCellRegion(nextRegion, newPos);
					return;
				}
				var delta = newPos < 0 ? -1 : (newPos >= this.cssMarkers.length ? 1 : 0);
				this.navHeaderNode(delta);
			}
		}));
	}, navHeaderNode:function (delta, ignoreRegionPos) {
		var _newColHeadFocusIdx = this._colHeadFocusIdx + delta;
		var headers = this._findHeaderCells();
		while (_newColHeadFocusIdx >= 0 && _newColHeadFocusIdx < headers.length && headers[_newColHeadFocusIdx].style.display == "none") {
			_newColHeadFocusIdx += delta;
		}
		if (this.grid.indirectSelection && _newColHeadFocusIdx == 0) {
			return;
		}
		if (delta != 0 && _newColHeadFocusIdx >= 0 && _newColHeadFocusIdx < this.grid.layout.cells.length) {
			this.lastHeaderFocus.cellNode = this._colHeadNode;
			this.lastHeaderFocus.regionIdx = -1;
			this._colHeadFocusIdx = _newColHeadFocusIdx;
			this.focusHeader(delta < 0 ? true : false, false, ignoreRegionPos);
		}
	}, navCellRegion:function (nextRegion, newPos) {
		this.isNavCellRegion = true;
		dojox.grid.util.fire(nextRegion, "focus");
		this.currentHeaderFocusEvt.target = nextRegion;
		this.lastHeaderFocus.regionIdx = newPos;
		var selectRegion = newPos == 0 ? nextRegion : nextRegion.parentNode.nextSibling;
		selectRegion && this.grid._fixSelectRegion(selectRegion);
		this.isNavCellRegion = false;
	}, headerCellInFocus:function (cellIndex) {
		return (this._colHeadFocusIdx == cellIndex) && this._focusBorderBox;
	}, clearHeaderFocus:function () {
		this._colHeadNode = this._colHeadFocusIdx = null;
		this.lastHeaderFocus = {cellNode:null, regionIdx:-1};
	}, addSortFocus:function (e) {
		var cellSortInfo = this.grid.getCellSortInfo(e.cell);
		if (!cellSortInfo) {
			return;
		}
		var _sortAttrs = this.grid.sortAttrs;
		var notSorted = !_sortAttrs || _sortAttrs.length < 1;
		var inUnarySort = (_sortAttrs && _sortAttrs.length == 1 && cellSortInfo["sortPos"] == 1);
		this._colHeadFocusIdx = e.cellIndex;
		this._colHeadNode = e.cellNode;
		this.currentHeaderFocusEvt = {};
		this.lastHeaderFocus.regionIdx = (notSorted || inUnarySort) ? 2 : (e.nestedSortChoice ? 1 : 0);
	}, _addFocusBorder:function (node) {
		if (!node) {
			return;
		}
		this._removeFocusBorder();
		this._focusBorderBox = dojo.create("div");
		this._focusBorderBox.className = "dojoxGridFocusBorderBox";
		dojo.toggleClass(node, "dojoxGridSelectRegionFocus", true);
		dojo.toggleClass(node, "dojoxGridSelectRegionHover", false);
		var nodeH = node.offsetHeight;
		if (node.hasChildNodes()) {
			node.insertBefore(this._focusBorderBox, node.firstChild);
		} else {
			node.appendChild(this._focusBorderBox);
		}
		var _d = {"l":0, "t":0, "r":0, "b":0};
		for (var i in _d) {
			_d[i] = dojo.create("div");
		}
		var pos = {x:dojo.coords(node).x - dojo.coords(this._focusBorderBox).x, y:dojo.coords(node).y - dojo.coords(this._focusBorderBox).y, w:node.offsetWidth, h:nodeH};
		for (var i in _d) {
			var n = _d[i];
			dojo.addClass(n, "dojoxGridFocusBorder");
			dojo.style(n, "top", pos.y + "px");
			dojo.style(n, "left", pos.x + "px");
			this._focusBorderBox.appendChild(n);
		}
		var normalize = function (val) {
			return val > 0 ? val : 0;
		};
		dojo.style(_d.r, "left", normalize(pos.x + pos.w - 1) + "px");
		dojo.style(_d.b, "top", normalize(pos.y + pos.h - 1) + "px");
		dojo.style(_d.l, "height", normalize(pos.h - 1) + "px");
		dojo.style(_d.r, "height", normalize(pos.h - 1) + "px");
		dojo.style(_d.t, "width", normalize(pos.w - 1) + "px");
		dojo.style(_d.b, "width", normalize(pos.w - 1) + "px");
	}, _updateFocusBorder:function () {
		if (this._focusBorderBox == null) {
			return;
		}
		this._addFocusBorder(this._focusBorderBox.parentNode);
	}, _removeFocusBorder:function () {
		if (this._focusBorderBox && this._focusBorderBox.parentNode) {
			dojo.toggleClass(this._focusBorderBox.parentNode, "dojoxGridSelectRegionFocus", false);
			this._focusBorderBox.parentNode.removeChild(this._focusBorderBox);
		}
		this._focusBorderBox = null;
	}});
}

