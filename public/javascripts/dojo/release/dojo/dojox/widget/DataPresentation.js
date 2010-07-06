/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.widget.DataPresentation"]) {
	dojo._hasResource["dojox.widget.DataPresentation"] = true;
	dojo.provide("dojox.widget.DataPresentation");
	dojo.experimental("dojox.widget.DataPresentation");
	dojo.require("dojox.grid.DataGrid");
	dojo.require("dojox.charting.Chart2D");
	dojo.require("dojox.charting.widget.Legend");
	dojo.require("dojox.charting.action2d.Tooltip");
	dojo.require("dojox.charting.action2d.Highlight");
	dojo.require("dojo.colors");
	dojo.require("dojo.data.ItemFileWriteStore");
	(function () {
		var getLabels = function (rangevalues, labelMod, reverse, charttype, domNode) {
			var labels = [], labelmod = labelMod;
			labels[0] = {value:0, text:""};
			var range = rangevalues.slice(0);
			if (reverse) {
				range.reverse();
			}
			var nlabels = range.length;
			if ((charttype !== "ClusteredBars") && (charttype !== "StackedBars")) {
				var cwid = domNode.offsetWidth;
				var tmp = ("" + range[0]).length * range.length * 7;
				if (labelmod == 1) {
					for (var z = 1; z < 500; ++z) {
						if ((tmp / z) < cwid) {
							break;
						}
						++labelmod;
					}
				}
			}
			for (var i = 0; i < nlabels; i++) {
				if (i % labelmod == 0) {
					labels.push({value:(i + 1), text:range[i]});
				} else {
					labels.push({value:(i + 1), text:""});
				}
			}
			labels.push({value:(nlabels + 1), text:""});
			return labels;
		};
		var getIndependentAxisArgs = function (charttype, labels) {
			var args = {vertical:false, labels:labels, min:0, max:labels.length - 1, majorTickStep:1, minorTickStep:1};
			if ((charttype === "ClusteredBars") || (charttype === "StackedBars")) {
				args.vertical = true;
			}
			if ((charttype === "Lines") || (charttype === "Areas") || (charttype === "StackedAreas")) {
				args.min++;
				args.max--;
			}
			return args;
		};
		var getDependentAxisArgs = function (charttype, axistype, minval, maxval) {
			var args = {vertical:true, fixLower:"major", fixUpper:"major", natural:true};
			if (axistype === "secondary") {
				args.leftBottom = false;
			}
			if ((charttype === "ClusteredBars") || (charttype === "StackedBars")) {
				args.vertical = false;
			}
			if (minval == maxval) {
				args.min = minval - 1;
				args.max = maxval + 1;
			}
			return args;
		};
		var getPlotArgs = function (charttype, axistype, animate) {
			var args = {type:charttype, hAxis:"independent", vAxis:"dependent-" + axistype, gap:4, lines:false, areas:false, markers:false};
			if ((charttype === "ClusteredBars") || (charttype === "StackedBars")) {
				args.hAxis = args.vAxis;
				args.vAxis = "independent";
			}
			if ((charttype === "Lines") || (charttype === "Hybrid-Lines") || (charttype === "Areas") || (charttype === "StackedAreas")) {
				args.lines = true;
			}
			if ((charttype === "Areas") || (charttype === "StackedAreas")) {
				args.areas = true;
			}
			if (charttype === "Lines") {
				args.markers = true;
			}
			if (charttype === "Hybrid-Lines") {
				args.shadows = {dx:2, dy:2, dw:2};
				args.type = "Lines";
			}
			if (charttype === "Hybrid-ClusteredColumns") {
				args.type = "ClusteredColumns";
			}
			if (animate) {
				args.animate = animate;
			}
			return args;
		};
		var setupChart = function (domNode, chart, type, reverse, animate, labelMod, theme, store, query, queryOptions) {
			var _chart = chart;
			if (!_chart) {
				domNode.innerHTML = "";
				_chart = new dojox.charting.Chart2D(domNode);
			}
			if (theme) {
				theme._clone = function () {
					var result = new dojox.charting.Theme({chart:this.chart, plotarea:this.plotarea, axis:this.axis, series:this.series, marker:this.marker, antiAlias:this.antiAlias, assignColors:this.assignColors, assignMarkers:this.assigneMarkers, colors:dojo.delegate(this.colors)});
					result.markers = this.markers;
					result._buildMarkerArray();
					return result;
				};
				_chart.setTheme(theme);
			}
			var labels = getLabels(store.series_data[0], labelMod, reverse, type, domNode);
			var plots = {};
			var maxval = null;
			var minval = null;
			var nseries = store.series_name.length;
			for (var i = 0; i < nseries; i++) {
				if (store.series_chart[i] && (store.series_data[i].length > 0)) {
					var charttype = type;
					var axistype = store.series_axis[i];
					if (charttype == "Hybrid") {
						if (store.series_charttype[i] == "line") {
							charttype = "Hybrid-Lines";
						} else {
							charttype = "Hybrid-ClusteredColumns";
						}
					}
					if (!plots[axistype]) {
						plots[axistype] = {};
					}
					if (!plots[axistype][charttype]) {
						var axisname = axistype + "-" + charttype;
						_chart.addPlot(axisname, getPlotArgs(charttype, axistype, animate));
						new dojox.charting.action2d.Tooltip(_chart, axisname);
						if ((charttype !== "Lines") && (charttype !== "Hybrid-Lines")) {
							new dojox.charting.action2d.Highlight(_chart, axisname);
						}
						plots[axistype][charttype] = true;
					}
					var xvals = [];
					var valen = store.series_data[i].length;
					for (var j = 0; j < valen; j++) {
						var val = store.series_data[i][j];
						xvals.push(val);
						if (maxval === null || val > maxval) {
							maxval = val;
						}
						if (minval === null || val < minval) {
							minval = val;
						}
					}
					if (reverse) {
						xvals.reverse();
					}
					var seriesargs = {plot:axistype + "-" + charttype};
					if (store.series_linestyle[i]) {
						seriesargs.stroke = {style:store.series_linestyle[i]};
					}
					_chart.addSeries(store.series_name[i], xvals, seriesargs);
				}
			}
			_chart.addAxis("independent", getIndependentAxisArgs(type, labels));
			_chart.addAxis("dependent-primary", getDependentAxisArgs(type, "primary", minval, maxval));
			_chart.addAxis("dependent-secondary", getDependentAxisArgs(type, "secondary", minval, maxval));
			_chart.render();
			return _chart;
		};
		var setupLegend = function (domNode, legend, chart, vertical) {
			var _legend = legend;
			if (!_legend) {
				if (vertical) {
					_legend = new dojox.charting.widget.Legend({chart:chart, horizontal:false}, domNode);
				} else {
					_legend = new dojox.charting.widget.Legend({chart:chart, vertical:false}, domNode);
				}
			}
			return _legend;
		};
		var setupGrid = function (domNode, grid, store, query, queryOptions) {
			var _grid = grid || new dojox.grid.DataGrid({}, domNode);
			_grid.startup();
			_grid.setStore(store, query, queryOptions);
			var structure = [];
			for (var ser = 0; ser < store.series_name.length; ser++) {
				if (store.series_grid[ser] && (store.series_data[ser].length > 0)) {
					structure.push({field:"data." + ser, name:store.series_name[ser], width:"auto", formatter:store.series_gridformatter[ser]});
				}
			}
			_grid.setStructure(structure);
			_grid.render();
			return _grid;
		};
		var setupTitle = function (domNode, store) {
			if (store.title) {
				domNode.innerHTML = store.title;
			}
		};
		var setupFooter = function (domNode, store) {
			if (store.footer) {
				domNode.innerHTML = store.footer;
			}
		};
		var getSubfield = function (object, field) {
			var result = object;
			if (field) {
				var fragments = field.split(/[.\[\]]+/);
				for (var frag in fragments) {
					if (result) {
						result = result[fragments[frag]];
					}
				}
			}
			return result;
		};
		dojo.declare("dojox.widget.DataPresentation", null, {type:"chart", chartType:"clusteredBars", reverse:false, animate:null, labelMod:1, legendVertical:false, constructor:function (node, args) {
			dojo.mixin(this, args);
			this.domNode = dojo.byId(node);
			this[this.type + "Node"] = this.domNode;
			if (typeof this.theme == "string") {
				this.theme = dojo.getObject(this.theme);
			}
			this.chartNode = dojo.byId(this.chartNode);
			this.legendNode = dojo.byId(this.legendNode);
			this.gridNode = dojo.byId(this.gridNode);
			this.titleNode = dojo.byId(this.titleNode);
			this.footerNode = dojo.byId(this.footerNode);
			if (this.url) {
				this.setURL(null, this.refreshInterval);
			} else {
				if (this.data) {
					this.setData(null, this.refreshInterval);
				} else {
					this.setStore();
				}
			}
		}, setURL:function (url, refreshInterval) {
			if (refreshInterval) {
				this.cancelRefresh();
			}
			this.url = url || this.url;
			this.refreshInterval = refreshInterval || this.refreshInterval;
			var me = this;
			dojo.xhrGet({url:this.url, handleAs:"json-comment-optional", load:function (response, ioArgs) {
				me.setData(response);
			}, error:function (xhr, ioArgs) {
				if (me.urlError && (typeof me.urlError == "function")) {
					me.urlError(xhr, ioArgs);
				}
			}});
			if (refreshInterval && (this.refreshInterval > 0)) {
				this.refreshIntervalPending = setInterval(function () {
					me.setURL();
				}, this.refreshInterval);
			}
		}, setData:function (data, refreshInterval) {
			if (refreshInterval) {
				this.cancelRefresh();
			}
			this.data = data || this.data;
			this.refreshInterval = refreshInterval || this.refreshInterval;
			var _series = (typeof this.series == "function") ? this.series(this.data) : this.series;
			var datasets = [], series_data = [], series_name = [], series_chart = [], series_charttype = [], series_linestyle = [], series_axis = [], series_grid = [], series_gridformatter = [], maxlen = 0;
			for (var ser = 0; ser < _series.length; ser++) {
				datasets[ser] = getSubfield(this.data, _series[ser].datapoints);
				if (datasets[ser] && (datasets[ser].length > maxlen)) {
					maxlen = datasets[ser].length;
				}
				series_data[ser] = [];
				series_name[ser] = _series[ser].name || (_series[ser].namefield ? getSubfield(this.data, _series[ser].namefield) : null) || ("series " + ser);
				series_chart[ser] = (_series[ser].chart !== false);
				series_charttype[ser] = _series[ser].charttype || "bar";
				series_linestyle[ser] = _series[ser].linestyle;
				series_axis[ser] = _series[ser].axis || "primary";
				series_grid[ser] = (_series[ser].grid !== false);
				series_gridformatter[ser] = _series[ser].gridformatter;
			}
			var point, datapoint, datavalue, fdatavalue;
			var datapoints = [];
			for (point = 0; point < maxlen; point++) {
				datapoint = {index:point};
				for (ser = 0; ser < _series.length; ser++) {
					if (datasets[ser] && (datasets[ser].length > point)) {
						datavalue = getSubfield(datasets[ser][point], _series[ser].field);
						if (series_chart[ser]) {
							fdatavalue = parseFloat(datavalue);
							if (!isNaN(fdatavalue)) {
								datavalue = fdatavalue;
							}
						}
						datapoint["data." + ser] = datavalue;
						series_data[ser].push(datavalue);
					}
				}
				datapoints.push(datapoint);
			}
			if (maxlen <= 0) {
				datapoints.push({index:0});
			}
			var store = new dojo.data.ItemFileWriteStore({data:{identifier:"index", items:datapoints}});
			if (this.data.title) {
				store.title = this.data.title;
			}
			if (this.data.footer) {
				store.footer = this.data.footer;
			}
			store.series_data = series_data;
			store.series_name = series_name;
			store.series_chart = series_chart;
			store.series_charttype = series_charttype;
			store.series_linestyle = series_linestyle;
			store.series_axis = series_axis;
			store.series_grid = series_grid;
			store.series_gridformatter = series_gridformatter;
			this.setPreparedStore(store);
			if (refreshInterval && (this.refreshInterval > 0)) {
				var me = this;
				this.refreshIntervalPending = setInterval(function () {
					me.setData();
				}, this.refreshInterval);
			}
		}, refresh:function () {
			if (this.url) {
				this.setURL(this.url, this.refreshInterval);
			} else {
				if (this.data) {
					this.setData(this.data, this.refreshInterval);
				}
			}
		}, cancelRefresh:function () {
			if (this.refreshIntervalPending) {
				clearInterval(this.refreshIntervalPending);
				this.refreshIntervalPending = undefined;
			}
		}, setStore:function (store, query, queryOptions) {
			this.setPreparedStore(store, query, queryOptions);
		}, setPreparedStore:function (store, query, queryOptions) {
			this.preparedstore = store || this.store;
			this.query = query || this.query;
			this.queryOptions = queryOptions || this.queryOptions;
			if (this.preparedstore) {
				if (this.chartNode) {
					this.chartWidget = setupChart(this.chartNode, this.chartWidget, this.chartType, this.reverse, this.animate, this.labelMod, this.theme, this.preparedstore, this.query, this, queryOptions);
				}
				if (this.legendNode) {
					this.legendWidget = setupLegend(this.legendNode, this.legendWidget, this.chartWidget, this.legendVertical);
				}
				if (this.gridNode) {
					this.gridWidget = setupGrid(this.gridNode, this.gridWidget, this.preparedstore, this.query, this.queryOptions);
				}
				if (this.titleNode) {
					setupTitle(this.titleNode, this.preparedstore);
				}
				if (this.footerNode) {
					setupFooter(this.footerNode, this.preparedstore);
				}
			}
		}, getChartWidget:function () {
			return this.chartWidget;
		}, getGridWidget:function () {
			return this.gridWidget;
		}, destroy:function () {
			this.cancelRefresh();
			if (this.chartWidget) {
				this.chartWidget.destroy();
				this.chartWidget = undefined;
			}
			if (this.legendWidget) {
				this.legendWidget = undefined;
			}
			if (this.gridWidget) {
				this.gridWidget = undefined;
			}
			if (this.chartNode) {
				this.chartNode.innerHTML = "";
			}
			if (this.legendNode) {
				this.legendNode.innerHTML = "";
			}
			if (this.gridNode) {
				this.gridNode.innerHTML = "";
			}
			if (this.titleNode) {
				this.titleNode.innerHTML = "";
			}
			if (this.footerNode) {
				this.footerNode.innerHTML = "";
			}
		}});
	})();
}

