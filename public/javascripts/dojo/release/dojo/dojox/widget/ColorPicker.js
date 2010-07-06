/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.widget.ColorPicker"]) {
	dojo._hasResource["dojox.widget.ColorPicker"] = true;
	dojo.provide("dojox.widget.ColorPicker");
	dojo.experimental("dojox.widget.ColorPicker");
	dojo.requireLocalization("dojox.widget", "ColorPicker", null, "ROOT,cs,de,es,fr,hu,it,ja,ko,pl,pt,ru,th,zh,zh-tw");
	dojo.requireLocalization("dojo.cldr", "number", null, "ROOT,ar,ca,cs,da,de,de-de,el,en,en-au,en-gb,en-us,es,es-es,fi,fr,he,hu,it,ja,ja-jp,ko,ko-kr,nb,nl,pl,pt,pt-pt,ru,sk,sl,sv,th,tr,zh,zh-cn,zh-tw");
	dojo.require("dijit.form._FormWidget");
	dojo.require("dojo.dnd.move");
	dojo.require("dojo.fx");
	dojo.require("dojox.color");
	dojo.require("dojo.i18n");
	(function (d) {
		var webSafeFromHex = function (hex) {
			return hex;
		};
		dojo.declare("dojox.widget.ColorPicker", dijit.form._FormWidget, {showRgb:true, showHsv:true, showHex:true, webSafe:true, animatePoint:true, slideDuration:250, liveUpdate:false, PICKER_HUE_H:150, PICKER_SAT_VAL_H:150, PICKER_SAT_VAL_W:150, value:"#ffffff", _underlay:d.moduleUrl("dojox.widget", "ColorPicker/images/underlay.png"), templateString:dojo.cache("dojox.widget", "ColorPicker/ColorPicker.html", "<div class=\"dojoxColorPicker\" dojoAttachEvent=\"onkeypress: _handleKey\">\n\t<div class=\"dojoxColorPickerBox\">\n\t\t<div dojoAttachPoint=\"cursorNode\" tabIndex=\"0\" class=\"dojoxColorPickerPoint\"></div>\n\t\t<img dojoAttachPoint=\"colorUnderlay\" dojoAttachEvent=\"onclick: _setPoint\" class=\"dojoxColorPickerUnderlay\" src=\"${_underlay}\">\n\t</div>\n\t<div class=\"dojoxHuePicker\">\n\t\t<div dojoAttachPoint=\"hueCursorNode\" tabIndex=\"0\" class=\"dojoxHuePickerPoint\"></div>\n\t\t<div dojoAttachPoint=\"hueNode\" class=\"dojoxHuePickerUnderlay\" dojoAttachEvent=\"onclick: _setHuePoint\"></div>\n\t</div>\n\t<div dojoAttachPoint=\"previewNode\" class=\"dojoxColorPickerPreview\"></div>\n\t<div dojoAttachPoint=\"safePreviewNode\" class=\"dojoxColorPickerWebSafePreview\"></div>\n\t<div class=\"dojoxColorPickerOptional\" dojoAttachEvent=\"onchange: _colorInputChange\">\n\t\t<div class=\"dijitInline dojoxColorPickerRgb\" dojoAttachPoint=\"rgbNode\">\n\t\t\t<table>\n\t\t\t<tr><td>${redLabel}</td><td><input dojoAttachPoint=\"Rval\" size=\"1\"></td></tr>\n\t\t\t<tr><td>${greenLabel}</td><td><input dojoAttachPoint=\"Gval\" size=\"1\"></td></tr>\n\t\t\t<tr><td>${blueLabel}</td><td><input dojoAttachPoint=\"Bval\" size=\"1\"></td></tr>\n\t\t\t</table>\n\t\t</div>\n\t\t<div class=\"dijitInline dojoxColorPickerHsv\" dojoAttachPoint=\"hsvNode\">\n\t\t\t<table>\n\t\t\t<tr><td>${hueLabel}</td><td><input dojoAttachPoint=\"Hval\"size=\"1\"> ${degLabel}</td></tr>\n\t\t\t<tr><td>${saturationLabel}</td><td><input dojoAttachPoint=\"Sval\" size=\"1\"> ${percentSign}</td></tr>\n\t\t\t<tr><td>${valueLabel}</td><td><input dojoAttachPoint=\"Vval\" size=\"1\"> ${percentSign}</td></tr>\n\t\t\t</table>\n\t\t</div>\n\t\t<div class=\"dojoxColorPickerHex\" dojoAttachPoint=\"hexNode\">\t\n\t\t\t${hexLabel}: <input dojoAttachPoint=\"hexCode, focusNode, valueNode\" size=\"6\" class=\"dojoxColorPickerHexCode\">\n\t\t</div>\n\t</div>\n</div>\n"), postMixInProperties:function () {
			dojo.mixin(this, dojo.i18n.getLocalization("dojox.widget", "ColorPicker"));
			dojo.mixin(this, dojo.i18n.getLocalization("dojo.cldr", "number"));
			this.inherited(arguments);
		}, postCreate:function () {
			this.inherited(arguments);
			if (d.isIE < 7) {
				this.colorUnderlay.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + this._underlay + "', sizingMethod='scale')";
				this.colorUnderlay.src = this._blankGif.toString();
			}
			if (!this.showRgb) {
				this.rgbNode.style.display = "none";
			}
			if (!this.showHsv) {
				this.hsvNode.style.display = "none";
			}
			if (!this.showHex) {
				this.hexNode.style.display = "none";
			}
			if (!this.webSafe) {
				this.safePreviewNode.style.visibility = "hidden";
			}
			this._offset = 0;
			var cmb = d.marginBox(this.cursorNode);
			var hmb = d.marginBox(this.hueCursorNode);
			this._shift = {hue:{x:Math.round(hmb.w / 2) - 1, y:Math.round(hmb.h / 2) - 1}, picker:{x:Math.floor(cmb.w / 2), y:Math.floor(cmb.h / 2)}};
			this.PICKER_HUE_H = d.coords(this.hueNode).h;
			var cu = d.coords(this.colorUnderlay);
			this.PICKER_SAT_VAL_H = cu.h;
			this.PICKER_SAT_VAL_W = cu.w;
			var ox = this._shift.picker.x;
			var oy = this._shift.picker.y;
			this._mover = new d.dnd.move.boxConstrainedMoveable(this.cursorNode, {box:{t:0 - oy, l:0 - ox, w:this.PICKER_SAT_VAL_W, h:this.PICKER_SAT_VAL_H}});
			this._hueMover = new d.dnd.move.boxConstrainedMoveable(this.hueCursorNode, {box:{t:0 - this._shift.hue.y, l:0, w:0, h:this.PICKER_HUE_H}});
			d.subscribe("/dnd/move/stop", d.hitch(this, "_clearTimer"));
			d.subscribe("/dnd/move/start", d.hitch(this, "_setTimer"));
		}, startup:function () {
			this._started = true;
			this.attr("value", this.value);
		}, _setValueAttr:function (value) {
			if (!this._started) {
				return;
			}
			this.setColor(value, true);
		}, setColor:function (color, force) {
			var col = dojox.color.fromString(color);
			this._updatePickerLocations(col);
			this._updateColorInputs(col);
			this._updateValue(col, force);
		}, _setTimer:function (mover) {
			dijit.focus(mover.node);
			d.setSelectable(this.domNode, false);
			this._timer = setInterval(d.hitch(this, "_updateColor"), 45);
		}, _clearTimer:function (mover) {
			clearInterval(this._timer);
			this._timer = null;
			this.onChange(this.value);
			d.setSelectable(this.domNode, true);
		}, _setHue:function (h) {
			d.style(this.colorUnderlay, "backgroundColor", dojox.color.fromHsv(h, 100, 100).toHex());
		}, _updateColor:function () {
			var _huetop = d.style(this.hueCursorNode, "top") + this._shift.hue.y, _pickertop = d.style(this.cursorNode, "top") + this._shift.picker.y, _pickerleft = d.style(this.cursorNode, "left") + this._shift.picker.x, h = Math.round(360 - (_huetop / this.PICKER_HUE_H * 360)), col = dojox.color.fromHsv(h, _pickerleft / this.PICKER_SAT_VAL_W * 100, 100 - (_pickertop / this.PICKER_SAT_VAL_H * 100));
			this._updateColorInputs(col);
			this._updateValue(col, true);
			if (h != this._hue) {
				this._setHue(h);
			}
		}, _colorInputChange:function (e) {
			var col, hasit = false;
			switch (e.target) {
			  case this.hexCode:
				col = dojox.color.fromString(e.target.value);
				hasit = true;
				break;
			  case this.Rval:
			  case this.Gval:
			  case this.Bval:
				col = dojox.color.fromArray([this.Rval.value, this.Gval.value, this.Bval.value]);
				hasit = true;
				break;
			  case this.Hval:
			  case this.Sval:
			  case this.Vval:
				col = dojox.color.fromHsv(this.Hval.value, this.Sval.value, this.Vval.value);
				hasit = true;
				break;
			}
			if (hasit) {
				this._updatePickerLocations(col);
				this._updateColorInputs(col);
				this._updateValue(col, true);
			}
		}, _updateValue:function (col, fireChange) {
			var hex = col.toHex();
			this.value = this.valueNode.value = hex;
			if (fireChange && (!this._timer || this.liveUpdate)) {
				this.onChange(hex);
			}
		}, _updatePickerLocations:function (col) {
			var hsv = col.toHsv(), ypos = Math.round(this.PICKER_HUE_H - hsv.h / 360 * this.PICKER_HUE_H - this._shift.hue.y), newLeft = Math.round(hsv.s / 100 * this.PICKER_SAT_VAL_W - this._shift.picker.x), newTop = Math.round(this.PICKER_SAT_VAL_H - hsv.v / 100 * this.PICKER_SAT_VAL_H - this._shift.picker.y);
			if (this.animatePoint) {
				d.fx.slideTo({node:this.hueCursorNode, duration:this.slideDuration, top:ypos, left:0}).play();
				d.fx.slideTo({node:this.cursorNode, duration:this.slideDuration, top:newTop, left:newLeft}).play();
			} else {
				d.style(this.hueCursorNode, "top", ypos + "px");
				d.style(this.cursorNode, {left:newLeft + "px", top:newTop + "px"});
			}
			if (hsv.h != this._hue) {
				this._setHue(hsv.h);
			}
		}, _updateColorInputs:function (col) {
			var hex = col.toHex();
			if (this.showRgb) {
				this.Rval.value = col.r;
				this.Gval.value = col.g;
				this.Bval.value = col.b;
			}
			if (this.showHsv) {
				var hsv = col.toHsv();
				this.Hval.value = Math.round((hsv.h));
				this.Sval.value = Math.round(hsv.s);
				this.Vval.value = Math.round(hsv.v);
			}
			if (this.showHex) {
				this.hexCode.value = hex;
			}
			this.previewNode.style.backgroundColor = hex;
			if (this.webSafe) {
				this.safePreviewNode.style.backgroundColor = webSafeFromHex(hex);
			}
		}, _setHuePoint:function (evt) {
			var ypos = evt.layerY - this._shift.hue.y;
			if (this.animatePoint) {
				d.fx.slideTo({node:this.hueCursorNode, duration:this.slideDuration, top:ypos, left:0, onEnd:d.hitch(this, "_updateColor", true)}).play();
			} else {
				d.style(this.hueCursorNode, "top", ypos + "px");
				this._updateColor(false);
			}
		}, _setPoint:function (evt) {
			var newTop = evt.layerY - this._shift.picker.y, newLeft = evt.layerX - this._shift.picker.x;
			if (evt) {
				dijit.focus(evt.target);
			}
			if (this.animatePoint) {
				d.fx.slideTo({node:this.cursorNode, duration:this.slideDuration, top:newTop, left:newLeft, onEnd:d.hitch(this, "_updateColor", true)}).play();
			} else {
				d.style(this.cursorNode, {left:newLeft + "px", top:newTop + "px"});
				this._updateColor(false);
			}
		}, _handleKey:function (e) {
		}});
	})(dojo);
}

