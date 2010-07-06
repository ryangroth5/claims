/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.NumberTextBox"]) {
	dojo._hasResource["dijit.form.NumberTextBox"] = true;
	dojo.provide("dijit.form.NumberTextBox");
	dojo.require("dijit.form.ValidationTextBox");
	dojo.require("dojo.number");
	dojo.declare("dijit.form.NumberTextBoxMixin", null, {regExpGen:dojo.number.regexp, value:NaN, editOptions:{pattern:"#.######"}, _formatter:dojo.number.format, postMixInProperties:function () {
		var places = typeof this.constraints.places == "number" ? this.constraints.places : 0;
		if (places) {
			places++;
		}
		if (typeof this.constraints.max != "number") {
			this.constraints.max = 9 * Math.pow(10, 15 - places);
		}
		if (typeof this.constraints.min != "number") {
			this.constraints.min = -9 * Math.pow(10, 15 - places);
		}
		this.inherited(arguments);
	}, _onFocus:function () {
		if (this.disabled) {
			return;
		}
		var val = this.attr("value");
		if (typeof val == "number" && !isNaN(val)) {
			var formattedValue = this.format(val, this.constraints);
			if (formattedValue !== undefined) {
				this.textbox.value = formattedValue;
			}
		}
		this.inherited(arguments);
	}, format:function (value, constraints) {
		if (typeof value != "number") {
			return String(value);
		}
		if (isNaN(value)) {
			return "";
		}
		if (("rangeCheck" in this) && !this.rangeCheck(value, constraints)) {
			return String(value);
		}
		if (this.editOptions && this._focused) {
			constraints = dojo.mixin({}, constraints, this.editOptions);
		}
		return this._formatter(value, constraints);
	}, parse:dojo.number.parse, _getDisplayedValueAttr:function () {
		var v = this.inherited(arguments);
		return isNaN(v) ? this.textbox.value : v;
	}, filter:function (value) {
		return (value === null || value === "" || value === undefined) ? NaN : this.inherited(arguments);
	}, serialize:function (value, options) {
		return (typeof value != "number" || isNaN(value)) ? "" : this.inherited(arguments);
	}, _setValueAttr:function (value, priorityChange, formattedValue) {
		if (value !== undefined && formattedValue === undefined) {
			if (typeof value == "number") {
				if (isNaN(value)) {
					formattedValue = "";
				} else {
					if (("rangeCheck" in this) && !this.rangeCheck(value, this.constraints)) {
						formattedValue = String(value);
					}
				}
			} else {
				if (!value) {
					formattedValue = "";
					value = NaN;
				} else {
					formattedValue = String(value);
					value = undefined;
				}
			}
		}
		this.inherited(arguments, [value, priorityChange, formattedValue]);
	}, _getValueAttr:function () {
		var v = this.inherited(arguments);
		if (isNaN(v) && this.textbox.value !== "") {
			if (this.constraints.exponent !== false && /\de[-+]?|\d/i.test(this.textbox.value) && (new RegExp("^" + dojo.number._realNumberRegexp(dojo.mixin({}, this.constraints)) + "$").test(this.textbox.value))) {
				var n = Number(this.textbox.value);
				return isNaN(n) ? undefined : n;
			} else {
				return undefined;
			}
		} else {
			return v;
		}
	}, isValid:function (isFocused) {
		if (!this._focused || this._isEmpty(this.textbox.value)) {
			return this.inherited(arguments);
		} else {
			var v = this.attr("value");
			if (!isNaN(v) && this.rangeCheck(v, this.constraints)) {
				if (this.constraints.exponent !== false && /\de[-+]?\d/i.test(this.textbox.value)) {
					return true;
				} else {
					return this.inherited(arguments);
				}
			} else {
				return false;
			}
		}
	}});
	dojo.declare("dijit.form.NumberTextBox", [dijit.form.RangeBoundTextBox, dijit.form.NumberTextBoxMixin], {});
}

