/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.Declaration"]) {
	dojo._hasResource["dijit.Declaration"] = true;
	dojo.provide("dijit.Declaration");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.declare("dijit.Declaration", dijit._Widget, {_noScript:true, widgetClass:"", defaults:null, mixins:[], buildRendering:function () {
		var src = this.srcNodeRef.parentNode.removeChild(this.srcNodeRef), methods = dojo.query("> script[type^='dojo/method'][event]", src).orphan(), postscriptConnects = dojo.query("> script[type^='dojo/method']", src).orphan(), regularConnects = dojo.query("> script[type^='dojo/connect']", src).orphan(), srcType = src.nodeName;
		var propList = this.defaults || {};
		dojo.forEach(methods, function (s) {
			var evt = s.getAttribute("event"), func = dojo.parser._functionFromScript(s);
			propList[evt] = func;
		});
		this.mixins = this.mixins.length ? dojo.map(this.mixins, function (name) {
			return dojo.getObject(name);
		}) : [dijit._Widget, dijit._Templated];
		propList.widgetsInTemplate = true;
		propList._skipNodeCache = true;
		propList.templateString = "<" + srcType + " class='" + src.className + "' dojoAttachPoint='" + (src.getAttribute("dojoAttachPoint") || "") + "' dojoAttachEvent='" + (src.getAttribute("dojoAttachEvent") || "") + "' >" + src.innerHTML.replace(/\%7B/g, "{").replace(/\%7D/g, "}") + "</" + srcType + ">";
		dojo.query("[dojoType]", src).forEach(function (node) {
			node.removeAttribute("dojoType");
		});
		var wc = dojo.declare(this.widgetClass, this.mixins, propList);
		var connects = regularConnects.concat(postscriptConnects);
		dojo.forEach(connects, function (s) {
			var evt = s.getAttribute("event") || "postscript", func = dojo.parser._functionFromScript(s);
			dojo.connect(wc.prototype, evt, func);
		});
	}});
}

