/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.charting.Theme"]) {
	dojo._hasResource["dojox.charting.Theme"] = true;
	dojo.provide("dojox.charting.Theme");
	dojo.require("dojox.color");
	dojo.require("dojox.color.Palette");
	(function () {
		var dxc = dojox.charting;
		dxc.Theme = function (kwArgs) {
			kwArgs = kwArgs || {};
			var def = dxc.Theme._def;
			dojo.forEach(["chart", "plotarea", "axis", "series", "marker"], function (n) {
				this[n] = dojo.delegate(def[n], kwArgs[n] || {});
			}, this);
			this.markers = dojo.delegate(dxc.Theme.Markers, kwArgs.markers || {});
			this.colors = [];
			this.antiAlias = ("antiAlias" in kwArgs) ? kwArgs.antiAlias : true;
			this.assignColors = ("assignColors" in kwArgs) ? kwArgs.assignColors : true;
			this.assignMarkers = ("assignMarkers" in kwArgs) ? kwArgs.assignMarkers : true;
			kwArgs.colors = kwArgs.colors || def.colors;
			dojo.forEach(kwArgs.colors, function (item) {
				this.colors.push(item);
			}, this);
			this._current = {color:0, marker:0};
			this._markers = [];
			this._buildMarkerArray();
		};
		dxc.Theme.Markers = {CIRCLE:"m-3,0 c0,-4 6,-4 6,0 m-6,0 c0,4 6,4 6,0", SQUARE:"m-3,-3 l0,6 6,0 0,-6 z", DIAMOND:"m0,-3 l3,3 -3,3 -3,-3 z", CROSS:"m0,-3 l0,6 m-3,-3 l6,0", X:"m-3,-3 l6,6 m0,-6 l-6,6", TRIANGLE:"m-3,3 l3,-6 3,6 z", TRIANGLE_INVERTED:"m-3,-3 l3,6 3,-6 z"};
		dxc.Theme._def = {chart:{stroke:null, fill:"white"}, plotarea:{stroke:null, fill:"white"}, axis:{stroke:{color:"#333", width:1}, majorTick:{color:"#666", width:1, length:6, position:"center"}, minorTick:{color:"#666", width:0.8, length:3, position:"center"}, microTick:{color:"#666", width:0.5, length:1, position:"center"}, font:"normal normal normal 7pt Tahoma", fontColor:"#333"}, series:{outline:{width:0.1, color:"#ccc"}, stroke:{width:1.5, color:"#333"}, fill:"#ccc", font:"normal normal normal 7pt Tahoma", fontColor:"#000"}, marker:{stroke:{width:1}, fill:"#333", font:"normal normal normal 7pt Tahoma", fontColor:"#000"}, colors:["#54544c", "#858e94", "#6e767a", "#948585", "#474747"]};
		dojo.extend(dxc.Theme, {defineColors:function (obj) {
			var kwArgs = obj || {};
			var c = [], n = kwArgs.num || 5;
			if (kwArgs.colors) {
				var l = kwArgs.colors.length;
				for (var i = 0; i < n; i++) {
					c.push(kwArgs.colors[i % l]);
				}
				this.colors = c;
			} else {
				if (kwArgs.hue) {
					var s = kwArgs.saturation || 100;
					var st = kwArgs.low || 30;
					var end = kwArgs.high || 90;
					var l = (end + st) / 2;
					this.colors = dojox.color.Palette.generate(dojox.color.fromHsv(kwArgs.hue, s, l), "monochromatic").colors;
				} else {
					if (kwArgs.generator) {
						this.colors = dojox.color.Palette.generate(kwArgs.base, kwArgs.generator).colors;
					}
				}
			}
		}, _buildMarkerArray:function () {
			this._markers = [];
			for (var p in this.markers) {
				this._markers.push(this.markers[p]);
			}
			this._current.marker = 0;
		}, _clone:function () {
			return new dxc.Theme({chart:this.chart, plotarea:this.plotarea, axis:this.axis, series:this.series, marker:this.marker, antiAlias:this.antiAlias, assignColors:this.assignColors, assignMarkers:this.assigneMarkers, colors:dojo.delegate(this.colors)});
		}, addMarker:function (name, segment) {
			this.markers[name] = segment;
			this._buildMarkerArray();
		}, setMarkers:function (obj) {
			this.markers = obj;
			this._buildMarkerArray();
		}, next:function (type) {
			if (type == "marker") {
				return this._markers[this._current.marker++ % this._markers.length];
			} else {
				return this.colors[this._current.color++ % this.colors.length];
			}
		}, clear:function () {
			this._current = {color:0, marker:0};
		}});
	})();
}

