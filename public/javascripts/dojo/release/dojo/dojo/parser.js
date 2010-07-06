/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.parser"]) {
	dojo._hasResource["dojo.parser"] = true;
	dojo.provide("dojo.parser");
	dojo.require("dojo.date.stamp");
	dojo.parser = new function () {
		var d = dojo;
		this._attrName = d._scopeName + "Type";
		this._query = "[" + this._attrName + "]";
		function val2type(value) {
			if (d.isString(value)) {
				return "string";
			}
			if (typeof value == "number") {
				return "number";
			}
			if (typeof value == "boolean") {
				return "boolean";
			}
			if (d.isFunction(value)) {
				return "function";
			}
			if (d.isArray(value)) {
				return "array";
			}
			if (value instanceof Date) {
				return "date";
			}
			if (value instanceof d._Url) {
				return "url";
			}
			return "object";
		}
		function str2obj(value, type) {
			switch (type) {
			  case "string":
				return value;
			  case "number":
				return value.length ? Number(value) : NaN;
			  case "boolean":
				return typeof value == "boolean" ? value : !(value.toLowerCase() == "false");
			  case "function":
				if (d.isFunction(value)) {
					value = value.toString();
					value = d.trim(value.substring(value.indexOf("{") + 1, value.length - 1));
				}
				try {
					if (value.search(/[^\w\.]+/i) != -1) {
						return new Function(value);
					} else {
						return d.getObject(value, false);
					}
				}
				catch (e) {
					return new Function();
				}
			  case "array":
				return value ? value.split(/\s*,\s*/) : [];
			  case "date":
				switch (value) {
				  case "":
					return new Date("");
				  case "now":
					return new Date();
				  default:
					return d.date.stamp.fromISOString(value);
				}
			  case "url":
				return d.baseUrl + value;
			  default:
				return d.fromJson(value);
			}
		}
		var instanceClasses = {};
		dojo.connect(dojo, "extend", function () {
			instanceClasses = {};
		});
		function getClassInfo(className) {
			if (!instanceClasses[className]) {
				var cls = d.getObject(className);
				if (!d.isFunction(cls)) {
					throw new Error("Could not load class '" + className + "'. Did you spell the name correctly and use a full path, like 'dijit.form.Button'?");
				}
				var proto = cls.prototype;
				var params = {}, dummyClass = {};
				for (var name in proto) {
					if (name.charAt(0) == "_") {
						continue;
					}
					if (name in dummyClass) {
						continue;
					}
					var defVal = proto[name];
					params[name] = val2type(defVal);
				}
				instanceClasses[className] = {cls:cls, params:params};
			}
			return instanceClasses[className];
		}
		this._functionFromScript = function (script) {
			var preamble = "";
			var suffix = "";
			var argsStr = script.getAttribute("args");
			if (argsStr) {
				d.forEach(argsStr.split(/\s*,\s*/), function (part, idx) {
					preamble += "var " + part + " = arguments[" + idx + "]; ";
				});
			}
			var withStr = script.getAttribute("with");
			if (withStr && withStr.length) {
				d.forEach(withStr.split(/\s*,\s*/), function (part) {
					preamble += "with(" + part + "){";
					suffix += "}";
				});
			}
			return new Function(preamble + script.innerHTML + suffix);
		};
		this.instantiate = function (nodes, mixin, args) {
			var thelist = [], dp = dojo.parser;
			mixin = mixin || {};
			args = args || {};
			d.forEach(nodes, function (node) {
				if (!node) {
					return;
				}
				var type = dp._attrName in mixin ? mixin[dp._attrName] : node.getAttribute(dp._attrName);
				if (!type || !type.length) {
					return;
				}
				var clsInfo = getClassInfo(type), clazz = clsInfo.cls, ps = clazz._noScript || clazz.prototype._noScript;
				var params = {}, attributes = node.attributes;
				for (var name in clsInfo.params) {
					var item = name in mixin ? {value:mixin[name], specified:true} : attributes.getNamedItem(name);
					if (!item || (!item.specified && (!dojo.isIE || name.toLowerCase() != "value"))) {
						continue;
					}
					var value = item.value;
					switch (name) {
					  case "class":
						value = "className" in mixin ? mixin.className : node.className;
						break;
					  case "style":
						value = "style" in mixin ? mixin.style : (node.style && node.style.cssText);
					}
					var _type = clsInfo.params[name];
					if (typeof value == "string") {
						params[name] = str2obj(value, _type);
					} else {
						params[name] = value;
					}
				}
				if (!ps) {
					var connects = [], calls = [];
					d.query("> script[type^='dojo/']", node).orphan().forEach(function (script) {
						var event = script.getAttribute("event"), type = script.getAttribute("type"), nf = d.parser._functionFromScript(script);
						if (event) {
							if (type == "dojo/connect") {
								connects.push({event:event, func:nf});
							} else {
								params[event] = nf;
							}
						} else {
							calls.push(nf);
						}
					});
				}
				var markupFactory = clazz.markupFactory || clazz.prototype && clazz.prototype.markupFactory;
				var instance = markupFactory ? markupFactory(params, node, clazz) : new clazz(params, node);
				thelist.push(instance);
				var jsname = node.getAttribute("jsId");
				if (jsname) {
					d.setObject(jsname, instance);
				}
				if (!ps) {
					d.forEach(connects, function (connect) {
						d.connect(instance, connect.event, null, connect.func);
					});
					d.forEach(calls, function (func) {
						func.call(instance);
					});
				}
			});
			if (!mixin._started) {
				d.forEach(thelist, function (instance) {
					if (!args.noStart && instance && instance.startup && !instance._started && (!instance.getParent || !instance.getParent())) {
						instance.startup();
					}
				});
			}
			return thelist;
		};
		this.parse = function (rootNode, args) {
			var root;
			if (!args && rootNode && rootNode.rootNode) {
				args = rootNode;
				root = args.rootNode;
			} else {
				root = rootNode;
			}
			var list = d.query(this._query, root);
			return this.instantiate(list, null, args);
		};
	}();
	(function () {
		var parseRunner = function () {
			if (dojo.config.parseOnLoad) {
				dojo.parser.parse();
			}
		};
		if (dojo.exists("dijit.wai.onload") && (dijit.wai.onload === dojo._loaders[0])) {
			dojo._loaders.splice(1, 0, parseRunner);
		} else {
			dojo._loaders.unshift(parseRunner);
		}
	})();
}

