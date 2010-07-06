/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["zstaff.helpers.dialog"]) {
	dojo._hasResource["zstaff.helpers.dialog"] = true;
	dojo.provide("zstaff.helpers.dialog");
	dojo.require("zstaff.widget.Dialog");
	dojo.require("zstaff.helpers.refresh");
	zstaff.helpers.dialog.dlg = null;
	zstaff.helpers.dialog.show = function (name, url, title) {
		if (title == null) {
			title = "";
		}
		if (!zstaff.helpers.dialog.dlg) {
			if (!dojo.byId("zdialog")) {
				var nodeDiv = document.createElement("div");
				nodeDiv.id = "zdialog";
				document.body.appendChild(nodeDiv);
				zstaff.helpers.dialog.dlg = new zstaff.widget.Dialog({id:"zdialog", preventCache:true, parseOnLoad:true, refreshOnShow:true}, nodeDiv);
				zstaff.helpers.dialog.dlg.onHide = zstaff.helpers.refresh.refreshAll;
			}
		}
		zstaff.helpers.dialog.dlg.setTitle(title);
		zstaff.helpers.dialog.dlg.setHref(url);
		zstaff.helpers.dialog.dlg.show();
	};
	zstaff.helpers.dialog.close = function () {
		if (zstaff.helpers.dialog.dlg) {
			zstaff.helpers.dialog.dlg.hide();
		}
	};
	zstaff.helpers.dialog.ttdlg = null;
	zstaff.helpers.dialog.tooldialog = function (attachNode, url) {
		dojo.xhrGet({url:url, load:function (d) {
			dijit.showTooltip(d, attachNode);
		}});
		var eventid = null;
		var diefunc = function () {
			dijit.hideTooltip(attachNode);
			dojo.disconnect(eventid);
		};
		eventid = dojo.connect(document.body, "onmouseup", diefunc);
	};
}

