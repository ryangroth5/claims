/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.Button"]) {
	dojo._hasResource["dijit.form.Button"] = true;
	dojo.provide("dijit.form.Button");
	dojo.require("dijit.form._FormWidget");
	dojo.require("dijit._Container");
	dojo.require("dijit._HasDropDown");
	dojo.declare("dijit.form.Button", dijit.form._FormWidget, {label:"", showLabel:true, iconClass:"", type:"button", baseClass:"dijitButton", templateString:dojo.cache("dijit.form", "templates/Button.html", "<span class=\"dijit dijitReset dijitLeft dijitInline\"\n\tdojoAttachEvent=\"onclick:_onButtonClick,onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\"\n\t><span class=\"dijitReset dijitRight dijitInline\"\n\t\t><span class=\"dijitReset dijitInline dijitButtonNode\"\n\t\t\t><button class=\"dijitReset dijitStretch dijitButtonContents\"\n\t\t\t\tdojoAttachPoint=\"titleNode,focusNode\"\n\t\t\t\t${nameAttrSetting} type=\"${type}\" value=\"${value}\" waiRole=\"button\" waiState=\"labelledby-${id}_label\"\n\t\t\t\t><span class=\"dijitReset dijitInline\" dojoAttachPoint=\"iconNode\"\n\t\t\t\t\t><span class=\"dijitReset dijitToggleButtonIconChar\">&#10003;</span\n\t\t\t\t></span\n\t\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"\n\t\t\t\t\tid=\"${id}_label\"\n\t\t\t\t\tdojoAttachPoint=\"containerNode\"\n\t\t\t\t></span\n\t\t\t></button\n\t\t></span\n\t></span\n></span>\n"), attributeMap:dojo.delegate(dijit.form._FormWidget.prototype.attributeMap, {label:{node:"containerNode", type:"innerHTML"}, iconClass:{node:"iconNode", type:"class"}}), _onClick:function (e) {
		if (this.disabled) {
			return false;
		}
		this._clicked();
		return this.onClick(e);
	}, _onButtonClick:function (e) {
		if (this._onClick(e) === false) {
			e.preventDefault();
		} else {
			if (this.type == "submit" && !this.focusNode.form) {
				for (var node = this.domNode; node.parentNode; node = node.parentNode) {
					var widget = dijit.byNode(node);
					if (widget && typeof widget._onSubmit == "function") {
						widget._onSubmit(e);
						break;
					}
				}
			}
		}
	}, _setValueAttr:function (value) {
		var attr = this.attributeMap.value || "";
		if (this[attr.node || attr || "domNode"].tagName == "BUTTON") {
			if (value != this.value) {
				console.debug("Cannot change the value attribute on a Button widget.");
			}
		}
	}, _fillContent:function (source) {
		if (source && (!this.params || !("label" in this.params))) {
			this.attr("label", source.innerHTML);
		}
	}, postCreate:function () {
		dojo.setSelectable(this.focusNode, false);
		this.inherited(arguments);
	}, _setShowLabelAttr:function (val) {
		if (this.containerNode) {
			dojo.toggleClass(this.containerNode, "dijitDisplayNone", !val);
		}
		this.showLabel = val;
	}, onClick:function (e) {
		return true;
	}, _clicked:function (e) {
	}, setLabel:function (content) {
		dojo.deprecated("dijit.form.Button.setLabel() is deprecated.  Use attr('label', ...) instead.", "", "2.0");
		this.attr("label", content);
	}, _setLabelAttr:function (content) {
		this.containerNode.innerHTML = this.label = content;
		if (this.showLabel == false && !this.params.title) {
			this.titleNode.title = dojo.trim(this.containerNode.innerText || this.containerNode.textContent || "");
		}
	}});
	dojo.declare("dijit.form.DropDownButton", [dijit.form.Button, dijit._Container, dijit._HasDropDown], {baseClass:"dijitDropDownButton", templateString:dojo.cache("dijit.form", "templates/DropDownButton.html", "<span class=\"dijit dijitReset dijitLeft dijitInline\"\n\tdojoAttachPoint=\"_buttonNode\"\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\"\n\t><span class='dijitReset dijitRight dijitInline'\n\t\t><span class='dijitReset dijitInline dijitButtonNode'\n\t\t\t><button class=\"dijitReset dijitStretch dijitButtonContents\"\n\t\t\t\t${nameAttrSetting} type=\"${type}\" value=\"${value}\"\n\t\t\t\tdojoAttachPoint=\"focusNode,titleNode,_arrowWrapperNode\"\n\t\t\t\twaiRole=\"button\" waiState=\"haspopup-true,labelledby-${id}_label\"\n\t\t\t\t><span class=\"dijitReset dijitInline\"\n\t\t\t\t\tdojoAttachPoint=\"iconNode\"\n\t\t\t\t></span\n\t\t\t\t><span class=\"dijitReset dijitInline dijitButtonText\"\n\t\t\t\t\tdojoAttachPoint=\"containerNode,_popupStateNode\"\n\t\t\t\t\tid=\"${id}_label\"\n\t\t\t\t></span\n\t\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonInner\">&thinsp;</span\n\t\t\t\t><span class=\"dijitReset dijitInline dijitArrowButtonChar\">&#9660;</span\n\t\t\t></button\n\t\t></span\n\t></span\n></span>\n"), _fillContent:function () {
		if (this.srcNodeRef) {
			var nodes = dojo.query("*", this.srcNodeRef);
			dijit.form.DropDownButton.superclass._fillContent.call(this, nodes[0]);
			this.dropDownContainer = this.srcNodeRef;
		}
	}, startup:function () {
		if (this._started) {
			return;
		}
		if (!this.dropDown) {
			var dropDownNode = dojo.query("[widgetId]", this.dropDownContainer)[0];
			this.dropDown = dijit.byNode(dropDownNode);
			delete this.dropDownContainer;
		}
		dijit.popup.moveOffScreen(this.dropDown.domNode);
		this.inherited(arguments);
	}, isLoaded:function () {
		var dropDown = this.dropDown;
		return (!dropDown.href || dropDown.isLoaded);
	}, loadDropDown:function () {
		var dropDown = this.dropDown;
		if (!dropDown) {
			return;
		}
		if (!this.isLoaded()) {
			var handler = dojo.connect(dropDown, "onLoad", this, function () {
				dojo.disconnect(handler);
				this.openDropDown();
			});
			dropDown.refresh();
		} else {
			this.openDropDown();
		}
	}, isFocusable:function () {
		return this.inherited(arguments) && !this._mouseDown;
	}});
	dojo.declare("dijit.form.ComboButton", dijit.form.DropDownButton, {templateString:dojo.cache("dijit.form", "templates/ComboButton.html", "<table class='dijit dijitReset dijitInline dijitLeft'\n\tcellspacing='0' cellpadding='0' waiRole=\"presentation\"\n\t><tbody waiRole=\"presentation\"><tr waiRole=\"presentation\"\n\t\t><td class=\"dijitReset dijitStretch dijitButtonNode\"><button id=\"${id}_button\" class=\"dijitReset dijitButtonContents\"\n\t\t\tdojoAttachEvent=\"onclick:_onButtonClick,onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse,onkeypress:_onButtonKeyPress\"  dojoAttachPoint=\"titleNode\"\n\t\t\twaiRole=\"button\" waiState=\"labelledby-${id}_label\"\n\t\t\t><div class=\"dijitReset dijitInline\" dojoAttachPoint=\"iconNode\" waiRole=\"presentation\"></div\n\t\t\t><div class=\"dijitReset dijitInline dijitButtonText\" id=\"${id}_label\" dojoAttachPoint=\"containerNode\" waiRole=\"presentation\"></div\n\t\t></button></td\n\t\t><td id=\"${id}_arrow\" class='dijitReset dijitRight dijitButtonNode dijitArrowButton'\n\t\t\tdojoAttachPoint=\"_popupStateNode,focusNode,_buttonNode\"\n\t\t\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onkeypress:_onArrowKeyPress\"\n\t\t\tstateModifier=\"DownArrow\"\n\t\t\ttitle=\"${optionsTitle}\" ${nameAttrSetting}\n\t\t\twaiRole=\"button\" waiState=\"haspopup-true\"\n\t\t\t><div class=\"dijitReset dijitArrowButtonInner\" waiRole=\"presentation\">&thinsp;</div\n\t\t\t><div class=\"dijitReset dijitArrowButtonChar\" waiRole=\"presentation\">&#9660;</div\n\t\t></td\n\t></tr></tbody\n></table>\n"), attributeMap:dojo.mixin(dojo.clone(dijit.form.Button.prototype.attributeMap), {id:"", tabIndex:["focusNode", "titleNode"], title:"titleNode"}), optionsTitle:"", baseClass:"dijitComboButton", _focusedNode:null, postCreate:function () {
		this.inherited(arguments);
		this._focalNodes = [this.titleNode, this._popupStateNode];
		var isIE = dojo.isIE;
		dojo.forEach(this._focalNodes, dojo.hitch(this, function (node) {
			this.connect(node, isIE ? "onactivate" : "onfocus", this._onNodeFocus);
			this.connect(node, isIE ? "ondeactivate" : "onblur", this._onNodeBlur);
		}));
		if (isIE && (isIE < 8 || dojo.isQuirks)) {
			with (this.titleNode) {
				style.width = scrollWidth + "px";
				this.connect(this.titleNode, "onresize", function () {
					setTimeout(function () {
						style.width = scrollWidth + "px";
					}, 0);
				});
			}
		}
	}, _onNodeFocus:function (evt) {
		this._focusedNode = evt.currentTarget;
		var fnc = this._focusedNode == this.focusNode ? "dijitDownArrowButtonFocused" : "dijitButtonContentsFocused";
		dojo.addClass(this._focusedNode, fnc);
	}, _onNodeBlur:function (evt) {
		var fnc = evt.currentTarget == this.focusNode ? "dijitDownArrowButtonFocused" : "dijitButtonContentsFocused";
		dojo.removeClass(evt.currentTarget, fnc);
	}, _onBlur:function () {
		this.inherited(arguments);
		this._focusedNode = null;
	}, _onButtonKeyPress:function (evt) {
		if (evt.charOrCode == dojo.keys[this.isLeftToRight() ? "RIGHT_ARROW" : "LEFT_ARROW"]) {
			dijit.focus(this._popupStateNode);
			dojo.stopEvent(evt);
		}
	}, _onArrowKeyPress:function (evt) {
		if (evt.charOrCode == dojo.keys[this.isLeftToRight() ? "LEFT_ARROW" : "RIGHT_ARROW"]) {
			dijit.focus(this.titleNode);
			dojo.stopEvent(evt);
		}
	}, focus:function (position) {
		dijit.focus(position == "start" ? this.titleNode : this._popupStateNode);
	}});
	dojo.declare("dijit.form.ToggleButton", dijit.form.Button, {baseClass:"dijitToggleButton", checked:false, attributeMap:dojo.mixin(dojo.clone(dijit.form.Button.prototype.attributeMap), {checked:"focusNode"}), _clicked:function (evt) {
		this.attr("checked", !this.checked);
	}, _setCheckedAttr:function (value) {
		this.checked = value;
		dojo.attr(this.focusNode || this.domNode, "checked", value);
		dijit.setWaiState(this.focusNode || this.domNode, "pressed", value);
		this._setStateClass();
		this._handleOnChange(value, true);
	}, setChecked:function (checked) {
		dojo.deprecated("setChecked(" + checked + ") is deprecated. Use attr('checked'," + checked + ") instead.", "", "2.0");
		this.attr("checked", checked);
	}, reset:function () {
		this._hasBeenBlurred = false;
		this.attr("checked", this.params.checked || false);
	}});
}

