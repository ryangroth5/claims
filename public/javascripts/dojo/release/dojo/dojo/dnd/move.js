/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.dnd.move"]) {
	dojo._hasResource["dojo.dnd.move"] = true;
	dojo.provide("dojo.dnd.move");
	dojo.require("dojo.dnd.Mover");
	dojo.require("dojo.dnd.Moveable");
	dojo.declare("dojo.dnd.move.constrainedMoveable", dojo.dnd.Moveable, {constraints:function () {
	}, within:false, markupFactory:function (params, node) {
		return new dojo.dnd.move.constrainedMoveable(node, params);
	}, constructor:function (node, params) {
		if (!params) {
			params = {};
		}
		this.constraints = params.constraints;
		this.within = params.within;
	}, onFirstMove:function (mover) {
		var c = this.constraintBox = this.constraints.call(this, mover);
		c.r = c.l + c.w;
		c.b = c.t + c.h;
		if (this.within) {
			var mb = dojo.marginBox(mover.node);
			c.r -= mb.w;
			c.b -= mb.h;
		}
	}, onMove:function (mover, leftTop) {
		var c = this.constraintBox, s = mover.node.style;
		s.left = (leftTop.l < c.l ? c.l : c.r < leftTop.l ? c.r : leftTop.l) + "px";
		s.top = (leftTop.t < c.t ? c.t : c.b < leftTop.t ? c.b : leftTop.t) + "px";
	}});
	dojo.declare("dojo.dnd.move.boxConstrainedMoveable", dojo.dnd.move.constrainedMoveable, {box:{}, markupFactory:function (params, node) {
		return new dojo.dnd.move.boxConstrainedMoveable(node, params);
	}, constructor:function (node, params) {
		var box = params && params.box;
		this.constraints = function () {
			return box;
		};
	}});
	dojo.declare("dojo.dnd.move.parentConstrainedMoveable", dojo.dnd.move.constrainedMoveable, {area:"content", markupFactory:function (params, node) {
		return new dojo.dnd.move.parentConstrainedMoveable(node, params);
	}, constructor:function (node, params) {
		var area = params && params.area;
		this.constraints = function () {
			var n = this.node.parentNode, s = dojo.getComputedStyle(n), mb = dojo._getMarginBox(n, s);
			if (area == "margin") {
				return mb;
			}
			var t = dojo._getMarginExtents(n, s);
			mb.l += t.l, mb.t += t.t, mb.w -= t.w, mb.h -= t.h;
			if (area == "border") {
				return mb;
			}
			t = dojo._getBorderExtents(n, s);
			mb.l += t.l, mb.t += t.t, mb.w -= t.w, mb.h -= t.h;
			if (area == "padding") {
				return mb;
			}
			t = dojo._getPadExtents(n, s);
			mb.l += t.l, mb.t += t.t, mb.w -= t.w, mb.h -= t.h;
			return mb;
		};
	}});
	dojo.dnd.move.constrainedMover = function (fun, within) {
		dojo.deprecated("dojo.dnd.move.constrainedMover, use dojo.dnd.move.constrainedMoveable instead");
		var mover = function (node, e, notifier) {
			dojo.dnd.Mover.call(this, node, e, notifier);
		};
		dojo.extend(mover, dojo.dnd.Mover.prototype);
		dojo.extend(mover, {onMouseMove:function (e) {
			dojo.dnd.autoScroll(e);
			var m = this.marginBox, c = this.constraintBox, l = m.l + e.pageX, t = m.t + e.pageY;
			l = l < c.l ? c.l : c.r < l ? c.r : l;
			t = t < c.t ? c.t : c.b < t ? c.b : t;
			this.host.onMove(this, {l:l, t:t});
		}, onFirstMove:function () {
			dojo.dnd.Mover.prototype.onFirstMove.call(this);
			var c = this.constraintBox = fun.call(this);
			c.r = c.l + c.w;
			c.b = c.t + c.h;
			if (within) {
				var mb = dojo.marginBox(this.node);
				c.r -= mb.w;
				c.b -= mb.h;
			}
		}});
		return mover;
	};
	dojo.dnd.move.boxConstrainedMover = function (box, within) {
		dojo.deprecated("dojo.dnd.move.boxConstrainedMover, use dojo.dnd.move.boxConstrainedMoveable instead");
		return dojo.dnd.move.constrainedMover(function () {
			return box;
		}, within);
	};
	dojo.dnd.move.parentConstrainedMover = function (area, within) {
		dojo.deprecated("dojo.dnd.move.parentConstrainedMover, use dojo.dnd.move.parentConstrainedMoveable instead");
		var fun = function () {
			var n = this.node.parentNode, s = dojo.getComputedStyle(n), mb = dojo._getMarginBox(n, s);
			if (area == "margin") {
				return mb;
			}
			var t = dojo._getMarginExtents(n, s);
			mb.l += t.l, mb.t += t.t, mb.w -= t.w, mb.h -= t.h;
			if (area == "border") {
				return mb;
			}
			t = dojo._getBorderExtents(n, s);
			mb.l += t.l, mb.t += t.t, mb.w -= t.w, mb.h -= t.h;
			if (area == "padding") {
				return mb;
			}
			t = dojo._getPadExtents(n, s);
			mb.l += t.l, mb.t += t.t, mb.w -= t.w, mb.h -= t.h;
			return mb;
		};
		return dojo.dnd.move.constrainedMover(fun, within);
	};
	dojo.dnd.constrainedMover = dojo.dnd.move.constrainedMover;
	dojo.dnd.boxConstrainedMover = dojo.dnd.move.boxConstrainedMover;
	dojo.dnd.parentConstrainedMover = dojo.dnd.move.parentConstrainedMover;
}

