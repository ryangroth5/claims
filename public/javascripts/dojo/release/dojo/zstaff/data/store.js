/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["zstaff.data.store"]) {
	dojo._hasResource["zstaff.data.store"] = true;
	dojo.provide("zstaff.data.store");
	dojo.require("dojox.data.QueryReadStore");
	dojo.declare("zstaff.data.store", dojox.data.QueryReadStore, {data:null, datasize:100, getDataSize:function () {
		return this.datasize;
	}, _filterResponse:function (data) {
		if (typeof data.size != "undefined") {
			this.datasize = data.size;
		}
		return data;
	}, _fetchItems:function (request, fetchHandler, errorHandler) {
		if (this.data) {
			data = this._filterResponse(this.data);
			this.data = null;
			if (data.label) {
				this._labelAttr = data.label;
			}
			var numRows = data.numRows || -1;
			this._items = [];
			dojo.forEach(data.items, function (e) {
				this._items.push({i:e, r:this});
			}, this);
			var identifier = data.identifier;
			this._itemsByIdentity = {};
			if (identifier) {
				this._identifier = identifier;
				for (i = 0; i < this._items.length; ++i) {
					var item = this._items[i].i;
					var identity = item[identifier];
					if (!this._itemsByIdentity[identity]) {
						this._itemsByIdentity[identity] = item;
					} else {
						throw new Error(this._className + ":  The json data as specified by: [" + this.url + "] is malformed.  Items within the list have identifier: [" + identifier + "].  Value collided: [" + identity + "]");
					}
				}
			} else {
				this._identifier = Number;
				for (i = 0; i < this._items.length; ++i) {
					this._items[i].n = i;
				}
			}
			numRows = (numRows === -1) ? this._items.length : numRows;
			fetchHandler(this._items, request, numRows);
		} else {
			return (this.inherited("_fetchItems", arguments));
		}
	}});
}

