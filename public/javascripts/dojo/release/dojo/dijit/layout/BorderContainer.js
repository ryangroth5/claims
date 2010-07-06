/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.layout.BorderContainer"]) {
	dojo._hasResource["dijit.layout.BorderContainer"] = true;
	dojo.provide("dijit.layout.BorderContainer");
	dojo.require("dijit.layout._LayoutWidget");
	dojo.require("dojo.cookie");
	dojo.declare("dijit.layout.BorderContainer", dijit.layout._LayoutWidget, {design:"headline", gutters:true, liveSplitters:true, persist:false, baseClass:"dijitBorderContainer", _splitterClass:"dijit.layout._Splitter", postMixInProperties:function () {
		if (!this.gutters) {
			this.baseClass += "NoGutter";
		}
		this.inherited(arguments);
	}, postCreate:function () {
		this.inherited(arguments);
		this._splitters = {};
		this._splitterThickness = {};
	}, startup:function () {
		if (this._started) {
			return;
		}
		dojo.forEach(this.getChildren(), this._setupChild, this);
		this.inherited(arguments);
	}, _setupChild:function (child) {
		var region = child.region;
		if (region) {
			this.inherited(arguments);
			dojo.addClass(child.domNode, this.baseClass + "Pane");
			var ltr = this.isLeftToRight();
			if (region == "leading") {
				region = ltr ? "left" : "right";
			}
			if (region == "trailing") {
				region = ltr ? "right" : "left";
			}
			this["_" + region] = child.domNode;
			this["_" + region + "Widget"] = child;
			if ((child.splitter || this.gutters) && !this._splitters[region]) {
				var _Splitter = dojo.getObject(child.splitter ? this._splitterClass : "dijit.layout._Gutter");
				var splitter = new _Splitter({container:this, child:child, region:region, live:this.liveSplitters});
				splitter.isSplitter = true;
				this._splitters[region] = splitter.domNode;
				dojo.place(this._splitters[region], child.domNode, "after");
				splitter.startup();
			}
			child.region = region;
		}
	}, _computeSplitterThickness:function (region) {
		this._splitterThickness[region] = this._splitterThickness[region] || dojo.marginBox(this._splitters[region])[(/top|bottom/.test(region) ? "h" : "w")];
	}, layout:function () {
		for (var region in this._splitters) {
			this._computeSplitterThickness(region);
		}
		this._layoutChildren();
	}, addChild:function (child, insertIndex) {
		this.inherited(arguments);
		if (this._started) {
			this.layout();
		}
	}, removeChild:function (child) {
		var region = child.region;
		var splitter = this._splitters[region];
		if (splitter) {
			dijit.byNode(splitter).destroy();
			delete this._splitters[region];
			delete this._splitterThickness[region];
		}
		this.inherited(arguments);
		delete this["_" + region];
		delete this["_" + region + "Widget"];
		if (this._started) {
			this._layoutChildren(child.region);
		}
		dojo.removeClass(child.domNode, this.baseClass + "Pane");
	}, getChildren:function () {
		return dojo.filter(this.inherited(arguments), function (widget) {
			return !widget.isSplitter;
		});
	}, getSplitter:function (region) {
		var splitter = this._splitters[region];
		return splitter ? dijit.byNode(splitter) : null;
	}, resize:function (newSize, currentSize) {
		if (!this.cs || !this.pe) {
			var node = this.domNode;
			this.cs = dojo.getComputedStyle(node);
			this.pe = dojo._getPadExtents(node, this.cs);
			this.pe.r = dojo._toPixelValue(node, this.cs.paddingRight);
			this.pe.b = dojo._toPixelValue(node, this.cs.paddingBottom);
			dojo.style(node, "padding", "0px");
		}
		this.inherited(arguments);
	}, _layoutChildren:function (changedRegion) {
		if (!this._borderBox || !this._borderBox.h) {
			return;
		}
		var sidebarLayout = (this.design == "sidebar");
		var topHeight = 0, bottomHeight = 0, leftWidth = 0, rightWidth = 0;
		var topStyle = {}, leftStyle = {}, rightStyle = {}, bottomStyle = {}, centerStyle = (this._center && this._center.style) || {};
		var changedSide = /left|right/.test(changedRegion);
		var layoutSides = !changedRegion || (!changedSide && !sidebarLayout);
		var layoutTopBottom = !changedRegion || (changedSide && sidebarLayout);
		if (this._top) {
			topStyle = layoutTopBottom && this._top.style;
			topHeight = dojo.marginBox(this._top).h;
		}
		if (this._left) {
			leftStyle = layoutSides && this._left.style;
			leftWidth = dojo.marginBox(this._left).w;
		}
		if (this._right) {
			rightStyle = layoutSides && this._right.style;
			rightWidth = dojo.marginBox(this._right).w;
		}
		if (this._bottom) {
			bottomStyle = layoutTopBottom && this._bottom.style;
			bottomHeight = dojo.marginBox(this._bottom).h;
		}
		var splitters = this._splitters;
		var topSplitter = splitters.top, bottomSplitter = splitters.bottom, leftSplitter = splitters.left, rightSplitter = splitters.right;
		var splitterThickness = this._splitterThickness;
		var topSplitterThickness = splitterThickness.top || 0, leftSplitterThickness = splitterThickness.left || 0, rightSplitterThickness = splitterThickness.right || 0, bottomSplitterThickness = splitterThickness.bottom || 0;
		if (leftSplitterThickness > 50 || rightSplitterThickness > 50) {
			setTimeout(dojo.hitch(this, function () {
				this._splitterThickness = {};
				for (var region in this._splitters) {
					this._computeSplitterThickness(region);
				}
				this._layoutChildren();
			}), 50);
			return false;
		}
		var pe = this.pe;
		var splitterBounds = {left:(sidebarLayout ? leftWidth + leftSplitterThickness : 0) + pe.l + "px", right:(sidebarLayout ? rightWidth + rightSplitterThickness : 0) + pe.r + "px"};
		if (topSplitter) {
			dojo.mixin(topSplitter.style, splitterBounds);
			topSplitter.style.top = topHeight + pe.t + "px";
		}
		if (bottomSplitter) {
			dojo.mixin(bottomSplitter.style, splitterBounds);
			bottomSplitter.style.bottom = bottomHeight + pe.b + "px";
		}
		splitterBounds = {top:(sidebarLayout ? 0 : topHeight + topSplitterThickness) + pe.t + "px", bottom:(sidebarLayout ? 0 : bottomHeight + bottomSplitterThickness) + pe.b + "px"};
		if (leftSplitter) {
			dojo.mixin(leftSplitter.style, splitterBounds);
			leftSplitter.style.left = leftWidth + pe.l + "px";
		}
		if (rightSplitter) {
			dojo.mixin(rightSplitter.style, splitterBounds);
			rightSplitter.style.right = rightWidth + pe.r + "px";
		}
		dojo.mixin(centerStyle, {top:pe.t + topHeight + topSplitterThickness + "px", left:pe.l + leftWidth + leftSplitterThickness + "px", right:pe.r + rightWidth + rightSplitterThickness + "px", bottom:pe.b + bottomHeight + bottomSplitterThickness + "px"});
		var bounds = {top:sidebarLayout ? pe.t + "px" : centerStyle.top, bottom:sidebarLayout ? pe.b + "px" : centerStyle.bottom};
		dojo.mixin(leftStyle, bounds);
		dojo.mixin(rightStyle, bounds);
		leftStyle.left = pe.l + "px";
		rightStyle.right = pe.r + "px";
		topStyle.top = pe.t + "px";
		bottomStyle.bottom = pe.b + "px";
		if (sidebarLayout) {
			topStyle.left = bottomStyle.left = leftWidth + leftSplitterThickness + pe.l + "px";
			topStyle.right = bottomStyle.right = rightWidth + rightSplitterThickness + pe.r + "px";
		} else {
			topStyle.left = bottomStyle.left = pe.l + "px";
			topStyle.right = bottomStyle.right = pe.r + "px";
		}
		var containerHeight = this._borderBox.h - pe.t - pe.b, middleHeight = containerHeight - (topHeight + topSplitterThickness + bottomHeight + bottomSplitterThickness), sidebarHeight = sidebarLayout ? containerHeight : middleHeight;
		var containerWidth = this._borderBox.w - pe.l - pe.r, middleWidth = containerWidth - (leftWidth + leftSplitterThickness + rightWidth + rightSplitterThickness), sidebarWidth = sidebarLayout ? middleWidth : containerWidth;
		var dim = {top:{w:sidebarWidth, h:topHeight}, bottom:{w:sidebarWidth, h:bottomHeight}, left:{w:leftWidth, h:sidebarHeight}, right:{w:rightWidth, h:sidebarHeight}, center:{h:middleHeight, w:middleWidth}};
		var janky = dojo.isIE < 8 || (dojo.isIE && dojo.isQuirks) || dojo.some(this.getChildren(), function (child) {
			return child.domNode.tagName == "TEXTAREA" || child.domNode.tagName == "INPUT";
		});
		if (janky) {
			var resizeWidget = function (widget, changes, result) {
				if (widget) {
					(widget.resize ? widget.resize(changes, result) : dojo.marginBox(widget.domNode, changes));
				}
			};
			if (leftSplitter) {
				leftSplitter.style.height = sidebarHeight;
			}
			if (rightSplitter) {
				rightSplitter.style.height = sidebarHeight;
			}
			resizeWidget(this._leftWidget, {h:sidebarHeight}, dim.left);
			resizeWidget(this._rightWidget, {h:sidebarHeight}, dim.right);
			if (topSplitter) {
				topSplitter.style.width = sidebarWidth;
			}
			if (bottomSplitter) {
				bottomSplitter.style.width = sidebarWidth;
			}
			resizeWidget(this._topWidget, {w:sidebarWidth}, dim.top);
			resizeWidget(this._bottomWidget, {w:sidebarWidth}, dim.bottom);
			resizeWidget(this._centerWidget, dim.center);
		} else {
			var resizeList = {};
			if (changedRegion) {
				resizeList[changedRegion] = resizeList.center = true;
				if (/top|bottom/.test(changedRegion) && this.design != "sidebar") {
					resizeList.left = resizeList.right = true;
				} else {
					if (/left|right/.test(changedRegion) && this.design == "sidebar") {
						resizeList.top = resizeList.bottom = true;
					}
				}
			}
			dojo.forEach(this.getChildren(), function (child) {
				if (child.resize && (!changedRegion || child.region in resizeList)) {
					child.resize(null, dim[child.region]);
				}
			}, this);
		}
	}, destroy:function () {
		for (var region in this._splitters) {
			var splitter = this._splitters[region];
			dijit.byNode(splitter).destroy();
			dojo.destroy(splitter);
		}
		delete this._splitters;
		delete this._splitterThickness;
		this.inherited(arguments);
	}});
	dojo.extend(dijit._Widget, {region:"", splitter:false, minSize:0, maxSize:Infinity});
	dojo.require("dijit._Templated");
	dojo.declare("dijit.layout._Splitter", [dijit._Widget, dijit._Templated], {live:true, templateString:"<div class=\"dijitSplitter\" dojoAttachEvent=\"onkeypress:_onKeyPress,onmousedown:_startDrag,onmouseenter:_onMouse,onmouseleave:_onMouse\" tabIndex=\"0\" waiRole=\"separator\"><div class=\"dijitSplitterThumb\"></div></div>", postCreate:function () {
		this.inherited(arguments);
		this.horizontal = /top|bottom/.test(this.region);
		dojo.addClass(this.domNode, "dijitSplitter" + (this.horizontal ? "H" : "V"));
		this._factor = /top|left/.test(this.region) ? 1 : -1;
		this._cookieName = this.container.id + "_" + this.region;
		if (this.container.persist) {
			var persistSize = dojo.cookie(this._cookieName);
			if (persistSize) {
				this.child.domNode.style[this.horizontal ? "height" : "width"] = persistSize;
			}
		}
	}, _computeMaxSize:function () {
		var dim = this.horizontal ? "h" : "w", thickness = this.container._splitterThickness[this.region];
		var flip = {left:"right", right:"left", top:"bottom", bottom:"top", leading:"trailing", trailing:"leading"}, oppNode = this.container["_" + flip[this.region]];
		var available = dojo.contentBox(this.container.domNode)[dim] - (oppNode ? dojo.marginBox(oppNode)[dim] : 0) - 20 - thickness * 2;
		return Math.min(this.child.maxSize, available);
	}, _startDrag:function (e) {
		if (!this.cover) {
			this.cover = dojo.doc.createElement("div");
			dojo.addClass(this.cover, "dijitSplitterCover");
			dojo.place(this.cover, this.child.domNode, "after");
		}
		dojo.addClass(this.cover, "dijitSplitterCoverActive");
		if (this.fake) {
			dojo.destroy(this.fake);
		}
		if (!(this._resize = this.live)) {
			(this.fake = this.domNode.cloneNode(true)).removeAttribute("id");
			dojo.addClass(this.domNode, "dijitSplitterShadow");
			dojo.place(this.fake, this.domNode, "after");
		}
		dojo.addClass(this.domNode, "dijitSplitterActive");
		dojo.addClass(this.domNode, "dijitSplitter" + (this.horizontal ? "H" : "V") + "Active");
		if (this.fake) {
			dojo.removeClass(this.fake, "dijitSplitterHover");
			dojo.removeClass(this.fake, "dijitSplitter" + (this.horizontal ? "H" : "V") + "Hover");
		}
		var factor = this._factor, max = this._computeMaxSize(), min = this.child.minSize || 20, isHorizontal = this.horizontal, axis = isHorizontal ? "pageY" : "pageX", pageStart = e[axis], splitterStyle = this.domNode.style, dim = isHorizontal ? "h" : "w", childStart = dojo.marginBox(this.child.domNode)[dim], region = this.region, splitterStart = parseInt(this.domNode.style[region], 10), resize = this._resize, mb = {}, childNode = this.child.domNode, layoutFunc = dojo.hitch(this.container, this.container._layoutChildren), de = dojo.doc.body;
		this._handlers = (this._handlers || []).concat([dojo.connect(de, "onmousemove", this._drag = function (e, forceResize) {
			var delta = e[axis] - pageStart, childSize = factor * delta + childStart, boundChildSize = Math.max(Math.min(childSize, max), min);
			if (resize || forceResize) {
				mb[dim] = boundChildSize;
				dojo.marginBox(childNode, mb);
				layoutFunc(region);
			}
			splitterStyle[region] = factor * delta + splitterStart + (boundChildSize - childSize) + "px";
		}), dojo.connect(dojo.doc, "ondragstart", dojo.stopEvent), dojo.connect(dojo.body(), "onselectstart", dojo.stopEvent), dojo.connect(de, "onmouseup", this, "_stopDrag")]);
		dojo.stopEvent(e);
	}, _onMouse:function (e) {
		var o = (e.type == "mouseover" || e.type == "mouseenter");
		dojo.toggleClass(this.domNode, "dijitSplitterHover", o);
		dojo.toggleClass(this.domNode, "dijitSplitter" + (this.horizontal ? "H" : "V") + "Hover", o);
	}, _stopDrag:function (e) {
		try {
			if (this.cover) {
				dojo.removeClass(this.cover, "dijitSplitterCoverActive");
			}
			if (this.fake) {
				dojo.destroy(this.fake);
			}
			dojo.removeClass(this.domNode, "dijitSplitterActive");
			dojo.removeClass(this.domNode, "dijitSplitter" + (this.horizontal ? "H" : "V") + "Active");
			dojo.removeClass(this.domNode, "dijitSplitterShadow");
			this._drag(e);
			this._drag(e, true);
		}
		finally {
			this._cleanupHandlers();
			delete this._drag;
		}
		if (this.container.persist) {
			dojo.cookie(this._cookieName, this.child.domNode.style[this.horizontal ? "height" : "width"], {expires:365});
		}
	}, _cleanupHandlers:function () {
		dojo.forEach(this._handlers, dojo.disconnect);
		delete this._handlers;
	}, _onKeyPress:function (e) {
		this._resize = true;
		var horizontal = this.horizontal;
		var tick = 1;
		var dk = dojo.keys;
		switch (e.charOrCode) {
		  case horizontal ? dk.UP_ARROW : dk.LEFT_ARROW:
			tick *= -1;
		  case horizontal ? dk.DOWN_ARROW : dk.RIGHT_ARROW:
			break;
		  default:
			return;
		}
		var childSize = dojo.marginBox(this.child.domNode)[horizontal ? "h" : "w"] + this._factor * tick;
		var mb = {};
		mb[this.horizontal ? "h" : "w"] = Math.max(Math.min(childSize, this._computeMaxSize()), this.child.minSize);
		dojo.marginBox(this.child.domNode, mb);
		this.container._layoutChildren(this.region);
		dojo.stopEvent(e);
	}, destroy:function () {
		this._cleanupHandlers();
		delete this.child;
		delete this.container;
		delete this.cover;
		delete this.fake;
		this.inherited(arguments);
	}});
	dojo.declare("dijit.layout._Gutter", [dijit._Widget, dijit._Templated], {templateString:"<div class=\"dijitGutter\" waiRole=\"presentation\"></div>", postCreate:function () {
		this.horizontal = /top|bottom/.test(this.region);
		dojo.addClass(this.domNode, "dijitGutter" + (this.horizontal ? "H" : "V"));
	}});
}

