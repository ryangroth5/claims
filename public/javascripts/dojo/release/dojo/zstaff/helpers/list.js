/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["zstaff.helpers.list"]) {
	dojo._hasResource["zstaff.helpers.list"] = true;
	dojo.provide("zstaff.helpers.list");
	dojo.require("zstaff.helpers.form");
	dojo.require("zstaff.helpers.refresh");
	zstaff.helpers.list.group_button = function (button, grid, url) {
		qp = {};
		ogrid = null;
		if (grid != null) {
			var ogrid = dijit.byId(grid);
			if (!ogrid) {
				throw "Invalid grid passed in :" + grid;
			}
			var selection = ogrid.selection.getSelected();
			var ids = [];
			var idindex = ogrid.model.fields.indexOf("id");
			dojo.forEach(selection, function (s) {
				ids.push(ogrid.model.getDatum(s, idindex));
			});
			qp["id[]"] = ids;
		}
		zstaff.helpers.form.submit(null, button.form, url, qp, function () {
			if (ogrid) {
				ogrid.refresh();
			} else {
				zstaff.helpers.refresh.refreshAll();
			}
		});
		return (false);
	};
}

