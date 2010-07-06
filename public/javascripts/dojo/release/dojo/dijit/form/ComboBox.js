/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.form.ComboBox"]) {
	dojo._hasResource["dijit.form.ComboBox"] = true;
	dojo.provide("dijit.form.ComboBox");
	dojo.require("dijit.form._FormWidget");
	dojo.require("dijit.form.ValidationTextBox");
	dojo.require("dojo.data.util.simpleFetch");
	dojo.require("dojo.data.util.filter");
	dojo.require("dojo.regexp");
	dojo.requireLocalization("dijit.form", "ComboBox", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,ko,nb,nl,pl,pt,pt-pt,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dijit.form.ComboBoxMixin", null, {item:null, pageSize:Infinity, store:null, fetchProperties:{}, query:{}, autoComplete:true, highlightMatch:"first", searchDelay:100, searchAttr:"name", labelAttr:"", labelType:"text", queryExpr:"${0}*", ignoreCase:true, hasDownArrow:true, templateString:dojo.cache("dijit.form", "templates/ComboBox.html", "<div class=\"dijit dijitReset dijitInlineTable dijitLeft\"\n\tid=\"widget_${id}\"\n\tdojoAttachEvent=\"onmouseenter:_onMouse,onmouseleave:_onMouse,onmousedown:_onMouse\" dojoAttachPoint=\"comboNode\" waiRole=\"combobox\" tabIndex=\"-1\"\n\t><div style=\"overflow:hidden;\"\n\t\t><div class='dijitReset dijitRight dijitButtonNode dijitArrowButton dijitDownArrowButton'\n\t\t\tdojoAttachPoint=\"downArrowNode\" waiRole=\"presentation\"\n\t\t\tdojoAttachEvent=\"onmousedown:_onArrowMouseDown,onmouseup:_onMouse,onmouseenter:_onMouse,onmouseleave:_onMouse\"\n\t\t\t><div class=\"dijitArrowButtonInner\">&thinsp;</div\n\t\t\t><div class=\"dijitArrowButtonChar\">&#9660;</div\n\t\t></div\n\t\t><div class=\"dijitReset dijitValidationIcon\"><br></div\n\t\t><div class=\"dijitReset dijitValidationIconText\">&Chi;</div\n\t\t><div class=\"dijitReset dijitInputField\"\n\t\t\t><input ${nameAttrSetting} type=\"text\" autocomplete=\"off\" class='dijitReset'\n\t\t\tdojoAttachEvent=\"onkeypress:_onKeyPress,compositionend\"\n\t\t\tdojoAttachPoint=\"textbox,focusNode\" waiRole=\"textbox\" waiState=\"haspopup-true,autocomplete-list\"\n\t\t/></div\n\t></div\n></div>\n"), baseClass:"dijitComboBox", _getCaretPos:function (element) {
		var pos = 0;
		if (typeof (element.selectionStart) == "number") {
			pos = element.selectionStart;
		} else {
			if (dojo.isIE) {
				var tr = dojo.doc.selection.createRange().duplicate();
				var ntr = element.createTextRange();
				tr.move("character", 0);
				ntr.move("character", 0);
				try {
					ntr.setEndPoint("EndToEnd", tr);
					pos = String(ntr.text).replace(/\r/g, "").length;
				}
				catch (e) {
				}
			}
		}
		return pos;
	}, _setCaretPos:function (element, location) {
		location = parseInt(location);
		dijit.selectInputText(element, location, location);
	}, _setDisabledAttr:function (value) {
		this.inherited(arguments);
		dijit.setWaiState(this.comboNode, "disabled", value);
	}, _abortQuery:function () {
		if (this.searchTimer) {
			clearTimeout(this.searchTimer);
			this.searchTimer = null;
		}
		if (this._fetchHandle) {
			if (this._fetchHandle.abort) {
				this._fetchHandle.abort();
			}
			this._fetchHandle = null;
		}
	}, _onKeyPress:function (evt) {
		var key = evt.charOrCode;
		if (evt.altKey || ((evt.ctrlKey || evt.metaKey) && (key != "x" && key != "v")) || key == dojo.keys.SHIFT) {
			return;
		}
		var doSearch = false;
		var searchFunction = "_startSearchFromInput";
		var pw = this._popupWidget;
		var dk = dojo.keys;
		var highlighted = null;
		this._prev_key_backspace = false;
		this._abortQuery();
		if (this._isShowingNow) {
			pw.handleKey(key);
			highlighted = pw.getHighlightedOption();
		}
		switch (key) {
		  case dk.PAGE_DOWN:
		  case dk.DOWN_ARROW:
		  case dk.PAGE_UP:
		  case dk.UP_ARROW:
			if (!this._isShowingNow) {
				this._arrowPressed();
				doSearch = true;
				searchFunction = "_startSearchAll";
			} else {
				this._announceOption(highlighted);
			}
			dojo.stopEvent(evt);
			break;
		  case dk.ENTER:
			if (highlighted) {
				if (highlighted == pw.nextButton) {
					this._nextSearch(1);
					dojo.stopEvent(evt);
					break;
				} else {
					if (highlighted == pw.previousButton) {
						this._nextSearch(-1);
						dojo.stopEvent(evt);
						break;
					}
				}
			} else {
				this._setBlurValue();
				this._setCaretPos(this.focusNode, this.focusNode.value.length);
			}
			evt.preventDefault();
		  case dk.TAB:
			var newvalue = this.attr("displayedValue");
			if (pw && (newvalue == pw._messages["previousMessage"] || newvalue == pw._messages["nextMessage"])) {
				break;
			}
			if (highlighted) {
				this._selectOption();
			}
			if (this._isShowingNow) {
				this._lastQuery = null;
				this._hideResultList();
			}
			break;
		  case " ":
			if (highlighted) {
				dojo.stopEvent(evt);
				this._selectOption();
				this._hideResultList();
			} else {
				doSearch = true;
			}
			break;
		  case dk.ESCAPE:
			if (this._isShowingNow) {
				dojo.stopEvent(evt);
				this._hideResultList();
			}
			break;
		  case dk.DELETE:
		  case dk.BACKSPACE:
			this._prev_key_backspace = true;
			doSearch = true;
			break;
		  default:
			doSearch = typeof key == "string" || key == 229;
		}
		if (doSearch) {
			this.item = undefined;
			this.searchTimer = setTimeout(dojo.hitch(this, searchFunction), 1);
		}
	}, _autoCompleteText:function (text) {
		var fn = this.focusNode;
		dijit.selectInputText(fn, fn.value.length);
		var caseFilter = this.ignoreCase ? "toLowerCase" : "substr";
		if (text[caseFilter](0).indexOf(this.focusNode.value[caseFilter](0)) == 0) {
			var cpos = this._getCaretPos(fn);
			if ((cpos + 1) > fn.value.length) {
				fn.value = text;
				dijit.selectInputText(fn, cpos);
			}
		} else {
			fn.value = text;
			dijit.selectInputText(fn);
		}
	}, _openResultList:function (results, dataObject) {
		this._fetchHandle = null;
		if (this.disabled || this.readOnly || (dataObject.query[this.searchAttr] != this._lastQuery)) {
			return;
		}
		this._popupWidget.clearResultList();
		if (!results.length) {
			this._hideResultList();
			return;
		}
		dataObject._maxOptions = this._maxOptions;
		var nodes = this._popupWidget.createOptions(results, dataObject, dojo.hitch(this, "_getMenuLabelFromItem"));
		this._showResultList();
		if (dataObject.direction) {
			if (1 == dataObject.direction) {
				this._popupWidget.highlightFirstOption();
			} else {
				if (-1 == dataObject.direction) {
					this._popupWidget.highlightLastOption();
				}
			}
			this._announceOption(this._popupWidget.getHighlightedOption());
		} else {
			if (this.autoComplete && !this._prev_key_backspace && !/^[*]+$/.test(dataObject.query[this.searchAttr])) {
				this._announceOption(nodes[1]);
			}
		}
	}, _showResultList:function () {
		this._hideResultList();
		this._arrowPressed();
		this.displayMessage("");
		dojo.style(this._popupWidget.domNode, {width:"", height:""});
		var best = this.open();
		var popupbox = dojo.marginBox(this._popupWidget.domNode);
		this._popupWidget.domNode.style.overflow = ((best.h == popupbox.h) && (best.w == popupbox.w)) ? "hidden" : "auto";
		var newwidth = best.w;
		if (best.h < this._popupWidget.domNode.scrollHeight) {
			newwidth += 16;
		}
		dojo.marginBox(this._popupWidget.domNode, {h:best.h, w:Math.max(newwidth, this.domNode.offsetWidth)});
		if (newwidth < this.domNode.offsetWidth) {
			this._popupWidget.domNode.parentNode.style.left = dojo.position(this.domNode).x + "px";
		}
		dijit.setWaiState(this.comboNode, "expanded", "true");
	}, _hideResultList:function () {
		this._abortQuery();
		if (this._isShowingNow) {
			dijit.popup.close(this._popupWidget);
			this._arrowIdle();
			this._isShowingNow = false;
			dijit.setWaiState(this.comboNode, "expanded", "false");
			dijit.removeWaiState(this.focusNode, "activedescendant");
		}
	}, _setBlurValue:function () {
		var newvalue = this.attr("displayedValue");
		var pw = this._popupWidget;
		if (pw && (newvalue == pw._messages["previousMessage"] || newvalue == pw._messages["nextMessage"])) {
			this._setValueAttr(this._lastValueReported, true);
		} else {
			if (typeof this.item == "undefined") {
				this.item = null;
				this.attr("displayedValue", newvalue);
			} else {
				if (this.value != this._lastValueReported) {
					dijit.form._FormValueWidget.prototype._setValueAttr.call(this, this.value, true);
				}
				this._refreshState();
			}
		}
	}, _onBlur:function () {
		this._hideResultList();
		this._arrowIdle();
		this.inherited(arguments);
	}, _setItemAttr:function (item, priorityChange, displayedValue) {
		if (!displayedValue) {
			displayedValue = this.labelFunc(item, this.store);
		}
		this.value = this._getValueField() != this.searchAttr ? this.store.getIdentity(item) : displayedValue;
		this.item = item;
		dijit.form.ComboBox.superclass._setValueAttr.call(this, this.value, priorityChange, displayedValue);
	}, _announceOption:function (node) {
		if (!node) {
			return;
		}
		var newValue;
		if (node == this._popupWidget.nextButton || node == this._popupWidget.previousButton) {
			newValue = node.innerHTML;
			this.item = undefined;
			this.value = "";
		} else {
			newValue = this.labelFunc(node.item, this.store);
			this.attr("item", node.item, false, newValue);
		}
		this.focusNode.value = this.focusNode.value.substring(0, this._lastInput.length);
		dijit.setWaiState(this.focusNode, "activedescendant", dojo.attr(node, "id"));
		this._autoCompleteText(newValue);
	}, _selectOption:function (evt) {
		if (evt) {
			this._announceOption(evt.target);
		}
		this._hideResultList();
		this._setCaretPos(this.focusNode, this.focusNode.value.length);
		dijit.form._FormValueWidget.prototype._setValueAttr.call(this, this.value, true);
	}, _onArrowMouseDown:function (evt) {
		if (this.disabled || this.readOnly) {
			return;
		}
		dojo.stopEvent(evt);
		this.focus();
		if (this._isShowingNow) {
			this._hideResultList();
		} else {
			this._startSearchAll();
		}
	}, _startSearchAll:function () {
		this._startSearch("");
	}, _startSearchFromInput:function () {
		this._startSearch(this.focusNode.value.replace(/([\\\*\?])/g, "\\$1"));
	}, _getQueryString:function (text) {
		return dojo.string.substitute(this.queryExpr, [text]);
	}, _startSearch:function (key) {
		if (!this._popupWidget) {
			var popupId = this.id + "_popup";
			this._popupWidget = new dijit.form._ComboBoxMenu({onChange:dojo.hitch(this, this._selectOption), id:popupId});
			dijit.removeWaiState(this.focusNode, "activedescendant");
			dijit.setWaiState(this.textbox, "owns", popupId);
		}
		var query = dojo.clone(this.query);
		this._lastInput = key;
		this._lastQuery = query[this.searchAttr] = this._getQueryString(key);
		this.searchTimer = setTimeout(dojo.hitch(this, function (query, _this) {
			this.searchTimer = null;
			var fetch = {queryOptions:{ignoreCase:this.ignoreCase, deep:true}, query:query, onBegin:dojo.hitch(this, "_setMaxOptions"), onComplete:dojo.hitch(this, "_openResultList"), onError:function (errText) {
				_this._fetchHandle = null;
				console.error("dijit.form.ComboBox: " + errText);
				dojo.hitch(_this, "_hideResultList")();
			}, start:0, count:this.pageSize};
			dojo.mixin(fetch, _this.fetchProperties);
			this._fetchHandle = _this.store.fetch(fetch);
			var nextSearch = function (dataObject, direction) {
				dataObject.start += dataObject.count * direction;
				dataObject.direction = direction;
				this._fetchHandle = this.store.fetch(dataObject);
			};
			this._nextSearch = this._popupWidget.onPage = dojo.hitch(this, nextSearch, this._fetchHandle);
		}, query, this), this.searchDelay);
	}, _setMaxOptions:function (size, request) {
		this._maxOptions = size;
	}, _getValueField:function () {
		return this.searchAttr;
	}, _arrowPressed:function () {
		if (!this.disabled && !this.readOnly && this.hasDownArrow) {
			dojo.addClass(this.downArrowNode, "dijitArrowButtonActive");
		}
	}, _arrowIdle:function () {
		if (!this.disabled && !this.readOnly && this.hasDownArrow) {
			dojo.removeClass(this.downArrowNode, "dojoArrowButtonPushed");
		}
	}, compositionend:function (evt) {
		this._onKeyPress({charOrCode:229});
	}, constructor:function () {
		this.query = {};
		this.fetchProperties = {};
	}, postMixInProperties:function () {
		if (!this.hasDownArrow) {
			this.baseClass = "dijitTextBox";
		}
		if (!this.store) {
			var srcNodeRef = this.srcNodeRef;
			this.store = new dijit.form._ComboBoxDataStore(srcNodeRef);
			if (!this.value || ((typeof srcNodeRef.selectedIndex == "number") && srcNodeRef.selectedIndex.toString() === this.value)) {
				var item = this.store.fetchSelectedItem();
				if (item) {
					var valueField = this._getValueField();
					this.value = valueField != this.searchAttr ? this.store.getValue(item, valueField) : this.labelFunc(item, this.store);
				}
			}
		}
		this.inherited(arguments);
	}, postCreate:function () {
		var label = dojo.query("label[for=\"" + this.id + "\"]");
		if (label.length) {
			label[0].id = (this.id + "_label");
			var cn = this.comboNode;
			dijit.setWaiState(cn, "labelledby", label[0].id);
		}
		this.inherited(arguments);
	}, uninitialize:function () {
		if (this._popupWidget && !this._popupWidget._destroyed) {
			this._hideResultList();
			this._popupWidget.destroy();
		}
		this.inherited(arguments);
	}, _getMenuLabelFromItem:function (item) {
		var label = this.labelAttr ? this.store.getValue(item, this.labelAttr) : this.labelFunc(item, this.store);
		var labelType = this.labelType;
		if (this.highlightMatch != "none" && this.labelType == "text" && this._lastInput) {
			label = this.doHighlight(label, this._escapeHtml(this._lastInput));
			labelType = "html";
		}
		return {html:labelType == "html", label:label};
	}, doHighlight:function (label, find) {
		var modifiers = "i" + (this.highlightMatch == "all" ? "g" : "");
		var escapedLabel = this._escapeHtml(label);
		find = dojo.regexp.escapeString(find);
		var ret = escapedLabel.replace(new RegExp("(^|\\s)(" + find + ")", modifiers), "$1<span class=\"dijitComboBoxHighlightMatch\">$2</span>");
		return ret;
	}, _escapeHtml:function (str) {
		str = String(str).replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
		return str;
	}, open:function () {
		this._isShowingNow = true;
		return dijit.popup.open({popup:this._popupWidget, around:this.domNode, parent:this});
	}, reset:function () {
		this.item = null;
		this.inherited(arguments);
	}, labelFunc:function (item, store) {
		return store.getValue(item, this.searchAttr).toString();
	}});
	dojo.declare("dijit.form._ComboBoxMenu", [dijit._Widget, dijit._Templated], {templateString:"<ul class='dijitReset dijitMenu' dojoAttachEvent='onmousedown:_onMouseDown,onmouseup:_onMouseUp,onmouseover:_onMouseOver,onmouseout:_onMouseOut' tabIndex='-1' style='overflow: \"auto\"; overflow-x: \"hidden\";'>" + "<li class='dijitMenuItem dijitMenuPreviousButton' dojoAttachPoint='previousButton' waiRole='option'></li>" + "<li class='dijitMenuItem dijitMenuNextButton' dojoAttachPoint='nextButton' waiRole='option'></li>" + "</ul>", _messages:null, postMixInProperties:function () {
		this._messages = dojo.i18n.getLocalization("dijit.form", "ComboBox", this.lang);
		this.inherited(arguments);
	}, _setValueAttr:function (value) {
		this.value = value;
		this.onChange(value);
	}, onChange:function (value) {
	}, onPage:function (direction) {
	}, postCreate:function () {
		this.previousButton.innerHTML = this._messages["previousMessage"];
		this.nextButton.innerHTML = this._messages["nextMessage"];
		this.inherited(arguments);
	}, onClose:function () {
		this._blurOptionNode();
	}, _createOption:function (item, labelFunc) {
		var labelObject = labelFunc(item);
		var menuitem = dojo.doc.createElement("li");
		dijit.setWaiRole(menuitem, "option");
		if (labelObject.html) {
			menuitem.innerHTML = labelObject.label;
		} else {
			menuitem.appendChild(dojo.doc.createTextNode(labelObject.label));
		}
		if (menuitem.innerHTML == "") {
			menuitem.innerHTML = "&nbsp;";
		}
		menuitem.item = item;
		return menuitem;
	}, createOptions:function (results, dataObject, labelFunc) {
		this.previousButton.style.display = (dataObject.start == 0) ? "none" : "";
		dojo.attr(this.previousButton, "id", this.id + "_prev");
		dojo.forEach(results, function (item, i) {
			var menuitem = this._createOption(item, labelFunc);
			menuitem.className = "dijitReset dijitMenuItem";
			dojo.attr(menuitem, "id", this.id + i);
			this.domNode.insertBefore(menuitem, this.nextButton);
		}, this);
		var displayMore = false;
		if (dataObject._maxOptions && dataObject._maxOptions != -1) {
			if ((dataObject.start + dataObject.count) < dataObject._maxOptions) {
				displayMore = true;
			} else {
				if ((dataObject.start + dataObject.count) > (dataObject._maxOptions - 1)) {
					if (dataObject.count == results.length) {
						displayMore = true;
					}
				}
			}
		} else {
			if (dataObject.count == results.length) {
				displayMore = true;
			}
		}
		this.nextButton.style.display = displayMore ? "" : "none";
		dojo.attr(this.nextButton, "id", this.id + "_next");
		return this.domNode.childNodes;
	}, clearResultList:function () {
		while (this.domNode.childNodes.length > 2) {
			this.domNode.removeChild(this.domNode.childNodes[this.domNode.childNodes.length - 2]);
		}
	}, _onMouseDown:function (evt) {
		dojo.stopEvent(evt);
	}, _onMouseUp:function (evt) {
		if (evt.target === this.domNode) {
			return;
		} else {
			if (evt.target == this.previousButton) {
				this.onPage(-1);
			} else {
				if (evt.target == this.nextButton) {
					this.onPage(1);
				} else {
					var tgt = evt.target;
					while (!tgt.item) {
						tgt = tgt.parentNode;
					}
					this._setValueAttr({target:tgt}, true);
				}
			}
		}
	}, _onMouseOver:function (evt) {
		if (evt.target === this.domNode) {
			return;
		}
		var tgt = evt.target;
		if (!(tgt == this.previousButton || tgt == this.nextButton)) {
			while (!tgt.item) {
				tgt = tgt.parentNode;
			}
		}
		this._focusOptionNode(tgt);
	}, _onMouseOut:function (evt) {
		if (evt.target === this.domNode) {
			return;
		}
		this._blurOptionNode();
	}, _focusOptionNode:function (node) {
		if (this._highlighted_option != node) {
			this._blurOptionNode();
			this._highlighted_option = node;
			dojo.addClass(this._highlighted_option, "dijitMenuItemSelected");
		}
	}, _blurOptionNode:function () {
		if (this._highlighted_option) {
			dojo.removeClass(this._highlighted_option, "dijitMenuItemSelected");
			this._highlighted_option = null;
		}
	}, _highlightNextOption:function () {
		var fc = this.domNode.firstChild;
		if (!this.getHighlightedOption()) {
			this._focusOptionNode(fc.style.display == "none" ? fc.nextSibling : fc);
		} else {
			var ns = this._highlighted_option.nextSibling;
			if (ns && ns.style.display != "none") {
				this._focusOptionNode(ns);
			}
		}
		dijit.scrollIntoView(this._highlighted_option);
	}, highlightFirstOption:function () {
		this._focusOptionNode(this.domNode.firstChild.nextSibling);
		dijit.scrollIntoView(this._highlighted_option);
	}, highlightLastOption:function () {
		this._focusOptionNode(this.domNode.lastChild.previousSibling);
		dijit.scrollIntoView(this._highlighted_option);
	}, _highlightPrevOption:function () {
		var lc = this.domNode.lastChild;
		if (!this.getHighlightedOption()) {
			this._focusOptionNode(lc.style.display == "none" ? lc.previousSibling : lc);
		} else {
			var ps = this._highlighted_option.previousSibling;
			if (ps && ps.style.display != "none") {
				this._focusOptionNode(ps);
			}
		}
		dijit.scrollIntoView(this._highlighted_option);
	}, _page:function (up) {
		var scrollamount = 0;
		var oldscroll = this.domNode.scrollTop;
		var height = dojo.style(this.domNode, "height");
		if (!this.getHighlightedOption()) {
			this._highlightNextOption();
		}
		while (scrollamount < height) {
			if (up) {
				if (!this.getHighlightedOption().previousSibling || this._highlighted_option.previousSibling.style.display == "none") {
					break;
				}
				this._highlightPrevOption();
			} else {
				if (!this.getHighlightedOption().nextSibling || this._highlighted_option.nextSibling.style.display == "none") {
					break;
				}
				this._highlightNextOption();
			}
			var newscroll = this.domNode.scrollTop;
			scrollamount += (newscroll - oldscroll) * (up ? -1 : 1);
			oldscroll = newscroll;
		}
	}, pageUp:function () {
		this._page(true);
	}, pageDown:function () {
		this._page(false);
	}, getHighlightedOption:function () {
		var ho = this._highlighted_option;
		return (ho && ho.parentNode) ? ho : null;
	}, handleKey:function (key) {
		switch (key) {
		  case dojo.keys.DOWN_ARROW:
			this._highlightNextOption();
			break;
		  case dojo.keys.PAGE_DOWN:
			this.pageDown();
			break;
		  case dojo.keys.UP_ARROW:
			this._highlightPrevOption();
			break;
		  case dojo.keys.PAGE_UP:
			this.pageUp();
			break;
		}
	}});
	dojo.declare("dijit.form.ComboBox", [dijit.form.ValidationTextBox, dijit.form.ComboBoxMixin], {_setValueAttr:function (value, priorityChange, displayedValue) {
		this.item = null;
		if (!value) {
			value = "";
		}
		dijit.form.ValidationTextBox.prototype._setValueAttr.call(this, value, priorityChange, displayedValue);
	}});
	dojo.declare("dijit.form._ComboBoxDataStore", null, {constructor:function (root) {
		this.root = root;
		dojo.query("> option", root).forEach(function (node) {
			node.innerHTML = dojo.trim(node.innerHTML);
		});
	}, getValue:function (item, attribute, defaultValue) {
		return (attribute == "value") ? item.value : (item.innerText || item.textContent || "");
	}, isItemLoaded:function (something) {
		return true;
	}, getFeatures:function () {
		return {"dojo.data.api.Read":true, "dojo.data.api.Identity":true};
	}, _fetchItems:function (args, findCallback, errorCallback) {
		if (!args.query) {
			args.query = {};
		}
		if (!args.query.name) {
			args.query.name = "";
		}
		if (!args.queryOptions) {
			args.queryOptions = {};
		}
		var matcher = dojo.data.util.filter.patternToRegExp(args.query.name, args.queryOptions.ignoreCase), items = dojo.query("> option", this.root).filter(function (option) {
			return (option.innerText || option.textContent || "").match(matcher);
		});
		if (args.sort) {
			items.sort(dojo.data.util.sorter.createSortFunction(args.sort, this));
		}
		findCallback(items, args);
	}, close:function (request) {
		return;
	}, getLabel:function (item) {
		return item.innerHTML;
	}, getIdentity:function (item) {
		return dojo.attr(item, "value");
	}, fetchItemByIdentity:function (args) {
		var item = dojo.query("option[value='" + args.identity + "']", this.root)[0];
		args.onItem(item);
	}, fetchSelectedItem:function () {
		var root = this.root, si = root.selectedIndex;
		return dojo.query("> option:nth-child(" + (si != -1 ? si + 1 : 1) + ")", root)[0];
	}});
	dojo.extend(dijit.form._ComboBoxDataStore, dojo.data.util.simpleFetch);
}

