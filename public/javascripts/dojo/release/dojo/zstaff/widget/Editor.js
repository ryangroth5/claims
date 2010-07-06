/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["zstaff.widget.Editor"]) {
	dojo._hasResource["zstaff.widget.Editor"] = true;
	dojo.provide("zstaff.widget.Editor");
	dojo.declare("zstaff.widget.Editor", null, {constructor:function (args, element) {
		var id = element.id;
		this.mce = tinyMCE.init({mode:"exact", theme:"advanced", elements:id, height:"275px"});
		oldfn = dojo.hitch(element.form, element.form.onsubmit);
		element.form.onsubmit = function (e) {
			tinyMCE.triggerSave();
			return (oldfn(e));
		};
	}});
}

