/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.ValidationTextBox"]) {
	dojo._hasResource["dijit.form.ValidationTextBox"] = true;
	dojo.provide("dijit.form.ValidationTextBox");
	dojo.require("dojo.i18n");
	dojo.require("dijit.form.TextBox");
	dojo.require("dijit.Tooltip");
	dojo.requireLocalization("dijit.form", "validate", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,ko,nb,nl,pl,pt,pt-pt,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dijit.form.ValidationTextBox", dijit.form.TextBox, {templateString:dojo.cache("dijit.form", "templates/ValidationTextBox.html", "<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\n\tid=\"widget_${id}\"\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\" waiRole=\"presentation\"\n\t><div style=\"overflow:hidden;\"\n\t\t><div class=\"dijitReset dijitValidationIcon\"><br></div\n\t\t><div class=\"dijitReset dijitValidationIconText\">&Chi;</div\n\t\t><div class=\"dijitReset dijitInputField\"\n\t\t\t><input class=\"dijitReset\" dojoAttachPoint='textbox,focusNode' autocomplete=\"off\"\n\t\t\t${nameAttrSetting} type='${type}'\n\t\t/></div\n\t></div\n></div>\n"), baseClass:"dijitTextBox", required:false, promptMessage:"", invalidMessage:"$_unset_$", constraints:{}, regExp:".*", regExpGen:function (constraints) {
		return this.regExp;
	}, state:"", tooltipPosition:[], _setValueAttr:function () {
		this.inherited(arguments);
		this.validate(this._focused);
	}, validator:function (value, constraints) {
		return (new RegExp("^(?:" + this.regExpGen(constraints) + ")" + (this.required ? "" : "?") + "$")).test(value) && (!this.required || !this._isEmpty(value)) && (this._isEmpty(value) || this.parse(value, constraints) !== undefined);
	}, _isValidSubset:function () {
		return this.textbox.value.search(this._partialre) == 0;
	}, isValid:function (isFocused) {
		return this.validator(this.textbox.value, this.constraints);
	}, _isEmpty:function (value) {
		return /^\s*$/.test(value);
	}, getErrorMessage:function (isFocused) {
		return this.invalidMessage;
	}, getPromptMessage:function (isFocused) {
		return this.promptMessage;
	}, _maskValidSubsetError:true, validate:function (isFocused) {
		var message = "";
		var isValid = this.disabled || this.isValid(isFocused);
		if (isValid) {
			this._maskValidSubsetError = true;
		}
		var isValidSubset = !isValid && isFocused && this._isValidSubset();
		var isEmpty = this._isEmpty(this.textbox.value);
		if (isEmpty) {
			this._maskValidSubsetError = true;
		}
		this.state = (isValid || (!this._hasBeenBlurred && isEmpty) || isValidSubset) ? "" : "Error";
		if (this.state == "Error") {
			this._maskValidSubsetError = false;
		}
		this._setStateClass();
		dijit.setWaiState(this.focusNode, "invalid", isValid ? "false" : "true");
		if (isFocused) {
			if (isEmpty) {
				message = this.getPromptMessage(true);
			}
			if (!message && (this.state == "Error" || (isValidSubset && !this._maskValidSubsetError))) {
				message = this.getErrorMessage(true);
			}
		}
		this.displayMessage(message);
		return isValid;
	}, _message:"", displayMessage:function (message) {
		if (this._message == message) {
			return;
		}
		this._message = message;
		dijit.hideTooltip(this.domNode);
		if (message) {
			dijit.showTooltip(message, this.domNode, this.tooltipPosition);
		}
	}, _refreshState:function () {
		this.validate(this._focused);
		this.inherited(arguments);
	}, constructor:function () {
		this.constraints = {};
	}, postMixInProperties:function () {
		this.inherited(arguments);
		this.constraints.locale = this.lang;
		this.messages = dojo.i18n.getLocalization("dijit.form", "validate", this.lang);
		if (this.invalidMessage == "$_unset_$") {
			this.invalidMessage = this.messages.invalidMessage;
		}
		var p = this.regExpGen(this.constraints);
		this.regExp = p;
		var partialre = "";
		if (p != ".*") {
			this.regExp.replace(/\\.|\[\]|\[.*?[^\\]{1}\]|\{.*?\}|\(\?[=:!]|./g, function (re) {
				switch (re.charAt(0)) {
				  case "{":
				  case "+":
				  case "?":
				  case "*":
				  case "^":
				  case "$":
				  case "|":
				  case "(":
					partialre += re;
					break;
				  case ")":
					partialre += "|$)";
					break;
				  default:
					partialre += "(?:" + re + "|$)";
					break;
				}
			});
		}
		try {
			"".search(partialre);
		}
		catch (e) {
			partialre = this.regExp;
			console.warn("RegExp error in " + this.declaredClass + ": " + this.regExp);
		}
		this._partialre = "^(?:" + partialre + ")$";
	}, _setDisabledAttr:function (value) {
		this.inherited(arguments);
		this._refreshState();
	}, _setRequiredAttr:function (value) {
		this.required = value;
		dijit.setWaiState(this.focusNode, "required", value);
		this._refreshState();
	}, postCreate:function () {
		if (dojo.isIE) {
			var s = dojo.getComputedStyle(this.focusNode);
			if (s) {
				var ff = s.fontFamily;
				if (ff) {
					this.focusNode.style.fontFamily = ff;
				}
			}
		}
		this.inherited(arguments);
	}, reset:function () {
		this._maskValidSubsetError = true;
		this.inherited(arguments);
	}, _onBlur:function () {
		this.displayMessage("");
		this.inherited(arguments);
	}});
	dojo.declare("dijit.form.MappedTextBox", dijit.form.ValidationTextBox, {postMixInProperties:function () {
		this.inherited(arguments);
		this.nameAttrSetting = "";
	}, serialize:function (val, options) {
		return val.toString ? val.toString() : "";
	}, toString:function () {
		var val = this.filter(this.attr("value"));
		return val != null ? (typeof val == "string" ? val : this.serialize(val, this.constraints)) : "";
	}, validate:function () {
		this.valueNode.value = this.toString();
		return this.inherited(arguments);
	}, buildRendering:function () {
		this.inherited(arguments);
		this.valueNode = dojo.place("<input type='hidden'" + (this.name ? " name='" + this.name + "'" : "") + ">", this.textbox, "after");
	}, reset:function () {
		this.valueNode.value = "";
		this.inherited(arguments);
	}});
	dojo.declare("dijit.form.RangeBoundTextBox", dijit.form.MappedTextBox, {rangeMessage:"", rangeCheck:function (primitive, constraints) {
		return ("min" in constraints ? (this.compare(primitive, constraints.min) >= 0) : true) && ("max" in constraints ? (this.compare(primitive, constraints.max) <= 0) : true);
	}, isInRange:function (isFocused) {
		return this.rangeCheck(this.attr("value"), this.constraints);
	}, _isDefinitelyOutOfRange:function () {
		var val = this.attr("value");
		var isTooLittle = false;
		var isTooMuch = false;
		if ("min" in this.constraints) {
			var min = this.constraints.min;
			min = this.compare(val, ((typeof min == "number") && min >= 0 && val != 0) ? 0 : min);
			isTooLittle = (typeof min == "number") && min < 0;
		}
		if ("max" in this.constraints) {
			var max = this.constraints.max;
			max = this.compare(val, ((typeof max != "number") || max > 0) ? max : 0);
			isTooMuch = (typeof max == "number") && max > 0;
		}
		return isTooLittle || isTooMuch;
	}, _isValidSubset:function () {
		return this.inherited(arguments) && !this._isDefinitelyOutOfRange();
	}, isValid:function (isFocused) {
		return this.inherited(arguments) && ((this._isEmpty(this.textbox.value) && !this.required) || this.isInRange(isFocused));
	}, getErrorMessage:function (isFocused) {
		var v = this.attr("value");
		if (v !== null && v !== "" && v !== undefined && !this.isInRange(isFocused)) {
			return this.rangeMessage;
		}
		return this.inherited(arguments);
	}, postMixInProperties:function () {
		this.inherited(arguments);
		if (!this.rangeMessage) {
			this.messages = dojo.i18n.getLocalization("dijit.form", "validate", this.lang);
			this.rangeMessage = this.messages.rangeMessage;
		}
	}, postCreate:function () {
		this.inherited(arguments);
		if (this.constraints.min !== undefined) {
			dijit.setWaiState(this.focusNode, "valuemin", this.constraints.min);
		}
		if (this.constraints.max !== undefined) {
			dijit.setWaiState(this.focusNode, "valuemax", this.constraints.max);
		}
	}, _setValueAttr:function (value, priorityChange) {
		dijit.setWaiState(this.focusNode, "valuenow", value);
		this.inherited(arguments);
	}});
}

