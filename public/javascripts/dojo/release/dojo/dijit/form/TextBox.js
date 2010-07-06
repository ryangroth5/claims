/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.TextBox"]) {
	dojo._hasResource["dijit.form.TextBox"] = true;
	dojo.provide("dijit.form.TextBox");
	dojo.require("dijit.form._FormWidget");
	dojo.declare("dijit.form.TextBox", dijit.form._FormValueWidget, {trim:false, uppercase:false, lowercase:false, propercase:false, maxLength:"", selectOnClick:false, templateString:dojo.cache("dijit.form", "templates/TextBox.html", "<input class=\"dijit dijitReset dijitLeft\" dojoAttachPoint='textbox,focusNode'\n\tdojoAttachEvent='onmouseenter:_onMouse,onmouseleave:_onMouse'\n\tautocomplete=\"off\" type=\"${type}\" ${nameAttrSetting}\n\t/>\n"), baseClass:"dijitTextBox", attributeMap:dojo.delegate(dijit.form._FormValueWidget.prototype.attributeMap, {maxLength:"focusNode"}), _getValueAttr:function () {
		return this.parse(this.attr("displayedValue"), this.constraints);
	}, _setValueAttr:function (value, priorityChange, formattedValue) {
		var filteredValue;
		if (value !== undefined) {
			filteredValue = this.filter(value);
			if (typeof formattedValue != "string") {
				if (filteredValue !== null && ((typeof filteredValue != "number") || !isNaN(filteredValue))) {
					formattedValue = this.filter(this.format(filteredValue, this.constraints));
				} else {
					formattedValue = "";
				}
			}
		}
		if (formattedValue != null && formattedValue != undefined && ((typeof formattedValue) != "number" || !isNaN(formattedValue)) && this.textbox.value != formattedValue) {
			this.textbox.value = formattedValue;
		}
		this.inherited(arguments, [filteredValue, priorityChange]);
	}, displayedValue:"", getDisplayedValue:function () {
		dojo.deprecated(this.declaredClass + "::getDisplayedValue() is deprecated. Use attr('displayedValue') instead.", "", "2.0");
		return this.attr("displayedValue");
	}, _getDisplayedValueAttr:function () {
		return this.filter(this.textbox.value);
	}, setDisplayedValue:function (value) {
		dojo.deprecated(this.declaredClass + "::setDisplayedValue() is deprecated. Use attr('displayedValue', ...) instead.", "", "2.0");
		this.attr("displayedValue", value);
	}, _setDisplayedValueAttr:function (value) {
		if (value === null || value === undefined) {
			value = "";
		} else {
			if (typeof value != "string") {
				value = String(value);
			}
		}
		this.textbox.value = value;
		this._setValueAttr(this.attr("value"), undefined, value);
	}, format:function (value, constraints) {
		return ((value == null || value == undefined) ? "" : (value.toString ? value.toString() : value));
	}, parse:function (value, constraints) {
		return value;
	}, _refreshState:function () {
	}, _onInput:function (e) {
		if (e && e.type && /key/i.test(e.type) && e.keyCode) {
			switch (e.keyCode) {
			  case dojo.keys.SHIFT:
			  case dojo.keys.ALT:
			  case dojo.keys.CTRL:
			  case dojo.keys.TAB:
				return;
			}
		}
		if (this.intermediateChanges) {
			var _this = this;
			setTimeout(function () {
				_this._handleOnChange(_this.attr("value"), false);
			}, 0);
		}
		this._refreshState();
	}, postCreate:function () {
		this.textbox.setAttribute("value", this.textbox.value);
		this.inherited(arguments);
		if (dojo.isMoz || dojo.isOpera) {
			this.connect(this.textbox, "oninput", this._onInput);
		} else {
			this.connect(this.textbox, "onkeydown", this._onInput);
			this.connect(this.textbox, "onkeyup", this._onInput);
			this.connect(this.textbox, "onpaste", this._onInput);
			this.connect(this.textbox, "oncut", this._onInput);
		}
	}, _blankValue:"", filter:function (val) {
		if (val === null) {
			return this._blankValue;
		}
		if (typeof val != "string") {
			return val;
		}
		if (this.trim) {
			val = dojo.trim(val);
		}
		if (this.uppercase) {
			val = val.toUpperCase();
		}
		if (this.lowercase) {
			val = val.toLowerCase();
		}
		if (this.propercase) {
			val = val.replace(/[^\s]+/g, function (word) {
				return word.substring(0, 1).toUpperCase() + word.substring(1);
			});
		}
		return val;
	}, _setBlurValue:function () {
		this._setValueAttr(this.attr("value"), true);
	}, _onBlur:function (e) {
		if (this.disabled) {
			return;
		}
		this._setBlurValue();
		this.inherited(arguments);
		if (this._selectOnClickHandle) {
			this.disconnect(this._selectOnClickHandle);
		}
		if (this.selectOnClick && dojo.isMoz) {
			this.textbox.selectionStart = this.textbox.selectionEnd = undefined;
		}
	}, _onFocus:function (by) {
		if (this.disabled || this.readOnly) {
			return;
		}
		if (this.selectOnClick && by == "mouse") {
			this._selectOnClickHandle = this.connect(this.domNode, "onmouseup", function () {
				this.disconnect(this._selectOnClickHandle);
				var textIsNotSelected;
				if (dojo.isIE) {
					var range = dojo.doc.selection.createRange();
					var parent = range.parentElement();
					textIsNotSelected = parent == this.textbox && range.text.length == 0;
				} else {
					textIsNotSelected = this.textbox.selectionStart == this.textbox.selectionEnd;
				}
				if (textIsNotSelected) {
					dijit.selectInputText(this.textbox);
				}
			});
		}
		this._refreshState();
		this.inherited(arguments);
	}, reset:function () {
		this.textbox.value = "";
		this.inherited(arguments);
	}});
	dijit.selectInputText = function (element, start, stop) {
		var _window = dojo.global;
		var _document = dojo.doc;
		element = dojo.byId(element);
		if (isNaN(start)) {
			start = 0;
		}
		if (isNaN(stop)) {
			stop = element.value ? element.value.length : 0;
		}
		dijit.focus(element);
		if (_document["selection"] && dojo.body()["createTextRange"]) {
			if (element.createTextRange) {
				var range = element.createTextRange();
				with (range) {
					collapse(true);
					moveStart("character", -99999);
					moveStart("character", start);
					moveEnd("character", stop - start);
					select();
				}
			}
		} else {
			if (_window["getSelection"]) {
				if (element.setSelectionRange) {
					element.setSelectionRange(start, stop);
				}
			}
		}
	};
}

