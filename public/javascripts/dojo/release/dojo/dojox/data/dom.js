/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.data.dom"]) {
	dojo._hasResource["dojox.data.dom"] = true;
	dojo.provide("dojox.data.dom");
	dojo.require("dojox.xml.parser");
	dojo.deprecated("dojox.data.dom", "Use dojox.xml.parser instead.", "2.0");
	dojox.data.dom.createDocument = function (str, mimetype) {
		dojo.deprecated("dojox.data.dom.createDocument()", "Use dojox.xml.parser.parse() instead.", "2.0");
		try {
			return dojox.xml.parser.parse(str, mimetype);
		}
		catch (e) {
			return null;
		}
	};
	dojox.data.dom.textContent = function (node, text) {
		dojo.deprecated("dojox.data.dom.textContent()", "Use dojox.xml.parser.textContent() instead.", "2.0");
		if (arguments.length > 1) {
			return dojox.xml.parser.textContent(node, text);
		} else {
			return dojox.xml.parser.textContent(node);
		}
	};
	dojox.data.dom.replaceChildren = function (node, newChildren) {
		dojo.deprecated("dojox.data.dom.replaceChildren()", "Use dojox.xml.parser.replaceChildren() instead.", "2.0");
		dojox.xml.parser.replaceChildren(node, newChildren);
	};
	dojox.data.dom.removeChildren = function (node) {
		dojo.deprecated("dojox.data.dom.removeChildren()", "Use dojox.xml.parser.removeChildren() instead.", "2.0");
		return dojox.xml.parser.removeChildren(node);
	};
	dojox.data.dom.innerXML = function (node) {
		dojo.deprecated("dojox.data.dom.innerXML()", "Use dojox.xml.parser.innerXML() instead.", "2.0");
		return dojox.xml.parser.innerXML(node);
	};
}

