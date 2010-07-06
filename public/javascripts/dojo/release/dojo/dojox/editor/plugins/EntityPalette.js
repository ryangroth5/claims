/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.editor.plugins.EntityPalette"]) {
	dojo._hasResource["dojox.editor.plugins.EntityPalette"] = true;
	dojo.provide("dojox.editor.plugins.EntityPalette");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dojox.editor.plugins", "latinEntities", null, "ROOT,cs,de,es,fr,hu,it,ja,ko,pl,pt,ru,zh,zh-tw");
	dojo.experimental("dojox.editor.plugins.EntityPalette");
	dojo.declare("dojox.editor.plugins.EntityPalette", [dijit._Widget, dijit._Templated], {templateString:"<div class=\"dojoxEntityPalette\">\n" + "\t<table>\n" + "\t\t<tbody>\n" + "\t\t\t<tr>\n" + "\t\t\t\t<td>\n" + "\t\t\t\t\t<table class=\"dojoxEntityPaletteTable\"  waiRole=\"grid\" tabIndex=\"${tabIndex}\">\n" + "\t\t\t\t\t\t<tbody dojoAttachPoint=\"tableNode\"></tbody>\n" + "\t\t\t\t\t</table>\n" + "\t\t\t\t</td>\n" + "\t\t\t</tr>\n" + "\t\t\t<tr>\n" + "\t\t\t\t<td>\n" + "\t\t\t\t\t<table dojoAttachPoint=\"previewPane\" class=\"dojoxEntityPalettePreviewTable\">\n" + "\t\t\t\t\t\t<tbody>\n" + "\t\t\t\t\t	\t<tr>\n" + "\t\t\t\t\t\t\t\t<th class=\"dojoxEntityPalettePreviewHeader\">Preview</th>\n" + "\t\t\t\t\t\t\t\t<th class=\"dojoxEntityPalettePreviewHeader\" dojoAttachPoint=\"codeHeader\">Code</th>\n" + "\t\t\t\t\t\t\t\t<th class=\"dojoxEntityPalettePreviewHeader\" dojoAttachPoint=\"entityHeader\">Name</th>\n" + "\t\t\t\t\t\t\t\t<th class=\"dojoxEntityPalettePreviewHeader\">Description</th>\n" + "\t\t\t\t\t\t\t</tr>\n" + "\t\t\t\t\t\t\t<tr>\n" + "\t\t\t\t\t\t\t\t<td class=\"dojoxEntityPalettePreviewDetailEntity\" dojoAttachPoint=\"previewNode\"></td>\n" + "\t\t\t\t\t\t\t\t<td class=\"dojoxEntityPalettePreviewDetail\" dojoAttachPoint=\"codeNode\"></td>\n" + "\t\t\t\t\t\t\t\t<td class=\"dojoxEntityPalettePreviewDetail\" dojoAttachPoint=\"entityNode\"></td>\n" + "\t\t\t\t\t\t\t\t<td class=\"dojoxEntityPalettePreviewDetail\" dojoAttachPoint=\"descNode\"></td>\n" + "\t\t\t\t\t\t\t</tr>\n" + "\t\t\t\t\t\t</tbody>\n" + "\t\t\t\t\t</table>\n" + "\t\t\t\t</td>\n" + "\t\t\t</tr>\n" + "\t\t</tbody>\n" + "\t</table>\n" + "</div>", defaultTimeout:500, timeoutChangeRate:0.9, showPreview:true, showCode:false, showEntityName:false, palette:"latin", value:null, _currentFocus:0, _xDim:null, _yDim:null, tabIndex:"0", _created:false, postCreate:function () {
		if (!this._created) {
			this._created = true;
			this.domNode.style.position = "relative";
			this._cellNodes = [];
			this.entities = {};
			this.entities[this.palette] = dojo.i18n.getLocalization("dojox.editor.plugins", "latinEntities");
			var choices = this.entities[this.palette];
			var numChoices = 0;
			var entityKey;
			for (entityKey in choices) {
				numChoices++;
			}
			var choicesPerRow = Math.floor(Math.sqrt(numChoices));
			var numRows = choicesPerRow;
			var currChoiceIdx = 0;
			var rowNode = null;
			var cellNode;
			dojo.style(this.codeHeader, "display", this.showCode ? "" : "none");
			dojo.style(this.codeNode, "display", this.showCode ? "" : "none");
			dojo.style(this.entityHeader, "display", this.showEntityName ? "" : "none");
			dojo.style(this.entityNode, "display", this.showEntityName ? "" : "none");
			for (entityKey in choices) {
				var newRow = currChoiceIdx % numRows === 0;
				if (newRow) {
					rowNode = dojo.create("tr", {tabIndex:"-1"});
				}
				var entityHtml = "&" + entityKey + ";";
				cellNode = dojo.create("td", {innerHTML:entityHtml, tabIndex:"-1", "class":"dojoxEntityPaletteCell"}, rowNode);
				dojo.forEach(["Dijitclick", "MouseEnter", "Focus", "Blur"], function (handler) {
					this.connect(cellNode, "on" + handler.toLowerCase(), "_onCell" + handler);
				}, this);
				if (newRow) {
					dojo.place(rowNode, this.tableNode);
				}
				dijit.setWaiRole(cellNode, "gridcell");
				cellNode.index = this._cellNodes.length;
				this._cellNodes.push({node:cellNode, html:entityHtml});
				currChoiceIdx++;
			}
			var remainder = choicesPerRow - (numChoices % choicesPerRow);
			while (remainder > 0) {
				cellNode = dojo.create("td", {innerHTML:"", tabIndex:"-1", "class":"dojoxEntityPaletteNullCell"}, rowNode);
				remainder--;
			}
			this._xDim = choicesPerRow;
			this._yDim = numRows;
			this.connect(this.tableNode, "onfocus", "_onTableNodeFocus");
			var keyIncrementMap = {UP_ARROW:-this._xDim, DOWN_ARROW:this._xDim, RIGHT_ARROW:1, LEFT_ARROW:-1};
			for (var key in keyIncrementMap) {
				this._connects.push(dijit.typematic.addKeyListener(this.domNode, {charOrCode:dojo.keys[key], ctrlKey:false, altKey:false, shiftKey:false}, this, function () {
					var increment = keyIncrementMap[key];
					return function (count) {
						this._navigateByKey(increment, count);
					};
				}(), this.timeoutChangeRate, this.defaultTimeout));
			}
			if (!this.showPreview) {
				dojo.style(this.previewNode, "display", "none");
			}
		}
	}, focus:function () {
		this._focusFirst();
	}, onChange:function (entity) {
	}, _focusFirst:function () {
		this._currentFocus = 0;
		var cellNode = this._cellNodes[this._currentFocus].node;
		setTimeout(function () {
			dijit.focus(cellNode);
		}, 25);
	}, _onTableNodeFocus:function (evt) {
		if (evt.target === this.tableNode) {
			this._focusFirst();
		}
	}, _onFocus:function () {
		dojo.attr(this.tableNode, "tabIndex", "-1");
	}, _onBlur:function () {
		this._removeCellHighlight(this._currentFocus);
		dojo.attr(this.tableNode, "tabIndex", this.tabIndex);
	}, _onCellDijitclick:function (evt) {
		var target = evt.currentTarget;
		if (this._currentFocus != target.index) {
			this._currentFocus = target.index;
			setTimeout(function () {
				dijit.focus(target);
			}, 0);
		}
		this._selectEntity(target);
		dojo.stopEvent(evt);
	}, _onCellMouseEnter:function (evt) {
		var target = evt.currentTarget;
		this._setCurrent(target);
		setTimeout(function () {
			dijit.focus(target);
		}, 0);
	}, _onCellFocus:function (evt) {
		this._setCurrent(evt.currentTarget);
	}, _setCurrent:function (node) {
		this._removeCellHighlight(this._currentFocus);
		this._currentFocus = node.index;
		dojo.addClass(node, "dojoxEntityPaletteCellHighlight");
		if (this.showPreview) {
			this._displayDetails(node);
		}
	}, _displayDetails:function (node) {
		var selectNodeAssoc = dojo.filter(this._cellNodes, function (item) {
			return item.node == node;
		});
		if (selectNodeAssoc.length > 0) {
			var ehtml = selectNodeAssoc[0].html;
			var ename = ehtml.substr(1, ehtml.length - 2);
			this.previewNode.innerHTML = node.innerHTML;
			this.codeNode.innerHTML = "&amp;#" + parseInt(node.innerHTML.charCodeAt(0), 10) + ";";
			this.entityNode.innerHTML = "&amp;" + ename + ";";
			this.descNode.innerHTML = this.entities[this.palette][ename].replace("\n", "<br>");
		} else {
			this.previewNode.innerHTML = "";
			this.codeNode.innerHTML = "";
			this.entityNode.innerHTML = "";
			this.descNode.innerHTML = "";
		}
	}, _onCellBlur:function (evt) {
		this._removeCellHighlight(this._currentFocus);
	}, _removeCellHighlight:function (index) {
		dojo.removeClass(this._cellNodes[index].node, "dojoxEntityPaletteCellHighlight");
	}, _selectEntity:function (selectNode) {
		var selectNodeAssoc = dojo.filter(this._cellNodes, function (item) {
			return item.node == selectNode;
		});
		if (selectNodeAssoc.length > 0) {
			this.onChange(this.value = selectNodeAssoc[0].html);
		}
	}, _navigateByKey:function (increment, typeCount) {
		if (typeCount == -1) {
			return;
		}
		var newFocusIndex = this._currentFocus + increment;
		if (newFocusIndex < this._cellNodes.length && newFocusIndex > -1) {
			var focusNode = this._cellNodes[newFocusIndex].node;
			focusNode.focus();
		}
	}});
}

