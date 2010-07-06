/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form._FormMixin"]) {
	dojo._hasResource["dijit.form._FormMixin"] = true;
	dojo.provide("dijit.form._FormMixin");
	dojo.declare("dijit.form._FormMixin", null, {reset:function () {
		dojo.forEach(this.getDescendants(), function (widget) {
			if (widget.reset) {
				widget.reset();
			}
		});
	}, validate:function () {
		var didFocus = false;
		return dojo.every(dojo.map(this.getDescendants(), function (widget) {
			widget._hasBeenBlurred = true;
			var valid = widget.disabled || !widget.validate || widget.validate();
			if (!valid && !didFocus) {
				dijit.scrollIntoView(widget.containerNode || widget.domNode);
				widget.focus();
				didFocus = true;
			}
			return valid;
		}), function (item) {
			return item;
		});
	}, setValues:function (val) {
		dojo.deprecated(this.declaredClass + "::setValues() is deprecated. Use attr('value', val) instead.", "", "2.0");
		return this.attr("value", val);
	}, _setValueAttr:function (obj) {
		var map = {};
		dojo.forEach(this.getDescendants(), function (widget) {
			if (!widget.name) {
				return;
			}
			var entry = map[widget.name] || (map[widget.name] = []);
			entry.push(widget);
		});
		for (var name in map) {
			if (!map.hasOwnProperty(name)) {
				continue;
			}
			var widgets = map[name], values = dojo.getObject(name, false, obj);
			if (values === undefined) {
				continue;
			}
			if (!dojo.isArray(values)) {
				values = [values];
			}
			if (typeof widgets[0].checked == "boolean") {
				dojo.forEach(widgets, function (w, i) {
					w.attr("value", dojo.indexOf(values, w.value) != -1);
				});
			} else {
				if (widgets[0].multiple) {
					widgets[0].attr("value", values);
				} else {
					dojo.forEach(widgets, function (w, i) {
						w.attr("value", values[i]);
					});
				}
			}
		}
	}, getValues:function () {
		dojo.deprecated(this.declaredClass + "::getValues() is deprecated. Use attr('value') instead.", "", "2.0");
		return this.attr("value");
	}, _getValueAttr:function () {
		var obj = {};
		dojo.forEach(this.getDescendants(), function (widget) {
			var name = widget.name;
			if (!name || widget.disabled) {
				return;
			}
			var value = widget.attr("value");
			if (typeof widget.checked == "boolean") {
				if (/Radio/.test(widget.declaredClass)) {
					if (value !== false) {
						dojo.setObject(name, value, obj);
					} else {
						value = dojo.getObject(name, false, obj);
						if (value === undefined) {
							dojo.setObject(name, null, obj);
						}
					}
				} else {
					var ary = dojo.getObject(name, false, obj);
					if (!ary) {
						ary = [];
						dojo.setObject(name, ary, obj);
					}
					if (value !== false) {
						ary.push(value);
					}
				}
			} else {
				var prev = dojo.getObject(name, false, obj);
				if (typeof prev != "undefined") {
					if (dojo.isArray(prev)) {
						prev.push(value);
					} else {
						dojo.setObject(name, [prev, value], obj);
					}
				} else {
					dojo.setObject(name, value, obj);
				}
			}
		});
		return obj;
	}, isValid:function () {
		this._invalidWidgets = dojo.filter(this.getDescendants(), function (widget) {
			return !widget.disabled && widget.isValid && !widget.isValid();
		});
		return !this._invalidWidgets.length;
	}, onValidStateChange:function (isValid) {
	}, _widgetChange:function (widget) {
		var isValid = this._lastValidState;
		if (!widget || this._lastValidState === undefined) {
			isValid = this.isValid();
			if (this._lastValidState === undefined) {
				this._lastValidState = isValid;
			}
		} else {
			if (widget.isValid) {
				this._invalidWidgets = dojo.filter(this._invalidWidgets || [], function (w) {
					return (w != widget);
				}, this);
				if (!widget.isValid() && !widget.attr("disabled")) {
					this._invalidWidgets.push(widget);
				}
				isValid = (this._invalidWidgets.length === 0);
			}
		}
		if (isValid !== this._lastValidState) {
			this._lastValidState = isValid;
			this.onValidStateChange(isValid);
		}
	}, connectChildren:function () {
		dojo.forEach(this._changeConnections, dojo.hitch(this, "disconnect"));
		var _this = this;
		var conns = this._changeConnections = [];
		dojo.forEach(dojo.filter(this.getDescendants(), function (item) {
			return item.validate;
		}), function (widget) {
			conns.push(_this.connect(widget, "validate", dojo.hitch(_this, "_widgetChange", widget)));
			conns.push(_this.connect(widget, "_setDisabledAttr", dojo.hitch(_this, "_widgetChange", widget)));
		});
		this._widgetChange(null);
	}, startup:function () {
		this.inherited(arguments);
		this._changeConnections = [];
		this.connectChildren();
	}});
}

