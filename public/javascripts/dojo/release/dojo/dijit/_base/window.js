/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._base.window"]) {
	dojo._hasResource["dijit._base.window"] = true;
	dojo.provide("dijit._base.window");
	dijit.getDocumentWindow = function (doc) {
		if (dojo.isIE && window !== document.parentWindow && !doc._parentWindow) {
			doc.parentWindow.execScript("document._parentWindow = window;", "Javascript");
			var win = doc._parentWindow;
			doc._parentWindow = null;
			return win;
		}
		return doc._parentWindow || doc.parentWindow || doc.defaultView;
	};
}

