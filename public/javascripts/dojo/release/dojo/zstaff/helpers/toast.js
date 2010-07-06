/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["zstaff.helpers.toast"]) {
	dojo._hasResource["zstaff.helpers.toast"] = true;
	dojo.provide("zstaff.helpers.toast");
	dojo.require("dojox.widget.Toaster");
	zstaff.helpers.toast.toaster = null;
	zstaff.helpers.toast.toast = function (message, severity) {
		if (!dojo.byId("ztoaster")) {
			var nodeDiv = document.createElement("div");
			nodeDiv.id = "ztoaster";
			document.body.appendChild(nodeDiv);
			new dojox.widget.Toaster({id:"ztoaster", positionDirection:"br-left", showDelay:0, messageTopic:"ztoastages"}, nodeDiv);
		}
		opt = {};
		opt.message = message;
		if (severity) {
			opt.type = severity;
		}
		dojo.publish("ztoastages", [opt]);
	};
}

