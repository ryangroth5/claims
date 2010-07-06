/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.editor.plugins.TablePlugins"]) {
	dojo._hasResource["dojox.editor.plugins.TablePlugins"] = true;
	dojo.provide("dojox.editor.plugins.TablePlugins");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dijit._editor.selection");
	dojo.require("dijit.Menu");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dojox.editor.plugins", "TableDialog", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,ko,nb,nl,pl,pt,pt-pt,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.experimental("dojox.editor.plugins.TablePlugins");
	dojo.declare("dojox.editor.plugins.GlobalTableHandler", dijit._editor._Plugin, {tablesConnected:false, currentlyAvailable:false, alwaysAvailable:false, availableCurrentlySet:false, initialized:false, tableData:null, shiftKeyDown:false, editorDomNode:null, undoEnabled:dojo.isIE, doMixins:function () {
		dojo.mixin(this.editor, {getAncestorElement:function (tagName) {
			return dojo.withGlobal(this.window, "getAncestorElement", dijit._editor.selection, [tagName]);
		}, hasAncestorElement:function (tagName) {
			return true;
			return dojo.withGlobal(this.window, "hasAncestorElement", dijit._editor.selection, [tagName]);
		}, selectElement:function (elem) {
			dojo.withGlobal(this.window, "selectElement", dijit._editor.selection, [elem]);
		}, byId:function (id) {
			return dojo.withGlobal(this.window, "byId", dojo, [id]);
		}, query:function (arg, scope, returnFirstOnly) {
			var ar = dojo.withGlobal(this.window, "query", dojo, [arg, scope]);
			return (returnFirstOnly) ? ar[0] : ar;
		}});
	}, initialize:function (editor) {
		if (this.initialized) {
			return;
		}
		this.initialized = true;
		this.editor = editor;
		editor.onLoadDeferred.addCallback(dojo.hitch(this, function () {
			this.editorDomNode = this.editor.editNode || this.editor.iframe.document.body.firstChild;
			dojo.connect(this.editorDomNode, "mouseup", this.editor, "onClick");
			dojo.connect(this.editor, "onDisplayChanged", this, "checkAvailable");
			this.doMixins();
			this.connectDraggable();
		}));
	}, getTableInfo:function (forceNewData) {
		if (forceNewData) {
			this._tempStoreTableData(false);
		}
		if (this.tableData) {
			console.log("returning current tableData:", this.tableData);
			return this.tableData;
		}
		var tr, trs, td, tds, tbl, cols, tdIndex, trIndex;
		td = this.editor.getAncestorElement("td");
		if (td) {
			tr = td.parentNode;
		}
		tbl = this.editor.getAncestorElement("table");
		tds = dojo.query("td", tbl);
		tds.forEach(function (d, i) {
			if (td == d) {
				tdIndex = i;
			}
		});
		trs = dojo.query("tr", tbl);
		trs.forEach(function (r, i) {
			if (tr == r) {
				trIndex = i;
			}
		});
		cols = tds.length / trs.length;
		var o = {tbl:tbl, td:td, tr:tr, trs:trs, tds:tds, rows:trs.length, cols:cols, tdIndex:tdIndex, trIndex:trIndex, colIndex:tdIndex % cols};
		console.log("NEW tableData:", o);
		this.tableData = o;
		this._tempStoreTableData(500);
		return this.tableData;
	}, connectDraggable:function () {
		if (!dojo.isIE) {
			return;
		}
		this.editorDomNode.ondragstart = dojo.hitch(this, "onDragStart");
		this.editorDomNode.ondragend = dojo.hitch(this, "onDragEnd");
	}, onDragStart:function () {
		var e = window.event;
		if (!e.srcElement.id) {
			e.srcElement.id = "tbl_" + (new Date().getTime());
		}
	}, onDragEnd:function () {
		var e = window.event;
		var node = e.srcElement;
		var id = node.id;
		var win = this.editor.window;
		if (node.tagName.toLowerCase() == "table") {
			setTimeout(function () {
				var node = dojo.withGlobal(win, "byId", dojo, [id]);
				dojo.removeAttr(node, "align");
			}, 100);
		}
	}, checkAvailable:function () {
		if (this.availableCurrentlySet) {
			return this.currentlyAvailable;
		}
		if (!this.editor) {
			return false;
		}
		if (this.alwaysAvailable) {
			return true;
		}
		this.currentlyAvailable = this.editor.hasAncestorElement("table");
		if (this.currentlyAvailable) {
			this.connectTableKeys();
		} else {
			this.disconnectTableKeys();
		}
		this._tempAvailability(500);
		dojo.publish("available", [this.currentlyAvailable]);
		return this.currentlyAvailable;
	}, _prepareTable:function (tbl) {
		var tds = this.editor.query("td", tbl);
		console.log("prep:", tds, tbl);
		if (!tds[0].id) {
			tds.forEach(function (td, i) {
				if (!td.id) {
					td.id = "tdid" + i + this.getTimeStamp();
				}
			}, this);
		}
		return tds;
	}, getTimeStamp:function () {
		return Math.floor(new Date().getTime() * 1e-8);
	}, _tempStoreTableData:function (type) {
		if (type === true) {
		} else {
			if (type === false) {
				this.tableData = null;
			} else {
				if (type === undefined) {
					console.warn("_tempStoreTableData must be passed an argument");
				} else {
					setTimeout(dojo.hitch(this, function () {
						this.tableData = null;
					}), type);
				}
			}
		}
	}, _tempAvailability:function (type) {
		if (type === true) {
			this.availableCurrentlySet = true;
		} else {
			if (type === false) {
				this.availableCurrentlySet = false;
			} else {
				if (type === undefined) {
					console.warn("_tempAvailability must be passed an argument");
				} else {
					this.availableCurrentlySet = true;
					setTimeout(dojo.hitch(this, function () {
						this.availableCurrentlySet = false;
					}), type);
				}
			}
		}
	}, connectTableKeys:function () {
		if (this.tablesConnected) {
			return;
		}
		this.tablesConnected = true;
		var node = (this.editor.iframe) ? this.editor.document : this.editor.editNode;
		this.cnKeyDn = dojo.connect(node, "onkeydown", this, "onKeyDown");
		this.cnKeyUp = dojo.connect(node, "onkeyup", this, "onKeyUp");
		dojo.connect(node, "onkeypress", this, "onKeyUp");
	}, disconnectTableKeys:function () {
		dojo.disconnect(this.cnKeyDn);
		dojo.disconnect(this.cnKeyUp);
		this.tablesConnected = false;
	}, onKeyDown:function (evt) {
		var key = evt.keyCode;
		if (key == 16) {
			this.shiftKeyDown = true;
		}
		if (key == 9) {
			console.log("TAB!:");
			var o = this.getTableInfo();
			o.tdIndex = (this.shiftKeyDown) ? o.tdIndex - 1 : tabTo = o.tdIndex + 1;
			if (o.tdIndex >= 0 && o.tdIndex < o.tds.length) {
				this.editor.selectElement(o.tds[o.tdIndex]);
				this.currentlyAvailable = true;
				this._tempAvailability(true);
				this._tempStoreTableData(true);
				this.stopEvent = true;
			} else {
				this.stopEvent = false;
				this.onDisplayChanged();
			}
			if (this.stopEvent) {
				dojo.stopEvent(evt);
			}
		}
	}, onKeyUp:function (evt) {
		var key = evt.keyCode;
		if (key == 16) {
			this.shiftKeyDown = false;
		}
		if (key == 37 || key == 38 || key == 39 || key == 40) {
			this.onDisplayChanged();
		}
		if (key == 9 && this.stopEvent) {
			dojo.stopEvent(evt);
		}
	}, onDisplayChanged:function () {
		this.currentlyAvailable = false;
		this._tempStoreTableData(false);
		this._tempAvailability(false);
		this.checkAvailable();
	}});
	tablePluginHandler = new dojox.editor.plugins.GlobalTableHandler();
	dojo.declare("dojox.editor.plugins.TablePlugins", dijit._editor._Plugin, {iconClassPrefix:"editorIcon", useDefaultCommand:false, buttonClass:dijit.form.Button, commandName:"", label:"", alwaysAvailable:false, undoEnabled:false, constructor:function () {
		switch (this.commandName) {
		  case "colorTableCell":
			this.buttonClass = dijit.form.DropDownButton;
			this.dropDown = new dijit.ColorPalette();
			this.connect(this.dropDown, "onChange", function (color) {
				this.modTable(null, color);
			});
			break;
		  case "modifyTable":
			this.buttonClass = dijit.form.Button;
			this.modTable = this.launchModifyDialog;
			break;
		  case "insertTable":
			this.alwaysAvailable = true;
			this.buttonClass = dijit.form.Button;
			this.modTable = this.launchInsertDialog;
			break;
		  case "tableContextMenu":
			this.connect(this, "setEditor", function (editor) {
				editor.onLoadDeferred.addCallback(dojo.hitch(this, function () {
					this._createContextMenu();
				}));
				this.button.domNode.style.display = "none";
			});
			break;
		}
		dojo.subscribe("available", this, "onDisplayChanged");
	}, onDisplayChanged:function (withinTable) {
		if (!this.alwaysAvailable) {
			this.available = withinTable;
			this.button.attr("disabled", !this.available);
		}
	}, setEditor:function () {
		this.inherited(arguments);
		this.onEditorLoaded();
	}, onEditorLoaded:function () {
		tablePluginHandler.initialize(this.editor);
	}, _createContextMenu:function () {
		var node = dojo.isMoz ? this.editor.editNode : this.editorDomNode;
		var pMenu = new dijit.Menu({targetNodeIds:[node], id:"progMenu", contextMenuForWindow:dojo.isIE});
		var _M = dijit.MenuItem;
		var messages = dojo.i18n.getLocalization("dojox.editor.plugins", "TableDialog", this.lang);
		pMenu.addChild(new _M({label:messages.selectTableLabel, onClick:dojo.hitch(this, "selectTable")}));
		pMenu.addChild(new dijit.MenuSeparator());
		pMenu.addChild(new _M({label:messages.insertTableRowBeforeLabel, onClick:dojo.hitch(this, "modTable", "insertTableRowBefore")}));
		pMenu.addChild(new _M({label:messages.insertTableRowAfterLabel, onClick:dojo.hitch(this, "modTable", "insertTableRowAfter")}));
		pMenu.addChild(new _M({label:messages.insertTableColumnBeforeLabel, onClick:dojo.hitch(this, "modTable", "insertTableColumnBefore")}));
		pMenu.addChild(new _M({label:messages.insertTableColumnAfterLabel, onClick:dojo.hitch(this, "modTable", "insertTableColumnAfter")}));
		pMenu.addChild(new dijit.MenuSeparator());
		pMenu.addChild(new _M({label:messages.deleteTableRowLabel, onClick:dojo.hitch(this, "modTable", "deleteTableRow")}));
		pMenu.addChild(new _M({label:messages.deleteTableColumnLabel, onClick:dojo.hitch(this, "modTable", "deleteTableColumn")}));
		pMenu._openMyself = function (e) {
			if (!tablePluginHandler.checkAvailable()) {
				return;
			}
			if (this.leftClickToOpen && e.button > 0) {
				return;
			}
			dojo.stopEvent(e);
			var x, y;
			if (dojo.isIE) {
				x = e.x;
				y = e.y;
			} else {
				x = e.screenX;
				y = e.screenY + 25;
			}
			var self = this;
			var savedFocus = dijit.getFocus(this);
			function closeAndRestoreFocus() {
				dijit.focus(savedFocus);
				dijit.popup.close(self);
			}
			var res = dijit.popup.open({popup:this, x:x, y:y, onExecute:closeAndRestoreFocus, onCancel:closeAndRestoreFocus, orient:this.isLeftToRight() ? "L" : "R"});
			var v = dijit.getViewport();
			if (res.y + res.h > v.h) {
				if (e.screenY - res.h >= 0) {
					y = e.screenY - res.h;
				} else {
					y = 0;
				}
				dijit.popup.close(this);
				res = dijit.popup.open({popup:this, x:x, y:y, onExecute:closeAndRestoreFocus, onCancel:closeAndRestoreFocus, orient:this.isLeftToRight() ? "L" : "R"});
			}
			console.log(dijit.getViewport());
			this.focus();
			this._onBlur = function () {
				this.inherited("_onBlur", arguments);
				dijit.popup.close(this);
			};
		};
		this.menu = pMenu;
	}, selectTable:function () {
		var o = this.getTableInfo();
		dojo.withGlobal(this.editor.window, "selectElement", dijit._editor.selection, [o.tbl]);
	}, launchInsertDialog:function () {
		var w = new dojox.editor.plugins.EditorTableDialog({});
		w.show();
		var c = dojo.connect(w, "onBuildTable", this, function (obj) {
			dojo.disconnect(c);
			var res = this.editor.execCommand("inserthtml", obj.htmlText);
		});
	}, launchModifyDialog:function () {
		var o = this.getTableInfo();
		console.log("LAUNCH DIALOG");
		var w = new dojox.editor.plugins.EditorModifyTableDialog({table:o.tbl});
		w.show();
		this.connect(w, "onSetTable", function (color) {
			var o = this.getTableInfo();
			console.log("set color:", color);
			dojo.attr(o.td, "bgcolor", color);
		});
	}, _initButton:function () {
		this.command = this.commandName;
		this.label = this.editor.commands[this.command] = this._makeTitle(this.command);
		this.inherited(arguments);
		delete this.command;
		if (this.commandName != "colorTableCell") {
			this.connect(this.button.domNode, "click", "modTable");
		}
		if (this.commandName == "tableContextMenu") {
			this.button.domNode.display = "none";
		}
		this.onDisplayChanged(false);
	}, modTable:function (cmd, args) {
		this.begEdit();
		var o = this.getTableInfo();
		var sw = (dojo.isString(cmd)) ? cmd : this.commandName;
		var r, c, i;
		var adjustColWidth = false;
		switch (sw) {
		  case "insertTableRowBefore":
			r = o.tbl.insertRow(o.trIndex);
			for (i = 0; i < o.cols; i++) {
				c = r.insertCell(-1);
				c.innerHTML = "&nbsp;";
			}
			break;
		  case "insertTableRowAfter":
			r = o.tbl.insertRow(o.trIndex + 1);
			for (i = 0; i < o.cols; i++) {
				c = r.insertCell(-1);
				c.innerHTML = "&nbsp;";
			}
			break;
		  case "insertTableColumnBefore":
			o.trs.forEach(function (r) {
				c = r.insertCell(o.colIndex);
				c.innerHTML = "&nbsp;";
			});
			adjustColWidth = true;
			break;
		  case "insertTableColumnAfter":
			o.trs.forEach(function (r) {
				c = r.insertCell(o.colIndex + 1);
				c.innerHTML = "&nbsp;";
			});
			adjustColWidth = true;
			break;
		  case "deleteTableRow":
			o.tbl.deleteRow(o.trIndex);
			console.log("TableInfo:", this.getTableInfo());
			break;
		  case "deleteTableColumn":
			o.trs.forEach(function (tr) {
				tr.deleteCell(o.colIndex);
			});
			adjustColWidth = true;
			break;
		  case "colorTableCell":
			var tds = this.getSelectedCells(o.tbl);
			dojo.forEach(tds, function (td) {
				dojo.style(td, "backgroundColor", args);
			});
			break;
		  case "modifyTable":
			break;
		  case "insertTable":
			break;
		}
		if (adjustColWidth) {
			this.makeColumnsEven();
		}
		this.endEdit();
	}, begEdit:function () {
		if (tablePluginHandler.undoEnabled) {
			console.log("UNDO:", this.editor.customUndo);
			if (this.editor.customUndo) {
				this.editor.beginEditing();
			} else {
				this.valBeforeUndo = this.editor.getValue();
				console.log("VAL:", this.valBeforeUndo);
			}
		}
	}, endEdit:function () {
		if (tablePluginHandler.undoEnabled) {
			if (this.editor.customUndo) {
				this.editor.endEditing();
			} else {
				var afterUndo = this.editor.getValue();
				this.editor.setValue(this.valBeforeUndo);
				this.editor.replaceValue(afterUndo);
			}
			this.editor.onDisplayChanged();
		}
	}, makeColumnsEven:function () {
		setTimeout(dojo.hitch(this, function () {
			var o = this.getTableInfo(true);
			var w = Math.floor(100 / o.cols);
			o.tds.forEach(function (d) {
				dojo.attr(d, "width", w + "%");
			});
		}), 10);
	}, getTableInfo:function (forceNewData) {
		return tablePluginHandler.getTableInfo(forceNewData);
	}, _makeTitle:function (str) {
		var s = str.split(""), ns = [];
		dojo.forEach(str, function (c, i) {
			if (c.charCodeAt(0) < 91 && i > 0 && ns[i - 1].charCodeAt(0) != 32) {
				ns.push(" ");
			}
			if (i == 0) {
				c = c.toUpperCase();
			}
			ns.push(c);
		});
		return ns.join("");
	}, getSelectedCells:function () {
		var cells = [];
		var tbl = this.getTableInfo().tbl;
		var tds = tablePluginHandler._prepareTable(tbl);
		var e = this.editor;
		var r;
		if (!dojo.isIE) {
			r = dijit.range.getSelection(e.window);
			var foundFirst = false;
			var foundLast = false;
			if (r.anchorNode && r.anchorNode.tagName && r.anchorNode.tagName.toLowerCase() == "tr") {
				var trs = dojo.query("tr", tbl);
				var rows = [];
				trs.forEach(function (tr, i) {
					if (!foundFirst && (tr == r.anchorNode || tr == r.focusNode)) {
						rows.push(tr);
						foundFirst = true;
						if (r.anchorNode == r.focusNode) {
							foundLast = true;
						}
					} else {
						if (foundFirst && !foundLast) {
							rows.push(tr);
							if (tr == r.anchorNode || tr == r.focusNode) {
								foundLast = true;
							}
						}
					}
				});
				dojo.forEach(rows, function (tr) {
					cells = cells.concat(dojo.query("td", tr));
				}, this);
			} else {
				tds.forEach(function (td, i) {
					if (!foundFirst && (td.id == r.anchorNode.parentNode.id || td.id == r.focusNode.parentNode.id)) {
						cells.push(td);
						foundFirst = true;
						if (r.anchorNode.parentNode.id == r.focusNode.parentNode.id) {
							foundLast = true;
						}
					} else {
						if (foundFirst && !foundLast) {
							cells.push(td);
							if (td.id == r.focusNode.parentNode.id || td.id == r.anchorNode.parentNode.id) {
								foundLast = true;
							}
						}
					}
				});
				console.log("SAF CELLS:", cells);
			}
		}
		if (dojo.isIE) {
			r = document.selection.createRange();
			var str = r.htmlText.match(/id=\w*/g);
			dojo.forEach(str, function (a) {
				var id = a.substring(3, a.length);
				cells.push(e.byId(id));
			}, this);
		}
		return cells;
	}});
	dojo.provide("dojox.editor.plugins.EditorTableDialog");
	dojo.require("dijit.Dialog");
	dojo.require("dijit.form.TextBox");
	dojo.require("dijit.form.FilteringSelect");
	dojo.require("dijit.form.Button");
	dojo.declare("dojox.editor.plugins.EditorTableDialog", [dijit.Dialog], {baseClass:"EditorTableDialog", widgetsInTemplate:true, templateString:dojo.cache("dojox.editor.plugins", "resources/insertTable.html", "<div class=\"dijitDialog\" tabindex=\"-1\" waiRole=\"dialog\" waiState=\"labelledby-${id}_title\">\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\">\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\" id=\"${id}_title\">${insertTableTitle}</span>\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\" title=\"${buttonCancel}\">\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\" title=\"${buttonCancel}\">x</span>\n\t</span>\n\t</div>\n	<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\n		<table class=\"etdTable\"><tr>\n			<td class=\"left\">\n				<span dojoAttachPoint=\"selectRow\" dojoType=\"dijit.form.TextBox\" value=\"2\"></span>\n				<label>${rows}</label>\n			</td><td class=\"right\">\n				<span dojoAttachPoint=\"selectCol\" dojoType=\"dijit.form.TextBox\" value=\"2\"></span>\n				<label>${columns}</label>\n			</td></tr><tr><td>\n				<span dojoAttachPoint=\"selectWidth\" dojoType=\"dijit.form.TextBox\" value=\"100\"></span>\n				<label>${tableWidth}</label>\n			</td><td>\n				<select dojoAttachPoint=\"selectWidthType\" hasDownArrow=\"true\" dojoType=\"dijit.form.FilteringSelect\">\n				  <option value=\"percent\">${percent}</option>\n				  <option value=\"pixels\">${pixels}</option>\n				</select></td></tr>\n		  <tr><td>\n				<span dojoAttachPoint=\"selectBorder\" dojoType=\"dijit.form.TextBox\" value=\"1\"></span>\n				<label>${borderThickness}</label></td>\n			<td>\n				${pixels}\n			</td></tr><tr><td>\n				<span dojoAttachPoint=\"selectPad\" dojoType=\"dijit.form.TextBox\" value=\"0\"></span>\n				<label>${cellPadding}</label></td>\n			<td class=\"cellpad\"></td></tr><tr><td>\n				<span dojoAttachPoint=\"selectSpace\" dojoType=\"dijit.form.TextBox\" value=\"0\"></span>\n				<label>${cellSpacing}</label>\n			</td><td class=\"cellspace\"></td></tr></table>\n		<div class=\"dialogButtonContainer\">\n			<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick: onInsert\">${buttonInsert}</div>\n			<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick: onCancel\">${buttonCancel}</div>\n		</div>\n\t</div>\n</div>\n"), postMixInProperties:function () {
		var messages = dojo.i18n.getLocalization("dojox.editor.plugins", "TableDialog", this.lang);
		dojo.mixin(this, messages);
		this.inherited(arguments);
	}, postCreate:function () {
		dojo.addClass(this.domNode, this.baseClass);
		this.inherited(arguments);
	}, onInsert:function () {
		console.log("insert");
		var rows = this.selectRow.attr("value") || 1, cols = this.selectCol.attr("value") || 1, width = this.selectWidth.attr("value"), widthType = this.selectWidthType.attr("value"), border = this.selectBorder.attr("value"), pad = this.selectPad.attr("value"), space = this.selectSpace.attr("value"), _id = "tbl_" + (new Date().getTime()), t = "<table id=\"" + _id + "\"width=\"" + width + ((widthType == "percent") ? "%" : "") + "\" border=\"" + border + "\" cellspacing=\"" + space + "\" cellpadding=\"" + pad + "\">\n";
		for (var r = 0; r < rows; r++) {
			t += "\t<tr>\n";
			for (var c = 0; c < cols; c++) {
				t += "\t\t<td width=\"" + (Math.floor(100 / cols)) + "%\">&nbsp;</td>\n";
			}
			t += "\t</tr>\n";
		}
		t += "</table>";
		this.onBuildTable({htmlText:t, id:_id});
		this.hide();
	}, onBuildTable:function (tableText) {
	}});
	dojo.provide("dojox.editor.plugins.EditorModifyTableDialog");
	dojo.require("dijit.ColorPalette");
	dojo.declare("dojox.editor.plugins.EditorModifyTableDialog", [dijit.Dialog], {baseClass:"EditorTableDialog", widgetsInTemplate:true, table:null, tableAtts:{}, templateString:dojo.cache("dojox.editor.plugins", "resources/modifyTable.html", "<div class=\"dijitDialog\" tabindex=\"-1\" waiRole=\"dialog\" waiState=\"labelledby-${id}_title\">\n\t<div dojoAttachPoint=\"titleBar\" class=\"dijitDialogTitleBar\">\n\t<span dojoAttachPoint=\"titleNode\" class=\"dijitDialogTitle\" id=\"${id}_title\">${modifyTableTitle}</span>\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\" title=\"${buttonCancel}\">\n\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\" title=\"${buttonCancel}\">x</span>\n\t</span>\n\t</div>\n	<div dojoAttachPoint=\"containerNode\" class=\"dijitDialogPaneContent\">\n		<table class=\"etdTable\">\n		  <tr><td class=\"left\">\n				<span class=\"colorSwatchBtn\" dojoAttachPoint=\"backgroundCol\"></span>\n				<label>${backgroundColor}</label>\n			</td><td class=\"right\">\n				<span class=\"colorSwatchBtn\" dojoAttachPoint=\"borderCol\"></span>\n				<label>${borderColor}</label>\n			</td></tr><tr><td>\n				<span dojoAttachPoint=\"selectBorder\" dojoType=\"dijit.form.TextBox\" value=\"1\"></span>\n				<label>${borderThickness}</label>\n			</td><td>\n			${pixels}\n			</td></tr><tr><td>\n				<select class=\"floatDijit\" dojoAttachPoint=\"selectAlign\" dojoType=\"dijit.form.FilteringSelect\">\n				  <option value=\"default\">${default}</option>\n				  <option value=\"left\">${left}</option>\n				  <option value=\"center\">${center}</option>\n				  <option value=\"right\">${right}</option>\n				</select>\n				<label>${align}</label>\n			</td><td></td></tr><tr><td>\n				<span dojoAttachPoint=\"selectWidth\" dojoType=\"dijit.form.TextBox\" value=\"100\"></span>\n				<label>${tableWidth}</label>\n			</td><td>\n				<select dojoAttachPoint=\"selectWidthType\" hasDownArrow=\"true\" dojoType=\"dijit.form.FilteringSelect\">\n				  <option value=\"percent\">${percent}</option>\n				  <option value=\"pixels\">${pixels}</option>\n				</select>\n				</td></tr><tr><td>\n				<span dojoAttachPoint=\"selectPad\" dojoType=\"dijit.form.TextBox\" value=\"0\"></span>\n				<label>${cellPadding}</label></td>\n			<td class=\"cellpad\"></td></tr><tr><td>\n				<span dojoAttachPoint=\"selectSpace\" dojoType=\"dijit.form.TextBox\" value=\"0\"></span>\n				<label>${cellSpacing}</label>\n			</td><td class=\"cellspace\"></td></tr>\n		</table>\n		<div class=\"dialogButtonContainer\">\n			<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick: onSet\">${buttonSet}</div>\n			<div dojoType=\"dijit.form.Button\" dojoAttachEvent=\"onClick: onCancel\">${buttonCancel}</div>\n		</div>\n\t</div>\n</div>\n"), postMixInProperties:function () {
		var messages = dojo.i18n.getLocalization("dojox.editor.plugins", "TableDialog", this.lang);
		dojo.mixin(this, messages);
		this.inherited(arguments);
	}, postCreate:function () {
		dojo.addClass(this.domNode, this.baseClass);
		this.inherited(arguments);
		this.connect(this.borderCol, "click", function () {
			var div = document.createElement("div");
			var w = new dijit.ColorPalette({}, div);
			dijit.popup.open({popup:w, around:this.borderCol});
			this.connect(w, "onChange", function (color) {
				dijit.popup.close(w);
				this.setBrdColor(color);
			});
		});
		this.connect(this.backgroundCol, "click", function () {
			var div = document.createElement("div");
			var w = new dijit.ColorPalette({}, div);
			dijit.popup.open({popup:w, around:this.backgroundCol});
			this.connect(w, "onChange", function (color) {
				dijit.popup.close(w);
				this.setBkColor(color);
			});
		});
		this.setBrdColor(dojo.attr(this.table, "bordercolor"));
		this.setBkColor(dojo.attr(this.table, "bgcolor"));
		var w = dojo.attr(this.table, "width");
		var p = "pixels";
		if (w.indexOf("%") > -1) {
			p = "percent";
			w = w.replace(/%/, "");
		}
		this.selectWidth.attr("value", w);
		this.selectWidthType.attr("value", p);
		this.selectBorder.attr("value", dojo.attr(this.table, "border"));
		this.selectPad.attr("value", dojo.attr(this.table, "cellpadding"));
		this.selectSpace.attr("value", dojo.attr(this.table, "cellspacing"));
		this.selectAlign.attr("value", dojo.attr(this.table, "align"));
	}, setBrdColor:function (color) {
		this.brdColor = color;
		dojo.style(this.borderCol, "backgroundColor", color);
	}, setBkColor:function (color) {
		this.bkColor = color;
		dojo.style(this.backgroundCol, "backgroundColor", color);
	}, onSet:function () {
		dojo.attr(this.table, "bordercolor", this.brdColor);
		dojo.attr(this.table, "bgcolor", this.bkColor);
		dojo.attr(this.table, "width", (this.selectWidth.attr("value") + ((this.selectWidthType.attr("value") == "pixels") ? "" : "%")));
		dojo.attr(this.table, "border", this.selectBorder.attr("value"));
		dojo.attr(this.table, "cellpadding", this.selectPad.attr("value"));
		dojo.attr(this.table, "cellspacing", this.selectSpace.attr("value"));
		dojo.attr(this.table, "align", this.selectAlign.attr("value"));
		this.hide();
	}, onSetTable:function (tableText) {
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		if (o.args && o.args.command) {
			var cmd = o.args.command.charAt(0).toLowerCase() + o.args.command.substring(1, o.args.command.length);
			switch (cmd) {
			  case "insertTableRowBefore":
			  case "insertTableRowAfter":
			  case "insertTableColumnBefore":
			  case "insertTableColumnAfter":
			  case "deleteTableRow":
			  case "deleteTableColumn":
			  case "colorTableCell":
			  case "modifyTable":
			  case "insertTable":
			  case "tableContextMenu":
				o.plugin = new dojox.editor.plugins.TablePlugins({commandName:cmd});
				break;
			}
		}
	});
}

