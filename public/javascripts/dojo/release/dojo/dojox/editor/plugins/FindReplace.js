/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.editor.plugins.FindReplace"]) {
	dojo._hasResource["dojox.editor.plugins.FindReplace"] = true;
	dojo.provide("dojox.editor.plugins.FindReplace");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dijit.Toolbar");
	dojo.require("dijit.form.TextBox");
	dojo.require("dijit.form.CheckBox");
	dojo.require("dijit.form.Button");
	dojo.require("dijit.TooltipDialog");
	dojo.require("dijit.Menu");
	dojo.require("dijit.CheckedMenuItem");
	dojo.require("dojox.editor.plugins.ToolbarLineBreak");
	dojo.require("dojo.i18n");
	dojo.require("dojo.string");
	dojo.requireLocalization("dojox.editor.plugins", "FindReplace", null, "ROOT,cs,de,es,fr,hu,it,ja,ko,pl,pt,ru,zh,zh-tw");
	dojo.experimental("dojox.editor.plugins.FindReplace");
	dojo.declare("dojox.editor.plugins._FindReplaceTextBox", [dijit._Widget, dijit._Templated], {textId:"", label:"", widget:null, widgetsInTemplate:true, templateString:"<span style='white-space: nowrap' class='dijit dijitReset dijitInline findReplaceTextBox'>" + "<label class='dijitLeft dijitInline' for='${textId}'>${label}</label>" + "<input dojoType='dijit.form.TextBox' required=false intermediateChanges='true'" + "tabIndex='-1' id='${textId}' dojoAttachPoint='textBox' value='' style='width: 20em;'/>" + "</span>", postMixInProperties:function () {
		this.inherited(arguments);
		this.id = dijit.getUniqueId(this.declaredClass.replace(/\./g, "_"));
		this.textId = this.id + "_text";
		this.inherited(arguments);
	}, postCreate:function () {
		this.textBox.attr("value", "");
		this.disabled = this.textBox.attr("disabled");
		this.connect(this.textBox, "onChange", "onChange");
	}, _setValueAttr:function (value) {
		this.value = value;
		this.textBox.attr("value", value);
	}, focus:function () {
		this.textBox.focus();
	}, _setDisabledAttr:function (value) {
		this.disabled = value;
		this.textBox.attr("disabled", value);
	}, onChange:function (val) {
		this.value = val;
	}});
	dojo.declare("dojox.editor.plugins._FindReplaceCheckBox", [dijit._Widget, dijit._Templated], {checkId:"", label:"", widget:null, widgetsInTemplate:true, templateString:"<span style='white-space: nowrap' class='dijit dijitReset dijitInline findReplaceCheckBox'>" + "<input dojoType='dijit.form.CheckBox' required=false " + "tabIndex='-1' id='${checkId}' dojoAttachPoint='checkBox' value=''/>" + "<label class='dijitLeft dijitInline' for='${checkId}'>${label}</label>" + "</span>", postMixInProperties:function () {
		this.inherited(arguments);
		this.id = dijit.getUniqueId(this.declaredClass.replace(/\./g, "_"));
		this.checkId = this.id + "_check";
		this.inherited(arguments);
	}, postCreate:function () {
		this.checkBox.attr("checked", false);
		this.disabled = this.checkBox.attr("disabled");
		this.checkBox.isFocusable = function () {
			return false;
		};
	}, _setValueAttr:function (value) {
		this.checkBox.attr("value", value);
	}, _getValueAttr:function () {
		return this.checkBox.attr("value");
	}, focus:function () {
		this.checkBox.focus();
	}, _setDisabledAttr:function (value) {
		this.disabled = value;
		this.checkBox.attr("disabled", value);
	}});
	dojo.declare("dojox.editor.plugins.FindReplace", [dijit._editor._Plugin], {buttonClass:dijit.form.ToggleButton, iconClassPrefix:"dijitAdditionalEditorIcon", _initButton:function () {
		var strings = dojo.i18n.getLocalization("dojox.editor.plugins", "FindReplace");
		this.button = new dijit.form.ToggleButton({label:strings["findReplace"], showLabel:false, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "FindReplace", tabIndex:"-1", onChange:dojo.hitch(this, "_toggleFindReplace")});
		if (dojo.isOpera) {
			this.button.attr("disabled", true);
		}
		this.connect(this.button, "attr", dojo.hitch(this, function (attr, val) {
			if (attr === "disabled") {
				this._toggleFindReplace((!val && this._displayed), true);
			}
		}));
	}, setEditor:function (editor) {
		this.editor = editor;
		this._initButton();
	}, toggle:function () {
		this.button.attr("checked", !this.button.attr("checked"));
	}, _toggleFindReplace:function (show, ignoreState) {
		if (show && !dojo.isOpera) {
			dojo.style(this._frToolbar.domNode, "display", "block");
			if (!ignoreState) {
				this._displayed = true;
			}
		} else {
			dojo.style(this._frToolbar.domNode, "display", "none");
			if (!ignoreState) {
				this._displayed = false;
			}
		}
		this.editor.resize();
	}, setToolbar:function (toolbar) {
		this.inherited(arguments);
		if (!dojo.isOpera) {
			var strings = dojo.i18n.getLocalization("dojox.editor.plugins", "FindReplace");
			this._frToolbar = new dijit.Toolbar();
			dojo.style(this._frToolbar.domNode, "display", "none");
			dojo.place(this._frToolbar.domNode, toolbar.domNode, "after");
			this._frToolbar.startup();
			this._caseSensitive = new dojox.editor.plugins._FindReplaceCheckBox({label:strings["matchCase"]});
			this._backwards = new dojox.editor.plugins._FindReplaceCheckBox({label:strings["backwards"]});
			this._replaceAll = new dojox.editor.plugins._FindReplaceCheckBox({label:strings["replaceAll"]});
			this._findField = new dojox.editor.plugins._FindReplaceTextBox({label:strings.findLabel});
			this._frToolbar.addChild(this._findField);
			this._findButton = new dijit.form.Button({label:strings["findButton"], showLabel:true, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "FindRun"});
			this._frToolbar.addChild(this._findButton);
			this._frToolbar.addChild(this._caseSensitive);
			this._frToolbar.addChild(this._backwards);
			this._frToolbar.addChild(new dojox.editor.plugins._ToolbarLineBreak());
			this._replaceField = new dojox.editor.plugins._FindReplaceTextBox({label:strings.replaceLabel});
			this._frToolbar.addChild(this._replaceField);
			this._replaceButton = new dijit.form.Button({label:strings["replaceButton"], showLabel:true, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "ReplaceRun"});
			this._frToolbar.addChild(this._replaceButton);
			this._frToolbar.addChild(this._replaceAll);
			this._findButton.attr("disabled", true);
			this._replaceButton.attr("disabled", true);
			this.connect(this._findField, "onChange", "_checkButtons");
			this.connect(this._replaceField, "onChange", "_checkButtons");
			this.connect(this._findButton, "onClick", "_find");
			this.connect(this._replaceButton, "onClick", "_replace");
			this._replDialog = new dijit.TooltipDialog();
			this._replDialog.startup();
			this._replDialog.attr("content", "");
			this._dialogTemplate = strings.replaceDialogText;
		}
	}, _checkButtons:function () {
		var fText = this._findField.attr("value");
		var rText = this._replaceField.attr("value");
		if (fText) {
			this._findButton.attr("disabled", false);
		} else {
			this._findButton.attr("disabled", true);
		}
		if (fText && rText && fText !== rText) {
			this._replaceButton.attr("disabled", false);
		} else {
			this._replaceButton.attr("disabled", true);
		}
	}, _find:function () {
		var txt = this._findField.attr("value");
		if (txt) {
			var caseSensitive = this._caseSensitive.attr("value");
			var backwards = this._backwards.attr("value");
			return this._findText(txt, caseSensitive, backwards);
		}
		return false;
	}, _replace:function () {
		var ed = this.editor;
		ed.focus();
		var txt = this._findField.attr("value");
		var repTxt = this._replaceField.attr("value");
		var replaced = 0;
		if (txt) {
			if (this._replaceDialogTimeout) {
				clearTimeout(this._replaceDialogTimeout);
				this._replaceDialogTimeout = null;
				dijit.popup.close(this._replDialog);
			}
			var replaceAll = this._replaceAll.attr("value");
			var caseSensitive = this._caseSensitive.attr("value");
			var backwards = this._backwards.attr("value");
			var selected = dojo.withGlobal(ed.window, "getSelectedText", dijit._editor.selection, [null]);
			if (dojo.isMoz) {
				txt = dojo.trim(txt);
				selected = dojo.trim(selected);
			}
			var regExp = this._filterRegexp(txt, !caseSensitive);
			if (selected && regExp.test(selected)) {
				ed.execCommand("inserthtml", repTxt);
				replaced++;
			}
			if (replaceAll) {
				var found = this._findText(txt, caseSensitive, backwards);
				var loopFind = function () {
					ed.execCommand("inserthtml", repTxt);
					replaced++;
					found = this._findText(txt, caseSensitive, backwards);
					if (found) {
						setTimeout(dojo.hitch(this, loopFind), 10);
					} else {
						this._replDialog.attr("content", dojo.string.substitute(this._dialogTemplate, {"0":"" + replaced}));
						dijit.popup.open({popup:this._replDialog, around:this._replaceButton.domNode});
						this._replaceDialogTimeout = setTimeout(dojo.hitch(this, function () {
							clearTimeout(this._replaceDialogTimeout);
							this._replaceDialogTimeout = null;
							dijit.popup.close(this._replDialog);
						}), 5000);
					}
				};
				if (found) {
					var newF = dojo.hitch(this, loopFind);
					newF();
				}
			}
		}
	}, _findText:function (txt, caseSensitive, backwards) {
		var ed = this.editor;
		var win = ed.window;
		var found = false;
		if (txt) {
			if (win.find) {
				found = win.find(txt, caseSensitive, backwards, false, false, false, false);
			} else {
				var doc = ed.document;
				if (doc.selection) {
					this.editor.focus();
					var txtRg = doc.body.createTextRange();
					var curPos = doc.selection ? doc.selection.createRange() : null;
					if (curPos) {
						if (backwards) {
							txtRg.setEndPoint("EndToStart", curPos);
						} else {
							txtRg.setEndPoint("StartToEnd", curPos);
						}
					}
					var flags = caseSensitive ? 4 : 0;
					if (backwards) {
						flags = flags | 1;
					}
					found = txtRg.findText(txt, null, flags);
					if (found) {
						txtRg.select();
					}
				}
			}
		}
		return found;
	}, _filterRegexp:function (pattern, ignoreCase) {
		var rxp = "";
		var c = null;
		for (var i = 0; i < pattern.length; i++) {
			c = pattern.charAt(i);
			switch (c) {
			  case "\\":
				rxp += c;
				i++;
				rxp += pattern.charAt(i);
				break;
			  case "$":
			  case "^":
			  case "/":
			  case "+":
			  case ".":
			  case "|":
			  case "(":
			  case ")":
			  case "{":
			  case "}":
			  case "[":
			  case "]":
				rxp += "\\";
			  default:
				rxp += c;
			}
		}
		rxp = "^" + rxp + "$";
		if (ignoreCase) {
			return new RegExp(rxp, "mi");
		} else {
			return new RegExp(rxp, "m");
		}
	}, destroy:function () {
		this.inherited(arguments);
		if (this._replaceDialogTimeout) {
			clearTimeout(this._replaceDialogTimeout);
			this._replaceDialogTimeout = null;
			dijit.popup.close(this._replDialog);
		}
		if (this._frToolbar) {
			this._frToolbar.destroyRecursive();
			this._frToolbar = null;
		}
		if (this._replDialog) {
			this._replDialog.destroyRecursive();
			this._replDialog = null;
		}
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		var name = o.args.name.toLowerCase();
		if (name === "findreplace") {
			o.plugin = new dojox.editor.plugins.FindReplace({});
		}
	});
}

