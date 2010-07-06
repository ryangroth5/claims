/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.ColorPalette"]) {
	dojo._hasResource["dijit.ColorPalette"] = true;
	dojo.provide("dijit.ColorPalette");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dojo.colors");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dojo", "colors", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,ko,nb,nl,pl,pt,pt-pt,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dijit.ColorPalette", [dijit._Widget, dijit._Templated], {defaultTimeout:500, timeoutChangeRate:0.9, palette:"7x10", value:null, _currentFocus:0, _xDim:null, _yDim:null, _palettes:{"7x10":[["white", "seashell", "cornsilk", "lemonchiffon", "lightyellow", "palegreen", "paleturquoise", "lightcyan", "lavender", "plum"], ["lightgray", "pink", "bisque", "moccasin", "khaki", "lightgreen", "lightseagreen", "lightskyblue", "cornflowerblue", "violet"], ["silver", "lightcoral", "sandybrown", "orange", "palegoldenrod", "chartreuse", "mediumturquoise", "skyblue", "mediumslateblue", "orchid"], ["gray", "red", "orangered", "darkorange", "yellow", "limegreen", "darkseagreen", "royalblue", "slateblue", "mediumorchid"], ["dimgray", "crimson", "chocolate", "coral", "gold", "forestgreen", "seagreen", "blue", "blueviolet", "darkorchid"], ["darkslategray", "firebrick", "saddlebrown", "sienna", "olive", "green", "darkcyan", "mediumblue", "darkslateblue", "darkmagenta"], ["black", "darkred", "maroon", "brown", "darkolivegreen", "darkgreen", "midnightblue", "navy", "indigo", "purple"]], "3x4":[["white", "lime", "green", "blue"], ["silver", "yellow", "fuchsia", "navy"], ["gray", "red", "purple", "black"]]}, _imagePaths:{"7x10":dojo.moduleUrl("dijit.themes", "a11y/colors7x10.png"), "3x4":dojo.moduleUrl("dijit.themes", "a11y/colors3x4.png")}, _paletteCoords:{"leftOffset":3, "topOffset":3, "cWidth":20, "cHeight":20}, templateString:dojo.cache("dijit", "templates/ColorPalette.html", "<div class=\"dijitInline dijitColorPalette\">\n\t<div class=\"dijitColorPaletteInner\" dojoAttachPoint=\"divNode\" waiRole=\"grid\"\">\n\t\t<img class=\"dijitColorPaletteUnder\" dojoAttachPoint=\"imageNode\" waiRole=\"presentation\" alt=\"\">\n\t</div>\n</div>\n"), _paletteDims:{"7x10":{"width":"206px", "height":"145px"}, "3x4":{"width":"86px", "height":"64px"}}, tabIndex:"0", buildRendering:function () {
		this.inherited(arguments);
		dojo.mixin(this.divNode.style, this._paletteDims[this.palette]);
		this.imageNode.setAttribute("src", this._imagePaths[this.palette].toString());
		var choices = this._palettes[this.palette];
		this.domNode.style.position = "relative";
		this._cellNodes = [];
		this.colorNames = dojo.i18n.getLocalization("dojo", "colors", this.lang);
		var url = this._blankGif, colorObject = new dojo.Color(), coords = this._paletteCoords;
		for (var row = 0; row < choices.length; row++) {
			var rowNode = dojo.create("div", {role:"row"}, this.divNode);
			for (var col = 0; col < choices[row].length; col++) {
				var color = choices[row][col], colorValue = colorObject.setColor(dojo.Color.named[color]);
				var cellNode = dojo.create("span", {"class":"dijitPaletteCell", tabIndex:"-1", title:this.colorNames[color], style:{top:coords.topOffset + (row * coords.cHeight) + "px", left:coords.leftOffset + (col * coords.cWidth) + "px"}});
				var imgNode = dojo.create("img", {src:url, "class":"dijitPaletteImg", alt:this.colorNames[color]}, cellNode);
				imgNode.color = colorValue.toHex();
				var imgStyle = imgNode.style;
				imgStyle.color = imgStyle.backgroundColor = imgNode.color;
				dojo.forEach(["Dijitclick", "MouseEnter", "MouseLeave", "Focus"], function (handler) {
					this.connect(cellNode, "on" + handler.toLowerCase(), "_onCell" + handler);
				}, this);
				dojo.place(cellNode, rowNode);
				dijit.setWaiRole(cellNode, "gridcell");
				cellNode.index = this._cellNodes.length;
				this._cellNodes.push(cellNode);
			}
		}
		this._xDim = choices[0].length;
		this._yDim = choices.length;
		var keyIncrementMap = {UP_ARROW:-this._xDim, DOWN_ARROW:this._xDim, RIGHT_ARROW:1, LEFT_ARROW:-1};
		for (var key in keyIncrementMap) {
			this._connects.push(dijit.typematic.addKeyListener(this.domNode, {charOrCode:dojo.keys[key], ctrlKey:false, altKey:false, shiftKey:false}, this, function () {
				var increment = keyIncrementMap[key];
				return function (count) {
					this._navigateByKey(increment, count);
				};
			}(), this.timeoutChangeRate, this.defaultTimeout));
		}
	}, postCreate:function () {
		this.inherited(arguments);
		this._currentFocus = this._cellNodes[0];
		dojo.attr(this._currentFocus, "tabIndex", this.tabIndex);
	}, focus:function () {
		dojo.addClass(this._currentFocus, "dijitPaletteCellHighlight");
		dijit.focus(this._currentFocus);
	}, onChange:function (color) {
	}, _onFocus:function () {
		dojo.addClass(this._currentFocus, "dijitPaletteCellHighlight");
		this.inherited(arguments);
	}, _onBlur:function () {
		dojo.attr(this._currentFocus, "tabIndex", "-1");
		dojo.removeClass(this._currentFocus, "dijitPaletteCellHighlight");
		this._currentFocus = this._cellNodes[0];
		dojo.attr(this._currentFocus, "tabIndex", this.tabIndex);
		this.inherited(arguments);
	}, _onCellDijitclick:function (evt) {
		var target = evt.currentTarget;
		this._selectColor(target);
		dojo.stopEvent(evt);
	}, _onCellMouseEnter:function (evt) {
		var target = evt.currentTarget;
		this._setCurrent(target);
	}, _onCellMouseLeave:function (evt) {
		dojo.removeClass(this._currentFocus, "dijitPaletteCellHighlight");
	}, _onCellFocus:function (evt) {
		this._setCurrent(evt.currentTarget);
	}, _setCurrent:function (node) {
		if ("_currentFocus" in this) {
			dojo.attr(this._currentFocus, "tabIndex", "-1");
			dojo.removeClass(this._currentFocus, "dijitPaletteCellHighlight");
		}
		this._currentFocus = node;
		if (node) {
			dojo.attr(node, "tabIndex", this.tabIndex);
			dojo.addClass(node, "dijitPaletteCellHighlight");
		}
	}, _selectColor:function (selectNode) {
		var img = selectNode.getElementsByTagName("img")[0];
		this.onChange(this.value = img.color);
	}, _navigateByKey:function (increment, typeCount) {
		if (typeCount == -1) {
			return;
		}
		var newFocusIndex = this._currentFocus.index + increment;
		if (newFocusIndex < this._cellNodes.length && newFocusIndex > -1) {
			var focusNode = this._cellNodes[newFocusIndex];
			this._setCurrent(focusNode);
			setTimeout(dojo.hitch(dijit, "focus", focusNode), 0);
		}
	}});
}

