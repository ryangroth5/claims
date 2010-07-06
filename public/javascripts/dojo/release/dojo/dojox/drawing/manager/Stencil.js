/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.drawing.manager.Stencil"]) {
	dojo._hasResource["dojox.drawing.manager.Stencil"] = true;
	dojo.provide("dojox.drawing.manager.Stencil");
	(function () {
		var surface, surfaceNode;
		dojox.drawing.manager.Stencil = dojox.drawing.util.oo.declare(function (options) {
			surface = options.surface;
			this.canvas = options.canvas;
			this.defaults = dojox.drawing.defaults.copy();
			this.undo = options.undo;
			this.mouse = options.mouse;
			this.keys = options.keys;
			this.anchors = options.anchors;
			this.stencils = {};
			this.selectedStencils = {};
			this._mouseHandle = this.mouse.register(this);
			dojo.connect(this.keys, "onArrow", this, "onArrow");
			dojo.connect(this.keys, "onEsc", this, "deselect");
			dojo.connect(this.keys, "onDelete", this, "onDelete");
		}, {_dragBegun:false, _wasDragged:false, _secondClick:false, _isBusy:false, register:function (stencil) {
			console.log("Selection.register ::::::", stencil.id);
			if (stencil.isText && !stencil.editMode && stencil.deleteEmptyCreate && !stencil.getText()) {
				console.warn("EMPTY CREATE DELETE", stencil);
				stencil.destroy();
				return false;
			}
			this.stencils[stencil.id] = stencil;
			if (stencil.execText) {
				if (stencil._text && !stencil.editMode) {
					console.log("select text");
					this.selectItem(stencil);
				}
				stencil.connect("execText", this, function () {
					if (stencil.isText && stencil.deleteEmptyModify && !stencil.getText()) {
						console.warn("EMPTY MOD DELETE", stencil);
						this.deleteItem(stencil);
					} else {
						if (stencil.selectOnExec) {
							this.selectItem(stencil);
						}
					}
				});
			}
			stencil.connect("deselect", this, function () {
				if (!this._isBusy && this.isSelected(stencil)) {
					this.deselectItem(stencil);
				}
			});
			stencil.connect("select", this, function () {
				if (!this._isBusy && !this.isSelected(stencil)) {
					this.selectItem(stencil);
				}
			});
			return stencil;
		}, unregister:function (stencil) {
			console.log("Selection.unregister ::::::", stencil.id, "sel:", stencil.selected);
			if (stencil) {
				stencil.selected && this.onDeselect(stencil);
				delete this.stencils[stencil.id];
			}
		}, onArrow:function (evt) {
			if (this.hasSelected()) {
				this.saveThrottledState();
				this.group.applyTransform({dx:evt.x, dy:evt.y});
			}
		}, _throttleVrl:null, _throttle:false, throttleTime:400, _lastmxx:-1, _lastmxy:-1, saveMoveState:function () {
			var mx = this.group.getTransform();
			if (mx.dx == this._lastmxx && mx.dy == this._lastmxy) {
				return;
			}
			this._lastmxx = mx.dx;
			this._lastmxy = mx.dy;
			this.undo.add({before:dojo.hitch(this.group, "setTransform", mx)});
		}, saveThrottledState:function () {
			clearTimeout(this._throttleVrl);
			clearInterval(this._throttleVrl);
			this._throttleVrl = setTimeout(dojo.hitch(this, function () {
				this._throttle = false;
				this.saveMoveState();
			}), this.throttleTime);
			if (this._throttle) {
				return;
			}
			this._throttle = true;
			this.saveMoveState();
		}, unDelete:function (stencils) {
			console.log("unDelete:", stencils);
			for (var s in stencils) {
				stencils[s].render();
				this.onSelect(stencils[s]);
			}
		}, onDelete:function (noundo) {
			console.log("onDelete", noundo);
			if (noundo !== true) {
				this.undo.add({before:dojo.hitch(this, "unDelete", this.selectedStencils), after:dojo.hitch(this, "onDelete", true)});
			}
			this.withSelected(function (m) {
				this.anchors.remove(m);
				var id = m.id;
				console.log("delete:", m);
				m.destroy();
				delete this.stencils[id];
			});
			this.selectedStencils = {};
		}, deleteItem:function (stencil) {
			if (this.hasSelected()) {
				var sids = [];
				for (var m in this.selectedStencils) {
					if (this.selectedStencils.id == stencil.id) {
						if (this.hasSelected() == 1) {
							this.onDelete();
							return;
						}
					} else {
						sids.push(this.selectedStencils.id);
					}
				}
				this.deselect();
				this.selectItem(stencil);
				this.onDelete();
				dojo.forEach(sids, function (id) {
					this.selectItem(id);
				}, this);
			} else {
				this.selectItem(stencil);
				this.onDelete();
			}
		}, removeAll:function () {
			this.selectAll();
			this._isBusy = true;
			this.onDelete();
			this.stencils = {};
			this._isBusy = false;
		}, setSelectionGroup:function () {
			this.withSelected(function (m) {
				this.onDeselect(m, true);
			});
			if (this.group) {
				surface.remove(this.group);
				this.group.removeShape();
			}
			this.group = surface.createGroup();
			this.group.setTransform({dx:0, dy:0});
			this.withSelected(function (m) {
				this.group.add(m.container);
				m.select();
			});
		}, setConstraint:function () {
			var t = Infinity;
			l = Infinity;
			this.withSelected(function (m) {
				var o = m.getBounds();
				t = Math.min(o.y1, t);
				l = Math.min(o.x1, l);
			});
			this.constrain = {l:-l, t:-t};
		}, onDeselect:function (stencil, keepObject) {
			if (!keepObject) {
				delete this.selectedStencils[stencil.id];
			}
			this.anchors.remove(stencil);
			surface.add(stencil.container);
			stencil.selected && stencil.deselect();
			stencil.applyTransform(this.group.getTransform());
		}, deselectItem:function (stencil) {
			this.onDeselect(stencil);
		}, deselect:function () {
			this.withSelected(function (m) {
				this.onDeselect(m);
			});
			this._dragBegun = false;
			this._wasDragged = false;
		}, onSelect:function (stencil) {
			if (!stencil) {
				console.error("null stencil is not selected:", this.stencils);
			}
			if (this.selectedStencils[stencil.id]) {
				return;
			}
			this.selectedStencils[stencil.id] = stencil;
			this.group.add(stencil.container);
			stencil.select();
			if (this.hasSelected() == 1) {
				this.anchors.add(stencil, this.group);
			}
		}, selectAll:function () {
			this._isBusy = true;
			for (var m in this.stencils) {
				this.selectItem(m);
			}
			this._isBusy = false;
		}, selectItem:function (idOrItem) {
			var id = typeof (idOrItem) == "string" ? idOrItem : idOrItem.id;
			var stencil = this.stencils[id];
			this.setSelectionGroup();
			this.onSelect(stencil);
			this.group.moveToFront();
			this.setConstraint();
		}, onStencilDoubleClick:function (obj) {
			console.info("mgr.onStencilDoubleClick:", obj);
			if (this.selectedStencils[obj.id]) {
				if (this.selectedStencils[obj.id].edit) {
					console.info("Mgr Stencil Edit -> ", this.selectedStencils[obj.id]);
					var m = this.selectedStencils[obj.id];
					m.editMode = true;
					this.deselect();
					m.edit();
				}
			}
		}, onAnchorUp:function () {
			this.setConstraint();
		}, onStencilDown:function (obj, evt) {
			console.info(" >>> onStencilDown:", obj.id, this.keys.meta);
			if (!this.stencils[obj.id]) {
				return;
			}
			this._isBusy = true;
			if (this.selectedStencils[obj.id] && this.keys.meta) {
				if (dojo.isMac && this.keys.cmmd) {
				}
				console.log("	shift remove");
				this.onDeselect(this.selectedStencils[obj.id]);
				if (this.hasSelected() == 1) {
					this.withSelected(function (m) {
						this.anchors.add(m, this.group);
					});
				}
				this.group.moveToFront();
				this.setConstraint();
				return;
			} else {
				if (this.selectedStencils[obj.id]) {
					console.log("	clicked on selected");
					var mx = this.group.getTransform();
					this._offx = obj.x - mx.dx;
					this._offy = obj.y - mx.dy;
					return;
				} else {
					if (!this.keys.meta) {
						console.log("	deselect all");
						this.deselect();
					} else {
					}
				}
			}
			console.log("	add stencil to selection");
			this.selectItem(obj.id);
			var mx = this.group.getTransform();
			this._offx = obj.x - mx.dx;
			this._offy = obj.y - mx.dx;
			this.orgx = obj.x;
			this.orgy = obj.y;
			this._isBusy = false;
			this.undo.add({before:function () {
			}, after:function () {
			}});
		}, onStencilUp:function (obj) {
		}, onStencilDrag:function (obj) {
			if (!this._dragBegun) {
				this.onBeginDrag(obj);
				this._dragBegun = true;
			} else {
				this.saveThrottledState();
				var x = obj.x - obj.last.x, y = obj.y - obj.last.y, mx = this.group.getTransform(), c = this.constrain, mz = this.defaults.anchors.marginZero;
				x = obj.x - this._offx;
				y = obj.y - this._offy;
				if (x < c.l + mz) {
					x = c.l + mz;
				}
				if (y < c.t + mz) {
					y = c.t + mz;
				}
				this.group.setTransform({dx:x, dy:y});
			}
		}, onDragEnd:function (obj) {
			this._dragBegun = false;
		}, onBeginDrag:function (obj) {
			this._wasDragged = true;
		}, onDown:function (obj) {
			this.deselect();
		}, exporter:function () {
			var items = [];
			for (var m in this.stencils) {
				this.stencils[m].enabled && items.push(this.stencils[m].exporter());
			}
			return items;
		}, toSelected:function (func) {
			var args = Array.prototype.slice.call(arguments).splice(1);
			for (var m in this.selectedStencils) {
				var item = this.selectedStencils[m];
				item[func].apply(item, args);
			}
		}, withSelected:function (func) {
			var f = dojo.hitch(this, func);
			for (var m in this.selectedStencils) {
				f(this.selectedStencils[m]);
			}
		}, withUnselected:function (func) {
			var f = dojo.hitch(this, func);
			for (var m in this.stencils) {
				!this.stencils[m].selected && f(this.stencils[m]);
			}
		}, withStencils:function (func) {
			var f = dojo.hitch(this, func);
			for (var m in this.stencils) {
				f(this.stencils[m]);
			}
		}, hasSelected:function () {
			var ln = 0;
			for (var m in this.selectedStencils) {
				ln++;
			}
			return ln;
		}, isSelected:function (stencil) {
			return !!this.selectedStencils[stencil.id];
		}});
	})();
}

