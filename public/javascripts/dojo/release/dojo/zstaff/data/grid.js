/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["zstaff.data.grid"]) {
	dojo._hasResource["zstaff.data.grid"] = true;
	dojo.provide("zstaff.data.grid");
	dojo.require("dojox.grid._data.model");
	dojo.declare("zstaff.data.grid", dojox.grid.data.DojoData, {form:"", data:null, markupFactory:function (args, node) {
		return new zstaff.data.grid(null, null, args);
	}, constructor:function (inFields, inData, args) {
		this.count = 100;
	}, requestRows:function (inRowIndex, inCount) {
		var row = inRowIndex || 0;
		var otherfilters = {};
		if (this.form) {
			otherfilters = dojo.formToObject(this.form);
		}
		sort_index = this.fields.get(Math.abs(this.sortColumn - 1)).name;
		sort_order = (this.sortColumn > 0) ? 0 : 1;
		var self = this;
		var params = {start:row, count:inCount || this.rowsPerPage, serverQuery:dojo.mixin({page:(row / this.rowsPerPage), count:inCount || this.rowsPerPage, sort:sort_index, sort_order:sort_order, page_size:this.rowsPerPage}, otherfilters, this.query), query:this.query, onComplete:function (d, i) {
			if (self.store.getDataSize) {
				var ds = self.store.getDataSize();
				dojo.publish("zstaff.data.grid.rowsize", [ds]);
				if (ds != this.count) {
					self.setRowCount(ds);
				}
			}
			self.processRows(d, i);
		}};
		this.store.fetch(params);
	}, setData:function (inData) {
		this.data = [];
		this.allChange();
	}, sort:function (colIndex) {
		this.clearData();
		this.sortColumn = colIndex;
		this.requestRows();
	}, canSort:function () {
		return true;
	}});
}

