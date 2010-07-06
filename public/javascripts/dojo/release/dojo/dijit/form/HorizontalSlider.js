/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.HorizontalSlider"]) {
	dojo._hasResource["dijit.form.HorizontalSlider"] = true;
	dojo.provide("dijit.form.HorizontalSlider");
	dojo.require("dijit.form._FormWidget");
	dojo.require("dijit._Container");
	dojo.require("dojo.dnd.move");
	dojo.require("dijit.form.Button");
	dojo.require("dojo.number");
	dojo.require("dojo._base.fx");
	dojo.declare("dijit.form.HorizontalSlider", [dijit.form._FormValueWidget, dijit._Container], {templateString:dojo.cache("dijit.form", "templates/HorizontalSlider.html", "<table class=\"dijit dijitReset dijitSlider\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" rules=\"none\" dojoAttachEvent=\"onkeypress:_onKeyPress,onkeyup:_onKeyUp\"\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\n\t\t><td dojoAttachPoint=\"topDecoration\" class=\"dijitReset\" style=\"text-align:center;width:100%;\"></td\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerH\"\n\t\t\t><div class=\"dijitSliderDecrementIconH\" tabIndex=\"-1\" style=\"display:none\" dojoAttachPoint=\"decrementButton\"><span class=\"dijitSliderButtonInner\">-</span></div\n\t\t></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperH dijitSliderLeftBumper dijitSliderLeftBumper\" dojoAttachEvent=\"onmousedown:_onClkDecBumper\"></div\n\t\t></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><input dojoAttachPoint=\"valueNode\" type=\"hidden\" ${nameAttrSetting}\n\t\t\t/><div class=\"dijitReset dijitSliderBarContainerH\" waiRole=\"presentation\" dojoAttachPoint=\"sliderBarContainer\"\n\t\t\t\t><div waiRole=\"presentation\" dojoAttachPoint=\"progressBar\" class=\"dijitSliderBar dijitSliderBarH dijitSliderProgressBar dijitSliderProgressBarH\" dojoAttachEvent=\"onmousedown:_onBarClick\"\n\t\t\t\t\t><div class=\"dijitSliderMoveable dijitSliderMoveableH\"\n\t\t\t\t\t\t><div dojoAttachPoint=\"sliderHandle,focusNode\" class=\"dijitSliderImageHandle dijitSliderImageHandleH\" dojoAttachEvent=\"onmousedown:_onHandleClick\" waiRole=\"slider\" valuemin=\"${minimum}\" valuemax=\"${maximum}\"></div\n\t\t\t\t\t></div\n\t\t\t\t></div\n\t\t\t\t><div waiRole=\"presentation\" dojoAttachPoint=\"remainingBar\" class=\"dijitSliderBar dijitSliderBarH dijitSliderRemainingBar dijitSliderRemainingBarH\" dojoAttachEvent=\"onmousedown:_onBarClick\"></div\n\t\t\t></div\n\t\t></td\n\t\t><td class=\"dijitReset\"\n\t\t\t><div class=\"dijitSliderBar dijitSliderBumper dijitSliderBumperH dijitSliderRightBumper dijitSliderRightBumper\" dojoAttachEvent=\"onmousedown:_onClkIncBumper\"></div\n\t\t></td\n\t\t><td class=\"dijitReset dijitSliderButtonContainer dijitSliderButtonContainerH\" style=\"right:0px;\"\n\t\t\t><div class=\"dijitSliderIncrementIconH\" tabIndex=\"-1\" style=\"display:none\" dojoAttachPoint=\"incrementButton\"><span class=\"dijitSliderButtonInner\">+</span></div\n\t\t></td\n\t></tr\n\t><tr class=\"dijitReset\"\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\n\t\t><td dojoAttachPoint=\"containerNode,bottomDecoration\" class=\"dijitReset\" style=\"text-align:center;\"></td\n\t\t><td class=\"dijitReset\" colspan=\"2\"></td\n\t></tr\n></table>\n"), value:0, showButtons:true, minimum:0, maximum:100, discreteValues:Infinity, pageIncrement:2, clickSelect:true, slideDuration:dijit.defaultDuration, widgetsInTemplate:true, attributeMap:dojo.delegate(dijit.form._FormWidget.prototype.attributeMap, {id:""}), baseClass:"dijitSlider", _mousePixelCoord:"pageX", _pixelCount:"w", _startingPixelCoord:"x", _startingPixelCount:"l", _handleOffsetCoord:"left", _progressPixelSize:"width", _onKeyUp:function (e) {
		if (this.disabled || this.readOnly || e.altKey || e.ctrlKey || e.metaKey) {
			return;
		}
		this._setValueAttr(this.value, true);
	}, _onKeyPress:function (e) {
		if (this.disabled || this.readOnly || e.altKey || e.ctrlKey || e.metaKey) {
			return;
		}
		switch (e.charOrCode) {
		  case dojo.keys.HOME:
			this._setValueAttr(this.minimum, false);
			break;
		  case dojo.keys.END:
			this._setValueAttr(this.maximum, false);
			break;
		  case ((this._descending || this.isLeftToRight()) ? dojo.keys.RIGHT_ARROW : dojo.keys.LEFT_ARROW):
		  case (this._descending === false ? dojo.keys.DOWN_ARROW : dojo.keys.UP_ARROW):
		  case (this._descending === false ? dojo.keys.PAGE_DOWN : dojo.keys.PAGE_UP):
			this.increment(e);
			break;
		  case ((this._descending || this.isLeftToRight()) ? dojo.keys.LEFT_ARROW : dojo.keys.RIGHT_ARROW):
		  case (this._descending === false ? dojo.keys.UP_ARROW : dojo.keys.DOWN_ARROW):
		  case (this._descending === false ? dojo.keys.PAGE_UP : dojo.keys.PAGE_DOWN):
			this.decrement(e);
			break;
		  default:
			return;
		}
		dojo.stopEvent(e);
	}, _onHandleClick:function (e) {
		if (this.disabled || this.readOnly) {
			return;
		}
		if (!dojo.isIE) {
			dijit.focus(this.sliderHandle);
		}
		dojo.stopEvent(e);
	}, _isReversed:function () {
		return !this.isLeftToRight();
	}, _onBarClick:function (e) {
		if (this.disabled || this.readOnly || !this.clickSelect) {
			return;
		}
		dijit.focus(this.sliderHandle);
		dojo.stopEvent(e);
		var abspos = dojo.position(this.sliderBarContainer, true);
		var pixelValue = e[this._mousePixelCoord] - abspos[this._startingPixelCoord];
		this._setPixelValue(this._isReversed() ? (abspos[this._pixelCount] - pixelValue) : pixelValue, abspos[this._pixelCount], true);
		this._movable.onMouseDown(e);
	}, _setPixelValue:function (pixelValue, maxPixels, priorityChange) {
		if (this.disabled || this.readOnly) {
			return;
		}
		pixelValue = pixelValue < 0 ? 0 : maxPixels < pixelValue ? maxPixels : pixelValue;
		var count = this.discreteValues;
		if (count <= 1 || count == Infinity) {
			count = maxPixels;
		}
		count--;
		var pixelsPerValue = maxPixels / count;
		var wholeIncrements = Math.round(pixelValue / pixelsPerValue);
		this._setValueAttr((this.maximum - this.minimum) * wholeIncrements / count + this.minimum, priorityChange);
	}, _setValueAttr:function (value, priorityChange) {
		this.valueNode.value = this.value = value;
		dijit.setWaiState(this.focusNode, "valuenow", value);
		this.inherited(arguments);
		var percent = (value - this.minimum) / (this.maximum - this.minimum);
		var progressBar = (this._descending === false) ? this.remainingBar : this.progressBar;
		var remainingBar = (this._descending === false) ? this.progressBar : this.remainingBar;
		if (this._inProgressAnim && this._inProgressAnim.status != "stopped") {
			this._inProgressAnim.stop(true);
		}
		if (priorityChange && this.slideDuration > 0 && progressBar.style[this._progressPixelSize]) {
			var _this = this;
			var props = {};
			var start = parseFloat(progressBar.style[this._progressPixelSize]);
			var duration = this.slideDuration * (percent - start / 100);
			if (duration == 0) {
				return;
			}
			if (duration < 0) {
				duration = 0 - duration;
			}
			props[this._progressPixelSize] = {start:start, end:percent * 100, units:"%"};
			this._inProgressAnim = dojo.animateProperty({node:progressBar, duration:duration, onAnimate:function (v) {
				remainingBar.style[_this._progressPixelSize] = (100 - parseFloat(v[_this._progressPixelSize])) + "%";
			}, onEnd:function () {
				delete _this._inProgressAnim;
			}, properties:props});
			this._inProgressAnim.play();
		} else {
			progressBar.style[this._progressPixelSize] = (percent * 100) + "%";
			remainingBar.style[this._progressPixelSize] = ((1 - percent) * 100) + "%";
		}
	}, _bumpValue:function (signedChange, priorityChange) {
		if (this.disabled || this.readOnly) {
			return;
		}
		var s = dojo.getComputedStyle(this.sliderBarContainer);
		var c = dojo._getContentBox(this.sliderBarContainer, s);
		var count = this.discreteValues;
		if (count <= 1 || count == Infinity) {
			count = c[this._pixelCount];
		}
		count--;
		var value = (this.value - this.minimum) * count / (this.maximum - this.minimum) + signedChange;
		if (value < 0) {
			value = 0;
		}
		if (value > count) {
			value = count;
		}
		value = value * (this.maximum - this.minimum) / count + this.minimum;
		this._setValueAttr(value, priorityChange);
	}, _onClkBumper:function (val) {
		if (this.disabled || this.readOnly || !this.clickSelect) {
			return;
		}
		this._setValueAttr(val, true);
	}, _onClkIncBumper:function () {
		this._onClkBumper(this._descending === false ? this.minimum : this.maximum);
	}, _onClkDecBumper:function () {
		this._onClkBumper(this._descending === false ? this.maximum : this.minimum);
	}, decrement:function (e) {
		this._bumpValue(e.charOrCode == dojo.keys.PAGE_DOWN ? -this.pageIncrement : -1);
	}, increment:function (e) {
		this._bumpValue(e.charOrCode == dojo.keys.PAGE_UP ? this.pageIncrement : 1);
	}, _mouseWheeled:function (evt) {
		dojo.stopEvent(evt);
		var janky = !dojo.isMozilla;
		var scroll = evt[(janky ? "wheelDelta" : "detail")] * (janky ? 1 : -1);
		this._bumpValue(scroll < 0 ? -1 : 1, true);
	}, startup:function () {
		dojo.forEach(this.getChildren(), function (child) {
			if (this[child.container] != this.containerNode) {
				this[child.container].appendChild(child.domNode);
			}
		}, this);
	}, _typematicCallback:function (count, button, e) {
		if (count == -1) {
			this._setValueAttr(this.value, true);
		} else {
			this[(button == (this._descending ? this.incrementButton : this.decrementButton)) ? "decrement" : "increment"](e);
		}
	}, postCreate:function () {
		if (this.showButtons) {
			this.incrementButton.style.display = "";
			this.decrementButton.style.display = "";
			this._connects.push(dijit.typematic.addMouseListener(this.decrementButton, this, "_typematicCallback", 25, 500));
			this._connects.push(dijit.typematic.addMouseListener(this.incrementButton, this, "_typematicCallback", 25, 500));
		}
		this.connect(this.domNode, !dojo.isMozilla ? "onmousewheel" : "DOMMouseScroll", "_mouseWheeled");
		var mover = dojo.declare(dijit.form._SliderMover, {widget:this});
		this._movable = new dojo.dnd.Moveable(this.sliderHandle, {mover:mover});
		var label = dojo.query("label[for=\"" + this.id + "\"]");
		if (label.length) {
			label[0].id = (this.id + "_label");
			dijit.setWaiState(this.focusNode, "labelledby", label[0].id);
		}
		dijit.setWaiState(this.focusNode, "valuemin", this.minimum);
		dijit.setWaiState(this.focusNode, "valuemax", this.maximum);
		this.inherited(arguments);
		this._layoutHackIE7();
	}, destroy:function () {
		this._movable.destroy();
		if (this._inProgressAnim && this._inProgressAnim.status != "stopped") {
			this._inProgressAnim.stop(true);
		}
		this._supportingWidgets = dijit.findWidgets(this.domNode);
		this.inherited(arguments);
	}});
	dojo.declare("dijit.form._SliderMover", dojo.dnd.Mover, {onMouseMove:function (e) {
		var widget = this.widget;
		var abspos = widget._abspos;
		if (!abspos) {
			abspos = widget._abspos = dojo.position(widget.sliderBarContainer, true);
			widget._setPixelValue_ = dojo.hitch(widget, "_setPixelValue");
			widget._isReversed_ = widget._isReversed();
		}
		var pixelValue = e[widget._mousePixelCoord] - abspos[widget._startingPixelCoord];
		widget._setPixelValue_(widget._isReversed_ ? (abspos[widget._pixelCount] - pixelValue) : pixelValue, abspos[widget._pixelCount], false);
	}, destroy:function (e) {
		dojo.dnd.Mover.prototype.destroy.apply(this, arguments);
		var widget = this.widget;
		widget._abspos = null;
		widget._setValueAttr(widget.value, true);
	}});
}

