/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form._DateTimeTextBox"]) {
	dojo._hasResource["dijit.form._DateTimeTextBox"] = true;
	dojo.provide("dijit.form._DateTimeTextBox");
	dojo.require("dojo.date");
	dojo.require("dojo.date.locale");
	dojo.require("dojo.date.stamp");
	dojo.require("dijit.form.ValidationTextBox");
	dojo.declare("dijit.form._DateTimeTextBox", dijit.form.RangeBoundTextBox, {regExpGen:dojo.date.locale.regexp, datePackage:"dojo.date", compare:dojo.date.compare, format:function (value, constraints) {
		if (!value) {
			return "";
		}
		return this.dateLocaleModule.format(value, constraints);
	}, parse:function (value, constraints) {
		return this.dateLocaleModule.parse(value, constraints) || (this._isEmpty(value) ? null : undefined);
	}, serialize:function (val, options) {
		if (val.toGregorian) {
			val = val.toGregorian();
		}
		return dojo.date.stamp.toISOString(val, options);
	}, value:new Date(""), _blankValue:null, popupClass:"", _selector:"", constructor:function (args) {
		var dateClass = args.datePackage ? args.datePackage + ".Date" : "Date";
		this.dateClassObj = dojo.getObject(dateClass, false);
		this.value = new this.dateClassObj("");
		this.datePackage = args.datePackage || this.datePackage;
		this.dateLocaleModule = dojo.getObject(this.datePackage + ".locale", false);
		this.regExpGen = this.dateLocaleModule.regexp;
	}, postMixInProperties:function () {
		this.inherited(arguments);
		if (!this.value || this.value.toString() == dijit.form._DateTimeTextBox.prototype.value.toString()) {
			this.value = null;
		}
		var constraints = this.constraints;
		constraints.selector = this._selector;
		constraints.fullYear = true;
		var fromISO = dojo.date.stamp.fromISOString;
		if (typeof constraints.min == "string") {
			constraints.min = fromISO(constraints.min);
		}
		if (typeof constraints.max == "string") {
			constraints.max = fromISO(constraints.max);
		}
	}, _onFocus:function (evt) {
		this._open();
		this.inherited(arguments);
	}, _setValueAttr:function (value, priorityChange, formattedValue) {
		if (value instanceof Date && !(this.dateClassObj instanceof Date)) {
			value = new this.dateClassObj(value);
		}
		this.inherited(arguments);
		if (this._picker) {
			if (!value) {
				value = new this.dateClassObj();
			}
			this._picker.attr("value", value);
		}
	}, _open:function () {
		if (this.disabled || this.readOnly || !this.popupClass) {
			return;
		}
		var textBox = this;
		if (!this._picker) {
			var PopupProto = dojo.getObject(this.popupClass, false);
			this._picker = new PopupProto({onValueSelected:function (value) {
				if (textBox._tabbingAway) {
					delete textBox._tabbingAway;
				} else {
					textBox.focus();
				}
				setTimeout(dojo.hitch(textBox, "_close"), 1);
				dijit.form._DateTimeTextBox.superclass._setValueAttr.call(textBox, value, true);
			}, id:this.id + "_popup", lang:textBox.lang, constraints:textBox.constraints, datePackage:textBox.datePackage, isDisabledDate:function (date) {
				var compare = dojo.date.compare;
				var constraints = textBox.constraints;
				return constraints && (constraints.min && (compare(constraints.min, date, textBox._selector) > 0) || (constraints.max && compare(constraints.max, date, textBox._selector) < 0));
			}});
			this._picker.attr("value", this.attr("value") || new this.dateClassObj());
		}
		if (!this._opened) {
			dijit.popup.open({parent:this, popup:this._picker, orient:{"BL":"TL", "TL":"BL"}, around:this.domNode, onCancel:dojo.hitch(this, this._close), onClose:function () {
				textBox._opened = false;
			}});
			this._opened = true;
		}
		dojo.marginBox(this._picker.domNode, {w:this.domNode.offsetWidth});
	}, _close:function () {
		if (this._opened) {
			dijit.popup.close(this._picker);
			this._opened = false;
		}
	}, _onBlur:function () {
		this._close();
		if (this._picker) {
			this._picker.destroy();
			delete this._picker;
		}
		this.inherited(arguments);
	}, _getDisplayedValueAttr:function () {
		return this.textbox.value;
	}, _setDisplayedValueAttr:function (value, priorityChange) {
		this._setValueAttr(this.parse(value, this.constraints), priorityChange, value);
	}, destroy:function () {
		if (this._picker) {
			this._picker.destroy();
			delete this._picker;
		}
		this.inherited(arguments);
	}, postCreate:function () {
		this.inherited(arguments);
		this.connect(this.focusNode, "onkeypress", this._onKeyPress);
		this.connect(this.focusNode, "onclick", this._open);
	}, _onKeyPress:function (e) {
		var p = this._picker, dk = dojo.keys;
		if (p && this._opened && p.handleKey) {
			if (p.handleKey(e) === false) {
				return;
			}
		}
		if (this._opened && e.charOrCode == dk.ESCAPE && !(e.shiftKey || e.ctrlKey || e.altKey || e.metaKey)) {
			this._close();
			dojo.stopEvent(e);
		} else {
			if (!this._opened && e.charOrCode == dk.DOWN_ARROW) {
				this._open();
				dojo.stopEvent(e);
			} else {
				if (e.charOrCode === dk.TAB) {
					this._tabbingAway = true;
				} else {
					if (this._opened && (e.keyChar || e.charOrCode === dk.BACKSPACE || e.charOrCode == dk.DELETE)) {
						setTimeout(dojo.hitch(this, function () {
							dijit.placeOnScreenAroundElement(p.domNode.parentNode, this.domNode, {"BL":"TL", "TL":"BL"}, p.orient ? dojo.hitch(p, "orient") : null);
						}), 1);
					}
				}
			}
		}
	}});
}

