/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.editor.plugins._SmileyPalette"]) {
	dojo._hasResource["dojox.editor.plugins._SmileyPalette"] = true;
	dojo.provide("dojox.editor.plugins._SmileyPalette");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dojox.editor.plugins", "Smiley", null, "ROOT,cs,de,es,fr,hu,it,ja,ko,pl,pt,ru,zh,zh-tw");
	dojo.experimental("dojox.editor.plugins._SmileyPalette");
	dojo.declare("dojox.editor.plugins._SmileyPalette", [dijit._Widget, dijit._Templated], {templateString:"<div class=\"dojoxEntityPalette\">\n" + "<table>\n" + "<tbody>\n" + "<tr>\n" + "<td>\n" + "<table class=\"dojoxEntityPaletteTable\"  waiRole=\"grid\" tabIndex=\"${tabIndex}\">\n" + "<tbody dojoAttachPoint=\"tableNode\"></tbody>\n" + "</table>\n" + "</td>\n" + "</tr>\n" + "</tbody>\n" + "</table>\n" + "</div>", defaultTimeout:500, timeoutChangeRate:0.9, smileys:{emoticonSmile:":-)", emoticonLaughing:"lol", emoticonWink:";-)", emoticonGrin:":-D", emoticonCool:"8-)", emoticonAngry:":-@", emoticonHalf:":-/", emoticonEyebrow:"/:)", emoticonFrown:":-(", emoticonShy:":-$", emoticonGoofy:":-S", emoticonOops:":-O", emoticonTongue:":-P", emoticonIdea:"(i)", emoticonYes:"(y)", emoticonNo:"(n)", emoticonAngel:"0:-)", emoticonCrying:":'("}, value:null, _currentFocus:0, _xDim:null, _yDim:null, tabIndex:"0", _created:false, postCreate:function () {
		if (!this._created) {
			this._created = true;
			this.domNode.style.position = "relative";
			this._cellNodes = [];
			var numChoices = 0;
			var entityKey;
			for (entityKey in this.smileys) {
				numChoices++;
			}
			var choicesPerRow = Math.floor(Math.sqrt(numChoices));
			var numRows = choicesPerRow;
			var currChoiceIdx = 0;
			var rowNode = null;
			var cellNode;
			for (entityKey in this.smileys) {
				var newRow = currChoiceIdx % numRows === 0;
				if (newRow) {
					rowNode = dojo.create("tr", {tabIndex:"-1"});
				}
				var entityHtml = this.smileys[entityKey], desc = dojo.i18n.getLocalization("dojox.editor.plugins", "Smiley")[entityKey];
				cellNode = dojo.create("td", {tabIndex:"-1", "class":"dojoxEntityPaletteCell"}, rowNode);
				var imgNode = dojo.create("img", {src:dojo.moduleUrl("dojox.editor.plugins", "resources/emoticons/" + entityKey + ".gif"), "class":"dojoxSmileyPaletteImg dojoxSmiley" + entityKey.charAt(0).toUpperCase() + entityKey.substring(1), title:desc, alt:desc}, cellNode);
				dojo.forEach(["Dijitclick", "MouseEnter", "Focus", "Blur"], function (handler) {
					this.connect(cellNode, "on" + handler.toLowerCase(), "_onCell" + handler);
				}, this);
				if (newRow) {
					dojo.place(rowNode, this.tableNode);
				}
				dijit.setWaiRole(cellNode, "gridcell");
				cellNode.index = this._cellNodes.length;
				this._cellNodes.push({node:cellNode, html:"<span class='" + entityKey + "'>" + this.smileys[entityKey] + "</span>"});
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

