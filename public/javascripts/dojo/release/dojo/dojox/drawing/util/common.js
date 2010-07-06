/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.drawing.util.common"]) {
	dojo._hasResource["dojox.drawing.util.common"] = true;
	dojo.provide("dojox.drawing.util.common");
	dojo.require("dojox.math.round");
	(function () {
		var uidMap = {};
		dojox.drawing.util.common = {radToDeg:function (n) {
			return (n * 180) / Math.PI;
		}, degToRad:function (n) {
			return (n * Math.PI) / 180;
		}, angle:function (obj, snap) {
			if (snap) {
				snap = snap / 180;
				var radians = this.radians(obj), radius = this.length(obj), seg = Math.PI * snap, rnd = dojox.math.round(radians / seg), new_radian = rnd * seg;
				return dojox.math.round(this.radToDeg(new_radian));
			} else {
				return this.radToDeg(this.radians(obj));
			}
		}, radians:function (o) {
			return Math.atan2(o.start.y - o.y, o.start.x - o.x);
		}, length:function (o) {
			return Math.sqrt(Math.pow(o.start.x - o.x, 2) + Math.pow(o.start.y - o.y, 2));
		}, lineSub:function (x1, y1, x2, y2, amt) {
			var len = this.distance(this.argsToObj.apply(this, arguments));
			len = len < amt ? amt : len;
			var pc = (len - amt) / len;
			var x = x1 - (x1 - x2) * pc;
			var y = y1 - (y1 - y2) * pc;
			return {x:x, y:y};
		}, argsToObj:function () {
			var a = arguments;
			if (a.length < 4) {
				return a[0];
			}
			return {start:{x:a[0], y:a[1]}, x:a[2], y:a[3]};
		}, distance:function () {
			var o = this.argsToObj.apply(this, arguments);
			return Math.abs(Math.sqrt(Math.pow(o.start.x - o.x, 2) + Math.pow(o.start.y - o.y, 2)));
		}, slope:function (p1, p2) {
			if (!(p1.x - p2.x)) {
				return 0;
			}
			return ((p1.y - p2.y) / (p1.x - p2.x));
		}, pointOnCircle:function (cx, cy, radius, angle) {
			radians = angle * Math.PI / 180;
			var x = radius * Math.cos(radians) * -1;
			var y = radius * Math.sin(radians) * -1;
			return {x:cx + x, y:cy + y};
		}, constrainAngle:function (obj, min, max) {
			var angle = this.angle(obj);
			if (angle >= min && angle <= max) {
				return obj;
			}
			var radius = this.length(obj);
			var diff = min - ((360 - (max - min)) / 2);
			var new_angle = angle > max ? max : min - angle < 100 ? min : max;
			return this.pointOnCircle(obj.start.x, obj.start.y, radius, new_angle);
		}, snapAngle:function (obj, ca) {
			var radians = this.radians(obj), angle = this.angle(obj), radius = this.length(obj), seg = Math.PI * ca, rnd = Math.round(radians / seg), new_radian = rnd * seg, new_angle = this.radToDeg(new_radian), pt = this.pointOnCircle(obj.start.x, obj.start.y, radius, new_angle);
			return pt;
		}, uid:function (str) {
			str = str || "shape";
			uidMap[str] = uidMap[str] === undefined ? 0 : uidMap[str] + 1;
			return str + uidMap[str];
		}, abbr:function (type) {
			return type.substring(type.lastIndexOf(".") + 1).charAt(0).toLowerCase() + type.substring(type.lastIndexOf(".") + 2);
		}, mixin:function (o1, o2) {
		}, objects:{}, register:function (obj) {
			this.objects[obj.id] = obj;
		}, byId:function (id) {
			return this.objects[id];
		}, attr:function (elem, prop, value, squelchErrors) {
			if (!elem) {
				return false;
			}
			try {
				if (elem.shape && elem.util) {
					elem = elem.shape;
				}
				if (!value && prop == "id" && elem.target) {
					var n = elem.target;
					while (!dojo.attr(n, "id")) {
						n = n.parentNode;
					}
					return dojo.attr(n, "id");
				}
				if (elem.rawNode || elem.target) {
					var args = Array.prototype.slice.call(arguments);
					args[0] = elem.rawNode || elem.target;
					return dojo.attr.apply(dojo, args);
				}
				return dojo.attr(elem, "id");
			}
			catch (e) {
				if (!squelchErrors) {
				}
				return false;
			}
		}};
	})();
}

