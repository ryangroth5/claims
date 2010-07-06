/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.EnhancedGrid"]) {
	dojo._hasResource["dojox.grid.EnhancedGrid"] = true;
	dojo.provide("dojox.grid.EnhancedGrid");
	dojo.require("dojox.grid.DataGrid");
	dojo.require("dojox.grid.enhanced._Plugin");
	dojo.requireLocalization("dojox.grid.enhanced", "EnhancedGrid", null, "ROOT,cs,de,es,fr,hu,it,ja,ko,pl,pt,ru,zh,zh-tw");
	dojo.experimental("dojox.grid.EnhancedGrid");
	dojo.declare("dojox.grid.EnhancedGrid", dojox.grid.DataGrid, {plugins:null, pluginMgr:null, doubleAffordance:false, postMixInProperties:function () {
		this._nls = dojo.i18n.getLocalization("dojox.grid.enhanced", "EnhancedGrid", this.lang);
		this.inherited(arguments);
	}, postCreate:function () {
		if (this.plugins) {
			this.pluginMgr = new dojox.grid.enhanced._Plugin(this);
			this.pluginMgr.preInit();
		}
		this.inherited(arguments);
		this.pluginMgr && this.pluginMgr.postInit();
	}, _fillContent:function () {
		this.menuContainer = this.srcNodeRef;
		this.inherited(arguments);
	}, startup:function () {
		this.menuContainer && this._initMenus && this._initMenus();
		this.inherited(arguments);
		if (this.doubleAffordance) {
			dojo.addClass(this.domNode, "dojoxGridDoubleAffordance");
		}
	}, textSizeChanged:function () {
		if (!dojo.isWebKit) {
			this.inherited(arguments);
		} else {
			if (this.textSizeChanging) {
				return;
			}
			this.textSizeChanging = true;
			this.inherited(arguments);
			this.textSizeChanging = false;
		}
	}, removeSelectedRows:function () {
		if (this.indirectSelection && this._canEdit) {
			var selected = dojo.clone(this.selection.selected);
			this.inherited(arguments);
			dojo.forEach(selected, function (value, index) {
				value && this.grid.rowSelectCell.toggleRow(index, false);
			});
		}
	}, doApplyCellEdit:function (inValue, inRowIndex, inAttrName) {
		if (!inAttrName) {
			this.invalidated[inRowIndex] = true;
			return;
		}
		this.inherited(arguments);
	}, mixin:function (target, source) {
		var props = {};
		for (p in source) {
			if (p == "_inherited" || p == "declaredClass" || p == "constructor") {
				continue;
			}
			props[p] = source[p];
		}
		dojo.mixin(target, props);
	}, _copyAttr:function (idx, attr) {
		if (!attr) {
			return;
		}
		return this.inherited(arguments);
	}});
	dojox.grid.EnhancedGrid.markupFactory = function (props, node, ctor, cellFunc) {
		return dojox.grid._Grid.markupFactory(props, node, ctor, dojo.partial(dojox.grid.DataGrid.cell_markupFactory, cellFunc));
	};
}

