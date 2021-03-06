/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.lang.functional.numrec"]) {
	dojo._hasResource["dojox.lang.functional.numrec"] = true;
	dojo.provide("dojox.lang.functional.numrec");
	dojo.require("dojox.lang.functional.lambda");
	dojo.require("dojox.lang.functional.util");
	(function () {
		var df = dojox.lang.functional, inline = df.inlineLambda, _r_i = ["_r", "_i"];
		df.numrec = function (then, after) {
			var a, as, dict = {}, add2dict = function (x) {
				dict[x] = 1;
			};
			if (typeof after == "string") {
				as = inline(after, _r_i, add2dict);
			} else {
				a = df.lambda(after);
				as = "_a.call(this, _r, _i)";
			}
			var locals = df.keys(dict), f = new Function(["_x"], "var _t=arguments.callee,_r=_t.t,_i".concat(locals.length ? "," + locals.join(",") : "", a ? ",_a=_t.a" : "", ";for(_i=1;_i<=_x;++_i){_r=", as, "}return _r"));
			f.t = then;
			if (a) {
				f.a = a;
			}
			return f;
		};
	})();
}

