/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._base.place"]) {
	dojo._hasResource["dijit._base.place"] = true;
	dojo.provide("dijit._base.place");
	dojo.require("dojo.AdapterRegistry");
	dijit.getViewport = function () {
		var scrollRoot = (dojo.doc.compatMode == "BackCompat") ? dojo.body() : dojo.doc.documentElement;
		var scroll = dojo._docScroll();
		return {w:scrollRoot.clientWidth, h:scrollRoot.clientHeight, l:scroll.x, t:scroll.y};
	};
	dijit.placeOnScreen = function (node, pos, corners, padding) {
		var choices = dojo.map(corners, function (corner) {
			var c = {corner:corner, pos:{x:pos.x, y:pos.y}};
			if (padding) {
				c.pos.x += corner.charAt(1) == "L" ? padding.x : -padding.x;
				c.pos.y += corner.charAt(0) == "T" ? padding.y : -padding.y;
			}
			return c;
		});
		return dijit._place(node, choices);
	};
	dijit._place = function (node, choices, layoutNode) {
		var view = dijit.getViewport();
		if (!node.parentNode || String(node.parentNode.tagName).toLowerCase() != "body") {
			dojo.body().appendChild(node);
		}
		var best = null;
		dojo.some(choices, function (choice) {
			var corner = choice.corner;
			var pos = choice.pos;
			if (layoutNode) {
				layoutNode(node, choice.aroundCorner, corner);
			}
			var style = node.style;
			var oldDisplay = style.display;
			var oldVis = style.visibility;
			style.visibility = "hidden";
			style.display = "";
			var mb = dojo.marginBox(node);
			style.display = oldDisplay;
			style.visibility = oldVis;
			var startX = Math.max(view.l, corner.charAt(1) == "L" ? pos.x : (pos.x - mb.w)), startY = Math.max(view.t, corner.charAt(0) == "T" ? pos.y : (pos.y - mb.h)), endX = Math.min(view.l + view.w, corner.charAt(1) == "L" ? (startX + mb.w) : pos.x), endY = Math.min(view.t + view.h, corner.charAt(0) == "T" ? (startY + mb.h) : pos.y), width = endX - startX, height = endY - startY, overflow = (mb.w - width) + (mb.h - height);
			if (best == null || overflow < best.overflow) {
				best = {corner:corner, aroundCorner:choice.aroundCorner, x:startX, y:startY, w:width, h:height, overflow:overflow};
			}
			return !overflow;
		});
		node.style.left = best.x + "px";
		node.style.top = best.y + "px";
		if (best.overflow && layoutNode) {
			layoutNode(node, best.aroundCorner, best.corner);
		}
		return best;
	};
	dijit.placeOnScreenAroundNode = function (node, aroundNode, aroundCorners, layoutNode) {
		aroundNode = dojo.byId(aroundNode);
		var oldDisplay = aroundNode.style.display;
		aroundNode.style.display = "";
		var aroundNodePos = dojo.position(aroundNode, true);
		aroundNode.style.display = oldDisplay;
		return dijit._placeOnScreenAroundRect(node, aroundNodePos.x, aroundNodePos.y, aroundNodePos.w, aroundNodePos.h, aroundCorners, layoutNode);
	};
	dijit.placeOnScreenAroundRectangle = function (node, aroundRect, aroundCorners, layoutNode) {
		return dijit._placeOnScreenAroundRect(node, aroundRect.x, aroundRect.y, aroundRect.width, aroundRect.height, aroundCorners, layoutNode);
	};
	dijit._placeOnScreenAroundRect = function (node, x, y, width, height, aroundCorners, layoutNode) {
		var choices = [];
		for (var nodeCorner in aroundCorners) {
			choices.push({aroundCorner:nodeCorner, corner:aroundCorners[nodeCorner], pos:{x:x + (nodeCorner.charAt(1) == "L" ? 0 : width), y:y + (nodeCorner.charAt(0) == "T" ? 0 : height)}});
		}
		return dijit._place(node, choices, layoutNode);
	};
	dijit.placementRegistry = new dojo.AdapterRegistry();
	dijit.placementRegistry.register("node", function (n, x) {
		return typeof x == "object" && typeof x.offsetWidth != "undefined" && typeof x.offsetHeight != "undefined";
	}, dijit.placeOnScreenAroundNode);
	dijit.placementRegistry.register("rect", function (n, x) {
		return typeof x == "object" && "x" in x && "y" in x && "width" in x && "height" in x;
	}, dijit.placeOnScreenAroundRectangle);
	dijit.placeOnScreenAroundElement = function (node, aroundElement, aroundCorners, layoutNode) {
		return dijit.placementRegistry.match.apply(dijit.placementRegistry, arguments);
	};
	dijit.getPopupAlignment = function (position, leftToRight) {
		var align = {};
		dojo.forEach(position, function (pos) {
			switch (pos) {
			  case "after":
				align[leftToRight ? "BR" : "BL"] = leftToRight ? "BL" : "BR";
				break;
			  case "before":
				align[leftToRight ? "BL" : "BR"] = leftToRight ? "BR" : "BL";
				break;
			  case "below":
				align[leftToRight ? "BL" : "BR"] = leftToRight ? "TL" : "TR";
				align[leftToRight ? "BR" : "BL"] = leftToRight ? "TR" : "TL";
				break;
			  case "above":
			  default:
				align[leftToRight ? "TL" : "TR"] = leftToRight ? "BL" : "BR";
				align[leftToRight ? "TR" : "TL"] = leftToRight ? "BR" : "BL";
				break;
			}
		});
		return align;
	};
	dijit.getPopupAroundAlignment = function (position, leftToRight) {
		var align = {};
		dojo.forEach(position, function (pos) {
			switch (pos) {
			  case "after":
				align[leftToRight ? "BR" : "BL"] = leftToRight ? "BL" : "BR";
				break;
			  case "before":
				align[leftToRight ? "BL" : "BR"] = leftToRight ? "BR" : "BL";
				break;
			  case "below":
				align[leftToRight ? "BL" : "BR"] = leftToRight ? "TL" : "TR";
				align[leftToRight ? "BR" : "BL"] = leftToRight ? "TR" : "TL";
				break;
			  case "above":
			  default:
				align[leftToRight ? "TL" : "TR"] = leftToRight ? "BL" : "BR";
				align[leftToRight ? "TR" : "TL"] = leftToRight ? "BR" : "BL";
				break;
			}
		});
		return align;
	};
}

