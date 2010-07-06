/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.Tooltip"]) {
	dojo._hasResource["dijit.Tooltip"] = true;
	dojo.provide("dijit.Tooltip");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.declare("dijit._MasterTooltip", [dijit._Widget, dijit._Templated], {duration:dijit.defaultDuration, templateString:dojo.cache("dijit", "templates/Tooltip.html", "<div class=\"dijitTooltip dijitTooltipLeft\" id=\"dojoTooltip\">\n\t<div class=\"dijitTooltipContainer dijitTooltipContents\" dojoAttachPoint=\"containerNode\" waiRole='alert'></div>\n\t<div class=\"dijitTooltipConnector\"></div>\n</div>\n"), postCreate:function () {
		dojo.body().appendChild(this.domNode);
		this.bgIframe = new dijit.BackgroundIframe(this.domNode);
		this.fadeIn = dojo.fadeIn({node:this.domNode, duration:this.duration, onEnd:dojo.hitch(this, "_onShow")});
		this.fadeOut = dojo.fadeOut({node:this.domNode, duration:this.duration, onEnd:dojo.hitch(this, "_onHide")});
	}, show:function (innerHTML, aroundNode, position) {
		if (this.aroundNode && this.aroundNode === aroundNode) {
			return;
		}
		if (this.fadeOut.status() == "playing") {
			this._onDeck = arguments;
			return;
		}
		this.containerNode.innerHTML = innerHTML;
		this.domNode.style.top = (this.domNode.offsetTop + 1) + "px";
		var pos = dijit.placeOnScreenAroundElement(this.domNode, aroundNode, dijit.getPopupAroundAlignment((position && position.length) ? position : dijit.Tooltip.defaultPosition, this.isLeftToRight()), dojo.hitch(this, "orient"));
		dojo.style(this.domNode, "opacity", 0);
		this.fadeIn.play();
		this.isShowingNow = true;
		this.aroundNode = aroundNode;
	}, orient:function (node, aroundCorner, tooltipCorner) {
		node.className = "dijitTooltip " + {"BL-TL":"dijitTooltipBelow dijitTooltipABLeft", "TL-BL":"dijitTooltipAbove dijitTooltipABLeft", "BR-TR":"dijitTooltipBelow dijitTooltipABRight", "TR-BR":"dijitTooltipAbove dijitTooltipABRight", "BR-BL":"dijitTooltipRight", "BL-BR":"dijitTooltipLeft"}[aroundCorner + "-" + tooltipCorner];
	}, _onShow:function () {
		if (dojo.isIE) {
			this.domNode.style.filter = "";
		}
	}, hide:function (aroundNode) {
		if (this._onDeck && this._onDeck[1] == aroundNode) {
			this._onDeck = null;
		} else {
			if (this.aroundNode === aroundNode) {
				this.fadeIn.stop();
				this.isShowingNow = false;
				this.aroundNode = null;
				this.fadeOut.play();
			} else {
			}
		}
	}, _onHide:function () {
		this.domNode.style.cssText = "";
		if (this._onDeck) {
			this.show.apply(this, this._onDeck);
			this._onDeck = null;
		}
	}});
	dijit.showTooltip = function (innerHTML, aroundNode, position) {
		if (!dijit._masterTT) {
			dijit._masterTT = new dijit._MasterTooltip();
		}
		return dijit._masterTT.show(innerHTML, aroundNode, position);
	};
	dijit.hideTooltip = function (aroundNode) {
		if (!dijit._masterTT) {
			dijit._masterTT = new dijit._MasterTooltip();
		}
		return dijit._masterTT.hide(aroundNode);
	};
	dojo.declare("dijit.Tooltip", dijit._Widget, {label:"", showDelay:400, connectId:[], position:[], constructor:function () {
		this._nodeConnectionsById = {};
	}, _setConnectIdAttr:function (newIds) {
		for (var oldId in this._nodeConnectionsById) {
			this.removeTarget(oldId);
		}
		dojo.forEach(dojo.isArrayLike(newIds) ? newIds : [newIds], this.addTarget, this);
	}, _getConnectIdAttr:function () {
		var ary = [];
		for (var id in this._nodeConnectionsById) {
			ary.push(id);
		}
		return ary;
	}, addTarget:function (id) {
		var node = dojo.byId(id);
		if (!node) {
			return;
		}
		if (node.id in this._nodeConnectionsById) {
			return;
		}
		this._nodeConnectionsById[node.id] = [this.connect(node, "onmouseenter", "_onTargetMouseEnter"), this.connect(node, "onmouseleave", "_onTargetMouseLeave"), this.connect(node, "onfocus", "_onTargetFocus"), this.connect(node, "onblur", "_onTargetBlur")];
		if (dojo.isIE && !node.style.zoom) {
			node.style.zoom = 1;
		}
	}, removeTarget:function (node) {
		var id = node.id || node;
		if (id in this._nodeConnectionsById) {
			dojo.forEach(this._nodeConnectionsById[id], this.disconnect, this);
			delete this._nodeConnectionsById[id];
		}
	}, postCreate:function () {
		dojo.addClass(this.domNode, "dijitTooltipData");
	}, startup:function () {
		this.inherited(arguments);
		var ids = this.connectId;
		dojo.forEach(dojo.isArrayLike(ids) ? ids : [ids], this.addTarget, this);
	}, _onTargetMouseEnter:function (e) {
		this._onHover(e);
	}, _onTargetMouseLeave:function (e) {
		this._onUnHover(e);
	}, _onTargetFocus:function (e) {
		this._focus = true;
		this._onHover(e);
	}, _onTargetBlur:function (e) {
		this._focus = false;
		this._onUnHover(e);
	}, _onHover:function (e) {
		if (!this._showTimer) {
			var target = e.target;
			this._showTimer = setTimeout(dojo.hitch(this, function () {
				this.open(target);
			}), this.showDelay);
		}
	}, _onUnHover:function (e) {
		if (this._focus) {
			return;
		}
		if (this._showTimer) {
			clearTimeout(this._showTimer);
			delete this._showTimer;
		}
		this.close();
	}, open:function (target) {
		if (this._showTimer) {
			clearTimeout(this._showTimer);
			delete this._showTimer;
		}
		dijit.showTooltip(this.label || this.domNode.innerHTML, target, this.position);
		this._connectNode = target;
		this.onShow(target, this.position);
	}, close:function () {
		if (this._connectNode) {
			dijit.hideTooltip(this._connectNode);
			delete this._connectNode;
			this.onHide();
		}
		if (this._showTimer) {
			clearTimeout(this._showTimer);
			delete this._showTimer;
		}
	}, onShow:function (target, position) {
	}, onHide:function () {
	}, uninitialize:function () {
		this.close();
		this.inherited(arguments);
	}});
	dijit.Tooltip.defaultPosition = ["after", "before"];
}

