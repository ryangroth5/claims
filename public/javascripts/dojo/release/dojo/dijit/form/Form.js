/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.Form"]) {
	dojo._hasResource["dijit.form.Form"] = true;
	dojo.provide("dijit.form.Form");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dijit.form._FormMixin");
	dojo.declare("dijit.form.Form", [dijit._Widget, dijit._Templated, dijit.form._FormMixin], {name:"", action:"", method:"", encType:"", "accept-charset":"", accept:"", target:"", templateString:"<form dojoAttachPoint='containerNode' dojoAttachEvent='onreset:_onReset,onsubmit:_onSubmit' ${nameAttrSetting}></form>", attributeMap:dojo.delegate(dijit._Widget.prototype.attributeMap, {action:"", method:"", encType:"", "accept-charset":"", accept:"", target:""}), postMixInProperties:function () {
		this.nameAttrSetting = this.name ? ("name='" + this.name + "'") : "";
		this.inherited(arguments);
	}, execute:function (formContents) {
	}, onExecute:function () {
	}, _setEncTypeAttr:function (value) {
		this.encType = value;
		dojo.attr(this.domNode, "encType", value);
		if (dojo.isIE) {
			this.domNode.encoding = value;
		}
	}, postCreate:function () {
		if (dojo.isIE && this.srcNodeRef && this.srcNodeRef.attributes) {
			var item = this.srcNodeRef.attributes.getNamedItem("encType");
			if (item && !item.specified && (typeof item.value == "string")) {
				this.attr("encType", item.value);
			}
		}
		this.inherited(arguments);
	}, onReset:function (e) {
		return true;
	}, _onReset:function (e) {
		var faux = {returnValue:true, preventDefault:function () {
			this.returnValue = false;
		}, stopPropagation:function () {
		}, currentTarget:e.currentTarget, target:e.target};
		if (!(this.onReset(faux) === false) && faux.returnValue) {
			this.reset();
		}
		dojo.stopEvent(e);
		return false;
	}, _onSubmit:function (e) {
		var fp = dijit.form.Form.prototype;
		if (this.execute != fp.execute || this.onExecute != fp.onExecute) {
			dojo.deprecated("dijit.form.Form:execute()/onExecute() are deprecated. Use onSubmit() instead.", "", "2.0");
			this.onExecute();
			this.execute(this.getValues());
		}
		if (this.onSubmit(e) === false) {
			dojo.stopEvent(e);
		}
	}, onSubmit:function (e) {
		return this.isValid();
	}, submit:function () {
		if (!(this.onSubmit() === false)) {
			this.containerNode.submit();
		}
	}});
}

