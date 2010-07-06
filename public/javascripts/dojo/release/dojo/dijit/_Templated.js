/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._Templated"]) {
	dojo._hasResource["dijit._Templated"] = true;
	dojo.provide("dijit._Templated");
	dojo.require("dijit._Widget");
	dojo.require("dojo.string");
	dojo.require("dojo.parser");
	dojo.require("dojo.cache");
	dojo.declare("dijit._Templated", null, {templateString:null, templatePath:null, widgetsInTemplate:false, _skipNodeCache:false, _earlyTemplatedStartup:false, constructor:function () {
		this._attachPoints = [];
	}, _stringRepl:function (tmpl) {
		var className = this.declaredClass, _this = this;
		return dojo.string.substitute(tmpl, this, function (value, key) {
			if (key.charAt(0) == "!") {
				value = dojo.getObject(key.substr(1), false, _this);
			}
			if (typeof value == "undefined") {
				throw new Error(className + " template:" + key);
			}
			if (value == null) {
				return "";
			}
			return key.charAt(0) == "!" ? value : value.toString().replace(/"/g, "&quot;");
		}, this);
	}, buildRendering:function () {
		var cached = dijit._Templated.getCachedTemplate(this.templatePath, this.templateString, this._skipNodeCache);
		var node;
		if (dojo.isString(cached)) {
			node = dojo._toDom(this._stringRepl(cached));
			if (node.nodeType != 1) {
				throw new Error("Invalid template: " + cached);
			}
		} else {
			node = cached.cloneNode(true);
		}
		this.domNode = node;
		this._attachTemplateNodes(node);
		if (this.widgetsInTemplate) {
			var parser = dojo.parser, qry, attr;
			if (parser._query != "[dojoType]") {
				qry = parser._query;
				attr = parser._attrName;
				parser._query = "[dojoType]";
				parser._attrName = "dojoType";
			}
			var cw = (this._startupWidgets = dojo.parser.parse(node, {noStart:!this._earlyTemplatedStartup}));
			if (qry) {
				parser._query = qry;
				parser._attrName = attr;
			}
			this._supportingWidgets = dijit.findWidgets(node);
			this._attachTemplateNodes(cw, function (n, p) {
				return n[p];
			});
		}
		this._fillContent(this.srcNodeRef);
	}, _fillContent:function (source) {
		var dest = this.containerNode;
		if (source && dest) {
			while (source.hasChildNodes()) {
				dest.appendChild(source.firstChild);
			}
		}
	}, _attachTemplateNodes:function (rootNode, getAttrFunc) {
		getAttrFunc = getAttrFunc || function (n, p) {
			return n.getAttribute(p);
		};
		var nodes = dojo.isArray(rootNode) ? rootNode : (rootNode.all || rootNode.getElementsByTagName("*"));
		var x = dojo.isArray(rootNode) ? 0 : -1;
		for (; x < nodes.length; x++) {
			var baseNode = (x == -1) ? rootNode : nodes[x];
			if (this.widgetsInTemplate && getAttrFunc(baseNode, "dojoType")) {
				continue;
			}
			var attachPoint = getAttrFunc(baseNode, "dojoAttachPoint");
			if (attachPoint) {
				var point, points = attachPoint.split(/\s*,\s*/);
				while ((point = points.shift())) {
					if (dojo.isArray(this[point])) {
						this[point].push(baseNode);
					} else {
						this[point] = baseNode;
					}
					this._attachPoints.push(point);
				}
			}
			var attachEvent = getAttrFunc(baseNode, "dojoAttachEvent");
			if (attachEvent) {
				var event, events = attachEvent.split(/\s*,\s*/);
				var trim = dojo.trim;
				while ((event = events.shift())) {
					if (event) {
						var thisFunc = null;
						if (event.indexOf(":") != -1) {
							var funcNameArr = event.split(":");
							event = trim(funcNameArr[0]);
							thisFunc = trim(funcNameArr[1]);
						} else {
							event = trim(event);
						}
						if (!thisFunc) {
							thisFunc = event;
						}
						this.connect(baseNode, event, thisFunc);
					}
				}
			}
			var role = getAttrFunc(baseNode, "waiRole");
			if (role) {
				dijit.setWaiRole(baseNode, role);
			}
			var values = getAttrFunc(baseNode, "waiState");
			if (values) {
				dojo.forEach(values.split(/\s*,\s*/), function (stateValue) {
					if (stateValue.indexOf("-") != -1) {
						var pair = stateValue.split("-");
						dijit.setWaiState(baseNode, pair[0], pair[1]);
					}
				});
			}
		}
	}, startup:function () {
		dojo.forEach(this._startupWidgets, function (w) {
			if (w && !w._started && w.startup) {
				w.startup();
			}
		});
		this.inherited(arguments);
	}, destroyRendering:function () {
		dojo.forEach(this._attachPoints, function (point) {
			delete this[point];
		}, this);
		this._attachPoints = [];
		this.inherited(arguments);
	}});
	dijit._Templated._templateCache = {};
	dijit._Templated.getCachedTemplate = function (templatePath, templateString, alwaysUseString) {
		var tmplts = dijit._Templated._templateCache;
		var key = templateString || templatePath;
		var cached = tmplts[key];
		if (cached) {
			try {
				if (!cached.ownerDocument || cached.ownerDocument == dojo.doc) {
					return cached;
				}
			}
			catch (e) {
			}
			dojo.destroy(cached);
		}
		if (!templateString) {
			templateString = dojo.cache(templatePath, {sanitize:true});
		}
		templateString = dojo.string.trim(templateString);
		if (alwaysUseString || templateString.match(/\$\{([^\}]+)\}/g)) {
			return (tmplts[key] = templateString);
		} else {
			var node = dojo._toDom(templateString);
			if (node.nodeType != 1) {
				throw new Error("Invalid template: " + templateString);
			}
			return (tmplts[key] = node);
		}
	};
	if (dojo.isIE) {
		dojo.addOnWindowUnload(function () {
			var cache = dijit._Templated._templateCache;
			for (var key in cache) {
				var value = cache[key];
				if (typeof value == "object") {
					dojo.destroy(value);
				}
				delete cache[key];
			}
		});
	}
	dojo.extend(dijit._Widget, {dojoAttachEvent:"", dojoAttachPoint:"", waiRole:"", waiState:""});
}

