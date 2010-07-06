/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.dnd.Source"]) {
	dojo._hasResource["dojo.dnd.Source"] = true;
	dojo.provide("dojo.dnd.Source");
	dojo.require("dojo.dnd.Selector");
	dojo.require("dojo.dnd.Manager");
	dojo.declare("dojo.dnd.Source", dojo.dnd.Selector, {isSource:true, horizontal:false, copyOnly:false, selfCopy:false, selfAccept:true, skipForm:false, withHandles:false, autoSync:false, delay:0, accept:["text"], generateText:true, constructor:function (node, params) {
		dojo.mixin(this, dojo.mixin({}, params));
		var type = this.accept;
		if (type.length) {
			this.accept = {};
			for (var i = 0; i < type.length; ++i) {
				this.accept[type[i]] = 1;
			}
		}
		this.isDragging = false;
		this.mouseDown = false;
		this.targetAnchor = null;
		this.targetBox = null;
		this.before = true;
		this._lastX = 0;
		this._lastY = 0;
		this.sourceState = "";
		if (this.isSource) {
			dojo.addClass(this.node, "dojoDndSource");
		}
		this.targetState = "";
		if (this.accept) {
			dojo.addClass(this.node, "dojoDndTarget");
		}
		if (this.horizontal) {
			dojo.addClass(this.node, "dojoDndHorizontal");
		}
		this.topics = [dojo.subscribe("/dnd/source/over", this, "onDndSourceOver"), dojo.subscribe("/dnd/start", this, "onDndStart"), dojo.subscribe("/dnd/drop", this, "onDndDrop"), dojo.subscribe("/dnd/cancel", this, "onDndCancel")];
	}, checkAcceptance:function (source, nodes) {
		if (this == source) {
			return !this.copyOnly || this.selfAccept;
		}
		for (var i = 0; i < nodes.length; ++i) {
			var type = source.getItem(nodes[i].id).type;
			var flag = false;
			for (var j = 0; j < type.length; ++j) {
				if (type[j] in this.accept) {
					flag = true;
					break;
				}
			}
			if (!flag) {
				return false;
			}
		}
		return true;
	}, copyState:function (keyPressed, self) {
		if (keyPressed) {
			return true;
		}
		if (arguments.length < 2) {
			self = this == dojo.dnd.manager().target;
		}
		if (self) {
			if (this.copyOnly) {
				return this.selfCopy;
			}
		} else {
			return this.copyOnly;
		}
		return false;
	}, destroy:function () {
		dojo.dnd.Source.superclass.destroy.call(this);
		dojo.forEach(this.topics, dojo.unsubscribe);
		this.targetAnchor = null;
	}, markupFactory:function (params, node) {
		params._skipStartup = true;
		return new dojo.dnd.Source(node, params);
	}, onMouseMove:function (e) {
		if (this.isDragging && this.targetState == "Disabled") {
			return;
		}
		dojo.dnd.Source.superclass.onMouseMove.call(this, e);
		var m = dojo.dnd.manager();
		if (this.isDragging) {
			var before = false;
			if (this.current) {
				if (!this.targetBox || this.targetAnchor != this.current) {
					this.targetBox = dojo.position(this.current, true);
				}
				if (this.horizontal) {
					before = (e.pageX - this.targetBox.x) < (this.targetBox.w / 2);
				} else {
					before = (e.pageY - this.targetBox.y) < (this.targetBox.h / 2);
				}
			}
			if (this.current != this.targetAnchor || before != this.before) {
				this._markTargetAnchor(before);
				m.canDrop(!this.current || m.source != this || !(this.current.id in this.selection));
			}
		} else {
			if (this.mouseDown && this.isSource && (Math.abs(e.pageX - this._lastX) > this.delay || Math.abs(e.pageY - this._lastY) > this.delay)) {
				var nodes = this.getSelectedNodes();
				if (nodes.length) {
					m.startDrag(this, nodes, this.copyState(dojo.isCopyKey(e), true));
				}
			}
		}
	}, onMouseDown:function (e) {
		if (!this.mouseDown && this._legalMouseDown(e) && (!this.skipForm || !dojo.dnd.isFormElement(e))) {
			this.mouseDown = true;
			this._lastX = e.pageX;
			this._lastY = e.pageY;
			dojo.dnd.Source.superclass.onMouseDown.call(this, e);
		}
	}, onMouseUp:function (e) {
		if (this.mouseDown) {
			this.mouseDown = false;
			dojo.dnd.Source.superclass.onMouseUp.call(this, e);
		}
	}, onDndSourceOver:function (source) {
		if (this != source) {
			this.mouseDown = false;
			if (this.targetAnchor) {
				this._unmarkTargetAnchor();
			}
		} else {
			if (this.isDragging) {
				var m = dojo.dnd.manager();
				m.canDrop(this.targetState != "Disabled" && (!this.current || m.source != this || !(this.current.id in this.selection)));
			}
		}
	}, onDndStart:function (source, nodes, copy) {
		if (this.autoSync) {
			this.sync();
		}
		if (this.isSource) {
			this._changeState("Source", this == source ? (copy ? "Copied" : "Moved") : "");
		}
		var accepted = this.accept && this.checkAcceptance(source, nodes);
		this._changeState("Target", accepted ? "" : "Disabled");
		if (this == source) {
			dojo.dnd.manager().overSource(this);
		}
		this.isDragging = true;
	}, onDndDrop:function (source, nodes, copy, target) {
		if (this == target) {
			this.onDrop(source, nodes, copy);
		}
		this.onDndCancel();
	}, onDndCancel:function () {
		if (this.targetAnchor) {
			this._unmarkTargetAnchor();
			this.targetAnchor = null;
		}
		this.before = true;
		this.isDragging = false;
		this.mouseDown = false;
		this._changeState("Source", "");
		this._changeState("Target", "");
	}, onDrop:function (source, nodes, copy) {
		if (this != source) {
			this.onDropExternal(source, nodes, copy);
		} else {
			this.onDropInternal(nodes, copy);
		}
	}, onDropExternal:function (source, nodes, copy) {
		var oldCreator = this._normalizedCreator;
		if (this.creator) {
			this._normalizedCreator = function (node, hint) {
				return oldCreator.call(this, source.getItem(node.id).data, hint);
			};
		} else {
			if (copy) {
				this._normalizedCreator = function (node, hint) {
					var t = source.getItem(node.id);
					var n = node.cloneNode(true);
					n.id = dojo.dnd.getUniqueId();
					return {node:n, data:t.data, type:t.type};
				};
			} else {
				this._normalizedCreator = function (node, hint) {
					var t = source.getItem(node.id);
					source.delItem(node.id);
					return {node:node, data:t.data, type:t.type};
				};
			}
		}
		this.selectNone();
		if (!copy && !this.creator) {
			source.selectNone();
		}
		this.insertNodes(true, nodes, this.before, this.current);
		if (!copy && this.creator) {
			source.deleteSelectedNodes();
		}
		this._normalizedCreator = oldCreator;
	}, onDropInternal:function (nodes, copy) {
		var oldCreator = this._normalizedCreator;
		if (this.current && this.current.id in this.selection) {
			return;
		}
		if (copy) {
			if (this.creator) {
				this._normalizedCreator = function (node, hint) {
					return oldCreator.call(this, this.getItem(node.id).data, hint);
				};
			} else {
				this._normalizedCreator = function (node, hint) {
					var t = this.getItem(node.id);
					var n = node.cloneNode(true);
					n.id = dojo.dnd.getUniqueId();
					return {node:n, data:t.data, type:t.type};
				};
			}
		} else {
			if (!this.current) {
				return;
			}
			this._normalizedCreator = function (node, hint) {
				var t = this.getItem(node.id);
				return {node:node, data:t.data, type:t.type};
			};
		}
		this._removeSelection();
		this.insertNodes(true, nodes, this.before, this.current);
		this._normalizedCreator = oldCreator;
	}, onDraggingOver:function () {
	}, onDraggingOut:function () {
	}, onOverEvent:function () {
		dojo.dnd.Source.superclass.onOverEvent.call(this);
		dojo.dnd.manager().overSource(this);
		if (this.isDragging && this.targetState != "Disabled") {
			this.onDraggingOver();
		}
	}, onOutEvent:function () {
		dojo.dnd.Source.superclass.onOutEvent.call(this);
		dojo.dnd.manager().outSource(this);
		if (this.isDragging && this.targetState != "Disabled") {
			this.onDraggingOut();
		}
	}, _markTargetAnchor:function (before) {
		if (this.current == this.targetAnchor && this.before == before) {
			return;
		}
		if (this.targetAnchor) {
			this._removeItemClass(this.targetAnchor, this.before ? "Before" : "After");
		}
		this.targetAnchor = this.current;
		this.targetBox = null;
		this.before = before;
		if (this.targetAnchor) {
			this._addItemClass(this.targetAnchor, this.before ? "Before" : "After");
		}
	}, _unmarkTargetAnchor:function () {
		if (!this.targetAnchor) {
			return;
		}
		this._removeItemClass(this.targetAnchor, this.before ? "Before" : "After");
		this.targetAnchor = null;
		this.targetBox = null;
		this.before = true;
	}, _markDndStatus:function (copy) {
		this._changeState("Source", copy ? "Copied" : "Moved");
	}, _legalMouseDown:function (e) {
		if (!dojo.mouseButtons.isLeft(e)) {
			return false;
		}
		if (!this.withHandles) {
			return true;
		}
		for (var node = e.target; node && node !== this.node; node = node.parentNode) {
			if (dojo.hasClass(node, "dojoDndHandle")) {
				return true;
			}
			if (dojo.hasClass(node, "dojoDndItem") || dojo.hasClass(node, "dojoDndIgnore")) {
				break;
			}
		}
		return false;
	}});
	dojo.declare("dojo.dnd.Target", dojo.dnd.Source, {constructor:function (node, params) {
		this.isSource = false;
		dojo.removeClass(this.node, "dojoDndSource");
	}, markupFactory:function (params, node) {
		params._skipStartup = true;
		return new dojo.dnd.Target(node, params);
	}});
	dojo.declare("dojo.dnd.AutoSource", dojo.dnd.Source, {constructor:function (node, params) {
		this.autoSync = true;
	}, markupFactory:function (params, node) {
		params._skipStartup = true;
		return new dojo.dnd.AutoSource(node, params);
	}});
}

