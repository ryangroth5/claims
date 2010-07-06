/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.robot"]) {
	dojo._hasResource["dojo.robot"] = true;
	dojo.provide("dojo.robot");
	dojo.experimental("dojo.robot");
	dojo.require("doh.robot");
	(function () {
		dojo.mixin(doh.robot, {_resolveNode:function (n) {
			if (typeof n == "function") {
				n = n();
			}
			return n ? dojo.byId(n) : null;
		}, _scrollIntoView:function (node) {
			node.scrollIntoView(false);
		}, _position:function (n) {
			return dojo.position(n, false);
		}, scrollIntoView:function (node, delay) {
			doh.robot.sequence(function () {
				doh.robot._scrollIntoView(doh.robot._resolveNode(node));
			}, delay);
		}, mouseMoveAt:function (node, delay, duration, offsetX, offsetY) {
			doh.robot._assertRobot();
			duration = duration || 100;
			this.sequence(function () {
				node = doh.robot._resolveNode(node);
				doh.robot._scrollIntoView(node);
				var pos = doh.robot._position(node);
				if (offsetY === undefined) {
					offsetX = pos.w / 2;
					offsetY = pos.h / 2;
				}
				var x = pos.x + offsetX;
				var y = pos.y + offsetY;
				doh.robot._mouseMove(x, y, false, duration);
			}, delay, duration);
		}});
	})();
}

