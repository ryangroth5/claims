/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._editor.plugins.FontChoice"]) {
	dojo._hasResource["dijit._editor.plugins.FontChoice"] = true;
	dojo.provide("dijit._editor.plugins.FontChoice");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dijit._editor.range");
	dojo.require("dijit.form.FilteringSelect");
	dojo.require("dojo.data.ItemFileReadStore");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dijit._editor", "FontChoice", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,ko,nb,nl,pl,pt,pt-pt,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dijit._editor.plugins._FontDropDown", [dijit._Widget, dijit._Templated], {label:"", widgetsInTemplate:true, plainText:false, templateString:"<span style='white-space: nowrap' class='dijit dijitReset dijitInline'>" + "<label class='dijitLeft dijitInline' for='${selectId}'>${label}</label>" + "<input dojoType='dijit.form.FilteringSelect' required=false labelType=html labelAttr=label searchAttr=name " + "tabIndex='-1' id='${selectId}' dojoAttachPoint='select' value=''/>" + "</span>", postMixInProperties:function () {
		this.inherited(arguments);
		this.strings = dojo.i18n.getLocalization("dijit._editor", "FontChoice");
		this.label = this.strings[this.command];
		this.id = dijit.getUniqueId(this.declaredClass.replace(/\./g, "_"));
		this.selectId = this.id + "_select";
		this.inherited(arguments);
	}, postCreate:function () {
		var items = dojo.map(this.values, function (value) {
			var name = this.strings[value] || value;
			return {label:this.getLabel(value, name), name:name, value:value};
		}, this);
		this.select.store = new dojo.data.ItemFileReadStore({data:{identifier:"value", items:items}});
		this.select.attr("value", "", false);
		this.disabled = this.select.attr("disabled");
	}, _setValueAttr:function (value, priorityChange) {
		priorityChange = priorityChange !== false ? true : false;
		this.select.attr("value", dojo.indexOf(this.values, value) < 0 ? "" : value, priorityChange);
		if (!priorityChange) {
			this.select._lastValueReported = null;
		}
	}, _getValueAttr:function () {
		return this.select.attr("value");
	}, focus:function () {
		this.select.focus();
	}, _setDisabledAttr:function (value) {
		this.disabled = value;
		this.select.attr("disabled", value);
	}});
	dojo.declare("dijit._editor.plugins._FontNameDropDown", dijit._editor.plugins._FontDropDown, {generic:false, command:"fontName", postMixInProperties:function () {
		if (!this.values) {
			this.values = this.generic ? ["serif", "sans-serif", "monospace", "cursive", "fantasy"] : ["Arial", "Times New Roman", "Comic Sans MS", "Courier New"];
		}
		this.inherited(arguments);
	}, getLabel:function (value, name) {
		if (this.plainText) {
			return name;
		} else {
			return "<div style='font-family: " + value + "'>" + name + "</div>";
		}
	}, _setValueAttr:function (value, priorityChange) {
		priorityChange = priorityChange !== false ? true : false;
		if (this.generic) {
			var map = {"Arial":"sans-serif", "Helvetica":"sans-serif", "Myriad":"sans-serif", "Times":"serif", "Times New Roman":"serif", "Comic Sans MS":"cursive", "Apple Chancery":"cursive", "Courier":"monospace", "Courier New":"monospace", "Papyrus":"fantasy"};
			value = map[value] || value;
		}
		this.inherited(arguments, [value, priorityChange]);
	}});
	dojo.declare("dijit._editor.plugins._FontSizeDropDown", dijit._editor.plugins._FontDropDown, {command:"fontSize", values:[1, 2, 3, 4, 5, 6, 7], getLabel:function (value, name) {
		if (this.plainText) {
			return name;
		} else {
			return "<font size=" + value + "'>" + name + "</font>";
		}
	}, _setValueAttr:function (value, priorityChange) {
		priorityChange = priorityChange !== false ? true : false;
		if (value.indexOf && value.indexOf("px") != -1) {
			var pixels = parseInt(value, 10);
			value = {10:1, 13:2, 16:3, 18:4, 24:5, 32:6, 48:7}[pixels] || value;
		}
		this.inherited(arguments, [value, priorityChange]);
	}});
	dojo.declare("dijit._editor.plugins._FormatBlockDropDown", dijit._editor.plugins._FontDropDown, {command:"formatBlock", values:["p", "h1", "h2", "h3", "pre"], getLabel:function (value, name) {
		if (this.plainText) {
			return name;
		} else {
			return "<" + value + ">" + name + "</" + value + ">";
		}
	}});
	dojo.declare("dijit._editor.plugins.FontChoice", dijit._editor._Plugin, {useDefaultCommand:false, _initButton:function () {
		var clazz = {fontName:dijit._editor.plugins._FontNameDropDown, fontSize:dijit._editor.plugins._FontSizeDropDown, formatBlock:dijit._editor.plugins._FormatBlockDropDown}[this.command], params = this.params;
		if (this.params.custom) {
			params.values = this.params.custom;
		}
		this.button = new clazz(params);
		this.connect(this.button.select, "onChange", function (choice) {
			this.editor.focus();
			if (this.command == "fontName" && choice.indexOf(" ") != -1) {
				choice = "'" + choice + "'";
			}
			this.editor.execCommand(this.command, choice);
		});
	}, updateState:function () {
		var _e = this.editor;
		var _c = this.command;
		if (!_e || !_e.isLoaded || !_c.length) {
			return;
		}
		if (this.button) {
			var value;
			try {
				value = _e.queryCommandValue(_c) || "";
			}
			catch (e) {
				value = "";
			}
			var quoted = dojo.isString(value) && value.match(/'([^']*)'/);
			if (quoted) {
				value = quoted[1];
			}
			if (!value && _c === "formatBlock") {
				var elem;
				var sel = dijit.range.getSelection(this.editor.window);
				if (sel && sel.rangeCount > 0) {
					var range = sel.getRangeAt(0);
					if (range) {
						elem = range.endContainer;
					}
				}
				while (elem && elem !== _e.editNode && elem !== _e.document) {
					var tg = elem.tagName ? elem.tagName.toLowerCase() : "";
					if (tg && dojo.indexOf(this.button.values, tg) > -1) {
						value = tg;
						break;
					}
					elem = elem.parentNode;
				}
			}
			if (value !== this.button.attr("value")) {
				this.button.attr("value", value, false);
			}
		}
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		switch (o.args.name) {
		  case "fontName":
		  case "fontSize":
		  case "formatBlock":
			o.plugin = new dijit._editor.plugins.FontChoice({command:o.args.name, plainText:o.args.plainText ? o.args.plainText : false});
		}
	});
}

