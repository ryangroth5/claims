/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._editor.RichText"]) {
	dojo._hasResource["dijit._editor.RichText"] = true;
	dojo.provide("dijit._editor.RichText");
	dojo.require("dijit._Widget");
	dojo.require("dijit._editor.selection");
	dojo.require("dijit._editor.range");
	dojo.require("dijit._editor.html");
	if (!dojo.config["useXDomain"] || dojo.config["allowXdRichTextSave"]) {
		if (dojo._postLoad) {
			(function () {
				var savetextarea = dojo.doc.createElement("textarea");
				savetextarea.id = dijit._scopeName + "._editor.RichText.savedContent";
				dojo.style(savetextarea, {display:"none", position:"absolute", top:"-100px", height:"3px", width:"3px"});
				dojo.body().appendChild(savetextarea);
			})();
		} else {
			try {
				dojo.doc.write("<textarea id=\"" + dijit._scopeName + "._editor.RichText.savedContent\" " + "style=\"display:none;position:absolute;top:-100px;left:-100px;height:3px;width:3px;overflow:hidden;\"></textarea>");
			}
			catch (e) {
			}
		}
	}
	dojo.declare("dijit._editor.RichText", dijit._Widget, {constructor:function (params) {
		this.contentPreFilters = [];
		this.contentPostFilters = [];
		this.contentDomPreFilters = [];
		this.contentDomPostFilters = [];
		this.editingAreaStyleSheets = [];
		this.events = [].concat(this.events);
		this._keyHandlers = {};
		this.contentPreFilters.push(dojo.hitch(this, "_preFixUrlAttributes"));
		if (dojo.isMoz) {
			this.contentPreFilters.push(this._normalizeFontStyle);
			this.contentPostFilters.push(this._removeMozBogus);
		}
		if (dojo.isWebKit) {
			this.contentPreFilters.push(this._removeWebkitBogus);
			this.contentPostFilters.push(this._removeWebkitBogus);
		}
		if (dojo.isIE) {
			this.contentPostFilters.push(this._normalizeFontStyle);
		}
		this.onLoadDeferred = new dojo.Deferred();
	}, inheritWidth:false, focusOnLoad:false, name:"", styleSheets:"", _content:"", height:"300px", minHeight:"1em", isClosed:true, isLoaded:false, _SEPARATOR:"@@**%%__RICHTEXTBOUNDRY__%%**@@", onLoadDeferred:null, isTabIndent:false, disableSpellCheck:false, postCreate:function () {
		if ("textarea" == this.domNode.tagName.toLowerCase()) {
			console.warn("RichText should not be used with the TEXTAREA tag.  See dijit._editor.RichText docs.");
		}
		dojo.publish(dijit._scopeName + "._editor.RichText::init", [this]);
		this.open();
		this.setupDefaultShortcuts();
	}, setupDefaultShortcuts:function () {
		var exec = dojo.hitch(this, function (cmd, arg) {
			return function () {
				return !this.execCommand(cmd, arg);
			};
		});
		var ctrlKeyHandlers = {b:exec("bold"), i:exec("italic"), u:exec("underline"), a:exec("selectall"), s:function () {
			this.save(true);
		}, m:function () {
			this.isTabIndent = !this.isTabIndent;
		}, "1":exec("formatblock", "h1"), "2":exec("formatblock", "h2"), "3":exec("formatblock", "h3"), "4":exec("formatblock", "h4"), "\\":exec("insertunorderedlist")};
		if (!dojo.isIE) {
			ctrlKeyHandlers.Z = exec("redo");
		}
		for (var key in ctrlKeyHandlers) {
			this.addKeyHandler(key, true, false, ctrlKeyHandlers[key]);
		}
	}, events:["onKeyPress", "onKeyDown", "onKeyUp", "onClick"], captureEvents:[], _editorCommandsLocalized:false, _localizeEditorCommands:function () {
		if (this._editorCommandsLocalized) {
			return;
		}
		this._editorCommandsLocalized = true;
		var formats = ["div", "p", "pre", "h1", "h2", "h3", "h4", "h5", "h6", "ol", "ul", "address"];
		var localhtml = "", format, i = 0;
		while ((format = formats[i++])) {
			if (format.charAt(1) != "l") {
				localhtml += "<" + format + "><span>content</span></" + format + "><br/>";
			} else {
				localhtml += "<" + format + "><li>content</li></" + format + "><br/>";
			}
		}
		var div = dojo.doc.createElement("div");
		dojo.style(div, {position:"absolute", top:"-2000px"});
		dojo.doc.body.appendChild(div);
		div.innerHTML = localhtml;
		var node = div.firstChild;
		while (node) {
			dijit._editor.selection.selectElement(node.firstChild);
			dojo.withGlobal(this.window, "selectElement", dijit._editor.selection, [node.firstChild]);
			var nativename = node.tagName.toLowerCase();
			this._local2NativeFormatNames[nativename] = document.queryCommandValue("formatblock");
			this._native2LocalFormatNames[this._local2NativeFormatNames[nativename]] = nativename;
			node = node.nextSibling.nextSibling;
		}
		dojo.body().removeChild(div);
	}, open:function (element) {
		if (!this.onLoadDeferred || this.onLoadDeferred.fired >= 0) {
			this.onLoadDeferred = new dojo.Deferred();
		}
		if (!this.isClosed) {
			this.close();
		}
		dojo.publish(dijit._scopeName + "._editor.RichText::open", [this]);
		this._content = "";
		if (arguments.length == 1 && element.nodeName) {
			this.domNode = element;
		}
		var dn = this.domNode;
		var html;
		if (dn.nodeName && dn.nodeName.toLowerCase() == "textarea") {
			var ta = (this.textarea = dn);
			this.name = ta.name;
			html = ta.value;
			dn = this.domNode = dojo.doc.createElement("div");
			dn.setAttribute("widgetId", this.id);
			ta.removeAttribute("widgetId");
			dn.cssText = ta.cssText;
			dn.className += " " + ta.className;
			dojo.place(dn, ta, "before");
			var tmpFunc = dojo.hitch(this, function () {
				dojo.style(ta, {display:"block", position:"absolute", top:"-1000px"});
				if (dojo.isIE) {
					var s = ta.style;
					this.__overflow = s.overflow;
					s.overflow = "hidden";
				}
			});
			if (dojo.isIE) {
				setTimeout(tmpFunc, 10);
			} else {
				tmpFunc();
			}
			if (ta.form) {
				dojo.connect(ta.form, "onsubmit", this, function () {
					ta.value = this.getValue();
				});
			}
		} else {
			html = dijit._editor.getChildrenHtml(dn);
			dn.innerHTML = "";
		}
		var content = dojo.contentBox(dn);
		this._oldHeight = content.h;
		this._oldWidth = content.w;
		this.savedContent = html;
		if (dn.nodeName && dn.nodeName == "LI") {
			dn.innerHTML = " <br>";
		}
		this.editingArea = dn.ownerDocument.createElement("div");
		dn.appendChild(this.editingArea);
		if (this.name !== "" && (!dojo.config["useXDomain"] || dojo.config["allowXdRichTextSave"])) {
			var saveTextarea = dojo.byId(dijit._scopeName + "._editor.RichText.savedContent");
			if (saveTextarea.value !== "") {
				var datas = saveTextarea.value.split(this._SEPARATOR), i = 0, dat;
				while ((dat = datas[i++])) {
					var data = dat.split(":");
					if (data[0] == this.name) {
						html = data[1];
						datas.splice(i, 1);
						break;
					}
				}
			}
			dojo.addOnUnload(dojo.hitch(this, "_saveContent"));
		}
		this.isClosed = false;
		var ifr = (this.editorObject = this.iframe = dojo.doc.createElement("iframe"));
		ifr.id = this.id + "_iframe";
		this._iframeSrc = this._getIframeDocTxt();
		ifr.style.border = "none";
		ifr.style.width = "100%";
		if (this._layoutMode) {
			ifr.style.height = "100%";
		} else {
			if (dojo.isIE >= 7) {
				if (this.height) {
					ifr.style.height = this.height;
				}
				if (this.minHeight) {
					ifr.style.minHeight = this.minHeight;
				}
			} else {
				ifr.style.height = this.height ? this.height : this.minHeight;
			}
		}
		ifr.frameBorder = 0;
		ifr._loadFunc = dojo.hitch(this, function (win) {
			this.window = win;
			this.document = this.window.document;
			if (dojo.isIE) {
				this._localizeEditorCommands();
			}
			this.onLoad(html);
			this.savedContent = this.getValue(true);
		});
		var s = "javascript:parent." + dijit._scopeName + ".byId(\"" + this.id + "\")._iframeSrc";
		ifr.setAttribute("src", s);
		this.editingArea.appendChild(ifr);
		if (dojo.isSafari) {
			setTimeout(function () {
				ifr.setAttribute("src", s);
			}, 0);
		}
		if (dn.nodeName == "LI") {
			dn.lastChild.style.marginTop = "-1.2em";
		}
		dojo.addClass(this.domNode, "RichTextEditable");
	}, _local2NativeFormatNames:{}, _native2LocalFormatNames:{}, _getIframeDocTxt:function () {
		var _cs = dojo.getComputedStyle(this.domNode);
		var html = "";
		if (dojo.isIE || (!this.height && !dojo.isMoz)) {
			html = "<div></div>";
		} else {
			if (dojo.isMoz) {
				this._cursorToStart = true;
				html = "&nbsp;";
			}
		}
		var font = [_cs.fontWeight, _cs.fontSize, _cs.fontFamily].join(" ");
		var lineHeight = _cs.lineHeight;
		if (lineHeight.indexOf("px") >= 0) {
			lineHeight = parseFloat(lineHeight) / parseFloat(_cs.fontSize);
		} else {
			if (lineHeight.indexOf("em") >= 0) {
				lineHeight = parseFloat(lineHeight);
			} else {
				lineHeight = "normal";
			}
		}
		var userStyle = "";
		this.style.replace(/(^|;)(line-|font-?)[^;]+/g, function (match) {
			userStyle += match.replace(/^;/g, "") + ";";
		});
		var label = dojo.query("label[for=\"" + this.id + "\"]");
		return [this.isLeftToRight() ? "<html><head>" : "<html dir='rtl'><head>", (dojo.isMoz && label.length ? "<title>" + label[0].innerHTML + "</title>" : ""), "<meta http-equiv='Content-Type' content='text/html'>", "<style>", "body,html {", "\tbackground:transparent;", "\tpadding: 1px 0 0 0;", "\tmargin: -1px 0 0 0;", (dojo.isWebKit ? "\twidth: 100%;" : ""), (dojo.isWebKit ? "\theight: 100%;" : ""), "}", "body{", "\ttop:0px; left:0px; right:0px;", "\tfont:", font, ";", ((this.height || dojo.isOpera) ? "" : "position: fixed;"), "\tmin-height:", this.minHeight, ";", "\tline-height:", lineHeight, "}", "p{ margin: 1em 0; }", (this.height ? "" : "body,html{overflow-y:hidden;/*for IE*/} body > div {overflow-x:auto;/*FF:horizontal scrollbar*/ overflow-y:hidden;/*safari*/ min-height:" + this.minHeight + ";/*safari*/}"), "li > ul:-moz-first-node, li > ol:-moz-first-node{ padding-top: 1.2em; } ", "li{ min-height:1.2em; }", "</style>", this._applyEditingAreaStyleSheets(), "</head><body onload='frameElement._loadFunc(window,document)' style='" + userStyle + "'>", html, "</body></html>"].join("");
	}, _applyEditingAreaStyleSheets:function () {
		var files = [];
		if (this.styleSheets) {
			files = this.styleSheets.split(";");
			this.styleSheets = "";
		}
		files = files.concat(this.editingAreaStyleSheets);
		this.editingAreaStyleSheets = [];
		var text = "", i = 0, url;
		while ((url = files[i++])) {
			var abstring = (new dojo._Url(dojo.global.location, url)).toString();
			this.editingAreaStyleSheets.push(abstring);
			text += "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + abstring + "\"/>";
		}
		return text;
	}, addStyleSheet:function (uri) {
		var url = uri.toString();
		if (url.charAt(0) == "." || (url.charAt(0) != "/" && !uri.host)) {
			url = (new dojo._Url(dojo.global.location, url)).toString();
		}
		if (dojo.indexOf(this.editingAreaStyleSheets, url) > -1) {
			return;
		}
		this.editingAreaStyleSheets.push(url);
		this.onLoadDeferred.addCallback(dojo.hitch(function () {
			if (this.document.createStyleSheet) {
				this.document.createStyleSheet(url);
			} else {
				var head = this.document.getElementsByTagName("head")[0];
				var stylesheet = this.document.createElement("link");
				stylesheet.rel = "stylesheet";
				stylesheet.type = "text/css";
				stylesheet.href = url;
				head.appendChild(stylesheet);
			}
		}));
	}, removeStyleSheet:function (uri) {
		var url = uri.toString();
		if (url.charAt(0) == "." || (url.charAt(0) != "/" && !uri.host)) {
			url = (new dojo._Url(dojo.global.location, url)).toString();
		}
		var index = dojo.indexOf(this.editingAreaStyleSheets, url);
		if (index == -1) {
			return;
		}
		delete this.editingAreaStyleSheets[index];
		dojo.withGlobal(this.window, "query", dojo, ["link:[href=\"" + url + "\"]"]).orphan();
	}, disabled:false, _mozSettingProps:{"styleWithCSS":false}, _setDisabledAttr:function (value) {
		this.disabled = value;
		if (!this.isLoaded) {
			return;
		}
		value = !!value;
		if (dojo.isIE || dojo.isWebKit || dojo.isOpera) {
			var preventIEfocus = dojo.isIE && (this.isLoaded || !this.focusOnLoad);
			if (preventIEfocus) {
				this.editNode.unselectable = "on";
			}
			this.editNode.contentEditable = !value;
			if (preventIEfocus) {
				var _this = this;
				setTimeout(function () {
					_this.editNode.unselectable = "off";
				}, 0);
			}
		} else {
			try {
				this.document.designMode = (value ? "off" : "on");
			}
			catch (e) {
				return;
			}
			if (!value && this._mozSettingProps) {
				var ps = this._mozSettingProps;
				for (var n in ps) {
					if (ps.hasOwnProperty(n)) {
						try {
							this.document.execCommand(n, false, ps[n]);
						}
						catch (e2) {
						}
					}
				}
			}
		}
		this._disabledOK = true;
	}, onLoad:function (html) {
		if (!this.window.__registeredWindow) {
			this.window.__registeredWindow = true;
			this._iframeRegHandle = dijit.registerIframe(this.iframe);
		}
		if (!dojo.isIE && (this.height || dojo.isMoz)) {
			this.editNode = this.document.body;
		} else {
			this.editNode = this.document.body.firstChild;
			var _this = this;
			if (dojo.isIE) {
				var tabStop = (this.tabStop = dojo.doc.createElement("<div tabIndex=-1>"));
				this.editingArea.appendChild(tabStop);
				this.iframe.onfocus = function () {
					_this.editNode.setActive();
				};
			}
		}
		this.focusNode = this.editNode;
		var events = this.events.concat(this.captureEvents);
		var ap = this.iframe ? this.document : this.editNode;
		dojo.forEach(events, function (item) {
			this.connect(ap, item.toLowerCase(), item);
		}, this);
		if (dojo.isIE) {
			this.connect(this.document, "onmousedown", "_onIEMouseDown");
			this.editNode.style.zoom = 1;
		}
		if (dojo.isWebKit) {
			this._webkitListener = this.connect(this.document, "onmouseup", "onDisplayChanged");
		}
		if (dojo.isIE) {
			try {
				this.document.execCommand("RespectVisibilityInDesign", true, null);
			}
			catch (e) {
			}
		}
		this.isLoaded = true;
		this.attr("disabled", this.disabled);
		this.setValue(html);
		if (this.onLoadDeferred) {
			this.onLoadDeferred.callback(true);
		}
		this.onDisplayChanged();
		if (this.focusOnLoad) {
			dojo.addOnLoad(dojo.hitch(this, function () {
				setTimeout(dojo.hitch(this, "focus"), this.updateInterval);
			}));
		}
	}, onKeyDown:function (e) {
		if (e.keyCode === dojo.keys.TAB && this.isTabIndent) {
			dojo.stopEvent(e);
			if (this.queryCommandEnabled((e.shiftKey ? "outdent" : "indent"))) {
				this.execCommand((e.shiftKey ? "outdent" : "indent"));
			}
		}
		if (dojo.isIE) {
			if (e.keyCode == dojo.keys.TAB && !this.isTabIndent) {
				if (e.shiftKey && !e.ctrlKey && !e.altKey) {
					this.iframe.focus();
				} else {
					if (!e.shiftKey && !e.ctrlKey && !e.altKey) {
						this.tabStop.focus();
					}
				}
			} else {
				if (e.keyCode === dojo.keys.BACKSPACE && this.document.selection.type === "Control") {
					dojo.stopEvent(e);
					this.execCommand("delete");
				} else {
					if ((65 <= e.keyCode && e.keyCode <= 90) || (e.keyCode >= 37 && e.keyCode <= 40)) {
						e.charCode = e.keyCode;
						this.onKeyPress(e);
					}
				}
			}
		}
		return true;
	}, onKeyUp:function (e) {
		return;
	}, setDisabled:function (disabled) {
		dojo.deprecated("dijit.Editor::setDisabled is deprecated", "use dijit.Editor::attr(\"disabled\",boolean) instead", 2);
		this.attr("disabled", disabled);
	}, _setValueAttr:function (value) {
		this.setValue(value);
	}, _setDisableSpellCheckAttr:function (disabled) {
		if (this.document) {
			dojo.attr(this.document.body, "spellcheck", !disabled);
		} else {
			this.onLoadDeferred.addCallback(dojo.hitch(this, function () {
				dojo.attr(this.document.body, "spellcheck", !disabled);
			}));
		}
		this.disableSpellCheck = disabled;
	}, onKeyPress:function (e) {
		var c = (e.keyChar && e.keyChar.toLowerCase()) || e.keyCode, handlers = this._keyHandlers[c], args = arguments;
		if (handlers && !e.altKey) {
			dojo.some(handlers, function (h) {
				if (!(h.shift ^ e.shiftKey) && !(h.ctrl ^ e.ctrlKey)) {
					if (!h.handler.apply(this, args)) {
						e.preventDefault();
					}
					return true;
				}
			}, this);
		}
		if (!this._onKeyHitch) {
			this._onKeyHitch = dojo.hitch(this, "onKeyPressed");
		}
		setTimeout(this._onKeyHitch, 1);
		return true;
	}, addKeyHandler:function (key, ctrl, shift, handler) {
		if (!dojo.isArray(this._keyHandlers[key])) {
			this._keyHandlers[key] = [];
		}
		this._keyHandlers[key].push({shift:shift || false, ctrl:ctrl || false, handler:handler});
	}, onKeyPressed:function () {
		this.onDisplayChanged();
	}, onClick:function (e) {
		this.onDisplayChanged(e);
	}, _onIEMouseDown:function (e) {
		if (!this._focused && !this.disabled) {
			this.focus();
		}
	}, _onBlur:function (e) {
		this.inherited(arguments);
		var _c = this.getValue(true);
		if (_c != this.savedContent) {
			this.onChange(_c);
			this.savedContent = _c;
		}
	}, _onFocus:function (e) {
		if (!this.disabled) {
			if (!this._disabledOK) {
				this.attr("disabled", false);
			}
			this.inherited(arguments);
		}
	}, blur:function () {
		if (!dojo.isIE && this.window.document.documentElement && this.window.document.documentElement.focus) {
			this.window.document.documentElement.focus();
		} else {
			if (dojo.doc.body.focus) {
				dojo.doc.body.focus();
			}
		}
	}, focus:function () {
		if (!dojo.isIE) {
			dijit.focus(this.iframe);
			if (this._cursorToStart) {
				delete this._cursorToStart;
				if (this.editNode.childNodes && this.editNode.childNodes.length === 1 && this.editNode.innerHTML === "&nbsp;") {
					this.placeCursorAtStart();
				}
			}
		} else {
			if (this.editNode && this.editNode.focus) {
				this.iframe.fireEvent("onfocus", document.createEventObject());
			}
		}
	}, updateInterval:200, _updateTimer:null, onDisplayChanged:function (e) {
		if (this._updateTimer) {
			clearTimeout(this._updateTimer);
		}
		if (!this._updateHandler) {
			this._updateHandler = dojo.hitch(this, "onNormalizedDisplayChanged");
		}
		this._updateTimer = setTimeout(this._updateHandler, this.updateInterval);
	}, onNormalizedDisplayChanged:function () {
		delete this._updateTimer;
	}, onChange:function (newContent) {
	}, _normalizeCommand:function (cmd, argument) {
		var command = cmd.toLowerCase();
		if (command == "formatblock") {
			if (dojo.isSafari && argument === undefined) {
				command = "heading";
			}
		} else {
			if (command == "hilitecolor" && !dojo.isMoz) {
				command = "backcolor";
			}
		}
		return command;
	}, _qcaCache:{}, queryCommandAvailable:function (command) {
		var ca = this._qcaCache[command];
		if (ca !== undefined) {
			return ca;
		}
		return (this._qcaCache[command] = this._queryCommandAvailable(command));
	}, _queryCommandAvailable:function (command) {
		var ie = 1;
		var mozilla = 1 << 1;
		var webkit = 1 << 2;
		var opera = 1 << 3;
		var webkit420 = 1 << 4;
		function isSupportedBy(browsers) {
			return {ie:Boolean(browsers & ie), mozilla:Boolean(browsers & mozilla), webkit:Boolean(browsers & webkit), webkit420:Boolean(browsers & webkit420), opera:Boolean(browsers & opera)};
		}
		var supportedBy = null;
		switch (command.toLowerCase()) {
		  case "bold":
		  case "italic":
		  case "underline":
		  case "subscript":
		  case "superscript":
		  case "fontname":
		  case "fontsize":
		  case "forecolor":
		  case "hilitecolor":
		  case "justifycenter":
		  case "justifyfull":
		  case "justifyleft":
		  case "justifyright":
		  case "delete":
		  case "selectall":
		  case "toggledir":
			supportedBy = isSupportedBy(mozilla | ie | webkit | opera);
			break;
		  case "createlink":
		  case "unlink":
		  case "removeformat":
		  case "inserthorizontalrule":
		  case "insertimage":
		  case "insertorderedlist":
		  case "insertunorderedlist":
		  case "indent":
		  case "outdent":
		  case "formatblock":
		  case "inserthtml":
		  case "undo":
		  case "redo":
		  case "strikethrough":
		  case "tabindent":
			supportedBy = isSupportedBy(mozilla | ie | opera | webkit420);
			break;
		  case "blockdirltr":
		  case "blockdirrtl":
		  case "dirltr":
		  case "dirrtl":
		  case "inlinedirltr":
		  case "inlinedirrtl":
			supportedBy = isSupportedBy(ie);
			break;
		  case "cut":
		  case "copy":
		  case "paste":
			supportedBy = isSupportedBy(ie | mozilla | webkit420);
			break;
		  case "inserttable":
			supportedBy = isSupportedBy(mozilla | ie);
			break;
		  case "insertcell":
		  case "insertcol":
		  case "insertrow":
		  case "deletecells":
		  case "deletecols":
		  case "deleterows":
		  case "mergecells":
		  case "splitcell":
			supportedBy = isSupportedBy(ie | mozilla);
			break;
		  default:
			return false;
		}
		return (dojo.isIE && supportedBy.ie) || (dojo.isMoz && supportedBy.mozilla) || (dojo.isWebKit && supportedBy.webkit) || (dojo.isWebKit > 420 && supportedBy.webkit420) || (dojo.isOpera && supportedBy.opera);
	}, execCommand:function (command, argument) {
		var returnValue;
		this.focus();
		command = this._normalizeCommand(command, argument);
		if (argument !== undefined) {
			if (command == "heading") {
				throw new Error("unimplemented");
			} else {
				if ((command == "formatblock") && dojo.isIE) {
					argument = "<" + argument + ">";
				}
			}
		}
		var implFunc = "_" + command + "Impl";
		if (this[implFunc]) {
			returnValue = this[implFunc](argument);
		} else {
			argument = arguments.length > 1 ? argument : null;
			if (argument || command != "createlink") {
				returnValue = this.document.execCommand(command, false, argument);
			}
		}
		this.onDisplayChanged();
		return returnValue;
	}, queryCommandEnabled:function (command) {
		if (this.disabled || !this._disabledOK) {
			return false;
		}
		command = this._normalizeCommand(command);
		if (dojo.isMoz || dojo.isWebKit) {
			if (command == "unlink") {
				return this._sCall("hasAncestorElement", ["a"]);
			} else {
				if (command == "inserttable") {
					return true;
				}
			}
		}
		if (dojo.isWebKit) {
			if (command == "copy") {
				command = "cut";
			} else {
				if (command == "paste") {
					return true;
				}
			}
		}
		var elem = dojo.isIE ? this.document.selection.createRange() : this.document;
		try {
			return elem.queryCommandEnabled(command);
		}
		catch (e) {
			return false;
		}
	}, queryCommandState:function (command) {
		if (this.disabled || !this._disabledOK) {
			return false;
		}
		command = this._normalizeCommand(command);
		try {
			return this.document.queryCommandState(command);
		}
		catch (e) {
			return false;
		}
	}, queryCommandValue:function (command) {
		if (this.disabled || !this._disabledOK) {
			return false;
		}
		var r;
		command = this._normalizeCommand(command);
		if (dojo.isIE && command == "formatblock") {
			r = this._native2LocalFormatNames[this.document.queryCommandValue(command)];
		} else {
			if (dojo.isMoz && command === "hilitecolor") {
				var oldValue;
				try {
					oldValue = this.document.queryCommandValue("styleWithCSS");
				}
				catch (e) {
					oldValue = false;
				}
				this.document.execCommand("styleWithCSS", false, true);
				r = this.document.queryCommandValue(command);
				this.document.execCommand("styleWithCSS", false, oldValue);
			} else {
				r = this.document.queryCommandValue(command);
			}
		}
		return r;
	}, _sCall:function (name, args) {
		return dojo.withGlobal(this.window, name, dijit._editor.selection, args);
	}, placeCursorAtStart:function () {
		this.focus();
		var isvalid = false;
		if (dojo.isMoz) {
			var first = this.editNode.firstChild;
			while (first) {
				if (first.nodeType == 3) {
					if (first.nodeValue.replace(/^\s+|\s+$/g, "").length > 0) {
						isvalid = true;
						this._sCall("selectElement", [first]);
						break;
					}
				} else {
					if (first.nodeType == 1) {
						isvalid = true;
						var tg = first.tagName ? first.tagName.toLowerCase() : "";
						if (/br|input|img|base|meta|area|basefont|hr|link/.test(tg)) {
							this._sCall("selectElement", [first]);
						} else {
							this._sCall("selectElementChildren", [first]);
						}
						break;
					}
				}
				first = first.nextSibling;
			}
		} else {
			isvalid = true;
			this._sCall("selectElementChildren", [this.editNode]);
		}
		if (isvalid) {
			this._sCall("collapse", [true]);
		}
	}, placeCursorAtEnd:function () {
		this.focus();
		var isvalid = false;
		if (dojo.isMoz) {
			var last = this.editNode.lastChild;
			while (last) {
				if (last.nodeType == 3) {
					if (last.nodeValue.replace(/^\s+|\s+$/g, "").length > 0) {
						isvalid = true;
						this._sCall("selectElement", [last]);
						break;
					}
				} else {
					if (last.nodeType == 1) {
						isvalid = true;
						if (last.lastChild) {
							this._sCall("selectElement", [last.lastChild]);
						} else {
							this._sCall("selectElement", [last]);
						}
						break;
					}
				}
				last = last.previousSibling;
			}
		} else {
			isvalid = true;
			this._sCall("selectElementChildren", [this.editNode]);
		}
		if (isvalid) {
			this._sCall("collapse", [false]);
		}
	}, getValue:function (nonDestructive) {
		if (this.textarea) {
			if (this.isClosed || !this.isLoaded) {
				return this.textarea.value;
			}
		}
		return this._postFilterContent(null, nonDestructive);
	}, _getValueAttr:function () {
		return this.getValue(true);
	}, setValue:function (html) {
		if (!this.isLoaded) {
			this.onLoadDeferred.addCallback(dojo.hitch(this, function () {
				this.setValue(html);
			}));
			return;
		}
		if (this.textarea && (this.isClosed || !this.isLoaded)) {
			this.textarea.value = html;
		} else {
			html = this._preFilterContent(html);
			var node = this.isClosed ? this.domNode : this.editNode;
			if (!html && dojo.isWebKit) {
				this._cursorToStart = true;
				html = "&nbsp;";
			}
			node.innerHTML = html;
			this._preDomFilterContent(node);
		}
		this.onDisplayChanged();
	}, replaceValue:function (html) {
		if (this.isClosed) {
			this.setValue(html);
		} else {
			if (this.window && this.window.getSelection && !dojo.isMoz) {
				this.setValue(html);
			} else {
				if (this.window && this.window.getSelection) {
					html = this._preFilterContent(html);
					this.execCommand("selectall");
					if (!html) {
						this._cursorToStart = true;
						html = "&nbsp;";
					}
					this.execCommand("inserthtml", html);
					this._preDomFilterContent(this.editNode);
				} else {
					if (this.document && this.document.selection) {
						this.setValue(html);
					}
				}
			}
		}
	}, _preFilterContent:function (html) {
		var ec = html;
		dojo.forEach(this.contentPreFilters, function (ef) {
			if (ef) {
				ec = ef(ec);
			}
		});
		return ec;
	}, _preDomFilterContent:function (dom) {
		dom = dom || this.editNode;
		dojo.forEach(this.contentDomPreFilters, function (ef) {
			if (ef && dojo.isFunction(ef)) {
				ef(dom);
			}
		}, this);
	}, _postFilterContent:function (dom, nonDestructive) {
		var ec;
		if (!dojo.isString(dom)) {
			dom = dom || this.editNode;
			if (this.contentDomPostFilters.length) {
				if (nonDestructive) {
					dom = dojo.clone(dom);
				}
				dojo.forEach(this.contentDomPostFilters, function (ef) {
					dom = ef(dom);
				});
			}
			ec = dijit._editor.getChildrenHtml(dom);
		} else {
			ec = dom;
		}
		if (!dojo.trim(ec.replace(/^\xA0\xA0*/, "").replace(/\xA0\xA0*$/, "")).length) {
			ec = "";
		}
		dojo.forEach(this.contentPostFilters, function (ef) {
			ec = ef(ec);
		});
		return ec;
	}, _saveContent:function (e) {
		var saveTextarea = dojo.byId(dijit._scopeName + "._editor.RichText.savedContent");
		if (saveTextarea.value) {
			saveTextarea.value += this._SEPARATOR;
		}
		saveTextarea.value += this.name + ":" + this.getValue(true);
	}, escapeXml:function (str, noSingleQuotes) {
		str = str.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
		if (!noSingleQuotes) {
			str = str.replace(/'/gm, "&#39;");
		}
		return str;
	}, getNodeHtml:function (node) {
		dojo.deprecated("dijit.Editor::getNodeHtml is deprecated", "use dijit._editor.getNodeHtml instead", 2);
		return dijit._editor.getNodeHtml(node);
	}, getNodeChildrenHtml:function (dom) {
		dojo.deprecated("dijit.Editor::getNodeChildrenHtml is deprecated", "use dijit._editor.getChildrenHtml instead", 2);
		return dijit._editor.getChildrenHtml(dom);
	}, close:function (save) {
		if (this.isClosed) {
			return false;
		}
		if (!arguments.length) {
			save = true;
		}
		this._content = this.getValue();
		var changed = (this.savedContent != this._content);
		if (this.interval) {
			clearInterval(this.interval);
		}
		if (this._webkitListener) {
			this.disconnect(this._webkitListener);
			delete this._webkitListener;
		}
		if (dojo.isIE) {
			this.iframe.onfocus = null;
		}
		this.iframe._loadFunc = null;
		if (this._iframeRegHandle) {
			dijit.unregisterIframe(this._iframeRegHandle);
			delete this._iframeRegHandle;
		}
		if (this.textarea) {
			var s = this.textarea.style;
			s.position = "";
			s.left = s.top = "";
			if (dojo.isIE) {
				s.overflow = this.__overflow;
				this.__overflow = null;
			}
			this.textarea.value = save ? this._content : this.savedContent;
			dojo.destroy(this.domNode);
			this.domNode = this.textarea;
		} else {
			this.domNode.innerHTML = save ? this._content : this.savedContent;
		}
		delete this.iframe;
		dojo.removeClass(this.domNode, "RichTextEditable");
		this.isClosed = true;
		this.isLoaded = false;
		delete this.editNode;
		delete this.focusNode;
		if (this.window && this.window._frameElement) {
			this.window._frameElement = null;
		}
		this.window = null;
		this.document = null;
		this.editingArea = null;
		this.editorObject = null;
		return changed;
	}, destroy:function () {
		if (!this.isClosed) {
			this.close(false);
		}
		this.inherited(arguments);
	}, _removeMozBogus:function (html) {
		return html.replace(/\stype="_moz"/gi, "").replace(/\s_moz_dirty=""/gi, "").replace(/_moz_resizing="(true|false)"/gi, "");
	}, _removeWebkitBogus:function (html) {
		html = html.replace(/\sclass="webkit-block-placeholder"/gi, "");
		html = html.replace(/\sclass="apple-style-span"/gi, "");
		return html;
	}, _normalizeFontStyle:function (html) {
		return html.replace(/<(\/)?strong([ \>])/gi, "<$1b$2").replace(/<(\/)?em([ \>])/gi, "<$1i$2");
	}, _preFixUrlAttributes:function (html) {
		return html.replace(/(?:(<a(?=\s).*?\shref=)("|')(.*?)\2)|(?:(<a\s.*?href=)([^"'][^ >]+))/gi, "$1$4$2$3$5$2 _djrealurl=$2$3$5$2").replace(/(?:(<img(?=\s).*?\ssrc=)("|')(.*?)\2)|(?:(<img\s.*?src=)([^"'][^ >]+))/gi, "$1$4$2$3$5$2 _djrealurl=$2$3$5$2");
	}, _inserthorizontalruleImpl:function (argument) {
		if (dojo.isIE) {
			return this._inserthtmlImpl("<hr>");
		}
		return this.document.execCommand("inserthorizontalrule", false, argument);
	}, _unlinkImpl:function (argument) {
		if ((this.queryCommandEnabled("unlink")) && (dojo.isMoz || dojo.isWebKit)) {
			var a = this._sCall("getAncestorElement", ["a"]);
			this._sCall("selectElement", [a]);
			return this.document.execCommand("unlink", false, null);
		}
		return this.document.execCommand("unlink", false, argument);
	}, _hilitecolorImpl:function (argument) {
		var returnValue;
		if (dojo.isMoz) {
			this.document.execCommand("styleWithCSS", false, true);
			returnValue = this.document.execCommand("hilitecolor", false, argument);
			this.document.execCommand("styleWithCSS", false, false);
		} else {
			returnValue = this.document.execCommand("hilitecolor", false, argument);
		}
		return returnValue;
	}, _backcolorImpl:function (argument) {
		if (dojo.isIE) {
			argument = argument ? argument : null;
		}
		return this.document.execCommand("backcolor", false, argument);
	}, _forecolorImpl:function (argument) {
		if (dojo.isIE) {
			argument = argument ? argument : null;
		}
		return this.document.execCommand("forecolor", false, argument);
	}, _inserthtmlImpl:function (argument) {
		argument = this._preFilterContent(argument);
		var rv = true;
		if (dojo.isIE) {
			var insertRange = this.document.selection.createRange();
			if (this.document.selection.type.toUpperCase() == "CONTROL") {
				var n = insertRange.item(0);
				while (insertRange.length) {
					insertRange.remove(insertRange.item(0));
				}
				n.outerHTML = argument;
			} else {
				insertRange.pasteHTML(argument);
			}
			insertRange.select();
		} else {
			if (dojo.isMoz && !argument.length) {
				this._sCall("remove");
			} else {
				rv = this.document.execCommand("inserthtml", false, argument);
			}
		}
		return rv;
	}});
}

