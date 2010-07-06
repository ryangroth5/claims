/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.drawing.ui.Toolbar"]) {
	dojo._hasResource["dojox.drawing.ui.Toolbar"] = true;
	dojo.provide("dojox.drawing.ui.Toolbar");
	dojo.require("dojox.drawing.library.icons");
	dojo.declare("dojox.drawing.ui.Toolbar", [], {constructor:function (props, node) {
		this.util = dojox.drawing.util.common;
		if (props.drawing) {
			this.toolDrawing = props.drawing;
			this.drawing = this.toolDrawing;
			this.width = this.toolDrawing.width;
			this.height = this.toolDrawing.height;
			this.strSelected = props.selected;
			this.strTools = props.tools;
			this.strPlugs = props.plugs;
			this._mixprops(["padding", "margin", "size", "radius"], props);
			this.addBack();
		} else {
			var box = dojo.marginBox(node);
			this.width = box.w;
			this.height = box.h;
			this.strSelected = dojo.attr(node, "selected");
			this.strTools = dojo.attr(node, "tools");
			this.strPlugs = dojo.attr(node, "plugs");
			this._mixprops(["padding", "margin", "size", "radius"], node);
			this.toolDrawing = new dojox.drawing.Drawing({mode:"ui"}, node);
		}
		this.horizontal = this.width > this.height;
		if (this.toolDrawing.ready) {
			this.makeButtons();
		} else {
			var c = dojo.connect(this.toolDrawing, "onSurfaceReady", this, function () {
				dojo.disconnect(c);
				this.drawing = dojox.drawing.getRegistered("drawing", dojo.attr(node, "drawingId"));
				this.makeButtons();
			});
		}
	}, padding:10, margin:5, size:30, radius:3, toolPlugGap:20, strSlelected:"", strTools:"", strPlugs:"", makeButtons:function () {
		this.buttons = [];
		this.plugins = [];
		var x = this.padding, y = this.padding, w = this.size, h = this.size, r = this.radius, g = this.margin, sym = dojox.drawing.library.icons, s = {place:"BR", size:2, mult:4};
		if (this.strTools) {
			var toolAr = [];
			if (this.strTools == "all") {
				for (var nm in dojox.drawing.getRegistered("tool")) {
					toolAr.push(this.util.abbr(nm));
				}
			} else {
				toolAr = this.strTools.split(",");
				dojo.map(toolAr, function (t) {
					return dojo.trim(t);
				});
			}
			dojo.forEach(toolAr, function (t) {
				t = dojo.trim(t);
				var btn = this.toolDrawing.addUI("button", {data:{x:x, y:y, width:w, height:h, r:r}, toolType:t, icon:sym[t], shadow:s, scope:this, callback:"onToolClick"});
				this.buttons.push(btn);
				if (this.strSelected == t) {
					btn.select();
					this.drawing.setTool(btn.toolType);
				}
				if (this.horizontal) {
					y += h + g;
				} else {
					y += h + g;
				}
			}, this);
		}
		if (this.horizontal) {
			y += this.toolPlugGap;
		} else {
			y += this.toolPlugGap;
		}
		if (this.strPlugs) {
			var plugAr = [];
			if (this.strPlugs == "all") {
				for (var nm in dojox.drawing.getRegistered("plugin")) {
					plugAr.push(this.util.abbr(nm));
				}
			} else {
				plugAr = this.strPlugs.split(",");
				dojo.map(plugAr, function (p) {
					return dojo.trim(p);
				});
			}
			dojo.forEach(plugAr, function (p) {
				t = dojo.trim(p);
				var btn = this.toolDrawing.addUI("button", {data:{x:x, y:y, width:w, height:h, r:r}, toolType:t, icon:sym[t], shadow:s, scope:this, callback:"onPlugClick"});
				this.plugins.push(btn);
				if (this.horizontal) {
					y += h + g;
				} else {
					y += h + g;
				}
				this.drawing.addPlugin({name:this.drawing.stencilTypeMap[p], options:{button:btn}});
			}, this);
		}
	}, addTool:function () {
	}, addPlugin:function () {
	}, addBack:function () {
		this.toolDrawing.addUI("rect", {data:{x:0, y:0, width:this.width, height:this.size + (this.padding * 2), fill:"#ffffff", borderWidth:0}});
	}, onToolClick:function (button) {
		dojo.forEach(this.buttons, function (b) {
			if (b.id == button.id) {
				b.select();
				this.drawing.setTool(button.toolType);
			} else {
				b.deselect();
			}
		}, this);
	}, onPlugClick:function (button) {
	}, _mixprops:function (props, objNode) {
		dojo.forEach(props, function (p) {
			this[p] = objNode.tagName ? dojo.attr(objNode, p) === null ? this[p] : dojo.attr(objNode, p) : objNode[p] === undefined ? this[p] : objNode[p];
		}, this);
	}});
}

