/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._base.manager"]) {
	dojo._hasResource["dijit._base.manager"] = true;
	dojo.provide("dijit._base.manager");
	dojo.declare("dijit.WidgetSet", null, {constructor:function () {
		this._hash = {};
		this.length = 0;
	}, add:function (widget) {
		if (this._hash[widget.id]) {
			throw new Error("Tried to register widget with id==" + widget.id + " but that id is already registered");
		}
		this._hash[widget.id] = widget;
		this.length++;
	}, remove:function (id) {
		if (this._hash[id]) {
			delete this._hash[id];
			this.length--;
		}
	}, forEach:function (func, thisObj) {
		thisObj = thisObj || dojo.global;
		var i = 0, id;
		for (id in this._hash) {
			func.call(thisObj, this._hash[id], i++, this._hash);
		}
		return this;
	}, filter:function (filter, thisObj) {
		thisObj = thisObj || dojo.global;
		var res = new dijit.WidgetSet(), i = 0, id;
		for (id in this._hash) {
			var w = this._hash[id];
			if (filter.call(thisObj, w, i++, this._hash)) {
				res.add(w);
			}
		}
		return res;
	}, byId:function (id) {
		return this._hash[id];
	}, byClass:function (cls) {
		var res = new dijit.WidgetSet(), id, widget;
		for (id in this._hash) {
			widget = this._hash[id];
			if (widget.declaredClass == cls) {
				res.add(widget);
			}
		}
		return res;
	}, toArray:function () {
		var ar = [];
		for (var id in this._hash) {
			ar.push(this._hash[id]);
		}
		return ar;
	}, map:function (func, thisObj) {
		return dojo.map(this.toArray(), func, thisObj);
	}, every:function (func, thisObj) {
		thisObj = thisObj || dojo.global;
		var x = 0, i;
		for (i in this._hash) {
			if (!func.call(thisObj, this._hash[i], x++, this._hash)) {
				return false;
			}
		}
		return true;
	}, some:function (func, thisObj) {
		thisObj = thisObj || dojo.global;
		var x = 0, i;
		for (i in this._hash) {
			if (func.call(thisObj, this._hash[i], x++, this._hash)) {
				return true;
			}
		}
		return false;
	}});
	dijit.registry = new dijit.WidgetSet();
	dijit._widgetTypeCtr = {};
	dijit.getUniqueId = function (widgetType) {
		var id;
		do {
			id = widgetType + "_" + (widgetType in dijit._widgetTypeCtr ? ++dijit._widgetTypeCtr[widgetType] : dijit._widgetTypeCtr[widgetType] = 0);
		} while (dijit.byId(id));
		return dijit._scopeName == "dijit" ? id : dijit._scopeName + "_" + id;
	};
	dijit.findWidgets = function (root) {
		var outAry = [];
		function getChildrenHelper(root) {
			for (var node = root.firstChild; node; node = node.nextSibling) {
				if (node.nodeType == 1) {
					var widgetId = node.getAttribute("widgetId");
					if (widgetId) {
						var widget = dijit.byId(widgetId);
						outAry.push(widget);
					} else {
						getChildrenHelper(node);
					}
				}
			}
		}
		getChildrenHelper(root);
		return outAry;
	};
	dijit._destroyAll = function () {
		dijit._curFocus = null;
		dijit._prevFocus = null;
		dijit._activeStack = [];
		dojo.forEach(dijit.findWidgets(dojo.body()), function (widget) {
			if (!widget._destroyed) {
				if (widget.destroyRecursive) {
					widget.destroyRecursive();
				} else {
					if (widget.destroy) {
						widget.destroy();
					}
				}
			}
		});
	};
	if (dojo.isIE) {
		dojo.addOnWindowUnload(function () {
			dijit._destroyAll();
		});
	}
	dijit.byId = function (id) {
		return typeof id == "string" ? dijit.registry._hash[id] : id;
	};
	dijit.byNode = function (node) {
		return dijit.registry.byId(node.getAttribute("widgetId"));
	};
	dijit.getEnclosingWidget = function (node) {
		while (node) {
			var id = node.getAttribute && node.getAttribute("widgetId");
			if (id) {
				return dijit.byId(id);
			}
			node = node.parentNode;
		}
		return null;
	};
	dijit._isElementShown = function (elem) {
		var style = dojo.style(elem);
		return (style.visibility != "hidden") && (style.visibility != "collapsed") && (style.display != "none") && (dojo.attr(elem, "type") != "hidden");
	};
	dijit.isTabNavigable = function (elem) {
		if (dojo.attr(elem, "disabled")) {
			return false;
		} else {
			if (dojo.hasAttr(elem, "tabIndex")) {
				return dojo.attr(elem, "tabIndex") >= 0;
			} else {
				switch (elem.nodeName.toLowerCase()) {
				  case "a":
					return dojo.hasAttr(elem, "href");
				  case "area":
				  case "button":
				  case "input":
				  case "object":
				  case "select":
				  case "textarea":
					return true;
				  case "iframe":
					if (dojo.isMoz) {
						return elem.contentDocument.designMode == "on";
					} else {
						if (dojo.isWebKit) {
							var doc = elem.contentDocument, body = doc && doc.body;
							return body && body.contentEditable == "true";
						} else {
							try {
								doc = elem.contentWindow.document;
								body = doc && doc.body;
								return body && body.firstChild && body.firstChild.contentEditable == "true";
							}
							catch (e) {
								return false;
							}
						}
					}
				  default:
					return elem.contentEditable == "true";
				}
			}
		}
	};
	dijit._getTabNavigable = function (root) {
		var first, last, lowest, lowestTabindex, highest, highestTabindex;
		var walkTree = function (parent) {
			dojo.query("> *", parent).forEach(function (child) {
				var isShown = dijit._isElementShown(child);
				if (isShown && dijit.isTabNavigable(child)) {
					var tabindex = dojo.attr(child, "tabIndex");
					if (!dojo.hasAttr(child, "tabIndex") || tabindex == 0) {
						if (!first) {
							first = child;
						}
						last = child;
					} else {
						if (tabindex > 0) {
							if (!lowest || tabindex < lowestTabindex) {
								lowestTabindex = tabindex;
								lowest = child;
							}
							if (!highest || tabindex >= highestTabindex) {
								highestTabindex = tabindex;
								highest = child;
							}
						}
					}
				}
				if (isShown && child.nodeName.toUpperCase() != "SELECT") {
					walkTree(child);
				}
			});
		};
		if (dijit._isElementShown(root)) {
			walkTree(root);
		}
		return {first:first, last:last, lowest:lowest, highest:highest};
	};
	dijit.getFirstInTabbingOrder = function (root) {
		var elems = dijit._getTabNavigable(dojo.byId(root));
		return elems.lowest ? elems.lowest : elems.first;
	};
	dijit.getLastInTabbingOrder = function (root) {
		var elems = dijit._getTabNavigable(dojo.byId(root));
		return elems.last ? elems.last : elems.highest;
	};
	dijit.defaultDuration = dojo.config["defaultDuration"] || 200;
}

