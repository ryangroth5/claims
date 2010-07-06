/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.form.BusyButton"]) {
	dojo._hasResource["dojox.form.BusyButton"] = true;
	dojo.provide("dojox.form.BusyButton");
	dojo.require("dijit.form.Button");
	dojo.requireLocalization("dijit", "loading", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,ko,nb,nl,pl,pt,pt-pt,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dojox.form._BusyButtonMixin", null, {isBusy:false, busyLabel:"", timeout:null, useIcon:true, postMixInProperties:function () {
		this.inherited(arguments);
		if (!this.busyLabel) {
			this.busyLabel = dojo.i18n.getLocalization("dijit", "loading", this.lang).loadingState;
		}
	}, postCreate:function () {
		this.inherited(arguments);
		this._label = this.containerNode.innerHTML;
		this._initTimeout = this.timeout;
		if (this.isBusy) {
			this.makeBusy();
		}
	}, makeBusy:function () {
		this.isBusy = true;
		this.attr("disabled", true);
		this.setLabel(this.busyLabel, this.timeout);
	}, cancel:function () {
		this.attr("disabled", false);
		this.isBusy = false;
		this.setLabel(this._label);
		if (this._timeout) {
			clearTimeout(this._timeout);
		}
		this.timeout = this._initTimeout;
	}, resetTimeout:function (timeout) {
		if (this._timeout) {
			clearTimeout(this._timeout);
		}
		if (timeout) {
			this._timeout = setTimeout(dojo.hitch(this, function () {
				this.cancel();
			}), timeout);
		} else {
			if (timeout == undefined || timeout === 0) {
				this.cancel();
			}
		}
	}, setLabel:function (content, timeout) {
		this.label = content;
		while (this.containerNode.firstChild) {
			this.containerNode.removeChild(this.containerNode.firstChild);
		}
		this.containerNode.innerHTML = this.label;
		if (this.showLabel == false && !(dojo.attr(this.domNode, "title"))) {
			this.titleNode.title = dojo.trim(this.containerNode.innerText || this.containerNode.textContent || "");
		}
		if (timeout) {
			this.resetTimeout(timeout);
		} else {
			this.timeout = null;
		}
		if (this.useIcon && this.isBusy) {
			var node = new Image();
			node.src = this._blankGif;
			dojo.attr(node, "id", this.id + "_icon");
			dojo.addClass(node, "dojoxBusyButtonIcon");
			this.containerNode.appendChild(node);
		}
	}, _clicked:function (e) {
		if (!this.isBusy) {
			this.makeBusy();
		}
	}});
	dojo.declare("dojox.form.BusyButton", [dijit.form.Button, dojox.form._BusyButtonMixin], {});
	dojo.declare("dojox.form.BusyComboButton", [dijit.form.ComboButton, dojox.form._BusyButtonMixin], {});
	dojo.declare("dojox.form.BusyDropDownButton", [dijit.form.DropDownButton, dojox.form._BusyButtonMixin], {});
}

