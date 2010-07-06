/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.layout.StackController"]) {
	dojo._hasResource["dijit.layout.StackController"] = true;
	dojo.provide("dijit.layout.StackController");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dijit._Container");
	dojo.require("dijit.form.ToggleButton");
	dojo.requireLocalization("dijit", "common", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,ko,nb,nl,pl,pt,pt-pt,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dijit.layout.StackController", [dijit._Widget, dijit._Templated, dijit._Container], {templateString:"<span wairole='tablist' dojoAttachEvent='onkeypress' class='dijitStackController'></span>", containerId:"", buttonWidget:"dijit.layout._StackButton", postCreate:function () {
		dijit.setWaiRole(this.domNode, "tablist");
		this.pane2button = {};
		this.pane2handles = {};
		this.subscribe(this.containerId + "-startup", "onStartup");
		this.subscribe(this.containerId + "-addChild", "onAddChild");
		this.subscribe(this.containerId + "-removeChild", "onRemoveChild");
		this.subscribe(this.containerId + "-selectChild", "onSelectChild");
		this.subscribe(this.containerId + "-containerKeyPress", "onContainerKeyPress");
	}, onStartup:function (info) {
		dojo.forEach(info.children, this.onAddChild, this);
		if (info.selected) {
			this.onSelectChild(info.selected);
		}
	}, destroy:function () {
		for (var pane in this.pane2button) {
			this.onRemoveChild(dijit.byId(pane));
		}
		this.inherited(arguments);
	}, onAddChild:function (page, insertIndex) {
		var refNode = dojo.doc.createElement("span");
		this.domNode.appendChild(refNode);
		var cls = dojo.getObject(this.buttonWidget);
		var button = new cls({id:this.id + "_" + page.id, label:page.title, showLabel:page.showTitle, iconClass:page.iconClass, closeButton:page.closable, title:page.tooltip}, refNode);
		dijit.setWaiState(button.focusNode, "selected", "false");
		this.pane2handles[page.id] = [this.connect(page, "attr", function (name, value) {
			if (arguments.length == 2) {
				var buttonAttr = {title:"label", showTitle:"showLabel", iconClass:"iconClass", closable:"closeButton", tooltip:"title"}[name];
				if (buttonAttr) {
					button.attr(buttonAttr, value);
				}
			}
		}), this.connect(button, "onClick", dojo.hitch(this, "onButtonClick", page)), this.connect(button, "onClickCloseButton", dojo.hitch(this, "onCloseButtonClick", page))];
		this.addChild(button, insertIndex);
		this.pane2button[page.id] = button;
		page.controlButton = button;
		if (!this._currentChild) {
			button.focusNode.setAttribute("tabIndex", "0");
			dijit.setWaiState(button.focusNode, "selected", "true");
			this._currentChild = page;
		}
		if (!this.isLeftToRight() && dojo.isIE && this._rectifyRtlTabList) {
			this._rectifyRtlTabList();
		}
	}, onRemoveChild:function (page) {
		if (this._currentChild === page) {
			this._currentChild = null;
		}
		dojo.forEach(this.pane2handles[page.id], this.disconnect, this);
		delete this.pane2handles[page.id];
		var button = this.pane2button[page.id];
		if (button) {
			this.removeChild(button);
			delete this.pane2button[page.id];
			button.destroy();
		}
		delete page.controlButton;
	}, onSelectChild:function (page) {
		if (!page) {
			return;
		}
		if (this._currentChild) {
			var oldButton = this.pane2button[this._currentChild.id];
			oldButton.attr("checked", false);
			dijit.setWaiState(oldButton.focusNode, "selected", "false");
			oldButton.focusNode.setAttribute("tabIndex", "-1");
		}
		var newButton = this.pane2button[page.id];
		newButton.attr("checked", true);
		dijit.setWaiState(newButton.focusNode, "selected", "true");
		this._currentChild = page;
		newButton.focusNode.setAttribute("tabIndex", "0");
		var container = dijit.byId(this.containerId);
		dijit.setWaiState(container.containerNode, "labelledby", newButton.id);
	}, onButtonClick:function (page) {
		var container = dijit.byId(this.containerId);
		container.selectChild(page);
	}, onCloseButtonClick:function (page) {
		var container = dijit.byId(this.containerId);
		container.closeChild(page);
		if (this._currentChild) {
			var b = this.pane2button[this._currentChild.id];
			if (b) {
				dijit.focus(b.focusNode || b.domNode);
			}
		}
	}, adjacent:function (forward) {
		if (!this.isLeftToRight() && (!this.tabPosition || /top|bottom/.test(this.tabPosition))) {
			forward = !forward;
		}
		var children = this.getChildren();
		var current = dojo.indexOf(children, this.pane2button[this._currentChild.id]);
		var offset = forward ? 1 : children.length - 1;
		return children[(current + offset) % children.length];
	}, onkeypress:function (e) {
		if (this.disabled || e.altKey) {
			return;
		}
		var forward = null;
		if (e.ctrlKey || !e._djpage) {
			var k = dojo.keys;
			switch (e.charOrCode) {
			  case k.LEFT_ARROW:
			  case k.UP_ARROW:
				if (!e._djpage) {
					forward = false;
				}
				break;
			  case k.PAGE_UP:
				if (e.ctrlKey) {
					forward = false;
				}
				break;
			  case k.RIGHT_ARROW:
			  case k.DOWN_ARROW:
				if (!e._djpage) {
					forward = true;
				}
				break;
			  case k.PAGE_DOWN:
				if (e.ctrlKey) {
					forward = true;
				}
				break;
			  case k.DELETE:
				if (this._currentChild.closable) {
					this.onCloseButtonClick(this._currentChild);
				}
				dojo.stopEvent(e);
				break;
			  default:
				if (e.ctrlKey) {
					if (e.charOrCode === k.TAB) {
						this.adjacent(!e.shiftKey).onClick();
						dojo.stopEvent(e);
					} else {
						if (e.charOrCode == "w") {
							if (this._currentChild.closable) {
								this.onCloseButtonClick(this._currentChild);
							}
							dojo.stopEvent(e);
						}
					}
				}
			}
			if (forward !== null) {
				this.adjacent(forward).onClick();
				dojo.stopEvent(e);
			}
		}
	}, onContainerKeyPress:function (info) {
		info.e._djpage = info.page;
		this.onkeypress(info.e);
	}});
	dojo.declare("dijit.layout._StackButton", dijit.form.ToggleButton, {tabIndex:"-1", postCreate:function (evt) {
		dijit.setWaiRole((this.focusNode || this.domNode), "tab");
		this.inherited(arguments);
	}, onClick:function (evt) {
		dijit.focus(this.focusNode);
	}, onClickCloseButton:function (evt) {
		evt.stopPropagation();
	}});
}

