/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.form.DateTextBox"]) {
	dojo._hasResource["dojox.form.DateTextBox"] = true;
	dojo.provide("dojox.form.DateTextBox");
	dojo.experimental("dojox.form.DateTextBox");
	dojo.require("dojox.widget.Calendar");
	dojo.require("dojox.widget.CalendarViews");
	dojo.require("dijit.form._DateTimeTextBox");
	dojo.declare("dojox.form.DateTextBox", dijit.form._DateTimeTextBox, {popupClass:"dojox.widget.Calendar", _selector:"date", _open:function () {
		this.inherited(arguments);
		dojo.style(this._picker.domNode.parentNode, "position", "absolute");
	}});
	dojo.declare("dojox.form.DayTextBox", dojox.form.DateTextBox, {popupClass:"dojox.widget.DailyCalendar", parse:function (displayVal) {
		return displayVal;
	}, format:function (value) {
		return value.getDate ? value.getDate() : value;
	}, validator:function (value) {
		var num = Number(value);
		var isInt = /(^-?\d\d*$)/.test(String(value));
		return value == "" || value == null || (isInt && num >= 1 && num <= 31);
	}, _open:function () {
		this.inherited(arguments);
		this._picker.onValueSelected = dojo.hitch(this, function (value) {
			this.focus();
			setTimeout(dojo.hitch(this, "_close"), 1);
			dijit.form.TextBox.prototype._setValueAttr.call(this, String(value.getDate()), true, String(value.getDate()));
		});
	}});
	dojo.declare("dojox.form.MonthTextBox", dojox.form.DateTextBox, {popupClass:"dojox.widget.MonthlyCalendar", selector:"date", postMixInProperties:function () {
		this.inherited(arguments);
		this.constraints.datePattern = "MM";
	}, format:function (value) {
		return Number(value) + 1;
	}, parse:function (value, constraints) {
		return Number(value) - 1;
	}, serialize:function (value, constraints) {
		return String(value);
	}, validator:function (value) {
		var num = Number(value);
		var isInt = /(^-?\d\d*$)/.test(String(value));
		return value == "" || value == null || (isInt && num >= 1 && num <= 12);
	}, _open:function () {
		this.inherited(arguments);
		this._picker.onValueSelected = dojo.hitch(this, function (value) {
			this.focus();
			setTimeout(dojo.hitch(this, "_close"), 1);
			dijit.form.TextBox.prototype._setValueAttr.call(this, value, true, value);
		});
	}});
	dojo.declare("dojox.form.YearTextBox", dojox.form.DateTextBox, {popupClass:"dojox.widget.YearlyCalendar", format:function (value) {
		if (typeof value == "string") {
			return value;
		} else {
			if (value.getFullYear) {
				return value.getFullYear();
			}
		}
		return value;
	}, validator:function (value) {
		return value == "" || value == null || /(^-?\d\d*$)/.test(String(value));
	}, _open:function () {
		this.inherited(arguments);
		this._picker.onValueSelected = dojo.hitch(this, function (value) {
			this.focus();
			setTimeout(dojo.hitch(this, "_close"), 1);
			dijit.form.TextBox.prototype._setValueAttr.call(this, value, true, value);
		});
	}, parse:function (value, constraints) {
		return value || (this._isEmpty(value) ? null : undefined);
	}, filter:function (val) {
		if (val && val.getFullYear) {
			return val.getFullYear().toString();
		}
		return this.inherited(arguments);
	}});
}

