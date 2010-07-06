/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form._Spinner"]) {
	dojo._hasResource["dijit.form._Spinner"] = true;
	dojo.provide("dijit.form._Spinner");
	dojo.require("dijit.form.ValidationTextBox");
	dojo.declare("dijit.form._Spinner", dijit.form.RangeBoundTextBox, {defaultTimeout:500, timeoutChangeRate:0.9, smallDelta:1, largeDelta:10, templateString:dojo.cache("dijit.form", "templates/Spinner.html", "<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\n\tid=\"widget_${id}\"\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\" waiRole=\"presentation\"\n\t><div class=\"dijitInputLayoutContainer\"\n\t\t><div class=\"dijitReset dijitSpinnerButtonContainer\"\n\t\t\t>&nbsp;<div class=\"dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitUpArrowButton\"\n\t\t\t\tdojoAttachPoint=\"upArrowNode\"\n\t\t\t\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse\"\n\t\t\t\tstateModifier=\"UpArrow\"\n\t\t\t\t><div class=\"dijitArrowButtonInner\">&thinsp;</div\n\t\t\t\t><div class=\"dijitArrowButtonChar\">&#9650;</div\n\t\t\t></div\n\t\t\t><div class=\"dijitReset dijitLeft dijitButtonNode dijitArrowButton dijitDownArrowButton\"\n\t\t\t\tdojoAttachPoint=\"downArrowNode\"\n\t\t\t\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse\"\n\t\t\t\tstateModifier=\"DownArrow\"\n\t\t\t\t><div class=\"dijitArrowButtonInner\">&thinsp;</div\n\t\t\t\t><div class=\"dijitArrowButtonChar\">&#9660;</div\n\t\t\t></div\n\t\t></div\n\t\t><div class=\"dijitReset dijitValidationIcon\"><br></div\n\t\t><div class=\"dijitReset dijitValidationIconText\">&Chi;</div\n\t\t><div class=\"dijitReset dijitInputField\"\n\t\t\t><input class='dijitReset' dojoAttachPoint=\"textbox,focusNode\" type=\"${type}\" dojoAttachEvent=\"onkeypress:_onKeyPress\"\n\t\t\t\twaiRole=\"spinbutton\" autocomplete=\"off\" ${nameAttrSetting}\n\t\t/></div\n\t></div\n></div>\n"), baseClass:"dijitSpinner", adjust:function (val, delta) {
		return val;
	}, _arrowState:function (node, pressed) {
		this._active = pressed;
		this.stateModifier = node.getAttribute("stateModifier") || "";
		this._setStateClass();
	}, _arrowPressed:function (nodePressed, direction, increment) {
		if (this.disabled || this.readOnly) {
			return;
		}
		this._arrowState(nodePressed, true);
		this._setValueAttr(this.adjust(this.attr("value"), direction * increment), false);
		dijit.selectInputText(this.textbox, this.textbox.value.length);
	}, _arrowReleased:function (node) {
		this._wheelTimer = null;
		if (this.disabled || this.readOnly) {
			return;
		}
		this._arrowState(node, false);
	}, _typematicCallback:function (count, node, evt) {
		var inc = this.smallDelta;
		if (node == this.textbox) {
			var k = dojo.keys;
			var key = evt.charOrCode;
			inc = (key == k.PAGE_UP || key == k.PAGE_DOWN) ? this.largeDelta : this.smallDelta;
			node = (key == k.UP_ARROW || key == k.PAGE_UP) ? this.upArrowNode : this.downArrowNode;
		}
		if (count == -1) {
			this._arrowReleased(node);
		} else {
			this._arrowPressed(node, (node == this.upArrowNode) ? 1 : -1, inc);
		}
	}, _wheelTimer:null, _mouseWheeled:function (evt) {
		dojo.stopEvent(evt);
		var scrollAmount = evt.detail ? (evt.detail * -1) : (evt.wheelDelta / 120);
		if (scrollAmount !== 0) {
			var node = this[(scrollAmount > 0 ? "upArrowNode" : "downArrowNode")];
			this._arrowPressed(node, scrollAmount, this.smallDelta);
			if (!this._wheelTimer) {
				clearTimeout(this._wheelTimer);
			}
			this._wheelTimer = setTimeout(dojo.hitch(this, "_arrowReleased", node), 50);
		}
	}, postCreate:function () {
		this.inherited(arguments);
		this.connect(this.domNode, !dojo.isMozilla ? "onmousewheel" : "DOMMouseScroll", "_mouseWheeled");
		this._connects.push(dijit.typematic.addListener(this.upArrowNode, this.textbox, {charOrCode:dojo.keys.UP_ARROW, ctrlKey:false, altKey:false, shiftKey:false, metaKey:false}, this, "_typematicCallback", this.timeoutChangeRate, this.defaultTimeout));
		this._connects.push(dijit.typematic.addListener(this.downArrowNode, this.textbox, {charOrCode:dojo.keys.DOWN_ARROW, ctrlKey:false, altKey:false, shiftKey:false, metaKey:false}, this, "_typematicCallback", this.timeoutChangeRate, this.defaultTimeout));
		this._connects.push(dijit.typematic.addListener(this.upArrowNode, this.textbox, {charOrCode:dojo.keys.PAGE_UP, ctrlKey:false, altKey:false, shiftKey:false, metaKey:false}, this, "_typematicCallback", this.timeoutChangeRate, this.defaultTimeout));
		this._connects.push(dijit.typematic.addListener(this.downArrowNode, this.textbox, {charOrCode:dojo.keys.PAGE_DOWN, ctrlKey:false, altKey:false, shiftKey:false, metaKey:false}, this, "_typematicCallback", this.timeoutChangeRate, this.defaultTimeout));
		if (dojo.isIE) {
			var _this = this;
			(function resize() {
				var sz = _this.upArrowNode.parentNode.offsetHeight;
				if (sz) {
					_this.upArrowNode.style.height = sz >> 1;
					_this.downArrowNode.style.height = sz - (sz >> 1);
					_this.focusNode.parentNode.style.height = sz;
				}
			})();
			this.connect(this.domNode, "onresize", function () {
				setTimeout(function () {
					resize();
					_this._setStateClass();
				}, 0);
			});
			this._layoutHackIE7();
		}
	}});
}

