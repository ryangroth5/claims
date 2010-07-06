/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.grid.enhanced._Builder"]) {
	dojo._hasResource["dojox.grid.enhanced._Builder"] = true;
	dojo.provide("dojox.grid.enhanced._Builder");
	dojo.require("dojox.grid._Builder");
	dojo.declare("dojox.grid.enhanced._BuilderMixin", null, {generateCellMarkup:function (inCell, inMoreStyles, inMoreClasses, isHeader) {
		var result = this.inherited(arguments);
		if (!isHeader) {
			result[4] += "<div class=\"dojoxGridCellContent\">";
			result[6] = "</div></td>";
		}
		return result;
	}, domouseup:function (e) {
		if (e.cellNode) {
			this.grid.onMouseUp(e);
		}
	}});
	dojo.declare("dojox.grid.enhanced._HeaderBuilder", [dojox.grid._HeaderBuilder, dojox.grid.enhanced._BuilderMixin], {getCellX:function (e) {
		if (this.grid.nestedSorting) {
			var ascendDom = function (inNode, inWhile) {
				for (var n = inNode; n && inWhile(n); n = n.parentNode) {
				}
				return n;
			};
			var makeNotTagName = function (inTagName) {
				var name = inTagName.toUpperCase();
				return function (node) {
					return node.tagName != name;
				};
			};
			var no = ascendDom(e.target, makeNotTagName("th"));
			var x = no ? e.pageX - dojo.coords(no, true).x : -1;
			if (dojo.isIE) {
				var rect = dojo.body().getBoundingClientRect();
				var zoomLevel = (rect.right - rect.left) / document.body.clientWidth;
				return parseInt(x / zoomLevel);
			}
			return x;
		}
		return this.inherited(arguments);
	}, decorateEvent:function (e) {
		var result = this.inherited(arguments);
		if (this.grid.nestedSorting) {
			var sortInfo = this.grid._getSortEventInfo(e);
			e.unarySortChoice = sortInfo.unarySortChoice;
			e.nestedSortChoice = sortInfo.nestedSortChoice;
			e.selectChoice = sortInfo.selectChoice;
		}
		return result;
	}, doclick:function (e) {
		if ((this._skipBogusClicks && !this.grid.nestedSorting) || (this.grid.nestedSorting && this.grid.ignoreEvent(e))) {
			dojo.stopEvent(e);
			return true;
		}
	}, colResizeSetup:function (e, isMouse) {
		var origMinColWidthRef = this.minColWidth;
		if (e.sourceView.grid.nestedSorting && !this.grid.pluginMgr.isFixedCell(e.cell)) {
			this.minColWidth = this.grid.getMinColWidth();
			var conn = dojo.connect(this, "endResizeColumn", dojo.hitch(this, function () {
				this.minColWidth = origMinColWidthRef;
				dojo.disconnect(conn);
			}));
		}
		var drag = this.inherited(arguments);
		if (!dojo._isBodyLtr() && dojo.isIE && drag.followers) {
			dojo.forEach(drag.followers, function (follower) {
				if (!follower.left) {
					follower.left = dojo.position(follower.node).x;
				}
			});
		}
		return drag;
	}});
	dojo.declare("dojox.grid.enhanced._ContentBuilder", [dojox.grid._ContentBuilder, dojox.grid.enhanced._BuilderMixin], {});
}

