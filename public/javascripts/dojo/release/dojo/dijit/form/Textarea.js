/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.Textarea"]) {
	dojo._hasResource["dijit.form.Textarea"] = true;
	dojo.provide("dijit.form.Textarea");
	dojo.require("dijit.form.SimpleTextarea");
	dojo.declare("dijit.form.Textarea", dijit.form.SimpleTextarea, {cols:"", _previousNewlines:0, _strictMode:(dojo.doc.compatMode != "BackCompat"), _getHeight:function (textarea) {
		var newH = textarea.scrollHeight;
		if (dojo.isIE) {
			newH += textarea.offsetHeight - textarea.clientHeight - ((dojo.isIE < 8 && this._strictMode) ? dojo._getPadBorderExtents(textarea).h : 0);
		} else {
			if (dojo.isMoz) {
				newH += textarea.offsetHeight - textarea.clientHeight;
			} else {
				if (dojo.isWebKit && !(dojo.isSafari < 4)) {
					newH += dojo._getBorderExtents(textarea).h;
				} else {
					newH += dojo._getPadBorderExtents(textarea).h;
				}
			}
		}
		return newH;
	}, _estimateHeight:function (textarea) {
		textarea.style.maxHeight = "";
		textarea.style.height = "auto";
		textarea.rows = (textarea.value.match(/\n/g) || []).length + 1;
	}, _needsHelpShrinking:dojo.isMoz || dojo.isWebKit, _onInput:function () {
		this.inherited(arguments);
		if (this._busyResizing) {
			return;
		}
		this._busyResizing = true;
		var textarea = this.textbox;
		if (textarea.scrollHeight && textarea.offsetHeight && textarea.clientHeight) {
			var newH = this._getHeight(textarea) + "px";
			if (textarea.style.height != newH) {
				textarea.style.maxHeight = textarea.style.height = newH;
			}
			if (this._needsHelpShrinking) {
				if (this._setTimeoutHandle) {
					clearTimeout(this._setTimeoutHandle);
				}
				this._setTimeoutHandle = setTimeout(dojo.hitch(this, "_shrink"), 0);
			}
		} else {
			this._estimateHeight(textarea);
		}
		this._busyResizing = false;
	}, _busyResizing:false, _shrink:function () {
		this._setTimeoutHandle = null;
		if (this._needsHelpShrinking && !this._busyResizing) {
			this._busyResizing = true;
			var textarea = this.textbox;
			var empty = false;
			if (textarea.value == "") {
				textarea.value = " ";
				empty = true;
			}
			var scrollHeight = textarea.scrollHeight;
			if (!scrollHeight) {
				this._estimateHeight(textarea);
			} else {
				var oldPadding = textarea.style.paddingBottom;
				var newPadding = dojo._getPadExtents(textarea);
				newPadding = newPadding.h - newPadding.t;
				textarea.style.paddingBottom = newPadding + 1 + "px";
				var newH = this._getHeight(textarea) - 1 + "px";
				if (textarea.style.maxHeight != newH) {
					textarea.style.paddingBottom = newPadding + scrollHeight + "px";
					textarea.scrollTop = 0;
					textarea.style.maxHeight = this._getHeight(textarea) - scrollHeight + "px";
				}
				textarea.style.paddingBottom = oldPadding;
			}
			if (empty) {
				textarea.value = "";
			}
			this._busyResizing = false;
		}
	}, resize:function () {
		this._onInput();
	}, _setValueAttr:function () {
		this.inherited(arguments);
		this.resize();
	}, postCreate:function () {
		this.inherited(arguments);
		dojo.style(this.textbox, {overflowY:"hidden", overflowX:"auto", boxSizing:"border-box", MsBoxSizing:"border-box", WebkitBoxSizing:"border-box", MozBoxSizing:"border-box"});
		this.connect(this.textbox, "onscroll", this._onInput);
		this.connect(this.textbox, "onresize", this._onInput);
		this.connect(this.textbox, "onfocus", this._onInput);
		setTimeout(dojo.hitch(this, "resize"), 0);
	}});
}

