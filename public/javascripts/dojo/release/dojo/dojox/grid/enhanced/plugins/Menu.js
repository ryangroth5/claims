/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced.plugins.Menu"]) {
	dojo._hasResource["dojox.grid.enhanced.plugins.Menu"] = true;
	dojo.provide("dojox.grid.enhanced.plugins.Menu");
	dojo.declare("dojox.grid.enhanced.plugins.Menu", null, {constructor:function (inGrid) {
		inGrid.mixin(inGrid, this);
	}, _initMenus:function () {
		var wrapper = this.menuContainer;
		!this.headerMenu && (this.headerMenu = this._getMenuWidget(this.menus["headerMenu"]));
		!this.rowMenu && (this.rowMenu = this._getMenuWidget(this.menus["rowMenu"]));
		!this.cellMenu && (this.cellMenu = this._getMenuWidget(this.menus["cellMenu"]));
		!this.selectedRegionMenu && (this.selectedRegionMenu = this._getMenuWidget(this.menus["selectedRegionMenu"]));
		this.headerMenu && this.attr("headerMenu", this.headerMenu) && this.setupHeaderMenu();
		this.rowMenu && this.attr("rowMenu", this.rowMenu);
		this.cellMenu && this.attr("cellMenu", this.cellMenu);
		this.isDndSelectEnable && this.selectedRegionMenu && dojo.connect(this.select, "setDrugCoverDivs", dojo.hitch(this, this._bindDnDSelectEvent));
	}, _getMenuWidget:function (menuId) {
		if (!menuId) {
			return;
		}
		var menu = dijit.byId(menuId);
		if (!menu) {
			throw new Error("Menu '" + menuId + "' not existed");
		}
		return menu;
	}, _bindDnDSelectEvent:function () {
		dojo.forEach(this.select.coverDIVs, dojo.hitch(this, function (cover) {
			this.selectedRegionMenu.bindDomNode(cover);
			dojo.connect(cover, "contextmenu", dojo.hitch(this, function (e) {
				dojo.mixin(e, this.select.getSelectedRegionInfo());
				this.onSelectedRegionContextMenu(e);
			}));
		}));
	}, _setRowMenuAttr:function (menu) {
		this._setRowCellMenuAttr(menu, "rowMenu");
	}, _setCellMenuAttr:function (menu) {
		this._setRowCellMenuAttr(menu, "cellMenu");
	}, _setRowCellMenuAttr:function (menu, menuType) {
		if (!menu) {
			return;
		}
		if (this[menuType]) {
			this[menuType].unBindDomNode(this.domNode);
		}
		this[menuType] = menu;
		this[menuType].bindDomNode(this.domNode);
	}, showRowCellMenu:function (e) {
		var inRowSelectorView = e.sourceView.declaredClass == "dojox.grid._RowSelector";
		if (this.rowMenu && (!e.cell || this.selection.isSelected(e.rowIndex))) {
			this.rowMenu._openMyself(e);
			dojo.stopEvent(e);
			return;
		}
		if (inRowSelectorView || e.cell && e.cell.isRowSelector) {
			dojo.stopEvent(e);
			return;
		}
		if (this.isDndSelectEnable) {
			this.select.cellClick(e.cellIndex, e.rowIndex);
			this.focus.setFocusCell(e.cell, e.rowIndex);
		}
		this.cellMenu && this.cellMenu._openMyself(e);
	}});
}

