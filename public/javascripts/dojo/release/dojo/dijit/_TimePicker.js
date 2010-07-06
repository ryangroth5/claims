/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._TimePicker"]) {
	dojo._hasResource["dijit._TimePicker"] = true;
	dojo.provide("dijit._TimePicker");
	dojo.require("dijit.form._FormWidget");
	dojo.require("dojo.date.locale");
	dojo.declare("dijit._TimePicker", [dijit._Widget, dijit._Templated], {templateString:dojo.cache("dijit", "templates/TimePicker.html", "<div id=\"widget_${id}\" class=\"dijitMenu ${baseClass}\"\n	><div dojoAttachPoint=\"upArrow\" class=\"dijitButtonNode dijitUpArrowButton\" dojoAttachEvent=\"onmouseenter:_buttonMouse,onmouseleave:_buttonMouse\"\n\t\t><div class=\"dijitReset dijitInline dijitArrowButtonInner\" wairole=\"presentation\" role=\"presentation\">&nbsp;</div\n\t\t><div class=\"dijitArrowButtonChar\">&#9650;</div></div\n	><div dojoAttachPoint=\"timeMenu,focusNode\" dojoAttachEvent=\"onclick:_onOptionSelected,onmouseover,onmouseout\"></div\n	><div dojoAttachPoint=\"downArrow\" class=\"dijitButtonNode dijitDownArrowButton\" dojoAttachEvent=\"onmouseenter:_buttonMouse,onmouseleave:_buttonMouse\"\n\t\t><div class=\"dijitReset dijitInline dijitArrowButtonInner\" wairole=\"presentation\" role=\"presentation\">&nbsp;</div\n\t\t><div class=\"dijitArrowButtonChar\">&#9660;</div></div\n></div>\n"), baseClass:"dijitTimePicker", clickableIncrement:"T00:15:00", visibleIncrement:"T01:00:00", visibleRange:"T05:00:00", value:new Date(), _visibleIncrement:2, _clickableIncrement:1, _totalIncrements:10, constraints:{}, serialize:dojo.date.stamp.toISOString, _filterString:"", setValue:function (value) {
		dojo.deprecated("dijit._TimePicker:setValue() is deprecated.  Use attr('value') instead.", "", "2.0");
		this.attr("value", value);
	}, _setValueAttr:function (date) {
		this.value = date;
		this._showText();
	}, onOpen:function (best) {
		if (this._beenOpened && this.domNode.parentNode) {
			var p = dijit.byId(this.domNode.parentNode.dijitPopupParent);
			if (p) {
				var val = p.attr("displayedValue");
				if (val && !p.parse(val, p.constraints)) {
					this._filterString = val;
				} else {
					this._filterString = "";
				}
				this._showText();
			}
		}
		this._beenOpened = true;
	}, isDisabledDate:function (dateObject, locale) {
		return false;
	}, _getFilteredNodes:function (start, maxNum, before) {
		var nodes = [], n, i = start, max = this._maxIncrement + Math.abs(i), chk = before ? -1 : 1, dec = before ? 1 : 0, inc = before ? 0 : 1;
		do {
			i = i - dec;
			n = this._createOption(i);
			if (n) {
				nodes.push(n);
			}
			i = i + inc;
		} while (nodes.length < maxNum && (i * chk) < max);
		if (before) {
			nodes.reverse();
		}
		return nodes;
	}, _showText:function () {
		this.timeMenu.innerHTML = "";
		var fromIso = dojo.date.stamp.fromISOString;
		this._clickableIncrementDate = fromIso(this.clickableIncrement);
		this._visibleIncrementDate = fromIso(this.visibleIncrement);
		this._visibleRangeDate = fromIso(this.visibleRange);
		var sinceMidnight = function (date) {
			return date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds();
		};
		var clickableIncrementSeconds = sinceMidnight(this._clickableIncrementDate);
		var visibleIncrementSeconds = sinceMidnight(this._visibleIncrementDate);
		var visibleRangeSeconds = sinceMidnight(this._visibleRangeDate);
		var time = this.value.getTime();
		this._refDate = new Date(time - time % (visibleIncrementSeconds * 1000));
		this._refDate.setFullYear(1970, 0, 1);
		this._clickableIncrement = 1;
		this._totalIncrements = visibleRangeSeconds / clickableIncrementSeconds;
		this._visibleIncrement = visibleIncrementSeconds / clickableIncrementSeconds;
		this._maxIncrement = (60 * 60 * 24) / clickableIncrementSeconds;
		var before = this._getFilteredNodes(0, this._totalIncrements >> 1, true);
		var after = this._getFilteredNodes(0, this._totalIncrements >> 1, false);
		if (before.length < this._totalIncrements >> 1) {
			before = before.slice(before.length / 2);
			after = after.slice(0, after.length / 2);
		}
		dojo.forEach(before.concat(after), function (n) {
			this.timeMenu.appendChild(n);
		}, this);
	}, postCreate:function () {
		if (this.constraints === dijit._TimePicker.prototype.constraints) {
			this.constraints = {};
		}
		dojo.mixin(this, this.constraints);
		if (!this.constraints.locale) {
			this.constraints.locale = this.lang;
		}
		this.connect(this.timeMenu, dojo.isIE ? "onmousewheel" : "DOMMouseScroll", "_mouseWheeled");
		var _this = this;
		var typematic = function () {
			_this._connects.push(dijit.typematic.addMouseListener.apply(null, arguments));
		};
		typematic(this.upArrow, this, this._onArrowUp, 1, 50);
		typematic(this.downArrow, this, this._onArrowDown, 1, 50);
		var triggerFx = function (cb) {
			return function (cnt) {
				if (cnt > 0) {
					cb.call(this, arguments);
				}
			};
		};
		var hoverFx = function (node, cb) {
			return function (e) {
				dojo.stopEvent(e);
				dijit.typematic.trigger(e, this, node, triggerFx(cb), node, 1, 50);
			};
		};
		this.connect(this.upArrow, "onmouseover", hoverFx(this.upArrow, this._onArrowUp));
		this.connect(this.downArrow, "onmouseover", hoverFx(this.downArrow, this._onArrowDown));
		this.inherited(arguments);
	}, _buttonMouse:function (e) {
		dojo.toggleClass(e.currentTarget, "dijitButtonNodeHover", e.type == "mouseover");
	}, _createOption:function (index) {
		var date = new Date(this._refDate);
		var incrementDate = this._clickableIncrementDate;
		date.setHours(date.getHours() + incrementDate.getHours() * index, date.getMinutes() + incrementDate.getMinutes() * index, date.getSeconds() + incrementDate.getSeconds() * index);
		if (this.constraints.selector == "time") {
			date.setFullYear(1970, 0, 1);
		}
		var dateString = dojo.date.locale.format(date, this.constraints);
		if (this._filterString && dateString.toLowerCase().indexOf(this._filterString) !== 0) {
			return null;
		}
		var div = dojo.create("div", {"class":this.baseClass + "Item"});
		div.date = date;
		div.index = index;
		dojo.create("div", {"class":this.baseClass + "ItemInner", innerHTML:dateString}, div);
		if (index % this._visibleIncrement < 1 && index % this._visibleIncrement > -1) {
			dojo.addClass(div, this.baseClass + "Marker");
		} else {
			if (!(index % this._clickableIncrement)) {
				dojo.addClass(div, this.baseClass + "Tick");
			}
		}
		if (this.isDisabledDate(date)) {
			dojo.addClass(div, this.baseClass + "ItemDisabled");
		}
		if (!dojo.date.compare(this.value, date, this.constraints.selector)) {
			div.selected = true;
			dojo.addClass(div, this.baseClass + "ItemSelected");
			if (dojo.hasClass(div, this.baseClass + "Marker")) {
				dojo.addClass(div, this.baseClass + "MarkerSelected");
			} else {
				dojo.addClass(div, this.baseClass + "TickSelected");
			}
		}
		return div;
	}, _onOptionSelected:function (tgt) {
		var tdate = tgt.target.date || tgt.target.parentNode.date;
		if (!tdate || this.isDisabledDate(tdate)) {
			return;
		}
		this._highlighted_option = null;
		this.attr("value", tdate);
		this.onValueSelected(tdate);
	}, onValueSelected:function (time) {
	}, _highlightOption:function (node, highlight) {
		if (!node) {
			return;
		}
		if (highlight) {
			if (this._highlighted_option) {
				this._highlightOption(this._highlighted_option, false);
			}
			this._highlighted_option = node;
		} else {
			if (this._highlighted_option !== node) {
				return;
			} else {
				this._highlighted_option = null;
			}
		}
		dojo.toggleClass(node, this.baseClass + "ItemHover", highlight);
		if (dojo.hasClass(node, this.baseClass + "Marker")) {
			dojo.toggleClass(node, this.baseClass + "MarkerHover", highlight);
		} else {
			dojo.toggleClass(node, this.baseClass + "TickHover", highlight);
		}
	}, onmouseover:function (e) {
		this._keyboardSelected = null;
		var tgr = (e.target.parentNode === this.timeMenu) ? e.target : e.target.parentNode;
		if (!dojo.hasClass(tgr, this.baseClass + "Item")) {
			return;
		}
		this._highlightOption(tgr, true);
	}, onmouseout:function (e) {
		this._keyboardSelected = null;
		var tgr = (e.target.parentNode === this.timeMenu) ? e.target : e.target.parentNode;
		this._highlightOption(tgr, false);
	}, _mouseWheeled:function (e) {
		this._keyboardSelected = null;
		dojo.stopEvent(e);
		var scrollAmount = (dojo.isIE ? e.wheelDelta : -e.detail);
		this[(scrollAmount > 0 ? "_onArrowUp" : "_onArrowDown")]();
	}, _onArrowUp:function (count) {
		if (typeof count == "number" && count == -1) {
			return;
		}
		if (!this.timeMenu.childNodes.length) {
			return;
		}
		var index = this.timeMenu.childNodes[0].index;
		var divs = this._getFilteredNodes(index, 1, true);
		if (divs.length) {
			this.timeMenu.removeChild(this.timeMenu.childNodes[this.timeMenu.childNodes.length - 1]);
			this.timeMenu.insertBefore(divs[0], this.timeMenu.childNodes[0]);
		}
	}, _onArrowDown:function (count) {
		if (typeof count == "number" && count == -1) {
			return;
		}
		if (!this.timeMenu.childNodes.length) {
			return;
		}
		var index = this.timeMenu.childNodes[this.timeMenu.childNodes.length - 1].index + 1;
		var divs = this._getFilteredNodes(index, 1, false);
		if (divs.length) {
			this.timeMenu.removeChild(this.timeMenu.childNodes[0]);
			this.timeMenu.appendChild(divs[0]);
		}
	}, handleKey:function (e) {
		var dk = dojo.keys;
		if (e.keyChar || e.charOrCode === dk.BACKSPACE || e.charOrCode == dk.DELETE) {
			setTimeout(dojo.hitch(this, function () {
				this._filterString = e.target.value.toLowerCase();
				this._showText();
			}), 1);
		} else {
			if (e.charOrCode == dk.DOWN_ARROW || e.charOrCode == dk.UP_ARROW) {
				dojo.stopEvent(e);
				if (this._highlighted_option && !this._highlighted_option.parentNode) {
					this._highlighted_option = null;
				}
				var timeMenu = this.timeMenu, tgt = this._highlighted_option || dojo.query("." + this.baseClass + "ItemSelected", timeMenu)[0];
				if (!tgt) {
					tgt = timeMenu.childNodes[0];
				} else {
					if (timeMenu.childNodes.length) {
						if (e.charOrCode == dk.DOWN_ARROW && !tgt.nextSibling) {
							this._onArrowDown();
						} else {
							if (e.charOrCode == dk.UP_ARROW && !tgt.previousSibling) {
								this._onArrowUp();
							}
						}
						if (e.charOrCode == dk.DOWN_ARROW) {
							tgt = tgt.nextSibling;
						} else {
							tgt = tgt.previousSibling;
						}
					}
				}
				this._highlightOption(tgt, true);
				this._keyboardSelected = tgt;
			} else {
				if (this._highlighted_option && (e.charOrCode == dk.ENTER || e.charOrCode === dk.TAB)) {
					if (!this._keyboardSelected && e.charOrCode === dk.TAB) {
						return;
					}
					if (e.charOrCode == dk.ENTER) {
						dojo.stopEvent(e);
					}
					this._onOptionSelected({target:this._highlighted_option});
				}
			}
		}
	}});
}

