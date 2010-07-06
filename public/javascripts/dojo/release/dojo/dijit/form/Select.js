/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.Select"]) {
	dojo._hasResource["dijit.form.Select"] = true;
	dojo.provide("dijit.form.Select");
	dojo.require("dijit.form._FormSelectWidget");
	dojo.require("dijit._HasDropDown");
	dojo.require("dijit.Menu");
	dojo.requireLocalization("dijit.form", "validate", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,ko,nb,nl,pl,pt,pt-pt,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dijit.form._SelectMenu", dijit.Menu, {buildRendering:function () {
		this.inherited(arguments);
		var o = (this.menuTableNode = this.domNode);
		var n = (this.domNode = dojo.doc.createElement("div"));
		if (o.parentNode) {
			o.parentNode.replaceChild(n, o);
		}
		dojo.removeClass(o, "dijitMenuTable");
		n.className = o.className + " dijitSelectMenu";
		o.className = "dijitReset dijitMenuTable";
		dijit.setWaiRole(o, "listbox");
		dijit.setWaiRole(n, "presentation");
		n.appendChild(o);
		this.tabIndex = null;
	}, resize:function (mb) {
		if (mb) {
			dojo.marginBox(this.domNode, mb);
			var w = dojo.contentBox(this.domNode).w;
			if (dojo.isMoz && this.domNode.scrollHeight > this.domNode.clientHeight) {
				w--;
			} else {
				if (dojo.isIE < 8 || (dojo.isIE && dojo.isQuirks)) {
					w -= 16;
				}
			}
			dojo.marginBox(this.menuTableNode, {w:w});
		}
	}});
	dojo.declare("dijit.form.Select", [dijit.form._FormSelectWidget, dijit._HasDropDown], {baseClass:"dijitSelect", templateString:dojo.cache("dijit.form", "templates/Select.html", "<table class='dijit dijitReset dijitInline dijitLeft'\n\tdojoAttachPoint=\"_buttonNode,tableNode\" cellspacing='0' cellpadding='0' waiRole=\"presentation\"\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\"\n\t><tbody waiRole=\"presentation\"><tr waiRole=\"presentation\"\n\t\t><td class=\"dijitReset dijitStretch dijitButtonContents dijitButtonNode\" dojoAttachPoint=\"focusNode\"\n\t\t\twaiRole=\"combobox\" waiState=\"haspopup-true\"\n\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"  dojoAttachPoint=\"containerNode,_popupStateNode\"></span\n\t\t\t><input type=\"hidden\" ${nameAttrSetting} dojoAttachPoint=\"valueNode\" value=\"${value}\" waiState=\"hidden-true\" />\n\t\t</td><td class=\"dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton\"\n\t\t\t\tdojoAttachPoint=\"titleNode\" waiRole=\"presentation\"\n\t\t\t><div class=\"dijitReset dijitArrowButtonInner\" waiRole=\"presentation\">&thinsp;</div\n\t\t\t><div class=\"dijitReset dijitArrowButtonChar\" waiRole=\"presentation\">&#9660;</div\n\t\t></td\n\t></tr></tbody\n></table>\n"), attributeMap:dojo.mixin(dojo.clone(dijit.form._FormSelectWidget.prototype.attributeMap), {style:"tableNode"}), required:false, state:"", tooltipPosition:[], emptyLabel:"", _isLoaded:false, _childrenLoaded:false, _fillContent:function () {
		this.inherited(arguments);
		if (this.options.length && !this.value && this.srcNodeRef) {
			var si = this.srcNodeRef.selectedIndex;
			this.value = this.options[si != -1 ? si : 0].value;
		}
		this.dropDown = new dijit.form._SelectMenu();
		dojo.addClass(this.dropDown.domNode, this.baseClass + "Menu");
	}, _getMenuItemForOption:function (option) {
		if (!option.value) {
			return new dijit.MenuSeparator();
		} else {
			var click = dojo.hitch(this, "_setValueAttr", option);
			var item = new dijit.MenuItem({option:option, label:option.label, onClick:click, disabled:option.disabled || false});
			dijit.setWaiRole(item.focusNode, "listitem");
			return item;
		}
	}, _addOptionItem:function (option) {
		if (this.dropDown) {
			this.dropDown.addChild(this._getMenuItemForOption(option));
		}
	}, _getChildren:function () {
		if (!this.dropDown) {
			return [];
		}
		return this.dropDown.getChildren();
	}, _loadChildren:function (loadMenuItems) {
		if (loadMenuItems === true) {
			if (this.dropDown) {
				delete this.dropDown.focusedChild;
			}
			if (this.options.length) {
				this.inherited(arguments);
			} else {
				dojo.forEach(this._getChildren(), function (child) {
					child.destroyRecursive();
				});
				var item = new dijit.MenuItem({label:"&nbsp;"});
				this.dropDown.addChild(item);
			}
		} else {
			this._updateSelection();
		}
		var len = this.options.length;
		this._isLoaded = false;
		this._childrenLoaded = true;
		if (!this._loadingStore) {
			this._setValueAttr(this.value);
		}
	}, _setValueAttr:function (value) {
		this.inherited(arguments);
		dojo.attr(this.valueNode, "value", this.attr("value"));
	}, _setDisplay:function (newDisplay) {
		this.containerNode.innerHTML = "<span class=\"dijitReset dijitInline " + this.baseClass + "Label\">" + (newDisplay || this.emptyLabel || "&nbsp;") + "</span>";
		dijit.setWaiState(this.focusNode, "valuenow", (newDisplay || this.emptyLabel || "&nbsp;"));
	}, validate:function (isFocused) {
		var isValid = this.isValid(isFocused);
		this.state = isValid ? "" : "Error";
		this._setStateClass();
		dijit.setWaiState(this.focusNode, "invalid", isValid ? "false" : "true");
		var message = isValid ? "" : this._missingMsg;
		if (this._message !== message) {
			this._message = message;
			dijit.hideTooltip(this.domNode);
			if (message) {
				dijit.showTooltip(message, this.domNode, this.tooltipPosition);
			}
		}
		return isValid;
	}, isValid:function (isFocused) {
		return (!this.required || !(/^\s*$/.test(this.value)));
	}, reset:function () {
		this.inherited(arguments);
		dijit.hideTooltip(this.domNode);
		this.state = "";
		this._setStateClass();
		delete this._message;
	}, postMixInProperties:function () {
		this.inherited(arguments);
		this._missingMsg = dojo.i18n.getLocalization("dijit.form", "validate", this.lang).missingMessage;
	}, postCreate:function () {
		this.inherited(arguments);
		if (this.tableNode.style.width) {
			dojo.addClass(this.domNode, this.baseClass + "FixedWidth");
		}
	}, isLoaded:function () {
		return this._isLoaded;
	}, loadDropDown:function (loadCallback) {
		this._loadChildren(true);
		this._isLoaded = true;
		loadCallback();
	}, uninitialize:function (preserveDom) {
		if (this.dropDown && !this.dropDown._destroyed) {
			this.dropDown.destroyRecursive(preserveDom);
			delete this.dropDown;
		}
		this.inherited(arguments);
	}});
}

