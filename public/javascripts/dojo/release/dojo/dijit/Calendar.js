/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.Calendar"]) {
	dojo._hasResource["dijit.Calendar"] = true;
	dojo.provide("dijit.Calendar");
	dojo.require("dojo.cldr.supplemental");
	dojo.require("dojo.date");
	dojo.require("dojo.date.locale");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.declare("dijit.Calendar", [dijit._Widget, dijit._Templated], {templateString:dojo.cache("dijit", "templates/Calendar.html", "<table cellspacing=\"0\" cellpadding=\"0\" class=\"dijitCalendarContainer\" role=\"grid\" dojoAttachEvent=\"onkeypress: _onKeyPress\">\n\t<thead>\n\t\t<tr class=\"dijitReset dijitCalendarMonthContainer\" valign=\"top\">\n\t\t\t<th class='dijitReset' dojoAttachPoint=\"decrementMonth\">\n\t\t\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitCalendarIncrementControl dijitCalendarDecrease\" waiRole=\"presentation\">\n\t\t\t\t<span dojoAttachPoint=\"decreaseArrowNode\" class=\"dijitA11ySideArrow\">-</span>\n\t\t\t</th>\n\t\t\t<th class='dijitReset' colspan=\"5\">\n\t\t\t\t<div class=\"dijitVisible\">\n\t\t\t\t\t<div class=\"dijitPopup dijitMenu dijitMenuPassive dijitHidden\" dojoAttachPoint=\"monthDropDown\" dojoAttachEvent=\"onmouseup: _onMonthSelect, onmouseover: _onMenuHover, onmouseout: _onMenuHover\">\n\t\t\t\t\t\t<div class=\"dijitCalendarMonthLabelTemplate dijitCalendarMonthLabel\"></div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div dojoAttachPoint=\"monthLabelSpacer\" class=\"dijitSpacer\"></div>\n\t\t\t\t<div dojoAttachPoint=\"monthLabelNode\" class=\"dijitCalendarMonthLabel dijitInline dijitVisible\" dojoAttachEvent=\"onmousedown: _onMonthToggle\"></div>\n\t\t\t</th>\n\t\t\t<th class='dijitReset' dojoAttachPoint=\"incrementMonth\">\n\t\t\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitCalendarIncrementControl dijitCalendarIncrease\" waiRole=\"presentation\">\n\t\t\t\t<span dojoAttachPoint=\"increaseArrowNode\" class=\"dijitA11ySideArrow\">+</span>\n\t\t\t</th>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<th class=\"dijitReset dijitCalendarDayLabelTemplate\" role=\"columnheader\"><span class=\"dijitCalendarDayLabel\"></span></th>\n\t\t</tr>\n\t</thead>\n\t<tbody dojoAttachEvent=\"onclick: _onDayClick, onmouseover: _onDayMouseOver, onmouseout: _onDayMouseOut\" class=\"dijitReset dijitCalendarBodyContainer\">\n\t\t<tr class=\"dijitReset dijitCalendarWeekTemplate\" role=\"row\">\n\t\t\t<td class=\"dijitReset dijitCalendarDateTemplate\" role=\"gridcell\"><span class=\"dijitCalendarDateLabel\"></span></td>\n\t\t</tr>\n\t</tbody>\n\t<tfoot class=\"dijitReset dijitCalendarYearContainer\">\n\t\t<tr>\n\t\t\t<td class='dijitReset' valign=\"top\" colspan=\"7\">\n\t\t\t\t<h3 class=\"dijitCalendarYearLabel\">\n\t\t\t\t\t<span dojoAttachPoint=\"previousYearLabelNode\" class=\"dijitInline dijitCalendarPreviousYear\"></span>\n\t\t\t\t\t<span dojoAttachPoint=\"currentYearLabelNode\" class=\"dijitInline dijitCalendarSelectedYear\"></span>\n\t\t\t\t\t<span dojoAttachPoint=\"nextYearLabelNode\" class=\"dijitInline dijitCalendarNextYear\"></span>\n\t\t\t\t</h3>\n\t\t\t</td>\n\t\t</tr>\n\t</tfoot>\n</table>\n"), value:new Date(), datePackage:"dojo.date", dayWidth:"narrow", tabIndex:"0", attributeMap:dojo.delegate(dijit._Widget.prototype.attributeMap, {tabIndex:"domNode"}), setValue:function (value) {
		dojo.deprecated("dijit.Calendar:setValue() is deprecated.  Use attr('value', ...) instead.", "", "2.0");
		this.attr("value", value);
	}, _getValueAttr:function () {
		var value = new this.dateClassObj(this.value);
		value.setHours(0, 0, 0, 0);
		if (value.getDate() < this.value.getDate()) {
			value = this.dateFuncObj.add(value, "hour", 1);
		}
		return value;
	}, _setValueAttr:function (value) {
		if (!this.value || this.dateFuncObj.compare(value, this.value)) {
			value = new this.dateClassObj(value);
			value.setHours(1);
			this.displayMonth = new this.dateClassObj(value);
			if (!this.isDisabledDate(value, this.lang)) {
				this.value = value;
				this.onChange(this.attr("value"));
			}
			dojo.attr(this.domNode, "aria-label", this.dateLocaleModule.format(value, {selector:"date", formatLength:"full"}));
			this._populateGrid();
		}
	}, _setText:function (node, text) {
		while (node.firstChild) {
			node.removeChild(node.firstChild);
		}
		node.appendChild(dojo.doc.createTextNode(text));
	}, _populateGrid:function () {
		var month = this.displayMonth;
		month.setDate(1);
		var firstDay = month.getDay(), daysInMonth = this.dateFuncObj.getDaysInMonth(month), daysInPreviousMonth = this.dateFuncObj.getDaysInMonth(this.dateFuncObj.add(month, "month", -1)), today = new this.dateClassObj(), dayOffset = dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
		if (dayOffset > firstDay) {
			dayOffset -= 7;
		}
		dojo.query(".dijitCalendarDateTemplate", this.domNode).forEach(function (template, i) {
			i += dayOffset;
			var date = new this.dateClassObj(month), number, clazz = "dijitCalendar", adj = 0;
			if (i < firstDay) {
				number = daysInPreviousMonth - firstDay + i + 1;
				adj = -1;
				clazz += "Previous";
			} else {
				if (i >= (firstDay + daysInMonth)) {
					number = i - firstDay - daysInMonth + 1;
					adj = 1;
					clazz += "Next";
				} else {
					number = i - firstDay + 1;
					clazz += "Current";
				}
			}
			if (adj) {
				date = this.dateFuncObj.add(date, "month", adj);
			}
			date.setDate(number);
			if (!this.dateFuncObj.compare(date, today, "date")) {
				clazz = "dijitCalendarCurrentDate " + clazz;
			}
			if (this._isSelectedDate(date, this.lang)) {
				clazz = "dijitCalendarSelectedDate " + clazz;
			}
			if (this.isDisabledDate(date, this.lang)) {
				clazz = "dijitCalendarDisabledDate " + clazz;
			}
			var clazz2 = this.getClassForDate(date, this.lang);
			if (clazz2) {
				clazz = clazz2 + " " + clazz;
			}
			template.className = clazz + "Month dijitCalendarDateTemplate";
			template.dijitDateValue = date.valueOf();
			var label = dojo.query(".dijitCalendarDateLabel", template)[0], text = date.getDateLocalized ? date.getDateLocalized(this.lang) : date.getDate();
			this._setText(label, text);
		}, this);
		var monthNames = this.dateLocaleModule.getNames("months", "wide", "standAlone", this.lang);
		this._setText(this.monthLabelNode, monthNames[month.getMonth()]);
		var y = month.getFullYear() - 1;
		var d = new this.dateClassObj();
		dojo.forEach(["previous", "current", "next"], function (name) {
			d.setFullYear(y++);
			this._setText(this[name + "YearLabelNode"], this.dateLocaleModule.format(d, {selector:"year", locale:this.lang}));
		}, this);
		var _this = this;
		var typematic = function (nodeProp, dateProp, adj) {
			_this._connects.push(dijit.typematic.addMouseListener(_this[nodeProp], _this, function (count) {
				if (count >= 0) {
					_this._adjustDisplay(dateProp, adj);
				}
			}, 0.8, 500));
		};
		typematic("incrementMonth", "month", 1);
		typematic("decrementMonth", "month", -1);
		typematic("nextYearLabelNode", "year", 1);
		typematic("previousYearLabelNode", "year", -1);
	}, goToToday:function () {
		this.attr("value", new this.dateClassObj());
	}, constructor:function (args) {
		var dateClass = (args.datePackage && (args.datePackage != "dojo.date")) ? args.datePackage + ".Date" : "Date";
		this.dateClassObj = dojo.getObject(dateClass, false);
		this.datePackage = args.datePackage || this.datePackage;
		this.dateFuncObj = dojo.getObject(this.datePackage, false);
		this.dateLocaleModule = dojo.getObject(this.datePackage + ".locale", false);
	}, postMixInProperties:function () {
		if (isNaN(this.value)) {
			delete this.value;
		}
		this.inherited(arguments);
	}, postCreate:function () {
		this.inherited(arguments);
		dojo.setSelectable(this.domNode, false);
		var cloneClass = dojo.hitch(this, function (clazz, n) {
			var template = dojo.query(clazz, this.domNode)[0];
			for (var i = 0; i < n; i++) {
				template.parentNode.appendChild(template.cloneNode(true));
			}
		});
		cloneClass(".dijitCalendarDayLabelTemplate", 6);
		cloneClass(".dijitCalendarDateTemplate", 6);
		cloneClass(".dijitCalendarWeekTemplate", 5);
		var dayNames = this.dateLocaleModule.getNames("days", this.dayWidth, "standAlone", this.lang);
		var dayOffset = dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
		dojo.query(".dijitCalendarDayLabel", this.domNode).forEach(function (label, i) {
			this._setText(label, dayNames[(i + dayOffset) % 7]);
		}, this);
		var monthNames = this.dateLocaleModule.getNames("months", "wide", "standAlone", this.lang);
		cloneClass(".dijitCalendarMonthLabelTemplate", monthNames.length - 1);
		dojo.query(".dijitCalendarMonthLabelTemplate", this.domNode).forEach(function (node, i) {
			dojo.attr(node, "month", i);
			this._setText(node, monthNames[i]);
			dojo.place(node.cloneNode(true), this.monthLabelSpacer);
		}, this);
		var value = this.value;
		this.value = null;
		this.attr("value", new this.dateClassObj(value));
	}, _onMenuHover:function (e) {
		dojo.stopEvent(e);
		dojo.toggleClass(e.target, "dijitMenuItemHover");
	}, _adjustDisplay:function (part, amount) {
		this.displayMonth = this.dateFuncObj.add(this.displayMonth, part, amount);
		this._populateGrid();
	}, _onMonthToggle:function (evt) {
		dojo.stopEvent(evt);
		if (evt.type == "mousedown") {
			var coords = dojo.position(this.monthLabelNode);
			var dim = {width:coords.w + "px", top:-this.displayMonth.getMonth() * coords.h + "px"};
			if ((dojo.isIE && dojo.isQuirks) || dojo.isIE < 7) {
				dim.left = -coords.w / 2 + "px";
			}
			dojo.style(this.monthDropDown, dim);
			this._popupHandler = this.connect(document, "onmouseup", "_onMonthToggle");
		} else {
			this.disconnect(this._popupHandler);
			delete this._popupHandler;
		}
		dojo.toggleClass(this.monthDropDown, "dijitHidden");
		dojo.toggleClass(this.monthLabelNode, "dijitVisible");
	}, _onMonthSelect:function (evt) {
		this._onMonthToggle(evt);
		this.displayMonth.setMonth(dojo.attr(evt.target, "month"));
		this._populateGrid();
	}, _onDayClick:function (evt) {
		dojo.stopEvent(evt);
		for (var node = evt.target; node && !node.dijitDateValue; node = node.parentNode) {
		}
		if (node && !dojo.hasClass(node, "dijitCalendarDisabledDate")) {
			this.attr("value", node.dijitDateValue);
			this.onValueSelected(this.attr("value"));
		}
	}, _onDayMouseOver:function (evt) {
		var node = evt.target;
		if (node && (node.dijitDateValue || node == this.previousYearLabelNode || node == this.nextYearLabelNode)) {
			dojo.addClass(node, "dijitCalendarHoveredDate");
			this._currentNode = node;
		}
	}, _onDayMouseOut:function (evt) {
		if (!this._currentNode) {
			return;
		}
		for (var node = evt.relatedTarget; node; ) {
			if (node == this._currentNode) {
				return;
			}
			try {
				node = node.parentNode;
			}
			catch (x) {
				node = null;
			}
		}
		dojo.removeClass(this._currentNode, "dijitCalendarHoveredDate");
		this._currentNode = null;
	}, _onKeyPress:function (evt) {
		var dk = dojo.keys, increment = -1, interval, newValue = this.value;
		switch (evt.keyCode) {
		  case dk.RIGHT_ARROW:
			increment = 1;
		  case dk.LEFT_ARROW:
			interval = "day";
			if (!this.isLeftToRight()) {
				increment *= -1;
			}
			break;
		  case dk.DOWN_ARROW:
			increment = 1;
		  case dk.UP_ARROW:
			interval = "week";
			break;
		  case dk.PAGE_DOWN:
			increment = 1;
		  case dk.PAGE_UP:
			interval = evt.ctrlKey ? "year" : "month";
			break;
		  case dk.END:
			newValue = this.dateFuncObj.add(newValue, "month", 1);
			interval = "day";
		  case dk.HOME:
			newValue = new Date(newValue).setDate(1);
			break;
		  case dk.ENTER:
			this.onValueSelected(this.attr("value"));
			break;
		  case dk.ESCAPE:
		  default:
			return;
		}
		dojo.stopEvent(evt);
		if (interval) {
			newValue = this.dateFuncObj.add(newValue, interval, increment);
		}
		this.attr("value", newValue);
	}, onValueSelected:function (date) {
	}, onChange:function (date) {
	}, _isSelectedDate:function (dateObject, locale) {
		return !this.dateFuncObj.compare(dateObject, this.value, "date");
	}, isDisabledDate:function (dateObject, locale) {
	}, getClassForDate:function (dateObject, locale) {
	}});
}

