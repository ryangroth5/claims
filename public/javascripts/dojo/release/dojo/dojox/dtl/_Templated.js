/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.dtl._Templated"]) {
	dojo._hasResource["dojox.dtl._Templated"] = true;
	dojo.provide("dojox.dtl._Templated");
	dojo.require("dijit._Templated");
	dojo.require("dojox.dtl._base");
	dojo.declare("dojox.dtl._Templated", dijit._Templated, {_dijitTemplateCompat:false, buildRendering:function () {
		var node;
		if (this.domNode && !this._template) {
			return;
		}
		if (!this._template) {
			var t = this.getCachedTemplate(this.templatePath, this.templateString, this._skipNodeCache);
			if (t instanceof dojox.dtl.Template) {
				this._template = t;
			} else {
				node = t;
			}
		}
		if (!node) {
			var nodes = dojo._toDom(this._template.render(new dojox.dtl._Context(this)));
			if (nodes.nodeType !== 1 && nodes.nodeType !== 3) {
				for (var i = 0, l = nodes.childNodes.length; i < l; ++i) {
					node = nodes.childNodes[i];
					if (node.nodeType == 1) {
						break;
					}
				}
			} else {
				node = nodes;
			}
		}
		this._attachTemplateNodes(node);
		if (this.widgetsInTemplate) {
			var childWidgets = dojo.parser.parse(node);
			this._attachTemplateNodes(childWidgets, function (n, p) {
				return n[p];
			});
		}
		if (this.domNode) {
			dojo.place(node, this.domNode, "before");
			this.destroyDescendants();
			dojo.destroy(this.domNode);
		}
		this.domNode = node;
		this._fillContent(this.srcNodeRef);
	}, _templateCache:{}, getCachedTemplate:function (templatePath, templateString, alwaysUseString) {
		var tmplts = this._templateCache;
		var key = templateString || templatePath;
		if (tmplts[key]) {
			return tmplts[key];
		}
		templateString = dojo.string.trim(templateString || dojo.cache(templatePath, {sanitize:true}));
		if (this._dijitTemplateCompat && (alwaysUseString || templateString.match(/\$\{([^\}]+)\}/g))) {
			templateString = this._stringRepl(templateString);
		}
		if (alwaysUseString || !templateString.match(/\{[{%]([^\}]+)[%}]\}/g)) {
			return tmplts[key] = dojo._toDom(templateString);
		} else {
			return tmplts[key] = new dojox.dtl.Template(templateString);
		}
	}, render:function () {
		this.buildRendering();
	}});
}

