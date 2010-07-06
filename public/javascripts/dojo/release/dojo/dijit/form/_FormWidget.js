/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form._FormWidget"]) {
	dojo._hasResource["dijit.form._FormWidget"] = true;
	dojo.provide("dijit.form._FormWidget");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.declare("dijit.form._FormWidget", [dijit._Widget, dijit._Templated], {baseClass:"", name:"", alt:"", value:"", type:"text", tabIndex:"0", disabled:false, intermediateChanges:false, scrollOnFocus:true, attributeMap:dojo.delegate(dijit._Widget.prototype.attributeMap, {value:"focusNode", id:"focusNode", tabIndex:"focusNode", alt:"focusNode", title:"focusNode"}), postMixInProperties:function () {
		this.nameAttrSetting = this.name ? ("name='" + this.name + "'") : "";
		this.inherited(arguments);
	}, _setDisabledAttr:function (value) {
		this.disabled = value;
		dojo.attr(this.focusNode, "disabled", value);
		if (this.valueNode) {
			dojo.attr(this.valueNode, "disabled", value);
		}
		dijit.setWaiState(this.focusNode, "disabled", value);
		if (value) {
			this._hovering = false;
			this._active = false;
			this.focusNode.setAttribute("tabIndex", "-1");
		} else {
			this.focusNode.setAttribute("tabIndex", this.tabIndex);
		}
		this._setStateClass();
	}, setDisabled:function (disabled) {
		dojo.deprecated("setDisabled(" + disabled + ") is deprecated. Use attr('disabled'," + disabled + ") instead.", "", "2.0");
		this.attr("disabled", disabled);
	}, _onFocus:function (e) {
		if (this.scrollOnFocus) {
			dijit.scrollIntoView(this.domNode);
		}
		this.inherited(arguments);
	}, _onMouse:function (event) {
		var mouseNode = event.currentTarget;
		if (mouseNode && mouseNode.getAttribute) {
			this.stateModifier = mouseNode.getAttribute("stateModifier") || "";
		}
		if (!this.disabled) {
			switch (event.type) {
			  case "mouseenter":
			  case "mouseover":
				this._hovering = true;
				this._active = this._mouseDown;
				break;
			  case "mouseout":
			  case "mouseleave":
				this._hovering = false;
				this._active = false;
				break;
			  case "mousedown":
				this._active = true;
				this._mouseDown = true;
				var mouseUpConnector = this.connect(dojo.body(), "onmouseup", function () {
					if (this._mouseDown && this.isFocusable()) {
						this.focus();
					}
					this._active = false;
					this._mouseDown = false;
					this._setStateClass();
					this.disconnect(mouseUpConnector);
				});
				break;
			}
			this._setStateClass();
		}
	}, isFocusable:function () {
		return !this.disabled && !this.readOnly && this.focusNode && (dojo.style(this.domNode, "display") != "none");
	}, focus:function () {
		dijit.focus(this.focusNode);
	}, _setStateClass:function () {
		var newStateClasses = this.baseClass.split(" ");
		function multiply(modifier) {
			newStateClasses = newStateClasses.concat(dojo.map(newStateClasses, function (c) {
				return c + modifier;
			}), "dijit" + modifier);
		}
		if (this.checked) {
			multiply("Checked");
		}
		if (this.state) {
			multiply(this.state);
		}
		if (this.selected) {
			multiply("Selected");
		}
		if (this.disabled) {
			multiply("Disabled");
		} else {
			if (this.readOnly) {
				multiply("ReadOnly");
			} else {
				if (this._active) {
					multiply(this.stateModifier + "Active");
				} else {
					if (this._focused) {
						multiply("Focused");
					}
					if (this._hovering) {
						multiply(this.stateModifier + "Hover");
					}
				}
			}
		}
		var tn = this.stateNode || this.domNode, classHash = {};
		dojo.forEach(tn.className.split(" "), function (c) {
			classHash[c] = true;
		});
		if ("_stateClasses" in this) {
			dojo.forEach(this._stateClasses, function (c) {
				delete classHash[c];
			});
		}
		dojo.forEach(newStateClasses, function (c) {
			classHash[c] = true;
		});
		var newClasses = [];
		for (var c in classHash) {
			newClasses.push(c);
		}
		tn.className = newClasses.join(" ");
		this._stateClasses = newStateClasses;
	}, compare:function (val1, val2) {
		if (typeof val1 == "number" && typeof val2 == "number") {
			return (isNaN(val1) && isNaN(val2)) ? 0 : val1 - val2;
		} else {
			if (val1 > val2) {
				return 1;
			} else {
				if (val1 < val2) {
					return -1;
				} else {
					return 0;
				}
			}
		}
	}, onChange:function (newValue) {
	}, _onChangeActive:false, _handleOnChange:function (newValue, priorityChange) {
		this._lastValue = newValue;
		if (this._lastValueReported == undefined && (priorityChange === null || !this._onChangeActive)) {
			this._resetValue = this._lastValueReported = newValue;
		}
		if ((this.intermediateChanges || priorityChange || priorityChange === undefined) && ((typeof newValue != typeof this._lastValueReported) || this.compare(newValue, this._lastValueReported) != 0)) {
			this._lastValueReported = newValue;
			if (this._onChangeActive) {
				if (this._onChangeHandle) {
					clearTimeout(this._onChangeHandle);
				}
				this._onChangeHandle = setTimeout(dojo.hitch(this, function () {
					this._onChangeHandle = null;
					this.onChange(newValue);
				}), 0);
			}
		}
	}, create:function () {
		this.inherited(arguments);
		this._onChangeActive = true;
		this._setStateClass();
	}, destroy:function () {
		if (this._onChangeHandle) {
			clearTimeout(this._onChangeHandle);
			this.onChange(this._lastValueReported);
		}
		this.inherited(arguments);
	}, setValue:function (value) {
		dojo.deprecated("dijit.form._FormWidget:setValue(" + value + ") is deprecated.  Use attr('value'," + value + ") instead.", "", "2.0");
		this.attr("value", value);
	}, getValue:function () {
		dojo.deprecated(this.declaredClass + "::getValue() is deprecated. Use attr('value') instead.", "", "2.0");
		return this.attr("value");
	}});
	dojo.declare("dijit.form._FormValueWidget", dijit.form._FormWidget, {readOnly:false, attributeMap:dojo.delegate(dijit.form._FormWidget.prototype.attributeMap, {value:"", readOnly:"focusNode"}), _setReadOnlyAttr:function (value) {
		this.readOnly = value;
		dojo.attr(this.focusNode, "readOnly", value);
		dijit.setWaiState(this.focusNode, "readonly", value);
		this._setStateClass();
	}, postCreate:function () {
		if (dojo.isIE) {
			this.connect(this.focusNode || this.domNode, "onkeydown", this._onKeyDown);
		}
		if (this._resetValue === undefined) {
			this._resetValue = this.value;
		}
	}, _setValueAttr:function (newValue, priorityChange) {
		this.value = newValue;
		this._handleOnChange(newValue, priorityChange);
	}, _getValueAttr:function () {
		return this._lastValue;
	}, undo:function () {
		this._setValueAttr(this._lastValueReported, false);
	}, reset:function () {
		this._hasBeenBlurred = false;
		this._setValueAttr(this._resetValue, true);
	}, _onKeyDown:function (e) {
		if (e.keyCode == dojo.keys.ESCAPE && !(e.ctrlKey || e.altKey || e.metaKey)) {
			var te;
			if (dojo.isIE) {
				e.preventDefault();
				te = document.createEventObject();
				te.keyCode = dojo.keys.ESCAPE;
				te.shiftKey = e.shiftKey;
				e.srcElement.fireEvent("onkeypress", te);
			}
		}
	}, _layoutHackIE7:function () {
		if (dojo.isIE == 7) {
			var domNode = this.domNode;
			var parent = domNode.parentNode;
			var pingNode = domNode.firstChild || domNode;
			var origFilter = pingNode.style.filter;
			while (parent && parent.clientHeight == 0) {
				parent._disconnectHandle = this.connect(parent, "onscroll", dojo.hitch(this, function (e) {
					this.disconnect(parent._disconnectHandle);
					parent.removeAttribute("_disconnectHandle");
					pingNode.style.filter = (new Date()).getMilliseconds();
					setTimeout(function () {
						pingNode.style.filter = origFilter;
					}, 0);
				}));
				parent = parent.parentNode;
			}
		}
	}});
}

