/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.sketch.UndoStack"]) {
	dojo._hasResource["dojox.sketch.UndoStack"] = true;
	dojo.provide("dojox.sketch.UndoStack");
	dojo.require("dojox.xml.DomParser");
	(function () {
		var ta = dojox.sketch;
		ta.CommandTypes = {Create:"Create", Move:"Move", Modify:"Modify", Delete:"Delete", Convert:"Convert"};
		dojo.declare("dojox.sketch.UndoStack", null, {constructor:function (figure) {
			this.figure = figure;
			this._steps = [];
			this._undoedSteps = [];
		}, apply:function (state, from, to) {
			if (!from && !to && state.fullText) {
				this.figure.setValue(state.fullText);
				return;
			}
			var fromText = from.shapeText;
			var toText = to.shapeText;
			if (fromText.length == 0 && toText.length == 0) {
				return;
			}
			if (fromText.length == 0) {
				var o = dojox.xml.DomParser.parse(toText).documentElement;
				var a = this.figure._loadAnnotation(o);
				if (a) {
					this.figure._add(a);
				}
				return;
			}
			if (toText.length == 0) {
				var ann = this.figure.get(from.shapeId);
				this.figure._delete([ann], true);
				return;
			}
			var nann = this.figure.get(to.shapeId);
			var no = dojox.xml.DomParser.parse(toText).documentElement;
			nann.draw(no);
			this.figure.select(nann);
			return;
		}, add:function (cmd, ann, before) {
			var id = ann ? ann.id : "";
			var after = ann ? ann.serialize() : "";
			if (cmd == ta.CommandTypes.Delete) {
				after = "";
			}
			var state = {cmdname:cmd, before:{shapeId:id, shapeText:before || ""}, after:{shapeId:id, shapeText:after}};
			this._steps.push(state);
			this._undoedSteps = [];
		}, destroy:function () {
		}, undo:function () {
			var state = this._steps.pop();
			if (state) {
				this._undoedSteps.push(state);
				this.apply(state, state.after, state.before);
			}
		}, redo:function () {
			var state = this._undoedSteps.pop();
			if (state) {
				this._steps.push(state);
				this.apply(state, state.before, state.after);
			}
		}});
	})();
}

