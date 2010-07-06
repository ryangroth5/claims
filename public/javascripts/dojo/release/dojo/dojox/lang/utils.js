/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.lang.utils"]) {
	dojo._hasResource["dojox.lang.utils"] = true;
	dojo.provide("dojox.lang.utils");
	(function () {
		var empty = {}, du = dojox.lang.utils;
		var clone = function (o) {
			if (dojo.isArray(o)) {
				return dojo._toArray(o);
			}
			if (!dojo.isObject(o) || dojo.isFunction(o)) {
				return o;
			}
			return dojo.delegate(o);
		};
		dojo.mixin(du, {coerceType:function (target, source) {
			switch (typeof target) {
			  case "number":
				return Number(eval("(" + source + ")"));
			  case "string":
				return String(source);
			  case "boolean":
				return Boolean(eval("(" + source + ")"));
			}
			return eval("(" + source + ")");
		}, updateWithObject:function (target, source, conv) {
			if (!source) {
				return target;
			}
			for (var x in target) {
				if (x in source && !(x in empty)) {
					var t = target[x];
					if (t && typeof t == "object") {
						du.updateWithObject(t, source[x], conv);
					} else {
						target[x] = conv ? du.coerceType(t, source[x]) : clone(source[x]);
					}
				}
			}
			return target;
		}, updateWithPattern:function (target, source, pattern, conv) {
			if (!source || !pattern) {
				return target;
			}
			for (var x in pattern) {
				if (x in source && !(x in empty)) {
					target[x] = conv ? du.coerceType(pattern[x], source[x]) : clone(source[x]);
				}
			}
			return target;
		}});
	})();
}

