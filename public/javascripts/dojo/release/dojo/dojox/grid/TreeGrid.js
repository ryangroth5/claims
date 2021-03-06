/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.TreeGrid"]) {
	dojo._hasResource["dojox.grid.TreeGrid"] = true;
	dojo.experimental("dojox.grid.TreeGrid");
	dojo.provide("dojox.grid.TreeGrid");
	dojo.require("dojox.grid.DataGrid");
	dojo.require("dojox.grid._TreeView");
	dojo.require("dojox.grid.cells.tree");
	dojo.require("dojox.grid.TreeSelection");
	dojo.declare("dojox.grid._TreeAggregator", null, {cells:[], grid:null, childFields:[], constructor:function (kwArgs) {
		this.cells = kwArgs.cells || [];
		this.childFields = kwArgs.childFields || [];
		this.grid = kwArgs.grid;
		this.store = this.grid.store;
	}, _cacheValue:function (cache, id, value) {
		cache[id] = value;
		return value;
	}, clearSubtotalCache:function () {
		if (this.store) {
			delete this.store._cachedAggregates;
		}
	}, cnt:function (cell, level, item) {
		var total = 0;
		var store = this.store;
		var childFields = this.childFields;
		if (childFields[level]) {
			var children = store.getValues(item, childFields[level]);
			if (cell.index <= level + 1) {
				total = children.length;
			} else {
				dojo.forEach(children, function (c) {
					total += this.getForCell(cell, level + 1, c, "cnt");
				}, this);
			}
		} else {
			total = 1;
		}
		return total;
	}, sum:function (cell, level, item) {
		var total = 0;
		var store = this.store;
		var childFields = this.childFields;
		if (childFields[level]) {
			dojo.forEach(store.getValues(item, childFields[level]), function (c) {
				total += this.getForCell(cell, level + 1, c, "sum");
			}, this);
		} else {
			total += store.getValue(item, cell.field);
		}
		return total;
	}, value:function (cell, level, item) {
	}, getForCell:function (cell, level, item, type) {
		var store = this.store;
		if (!store || !item || !store.isItem(item)) {
			return "";
		}
		var storeCache = store._cachedAggregates = store._cachedAggregates || {};
		var id = store.getIdentity(item);
		var itemCache = storeCache[id] = storeCache[id] || [];
		if (!cell.getOpenState) {
			cell = this.grid.getCell(cell.layoutIndex + level + 1);
		}
		var idx = cell.index;
		var idxCache = itemCache[idx] = itemCache[idx] || {};
		type = (type || (cell.parentCell ? cell.parentCell.aggregate : "sum")) || "sum";
		var attr = cell.field;
		if (attr == store.getLabelAttributes()[0]) {
			type = "cnt";
		}
		var typeCache = idxCache[type] = idxCache[type] || [];
		if (typeCache[level] != undefined) {
			return typeCache[level];
		}
		var field = ((cell.parentCell && cell.parentCell.itemAggregates) ? cell.parentCell.itemAggregates[cell.idxInParent] : "") || "";
		if (field && store.hasAttribute(item, field)) {
			return this._cacheValue(typeCache, level, store.getValue(item, field));
		} else {
			if (field) {
				return this._cacheValue(typeCache, level, 0);
			}
		}
		return this._cacheValue(typeCache, level, this[type](cell, level, item));
	}});
	dojo.declare("dojox.grid._TreeLayout", dojox.grid._Layout, {_isCollapsable:false, _getInternalStructure:function (inStructure) {
		var g = this.grid;
		var s = inStructure;
		var cells = s[0].cells[0];
		var tree = {type:"dojox.grid._TreeView", cells:[[]]};
		var cFields = [];
		var maxLevels = 0;
		var getTreeCells = function (parentCell, level) {
			var children = parentCell.children;
			var cloneTreeCell = function (originalCell, idx) {
				var k, n = {};
				for (k in originalCell) {
					n[k] = originalCell[k];
				}
				n = dojo.mixin(n, {level:level, idxInParent:level > 0 ? idx : -1, parentCell:level > 0 ? parentCell : null});
				return n;
			};
			var ret = [];
			dojo.forEach(children, function (c, idx) {
				if ("children" in c) {
					cFields.push(c.field);
					var last = ret[ret.length - 1];
					last.isCollapsable = true;
					c.level = level;
					ret = ret.concat(getTreeCells(c, level + 1));
				} else {
					ret.push(cloneTreeCell(c, idx));
				}
			});
			maxLevels = Math.max(maxLevels, level);
			return ret;
		};
		var tCell = {children:cells, itemAggregates:[]};
		tree.cells[0] = getTreeCells(tCell, 0);
		g.aggregator = new dojox.grid._TreeAggregator({cells:tree.cells[0], grid:g, childFields:cFields});
		if (g.scroller && g.defaultOpen) {
			g.scroller.defaultRowHeight = g.scroller._origDefaultRowHeight * (2 * maxLevels + 1);
		}
		return [tree];
	}, setStructure:function (inStructure) {
		var s = inStructure;
		var g = this.grid;
		if (g && g.treeModel && !dojo.every(s, function (i) {
			return ("cells" in i);
		})) {
			s = arguments[0] = [{cells:[s]}];
		}
		if (s.length == 1 && s[0].cells.length == 1) {
			if (g && g.treeModel) {
				s[0].type = "dojox.grid._TreeView";
				this._isCollapsable = true;
				s[0].cells[0][(this.grid.treeModel ? this.grid.expandoCell : 0)].isCollapsable = true;
			} else {
				var childCells = dojo.filter(s[0].cells[0], function (c) {
					return ("children" in c);
				});
				if (childCells.length === 1) {
					this._isCollapsable = true;
				}
			}
		}
		if (this._isCollapsable && (!g || !g.treeModel)) {
			arguments[0] = this._getInternalStructure(s);
		}
		this.inherited(arguments);
	}, addCellDef:function (inRowIndex, inCellIndex, inDef) {
		var obj = this.inherited(arguments);
		return dojo.mixin(obj, dojox.grid.cells.TreeCell);
	}});
	dojo.declare("dojox.grid.TreePath", null, {level:0, _str:"", _arr:null, grid:null, store:null, cell:null, item:null, constructor:function (path, grid) {
		if (dojo.isString(path)) {
			this._str = path;
			this._arr = dojo.map(path.split("/"), function (item) {
				return parseInt(item, 10);
			});
		} else {
			if (dojo.isArray(path)) {
				this._str = path.join("/");
				this._arr = path.slice(0);
			} else {
				if (typeof path == "number") {
					this._str = String(path);
					this._arr = [path];
				} else {
					this._str = path._str;
					this._arr = path._arr.slice(0);
				}
			}
		}
		this.level = this._arr.length - 1;
		this.grid = grid;
		this.store = this.grid.store;
		if (grid.treeModel) {
			this.cell = grid.layout.cells[grid.expandoCell];
		} else {
			this.cell = grid.layout.cells[this.level];
		}
	}, item:function () {
		if (!this._item) {
			this._item = this.grid.getItem(this._arr);
		}
		return this._item;
	}, compare:function (path) {
		if (dojo.isString(path) || dojo.isArray(path)) {
			if (this._str == path) {
				return 0;
			}
			if (path.join && this._str == path.join("/")) {
				return 0;
			}
			path = new dojox.grid.TreePath(path, this.grid);
		} else {
			if (path instanceof dojox.grid.TreePath) {
				if (this._str == path._str) {
					return 0;
				}
			}
		}
		for (var i = 0, l = (this._arr.length < path._arr.length ? this._arr.length : path._arr.length); i < l; i++) {
			if (this._arr[i] < path._arr[i]) {
				return -1;
			}
			if (this._arr[i] > path._arr[i]) {
				return 1;
			}
		}
		if (this._arr.length < path._arr.length) {
			return -1;
		}
		if (this._arr.length > path._arr.length) {
			return 1;
		}
		return 0;
	}, isOpen:function () {
		return this.cell.openStates && this.cell.getOpenState(this.item());
	}, previous:function () {
		var new_path = this._arr.slice(0);
		if (this._str == "0") {
			return null;
		}
		var last = new_path.length - 1;
		if (new_path[last] === 0) {
			new_path.pop();
			return new dojox.grid.TreePath(new_path, this.grid);
		}
		new_path[last]--;
		var path = new dojox.grid.TreePath(new_path, this.grid);
		return path.lastChild(true);
	}, next:function () {
		var new_path = this._arr.slice(0);
		if (this.isOpen()) {
			new_path.push(0);
		} else {
			new_path[new_path.length - 1]++;
			for (var i = this.level; i >= 0; i--) {
				var item = this.grid.getItem(new_path.slice(0, i + 1));
				if (i > 0) {
					if (!item) {
						new_path.pop();
						new_path[i - 1]++;
					}
				} else {
					if (!item) {
						return null;
					}
				}
			}
		}
		return new dojox.grid.TreePath(new_path, this.grid);
	}, children:function (alwaysReturn) {
		if (!this.isOpen() && !alwaysReturn) {
			return null;
		}
		var items = [];
		var model = this.grid.treeModel;
		if (model) {
			var item = this.item();
			var store = model.store;
			if (!model.mayHaveChildren(item)) {
				return null;
			}
			dojo.forEach(model.childrenAttrs, function (attr) {
				items = items.concat(store.getValues(item, attr));
			});
		} else {
			items = this.store.getValues(this.item(), this.grid.layout.cells[this.cell.level + 1].parentCell.field);
			if (items.length > 1 && this.grid.sortChildItems) {
				var sortProps = this.grid.getSortProps();
				if (sortProps && sortProps.length) {
					var attr = sortProps[0].attribute, grid = this.grid;
					if (attr && items[0][attr]) {
						var desc = !!sortProps[0].descending;
						items = items.slice(0);
						items.sort(function (a, b) {
							return grid._childItemSorter(a, b, attr, desc);
						});
					}
				}
			}
		}
		return items;
	}, childPaths:function () {
		var childItems = this.children();
		if (!childItems) {
			return [];
		}
		return dojo.map(childItems, function (item, index) {
			return new dojox.grid.TreePath(this._str + "/" + index, this.grid);
		}, this);
	}, parent:function () {
		if (this.level === 0) {
			return null;
		}
		return new dojox.grid.TreePath(this._arr.slice(0, this.level), this.grid);
	}, lastChild:function (traverse) {
		var children = this.children();
		if (!children || !children.length) {
			return this;
		}
		var path = new dojox.grid.TreePath(this._str + "/" + String(children.length - 1), this.grid);
		if (!traverse) {
			return path;
		}
		return path.lastChild(true);
	}, toString:function () {
		return this._str;
	}});
	dojo.declare("dojox.grid._TreeFocusManager", dojox.grid._FocusManager, {setFocusCell:function (inCell, inRowIndex) {
		if (inCell && inCell.getNode(inRowIndex)) {
			this.inherited(arguments);
		}
	}, isLastFocusCell:function () {
		if (this.cell && this.cell.index == this.grid.layout.cellCount - 1) {
			var path = new dojox.grid.TreePath(this.grid.rowCount - 1, this.grid);
			path = path.lastChild(true);
			return this.rowIndex == path._str;
		}
		return false;
	}, next:function () {
		if (this.cell) {
			var row = this.rowIndex, col = this.cell.index + 1, cc = this.grid.layout.cellCount - 1;
			var path = new dojox.grid.TreePath(this.rowIndex, this.grid);
			if (col > cc) {
				var new_path = path.next();
				if (!new_path) {
					col--;
				} else {
					col = 0;
					path = new_path;
				}
			}
			if (this.grid.edit.isEditing()) {
				var nextCell = this.grid.getCell(col);
				if (!this.isLastFocusCell() && !nextCell.editable) {
					this._focusifyCellNode(false);
					this.cell = nextCell;
					this.rowIndex = path._str;
					this.next();
					return;
				}
			}
			this.setFocusIndex(path._str, col);
		}
	}, previous:function () {
		if (this.cell) {
			var row = (this.rowIndex || 0), col = (this.cell.index || 0) - 1;
			var path = new dojox.grid.TreePath(row, this.grid);
			if (col < 0) {
				var new_path = path.previous();
				if (!new_path) {
					col = 0;
				} else {
					col = this.grid.layout.cellCount - 1;
					path = new_path;
				}
			}
			if (this.grid.edit.isEditing()) {
				var prevCell = this.grid.getCell(col);
				if (!this.isFirstFocusCell() && !prevCell.editable) {
					this._focusifyCellNode(false);
					this.cell = prevCell;
					this.rowIndex = path._str;
					this.previous();
					return;
				}
			}
			this.setFocusIndex(path._str, col);
		}
	}, move:function (inRowDelta, inColDelta) {
		if (this.isNavHeader()) {
			this.inherited(arguments);
			return;
		}
		if (!this.cell) {
			return;
		}
		var sc = this.grid.scroller, r = this.rowIndex, rc = this.grid.rowCount - 1, path = new dojox.grid.TreePath(this.rowIndex, this.grid);
		if (inRowDelta) {
			var row;
			if (inRowDelta > 0) {
				path = path.next();
				row = path._arr[0];
				if (row > sc.getLastPageRow(sc.page)) {
					this.grid.setScrollTop(this.grid.scrollTop + sc.findScrollTop(row) - sc.findScrollTop(r));
				}
			} else {
				if (inRowDelta < 0) {
					path = path.previous();
					row = path._arr[0];
					if (row <= sc.getPageRow(sc.page)) {
						this.grid.setScrollTop(this.grid.scrollTop - sc.findScrollTop(r) - sc.findScrollTop(row));
					}
				}
			}
		}
		var cc = this.grid.layout.cellCount - 1, i = this.cell.index, col = Math.min(cc, Math.max(0, i + inColDelta));
		var cell = this.grid.getCell(col);
		var colDir = inColDelta < 0 ? -1 : 1;
		while (col >= 0 && col < cc && cell && cell.hidden === true) {
			col += colDir;
			cell = this.grid.getCell(col);
		}
		if (!cell || cell.hidden === true) {
			col = i;
		}
		if (inRowDelta) {
			this.grid.updateRow(r);
		}
		this.setFocusIndex(path._str, col);
	}});
	dojo.declare("dojox.grid.TreeGrid", dojox.grid.DataGrid, {defaultOpen:true, sortChildItems:false, openAtLevels:[], treeModel:null, expandoCell:0, aggregator:null, _layoutClass:dojox.grid._TreeLayout, createSelection:function () {
		this.selection = new dojox.grid.TreeSelection(this);
	}, _childItemSorter:function (a, b, attribute, descending) {
		var av = this.store.getValue(a, attribute);
		var bv = this.store.getValue(b, attribute);
		if (av != bv) {
			return av < bv == descending ? 1 : -1;
		}
		return 0;
	}, _onNew:function (item, parentInfo) {
		if (!parentInfo || !parentInfo.item) {
			this.inherited(arguments);
		} else {
			var idx = this.getItemIndex(parentInfo.item);
			if (typeof idx == "string") {
				this.updateRow(idx.split("/")[0]);
			} else {
				if (idx > -1) {
					this.updateRow(idx);
				}
			}
		}
	}, _onSet:function (item, attribute, oldValue, newValue) {
		this._checkUpdateStatus();
		if (this.aggregator) {
			this.aggregator.clearSubtotalCache();
		}
		var idx = this.getItemIndex(item);
		if (typeof idx == "string") {
			this.updateRow(idx.split("/")[0]);
		} else {
			if (idx > -1) {
				this.updateRow(idx);
			}
		}
	}, _onDelete:function (item) {
		this._cleanupExpandoCache(this._getItemIndex(item, true), this.store.getIdentity(item), item);
		this.inherited(arguments);
	}, _cleanupExpandoCache:function (index, identity, item) {
	}, _addItem:function (item, index, noUpdate, dontUpdateRoot) {
		if (!dontUpdateRoot && this.model && dojo.indexOf(this.model.root.children, item) == -1) {
			this.model.root.children[index] = item;
		}
		this.inherited(arguments);
	}, getItem:function (idx) {
		var isArray = dojo.isArray(idx);
		if (dojo.isString(idx) && idx.indexOf("/")) {
			idx = idx.split("/");
			isArray = true;
		}
		if (isArray && idx.length == 1) {
			idx = idx[0];
			isArray = false;
		}
		if (!isArray) {
			return dojox.grid.DataGrid.prototype.getItem.call(this, idx);
		}
		var s = this.store;
		var itm = dojox.grid.DataGrid.prototype.getItem.call(this, idx[0]);
		var cf;
		if (this.aggregator) {
			cf = this.aggregator.childFields || [];
		} else {
			if (this.treeModel) {
				cf = this.treeModel.childrenAttrs || [];
			}
		}
		if (cf) {
			for (var i = 0; i < idx.length - 1 && itm; i++) {
				if (cf[i]) {
					itm = (s.getValues(itm, cf[i]) || [])[idx[i + 1]];
				} else {
					itm = null;
				}
			}
		}
		return itm || null;
	}, _getItemIndex:function (item, isDeleted) {
		if (!isDeleted && !this.store.isItem(item)) {
			return -1;
		}
		var idx = this.inherited(arguments);
		if (idx == -1) {
			var idty = this.store.getIdentity(item);
			return this._by_idty_paths[idty] || -1;
		}
		return idx;
	}, postMixInProperties:function () {
		if (this.treeModel && !("defaultOpen" in this.params)) {
			this.defaultOpen = false;
		}
		var def = this.defaultOpen;
		this.openAtLevels = dojo.map(this.openAtLevels, function (l) {
			if (typeof l == "string") {
				switch (l.toLowerCase()) {
				  case "true":
					return true;
					break;
				  case "false":
					return false;
					break;
				  default:
					var r = parseInt(l, 10);
					if (isNaN(r)) {
						return def;
					}
					return r;
					break;
				}
			}
			return l;
		});
		this._by_idty_paths = {};
		this.inherited(arguments);
	}, postCreate:function () {
		this.inherited(arguments);
		if (this.treeModel) {
			this._setModel(this.treeModel);
		}
	}, setModel:function (treeModel) {
		this._setModel(treeModel);
		this._refresh(true);
	}, _setModel:function (treeModel) {
		if (treeModel && (!dijit.tree.ForestStoreModel || !(treeModel instanceof dijit.tree.ForestStoreModel))) {
			throw new Error("dojox.grid.TreeGrid: treeModel must be an instance of dijit.tree.ForestStoreModel");
		}
		this.treeModel = treeModel;
		dojo.toggleClass(this.domNode, "dojoxGridTreeModel", this.treeModel ? true : false);
		this._setQuery(treeModel ? treeModel.query : null);
		this._setStore(treeModel ? treeModel.store : null);
	}, createScroller:function () {
		this.inherited(arguments);
		this.scroller._origDefaultRowHeight = this.scroller.defaultRowHeight;
	}, createManagers:function () {
		this.rows = new dojox.grid._RowManager(this);
		this.focus = new dojox.grid._TreeFocusManager(this);
		this.edit = new dojox.grid._EditManager(this);
	}, _setStore:function (store) {
		this.inherited(arguments);
		if (this.treeModel && !this.treeModel.root.children) {
			this.treeModel.root.children = [];
		}
		if (this.aggregator) {
			this.aggregator.store = store;
		}
	}, getDefaultOpenState:function (cellDef, item) {
		var cf;
		var store = this.store;
		if (this.treeModel) {
			return this.defaultOpen;
		}
		if (!cellDef || !store || !store.isItem(item) || !(cf = this.aggregator.childFields[cellDef.level])) {
			return this.defaultOpen;
		}
		if (this.openAtLevels.length > cellDef.level) {
			var dVal = this.openAtLevels[cellDef.level];
			if (typeof dVal == "boolean") {
				return dVal;
			} else {
				if (typeof dVal == "number") {
					return (store.getValues(item, cf).length <= dVal);
				}
			}
		}
		return this.defaultOpen;
	}, onStyleRow:function (row) {
		if (!this.layout._isCollapsable) {
			this.inherited(arguments);
			return;
		}
		var base = dojo.attr(row.node, "dojoxTreeGridBaseClasses");
		if (base) {
			row.customClasses = base;
		}
		var i = row;
		var tagName = i.node.tagName.toLowerCase();
		i.customClasses += (i.odd ? " dojoxGridRowOdd" : "") + (i.selected && tagName == "tr" ? " dojoxGridRowSelected" : "") + (i.over && tagName == "tr" ? " dojoxGridRowOver" : "");
		this.focus.styleRow(i);
		this.edit.styleRow(i);
	}, styleRowNode:function (inRowIndex, inRowNode) {
		if (inRowNode) {
			if (inRowNode.tagName.toLowerCase() == "div" && this.aggregator) {
				dojo.query("tr[dojoxTreeGridPath]", inRowNode).forEach(function (rowNode) {
					this.rows.styleRowNode(dojo.attr(rowNode, "dojoxTreeGridPath"), rowNode);
				}, this);
			}
			this.rows.styleRowNode(inRowIndex, inRowNode);
		}
	}, onCanSelect:function (inRowIndex) {
		var nodes = dojo.query("tr[dojoxTreeGridPath='" + inRowIndex + "']", this.domNode);
		if (nodes.length) {
			if (dojo.hasClass(nodes[0], "dojoxGridSummaryRow")) {
				return false;
			}
		}
		return this.inherited(arguments);
	}, onKeyDown:function (e) {
		if (e.altKey || e.metaKey) {
			return;
		}
		var dk = dojo.keys;
		switch (e.keyCode) {
		  case dk.UP_ARROW:
			if (!this.edit.isEditing() && this.focus.rowIndex != "0") {
				dojo.stopEvent(e);
				this.focus.move(-1, 0);
			}
			break;
		  case dk.DOWN_ARROW:
			var currPath = new dojox.grid.TreePath(this.focus.rowIndex, this);
			var lastPath = new dojox.grid.TreePath(this.rowCount - 1, this);
			lastPath = lastPath.lastChild(true);
			if (!this.edit.isEditing() && currPath.toString() != lastPath.toString()) {
				dojo.stopEvent(e);
				this.focus.move(1, 0);
			}
			break;
		  default:
			this.inherited(arguments);
			break;
		}
	}, canEdit:function (inCell, inRowIndex) {
		var node = inCell.getNode(inRowIndex);
		return node && this._canEdit;
	}, doApplyCellEdit:function (inValue, inRowIndex, inAttrName) {
		var item = this.getItem(inRowIndex);
		var oldValue = this.store.getValue(item, inAttrName);
		if (typeof oldValue == "number") {
			inValue = isNaN(inValue) ? inValue : parseFloat(inValue);
		} else {
			if (typeof oldValue == "boolean") {
				inValue = inValue == "true" ? true : inValue == "false" ? false : inValue;
			} else {
				if (oldValue instanceof Date) {
					var asDate = new Date(inValue);
					inValue = isNaN(asDate.getTime()) ? inValue : asDate;
				}
			}
		}
		this.store.setValue(item, inAttrName, inValue);
		this.onApplyCellEdit(inValue, inRowIndex, inAttrName);
	}});
	dojox.grid.TreeGrid.markupFactory = function (props, node, ctor, cellFunc) {
		var d = dojo;
		var widthFromAttr = function (n) {
			var w = d.attr(n, "width") || "auto";
			if ((w != "auto") && (w.slice(-2) != "em") && (w.slice(-1) != "%")) {
				w = parseInt(w, 10) + "px";
			}
			return w;
		};
		var cellsFromMarkup = function (table) {
			var rows;
			if (table.nodeName.toLowerCase() == "table" && d.query("> colgroup", table).length === 0 && (rows = d.query("> thead > tr", table)).length == 1) {
				var tr = rows[0];
				return d.query("> th", rows[0]).map(function (th) {
					var cell = {type:d.trim(d.attr(th, "cellType") || ""), field:d.trim(d.attr(th, "field") || "")};
					if (cell.type) {
						cell.type = d.getObject(cell.type);
					}
					var subTable = d.query("> table", th)[0];
					if (subTable) {
						cell.name = "";
						cell.children = cellsFromMarkup(subTable);
						if (d.hasAttr(th, "itemAggregates")) {
							cell.itemAggregates = d.map(d.attr(th, "itemAggregates").split(","), function (v) {
								return d.trim(v);
							});
						} else {
							cell.itemAggregates = [];
						}
						if (d.hasAttr(th, "aggregate")) {
							cell.aggregate = d.attr(th, "aggregate");
						}
						cell.type = cell.type || dojox.grid.cells.SubtableCell;
					} else {
						cell.name = d.trim(d.attr(th, "name") || th.innerHTML);
						if (d.hasAttr(th, "width")) {
							cell.width = widthFromAttr(th);
						}
						if (d.hasAttr(th, "relWidth")) {
							cell.relWidth = window.parseInt(d.attr(th, "relWidth"), 10);
						}
						if (d.hasAttr(th, "hidden")) {
							cell.hidden = d.attr(th, "hidden") == "true";
						}
						cell.field = cell.field || cell.name;
						dojox.grid.DataGrid.cell_markupFactory(cellFunc, th, cell);
						cell.type = cell.type || dojox.grid.cells.Cell;
					}
					if (cell.type && cell.type.markupFactory) {
						cell.type.markupFactory(th, cell);
					}
					return cell;
				});
			}
			return [];
		};
		var rows;
		if (!props.structure) {
			var row = cellsFromMarkup(node);
			if (row.length) {
				props.structure = [{__span:Infinity, cells:[row]}];
			}
		}
		return dojox.grid.DataGrid.markupFactory(props, node, ctor, cellFunc);
	};
}

