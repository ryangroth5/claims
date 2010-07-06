/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.CheckBox"]) {
	dojo._hasResource["dijit.form.CheckBox"] = true;
	dojo.provide("dijit.form.CheckBox");
	dojo.require("dijit.form.Button");
	dojo.declare("dijit.form.CheckBox", dijit.form.ToggleButton, {templateString:dojo.cache("dijit.form", "templates/CheckBox.html", "<div class=\"dijitReset dijitInline\" waiRole=\"presentation\"\n\t><input\n\t \t${nameAttrSetting} type=\"${type}\" ${checkedAttrSetting}\n\t\tclass=\"dijitReset dijitCheckBoxInput\"\n\t\tdojoAttachPoint=\"focusNode\"\n\t \tdojoAttachEvent=\"onmouseover:_onMouse,onmouseout:_onMouse,onclick:_onClick\"\n/></div>\n"), baseClass:"dijitCheckBox", type:"checkbox", value:"on", readOnly:false, attributeMap:dojo.delegate(dijit.form.ToggleButton.prototype.attributeMap, {readOnly:"focusNode"}), _setReadOnlyAttr:function (value) {
		this.readOnly = value;
		dojo.attr(this.focusNode, "readOnly", value);
		dijit.setWaiState(this.focusNode, "readonly", value);
		this._setStateClass();
	}, _setValueAttr:function (newValue) {
		if (typeof newValue == "string") {
			this.value = newValue;
			dojo.attr(this.focusNode, "value", newValue);
			newValue = true;
		}
		if (this._created) {
			this.attr("checked", newValue);
		}
	}, _getValueAttr:function () {
		return (this.checked ? this.value : false);
	}, postMixInProperties:function () {
		if (this.value == "") {
			this.value = "on";
		}
		this.checkedAttrSetting = this.checked ? "checked" : "";
		this.inherited(arguments);
	}, _fillContent:function (source) {
	}, reset:function () {
		this._hasBeenBlurred = false;
		this.attr("checked", this.params.checked || false);
		this.value = this.params.value || "on";
		dojo.attr(this.focusNode, "value", this.value);
	}, _onFocus:function () {
		if (this.id) {
			dojo.query("label[for='" + this.id + "']").addClass("dijitFocusedLabel");
		}
	}, _onBlur:function () {
		if (this.id) {
			dojo.query("label[for='" + this.id + "']").removeClass("dijitFocusedLabel");
		}
	}, _onClick:function (e) {
		if (this.readOnly) {
			return false;
		}
		return this.inherited(arguments);
	}});
	dojo.declare("dijit.form.RadioButton", dijit.form.CheckBox, {type:"radio", baseClass:"dijitRadio", _setCheckedAttr:function (value) {
		this.inherited(arguments);
		if (!this._created) {
			return;
		}
		if (value) {
			var _this = this;
			dojo.query("INPUT[type=radio]", this.focusNode.form || dojo.doc).forEach(function (inputNode) {
				if (inputNode.name == _this.name && inputNode != _this.focusNode && inputNode.form == _this.focusNode.form) {
					var widget = dijit.getEnclosingWidget(inputNode);
					if (widget && widget.checked) {
						widget.attr("checked", false);
					}
				}
			});
		}
	}, _clicked:function (e) {
		if (!this.checked) {
			this.attr("checked", true);
		}
	}});
}

