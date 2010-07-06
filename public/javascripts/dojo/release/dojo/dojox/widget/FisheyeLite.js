/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.widget.FisheyeLite"]) {
	dojo._hasResource["dojox.widget.FisheyeLite"] = true;
	dojo.provide("dojox.widget.FisheyeLite");
	dojo.experimental("dojox.widget.FisheyeLite");
	dojo.require("dijit._Widget");
	dojo.require("dojo.fx.easing");
	dojo.declare("dojox.widget.FisheyeLite", dijit._Widget, {durationIn:350, easeIn:dojo.fx.easing.backOut, durationOut:1420, easeOut:dojo.fx.easing.elasticOut, properties:null, units:"px", constructor:function (props, node) {
		this.properties = props.properties || {fontSize:2.75};
	}, postCreate:function () {
		this.inherited(arguments);
		this._target = dojo.query(".fisheyeTarget", this.domNode)[0] || this.domNode;
		this._makeAnims();
		this.connect(this.domNode, "onmouseover", "show");
		this.connect(this.domNode, "onmouseout", "hide");
		this.connect(this._target, "onclick", "onClick");
	}, show:function () {
		this._runningOut.stop();
		this._runningIn.play();
	}, hide:function () {
		this._runningIn.stop();
		this._runningOut.play();
	}, _makeAnims:function () {
		var _in = {}, _out = {}, cs = dojo.getComputedStyle(this._target);
		for (var p in this.properties) {
			var prop = this.properties[p], deep = dojo.isObject(prop), v = parseInt(cs[p]);
			_out[p] = {end:v, units:this.units};
			_in[p] = deep ? prop : {end:prop * v, units:this.units};
		}
		this._runningIn = dojo.animateProperty({node:this._target, easing:this.easeIn, duration:this.durationIn, properties:_in});
		this._runningOut = dojo.animateProperty({node:this._target, duration:this.durationOut, easing:this.easeOut, properties:_out});
		this.connect(this._runningIn, "onEnd", dojo.hitch(this, "onSelected", this));
	}, onClick:function (e) {
	}, onSelected:function (e) {
	}});
}

