/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._editor.plugins.EnterKeyHandling"]) {
	dojo._hasResource["dijit._editor.plugins.EnterKeyHandling"] = true;
	dojo.provide("dijit._editor.plugins.EnterKeyHandling");
	dojo.require("dijit._base.scroll");
	dojo.declare("dijit._editor.plugins.EnterKeyHandling", dijit._editor._Plugin, {blockNodeForEnter:"BR", constructor:function (args) {
		if (args) {
			dojo.mixin(this, args);
		}
	}, setEditor:function (editor) {
		this.editor = editor;
		if (this.blockNodeForEnter == "BR") {
			if (dojo.isIE) {
				editor.contentDomPreFilters.push(dojo.hitch(this, "regularPsToSingleLinePs"));
				editor.contentDomPostFilters.push(dojo.hitch(this, "singleLinePsToRegularPs"));
				editor.onLoadDeferred.addCallback(dojo.hitch(this, "_fixNewLineBehaviorForIE"));
			} else {
				editor.onLoadDeferred.addCallback(dojo.hitch(this, function (d) {
					try {
						this.editor.document.execCommand("insertBrOnReturn", false, true);
					}
					catch (e) {
					}
					return d;
				}));
			}
		} else {
			if (this.blockNodeForEnter) {
				dojo["require"]("dijit._editor.range");
				var h = dojo.hitch(this, this.handleEnterKey);
				editor.addKeyHandler(13, 0, 0, h);
				editor.addKeyHandler(13, 0, 1, h);
				this.connect(this.editor, "onKeyPressed", "onKeyPressed");
			}
		}
	}, onKeyPressed:function (e) {
		if (this._checkListLater) {
			if (dojo.withGlobal(this.editor.window, "isCollapsed", dijit)) {
				var liparent = dojo.withGlobal(this.editor.window, "getAncestorElement", dijit._editor.selection, ["LI"]);
				if (!liparent) {
					dijit._editor.RichText.prototype.execCommand.call(this.editor, "formatblock", this.blockNodeForEnter);
					var block = dojo.withGlobal(this.editor.window, "getAncestorElement", dijit._editor.selection, [this.blockNodeForEnter]);
					if (block) {
						block.innerHTML = this.bogusHtmlContent;
						if (dojo.isIE) {
							var r = this.editor.document.selection.createRange();
							r.move("character", -1);
							r.select();
						}
					} else {
						console.error("onKeyPressed: Cannot find the new block node");
					}
				} else {
					if (dojo.isMoz) {
						if (liparent.parentNode.parentNode.nodeName == "LI") {
							liparent = liparent.parentNode.parentNode;
						}
					}
					var fc = liparent.firstChild;
					if (fc && fc.nodeType == 1 && (fc.nodeName == "UL" || fc.nodeName == "OL")) {
						liparent.insertBefore(fc.ownerDocument.createTextNode("\xa0"), fc);
						var newrange = dijit.range.create(this.editor.window);
						newrange.setStart(liparent.firstChild, 0);
						var selection = dijit.range.getSelection(this.editor.window, true);
						selection.removeAllRanges();
						selection.addRange(newrange);
					}
				}
			}
			this._checkListLater = false;
		}
		if (this._pressedEnterInBlock) {
			if (this._pressedEnterInBlock.previousSibling) {
				this.removeTrailingBr(this._pressedEnterInBlock.previousSibling);
			}
			delete this._pressedEnterInBlock;
		}
	}, bogusHtmlContent:"&nbsp;", blockNodes:/^(?:P|H1|H2|H3|H4|H5|H6|LI)$/, handleEnterKey:function (e) {
		var selection, range, newrange, doc = this.editor.document, br;
		if (e.shiftKey) {
			var parent = dojo.withGlobal(this.editor.window, "getParentElement", dijit._editor.selection);
			var header = dijit.range.getAncestor(parent, this.blockNodes);
			if (header) {
				if (!e.shiftKey && header.tagName == "LI") {
					return true;
				}
				selection = dijit.range.getSelection(this.editor.window);
				range = selection.getRangeAt(0);
				if (!range.collapsed) {
					range.deleteContents();
					selection = dijit.range.getSelection(this.editor.window);
					range = selection.getRangeAt(0);
				}
				if (dijit.range.atBeginningOfContainer(header, range.startContainer, range.startOffset)) {
					if (e.shiftKey) {
						br = doc.createElement("br");
						newrange = dijit.range.create(this.editor.window);
						header.insertBefore(br, header.firstChild);
						newrange.setStartBefore(br.nextSibling);
						selection.removeAllRanges();
						selection.addRange(newrange);
					} else {
						dojo.place(br, header, "before");
					}
				} else {
					if (dijit.range.atEndOfContainer(header, range.startContainer, range.startOffset)) {
						newrange = dijit.range.create(this.editor.window);
						br = doc.createElement("br");
						if (e.shiftKey) {
							header.appendChild(br);
							header.appendChild(doc.createTextNode("\xa0"));
							newrange.setStart(header.lastChild, 0);
						} else {
							dojo.place(br, header, "after");
							newrange.setStartAfter(header);
						}
						selection.removeAllRanges();
						selection.addRange(newrange);
					} else {
						return true;
					}
				}
			} else {
				dijit._editor.RichText.prototype.execCommand.call(this.editor, "inserthtml", "<br>");
			}
			return false;
		}
		var _letBrowserHandle = true;
		selection = dijit.range.getSelection(this.editor.window);
		range = selection.getRangeAt(0);
		if (!range.collapsed) {
			range.deleteContents();
			selection = dijit.range.getSelection(this.editor.window);
			range = selection.getRangeAt(0);
		}
		var block = dijit.range.getBlockAncestor(range.endContainer, null, this.editor.editNode);
		var blockNode = block.blockNode;
		if ((this._checkListLater = (blockNode && (blockNode.nodeName == "LI" || blockNode.parentNode.nodeName == "LI")))) {
			if (dojo.isMoz) {
				this._pressedEnterInBlock = blockNode;
			}
			if (/^(\s|&nbsp;|\xA0|<span\b[^>]*\bclass=['"]Apple-style-span['"][^>]*>(\s|&nbsp;|\xA0)<\/span>)?(<br>)?$/.test(blockNode.innerHTML)) {
				blockNode.innerHTML = "";
				if (dojo.isWebKit) {
					newrange = dijit.range.create(this.editor.window);
					newrange.setStart(blockNode, 0);
					selection.removeAllRanges();
					selection.addRange(newrange);
				}
				this._checkListLater = false;
			}
			return true;
		}
		if (!block.blockNode || block.blockNode === this.editor.editNode) {
			try {
				dijit._editor.RichText.prototype.execCommand.call(this.editor, "formatblock", this.blockNodeForEnter);
			}
			catch (e2) {
			}
			block = {blockNode:dojo.withGlobal(this.editor.window, "getAncestorElement", dijit._editor.selection, [this.blockNodeForEnter]), blockContainer:this.editor.editNode};
			if (block.blockNode) {
				if (block.blockNode != this.editor.editNode && (!(block.blockNode.textContent || block.blockNode.innerHTML).replace(/^\s+|\s+$/g, "").length)) {
					this.removeTrailingBr(block.blockNode);
					return false;
				}
			} else {
				block.blockNode = this.editor.editNode;
			}
			selection = dijit.range.getSelection(this.editor.window);
			range = selection.getRangeAt(0);
		}
		var newblock = doc.createElement(this.blockNodeForEnter);
		newblock.innerHTML = this.bogusHtmlContent;
		this.removeTrailingBr(block.blockNode);
		if (dijit.range.atEndOfContainer(block.blockNode, range.endContainer, range.endOffset)) {
			if (block.blockNode === block.blockContainer) {
				block.blockNode.appendChild(newblock);
			} else {
				dojo.place(newblock, block.blockNode, "after");
			}
			_letBrowserHandle = false;
			newrange = dijit.range.create(this.editor.window);
			newrange.setStart(newblock, 0);
			selection.removeAllRanges();
			selection.addRange(newrange);
			if (this.editor.height) {
				dijit.scrollIntoView(newblock);
			}
		} else {
			if (dijit.range.atBeginningOfContainer(block.blockNode, range.startContainer, range.startOffset)) {
				dojo.place(newblock, block.blockNode, block.blockNode === block.blockContainer ? "first" : "before");
				if (newblock.nextSibling && this.editor.height) {
					newrange = dijit.range.create(this.editor.window);
					newrange.setStart(newblock.nextSibling, 0);
					selection.removeAllRanges();
					selection.addRange(newrange);
					dijit.scrollIntoView(newblock.nextSibling);
				}
				_letBrowserHandle = false;
			} else {
				if (dojo.isMoz) {
					this._pressedEnterInBlock = block.blockNode;
				}
			}
		}
		return _letBrowserHandle;
	}, removeTrailingBr:function (container) {
		var para = /P|DIV|LI/i.test(container.tagName) ? container : dijit._editor.selection.getParentOfType(container, ["P", "DIV", "LI"]);
		if (!para) {
			return;
		}
		if (para.lastChild) {
			if ((para.childNodes.length > 1 && para.lastChild.nodeType == 3 && /^[\s\xAD]*$/.test(para.lastChild.nodeValue)) || para.lastChild.tagName == "BR") {
				dojo.destroy(para.lastChild);
			}
		}
		if (!para.childNodes.length) {
			para.innerHTML = this.bogusHtmlContent;
		}
	}, _fixNewLineBehaviorForIE:function (d) {
		var doc = this.editor.document;
		if (doc.__INSERTED_EDITIOR_NEWLINE_CSS === undefined) {
			var style = dojo.create("style", {type:"text/css"}, doc.getElementsByTagName("head")[0]);
			style.styleSheet.cssText = "p{margin:0;}";
			this.editor.document.__INSERTED_EDITIOR_NEWLINE_CSS = true;
		}
		return d;
	}, regularPsToSingleLinePs:function (element, noWhiteSpaceInEmptyP) {
		function wrapLinesInPs(el) {
			function wrapNodes(nodes) {
				var newP = nodes[0].ownerDocument.createElement("p");
				nodes[0].parentNode.insertBefore(newP, nodes[0]);
				dojo.forEach(nodes, function (node) {
					newP.appendChild(node);
				});
			}
			var currentNodeIndex = 0;
			var nodesInLine = [];
			var currentNode;
			while (currentNodeIndex < el.childNodes.length) {
				currentNode = el.childNodes[currentNodeIndex];
				if (currentNode.nodeType == 3 || (currentNode.nodeType == 1 && currentNode.nodeName != "BR" && dojo.style(currentNode, "display") != "block")) {
					nodesInLine.push(currentNode);
				} else {
					var nextCurrentNode = currentNode.nextSibling;
					if (nodesInLine.length) {
						wrapNodes(nodesInLine);
						currentNodeIndex = (currentNodeIndex + 1) - nodesInLine.length;
						if (currentNode.nodeName == "BR") {
							dojo.destroy(currentNode);
						}
					}
					nodesInLine = [];
				}
				currentNodeIndex++;
			}
			if (nodesInLine.length) {
				wrapNodes(nodesInLine);
			}
		}
		function splitP(el) {
			var currentNode = null;
			var trailingNodes = [];
			var lastNodeIndex = el.childNodes.length - 1;
			for (var i = lastNodeIndex; i >= 0; i--) {
				currentNode = el.childNodes[i];
				if (currentNode.nodeName == "BR") {
					var newP = currentNode.ownerDocument.createElement("p");
					dojo.place(newP, el, "after");
					if (trailingNodes.length == 0 && i != lastNodeIndex) {
						newP.innerHTML = "&nbsp;";
					}
					dojo.forEach(trailingNodes, function (node) {
						newP.appendChild(node);
					});
					dojo.destroy(currentNode);
					trailingNodes = [];
				} else {
					trailingNodes.unshift(currentNode);
				}
			}
		}
		var pList = [];
		var ps = element.getElementsByTagName("p");
		dojo.forEach(ps, function (p) {
			pList.push(p);
		});
		dojo.forEach(pList, function (p) {
			var prevSib = p.previousSibling;
			if ((prevSib) && (prevSib.nodeType == 1) && (prevSib.nodeName == "P" || dojo.style(prevSib, "display") != "block")) {
				var newP = p.parentNode.insertBefore(this.document.createElement("p"), p);
				newP.innerHTML = noWhiteSpaceInEmptyP ? "" : "&nbsp;";
			}
			splitP(p);
		}, this.editor);
		wrapLinesInPs(element);
		return element;
	}, singleLinePsToRegularPs:function (element) {
		function getParagraphParents(node) {
			var ps = node.getElementsByTagName("p");
			var parents = [];
			for (var i = 0; i < ps.length; i++) {
				var p = ps[i];
				var knownParent = false;
				for (var k = 0; k < parents.length; k++) {
					if (parents[k] === p.parentNode) {
						knownParent = true;
						break;
					}
				}
				if (!knownParent) {
					parents.push(p.parentNode);
				}
			}
			return parents;
		}
		function isParagraphDelimiter(node) {
			return (!node.childNodes.length || node.innerHTML == "&nbsp;");
		}
		var paragraphContainers = getParagraphParents(element);
		for (var i = 0; i < paragraphContainers.length; i++) {
			var container = paragraphContainers[i];
			var firstPInBlock = null;
			var node = container.firstChild;
			var deleteNode = null;
			while (node) {
				if (node.nodeType != 1 || node.tagName != "P" || (node.getAttributeNode("style") || {}).specified) {
					firstPInBlock = null;
				} else {
					if (isParagraphDelimiter(node)) {
						deleteNode = node;
						firstPInBlock = null;
					} else {
						if (firstPInBlock == null) {
							firstPInBlock = node;
						} else {
							if ((!firstPInBlock.lastChild || firstPInBlock.lastChild.nodeName != "BR") && (node.firstChild) && (node.firstChild.nodeName != "BR")) {
								firstPInBlock.appendChild(this.editor.document.createElement("br"));
							}
							while (node.firstChild) {
								firstPInBlock.appendChild(node.firstChild);
							}
							deleteNode = node;
						}
					}
				}
				node = node.nextSibling;
				if (deleteNode) {
					dojo.destroy(deleteNode);
					deleteNode = null;
				}
			}
		}
		return element;
	}});
}

