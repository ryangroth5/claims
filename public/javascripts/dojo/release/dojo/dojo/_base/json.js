/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo._base.json"]) {
	dojo._hasResource["dojo._base.json"] = true;
	dojo.provide("dojo._base.json");
	dojo.fromJson = function (json) {
		return eval("(" + json + ")");
	};
	dojo._escapeString = function (str) {
		return ("\"" + str.replace(/(["\\])/g, "\\$1") + "\"").replace(/[\f]/g, "\\f").replace(/[\b]/g, "\\b").replace(/[\n]/g, "\\n").replace(/[\t]/g, "\\t").replace(/[\r]/g, "\\r");
	};
	dojo.toJsonIndentStr = "\t";
	dojo.toJson = function (it, prettyPrint, _indentStr) {
		if (it === undefined) {
			return "undefined";
		}
		var objtype = typeof it;
		if (objtype == "number" || objtype == "boolean") {
			return it + "";
		}
		if (it === null) {
			return "null";
		}
		if (dojo.isString(it)) {
			return dojo._escapeString(it);
		}
		var recurse = arguments.callee;
		var newObj;
		_indentStr = _indentStr || "";
		var nextIndent = prettyPrint ? _indentStr + dojo.toJsonIndentStr : "";
		var tf = it.__json__ || it.json;
		if (dojo.isFunction(tf)) {
			newObj = tf.call(it);
			if (it !== newObj) {
				return recurse(newObj, prettyPrint, nextIndent);
			}
		}
		if (it.nodeType && it.cloneNode) {
			throw new Error("Can't serialize DOM nodes");
		}
		var sep = prettyPrint ? " " : "";
		var newLine = prettyPrint ? "\n" : "";
		if (dojo.isArray(it)) {
			var res = dojo.map(it, function (obj) {
				var val = recurse(obj, prettyPrint, nextIndent);
				if (typeof val != "string") {
					val = "undefined";
				}
				return newLine + nextIndent + val;
			});
			return "[" + res.join("," + sep) + newLine + _indentStr + "]";
		}
		if (objtype == "function") {
			return null;
		}
		var output = [], key;
		for (key in it) {
			var keyStr, val;
			if (typeof key == "number") {
				keyStr = "\"" + key + "\"";
			} else {
				if (typeof key == "string") {
					keyStr = dojo._escapeString(key);
				} else {
					continue;
				}
			}
			val = recurse(it[key], prettyPrint, nextIndent);
			if (typeof val != "string") {
				continue;
			}
			output.push(newLine + nextIndent + keyStr + ":" + sep + val);
		}
		return "{" + output.join("," + sep) + newLine + _indentStr + "}";
	};
}

