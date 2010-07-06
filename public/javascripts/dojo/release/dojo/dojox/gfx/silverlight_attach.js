/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



dojo.require("dojox.gfx.silverlight");
dojo.experimental("dojox.gfx.silverlight_attach");
(function () {
	dojox.gfx.attachNode = function (node) {
		return null;
		if (!node) {
			return null;
		}
		var s = null;
		switch (node.tagName.toLowerCase()) {
		  case dojox.gfx.Rect.nodeType:
			s = new dojox.gfx.Rect(node);
			break;
		  case dojox.gfx.Ellipse.nodeType:
			if (node.width == node.height) {
				s = new dojox.gfx.Circle(node);
			} else {
				s = new dojox.gfx.Ellipse(node);
			}
			break;
		  case dojox.gfx.Polyline.nodeType:
			s = new dojox.gfx.Polyline(node);
			break;
		  case dojox.gfx.Path.nodeType:
			s = new dojox.gfx.Path(node);
			break;
		  case dojox.gfx.Line.nodeType:
			s = new dojox.gfx.Line(node);
			break;
		  case dojox.gfx.Image.nodeType:
			s = new dojox.gfx.Image(node);
			break;
		  case dojox.gfx.Text.nodeType:
			s = new dojox.gfx.Text(node);
			attachFont(s);
			break;
		  default:
			return null;
		}
		attachShape(s);
		if (!(s instanceof dojox.gfx.Image)) {
			attachFill(s);
			attachStroke(s);
		}
		attachTransform(s);
		return s;
	};
	dojox.gfx.attachSurface = function (node) {
		return null;
	};
	var attachFill = function (rawNode) {
		return null;
	};
	var attachStroke = function (rawNode) {
		return null;
	};
	var attachTransform = function (rawNode) {
		return null;
	};
	var attachFont = function (rawNode) {
		return null;
	};
	var attachShape = function (rawNode) {
		return null;
	};
})();

