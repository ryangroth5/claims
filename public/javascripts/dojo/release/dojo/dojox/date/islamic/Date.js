/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.date.islamic.Date"]) {
	dojo._hasResource["dojox.date.islamic.Date"] = true;
	dojo.provide("dojox.date.islamic.Date");
	dojo.experimental("dojox.date.islamic.Date");
	dojo.require("dojo.date");
	dojo.requireLocalization("dojo.cldr", "islamic", null, "ROOT,ar,he");
	dojo.declare("dojox.date.islamic.Date", null, {_date:0, _month:0, _year:0, _hours:0, _minutes:0, _seconds:0, _milliseconds:0, _day:0, _GREGORIAN_EPOCH:1721425.5, _ISLAMIC_EPOCH:1948439.5, constructor:function () {
		var len = arguments.length;
		if (!len) {
			this.fromGregorian(new Date());
		} else {
			if (len == 1) {
				var arg0 = arguments[0];
				if (typeof arg0 == "number") {
					arg0 = new Date(arg0);
				}
				if (arg0 instanceof Date) {
					this.fromGregorian(arg0);
				} else {
					if (arg0 == "") {
						this._date = new Date("");
					} else {
						this._year = arg0._year;
						this._month = arg0._month;
						this._date = arg0._date;
						this._hours = arg0._hours;
						this._minutes = arg0._minutes;
						this._seconds = arg0._seconds;
						this._milliseconds = arg0._milliseconds;
					}
				}
			} else {
				if (len >= 3) {
					this._year += arguments[0];
					this._month += arguments[1];
					this._date += arguments[2];
					this._hours += arguments[3] || 0;
					this._minutes += arguments[4] || 0;
					this._seconds += arguments[5] || 0;
					this._milliseconds += arguments[6] || 0;
				}
			}
		}
	}, getDate:function () {
		return this._date;
	}, getMonth:function () {
		return this._month;
	}, getFullYear:function () {
		return this._year;
	}, getDay:function () {
		return this.toGregorian().getDay();
	}, getHours:function () {
		return this._hours;
	}, getMinutes:function () {
		return this._minutes;
	}, getSeconds:function () {
		return this._seconds;
	}, getMilliseconds:function () {
		return this._milliseconds;
	}, setDate:function (date) {
		date = parseInt(date);
		if (date > 0 && date <= this.getDaysInIslamicMonth(this._month, this._year)) {
			this._date = date;
		} else {
			var mdays;
			if (date > 0) {
				for (mdays = this.getDaysInIslamicMonth(this._month, this._year); date > mdays; date -= mdays, mdays = this.getDaysInIslamicMonth(this._month, this._year)) {
					this._month++;
					if (this._month >= 12) {
						this._year++;
						this._month -= 12;
					}
				}
				this._date = date;
			} else {
				for (mdays = this.getDaysInIslamicMonth((this._month - 1) >= 0 ? (this._month - 1) : 11, ((this._month - 1) >= 0) ? this._year : this._year - 1); date <= 0; mdays = this.getDaysInIslamicMonth((this._month - 1) >= 0 ? (this._month - 1) : 11, ((this._month - 1) >= 0) ? this._year : this._year - 1)) {
					this._month--;
					if (this._month < 0) {
						this._year--;
						this._month += 12;
					}
					date += mdays;
				}
				this._date = date;
			}
		}
		return this;
	}, setFullYear:function (year) {
		this._year = +year;
	}, setMonth:function (month) {
		this._year += Math.floor(month / 12);
		this._month = Math.floor(month % 12);
	}, setHours:function () {
		var hours_arg_no = arguments.length;
		var hours = 0;
		if (hours_arg_no >= 1) {
			hours = parseInt(arguments[0]);
		}
		if (hours_arg_no >= 2) {
			this._minutes = parseInt(arguments[1]);
		}
		if (hours_arg_no >= 3) {
			this._seconds = parseInt(arguments[2]);
		}
		if (hours_arg_no == 4) {
			this._milliseconds = parseInt(arguments[3]);
		}
		while (hours >= 24) {
			this._date++;
			var mdays = this.getDaysInIslamicMonth(this._month, this._year);
			if (this._date > mdays) {
				this._month++;
				if (this._month >= 12) {
					this._year++;
					this._month -= 12;
				}
				this._date -= mdays;
			}
			hours -= 24;
		}
		this._hours = hours;
	}, setMinutes:function (minutes) {
		while (minutes >= 60) {
			this._hours++;
			if (this._hours >= 24) {
				this._date++;
				this._hours -= 24;
				var mdays = this.getDaysInIslamicMonth(this._month, this._year);
				if (this._date > mdays) {
					this._month++;
					if (this._month >= 12) {
						this._year++;
						this._month -= 12;
					}
					this._date -= mdays;
				}
			}
			minutes -= 60;
		}
		this._minutes = minutes;
	}, setSeconds:function (seconds) {
		while (seconds >= 60) {
			this._minutes++;
			if (this._minutes >= 60) {
				this._hours++;
				this._minutes -= 60;
				if (this._hours >= 24) {
					this._date++;
					this._hours -= 24;
					var mdays = this.getDaysInIslamicMonth(this._month, this._year);
					if (this._date > mdays) {
						this._month++;
						if (this._month >= 12) {
							this._year++;
							this._month -= 12;
						}
						this._date -= mdays;
					}
				}
			}
			seconds -= 60;
		}
		this._seconds = seconds;
	}, setMilliseconds:function (milliseconds) {
		while (milliseconds >= 1000) {
			this.setSeconds++;
			if (this.setSeconds >= 60) {
				this._minutes++;
				this.setSeconds -= 60;
				if (this._minutes >= 60) {
					this._hours++;
					this._minutes -= 60;
					if (this._hours >= 24) {
						this._date++;
						this._hours -= 24;
						var mdays = this.getDaysInIslamicMonth(this._month, this._year);
						if (this._date > mdays) {
							this._month++;
							if (this._month >= 12) {
								this._year++;
								this._month -= 12;
							}
							this._date -= mdays;
						}
					}
				}
			}
			milliseconds -= 1000;
		}
		this._milliseconds = milliseconds;
	}, toString:function () {
		var x = new Date();
		x.setHours(this._hours);
		x.setMinutes(this._minutes);
		x.setSeconds(this._seconds);
		x.setMilliseconds(this._milliseconds);
		return (this._month + " " + this._date + " " + this._year + " " + x.toTimeString());
	}, toGregorian:function () {
		var hYear = this._year;
		var hMonth = this._month;
		var hDate = this._date;
		var julianDay = hDate + Math.ceil(29.5 * hMonth) + (hYear - 1) * 354 + Math.floor((3 + (11 * hYear)) / 30) + this._ISLAMIC_EPOCH - 1;
		var wjd = Math.floor(julianDay - 0.5) + 0.5, depoch = wjd - this._GREGORIAN_EPOCH, quadricent = Math.floor(depoch / 146097), dqc = this._mod(depoch, 146097), cent = Math.floor(dqc / 36524), dcent = this._mod(dqc, 36524), quad = Math.floor(dcent / 1461), dquad = this._mod(dcent, 1461), yindex = Math.floor(dquad / 365), year = (quadricent * 400) + (cent * 100) + (quad * 4) + yindex;
		if (!(cent == 4 || yindex == 4)) {
			year++;
		}
		var gYearStart = this._GREGORIAN_EPOCH + (365 * (year - 1)) + Math.floor((year - 1) / 4) - (Math.floor((year - 1) / 100)) + Math.floor((year - 1) / 400);
		var yearday = wjd - gYearStart;
		var tjd = (this._GREGORIAN_EPOCH - 1) + (365 * (year - 1)) + Math.floor((year - 1) / 4) - (Math.floor((year - 1) / 100)) + Math.floor((year - 1) / 400) + Math.floor((739 / 12) + ((dojo.date.isLeapYear(new Date(year, 3, 1)) ? -1 : -2)) + 1);
		var leapadj = ((wjd < tjd) ? 0 : (dojo.date.isLeapYear(new Date(year, 3, 1)) ? 1 : 2));
		var month = Math.floor((((yearday + leapadj) * 12) + 373) / 367);
		var tjd2 = (this._GREGORIAN_EPOCH - 1) + (365 * (year - 1)) + Math.floor((year - 1) / 4) - (Math.floor((year - 1) / 100)) + Math.floor((year - 1) / 400) + Math.floor((((367 * month) - 362) / 12) + ((month <= 2) ? 0 : (dojo.date.isLeapYear(new Date(year, month, 1)) ? -1 : -2)) + 1);
		var day = (wjd - tjd2);
		var gdate = new Date(year, month - 1, day);
		gdate.setHours(this._hours);
		gdate.setMilliseconds(this._milliseconds);
		gdate.setMinutes(this._minutes);
		gdate.setSeconds(this._seconds);
		return gdate;
	}, fromGregorian:function (gdate) {
		var date = new Date(gdate);
		var gYear = date.getFullYear(), gMonth = date.getMonth(), gDay = date.getDate();
		var julianDay = (this._GREGORIAN_EPOCH - 1) + (365 * (gYear - 1)) + Math.floor((gYear - 1) / 4) + (-Math.floor((gYear - 1) / 100)) + Math.floor((gYear - 1) / 400) + Math.floor((((367 * (gMonth + 1)) - 362) / 12) + (((gMonth + 1) <= 2) ? 0 : (dojo.date.isLeapYear(date) ? -1 : -2)) + gDay) + (Math.floor(date.getSeconds() + 60 * (date.getMinutes() + 60 * date.getHours()) + 0.5) / 86400);
		julianDay = Math.floor(julianDay) + 0.5;
		var days = julianDay - 1948440;
		var hYear = Math.floor((30 * days + 10646) / 10631);
		var hMonth = Math.ceil((days - 29 - this._yearStart(hYear)) / 29.5);
		hMonth = Math.min(hMonth, 11);
		var hDay = Math.ceil(days - this._monthStart(hYear, hMonth)) + 1;
		this._date = hDay;
		this._month = hMonth;
		this._year = hYear;
		this._hours = date.getHours();
		this._minutes = date.getMinutes();
		this._seconds = date.getSeconds();
		this._milliseconds = date.getMilliseconds();
		this._day = date.getDay();
		return this;
	}, valueOf:function () {
		return this.toGregorian().valueOf();
	}, _yearStart:function (year) {
		return (year - 1) * 354 + Math.floor((3 + 11 * year) / 30);
	}, _monthStart:function (year, month) {
		return Math.ceil(29.5 * month) + (year - 1) * 354 + Math.floor((3 + 11 * year) / 30);
	}, _civilLeapYear:function (year) {
		return (14 + 11 * year) % 30 < 11;
	}, getDaysInIslamicMonth:function (month, year) {
		var length = 0;
		length = 29 + ((month + 1) % 2);
		if (month == 11 && this._civilLeapYear(year)) {
			length++;
		}
		return length;
	}, _mod:function (a, b) {
		return a - (b * Math.floor(a / b));
	}});
	dojox.date.islamic.Date.getDaysInIslamicMonth = function (month) {
		return new dojox.date.islamic.Date().getDaysInIslamicMonth(month.getMonth(), month.getFullYear());
	};
}

