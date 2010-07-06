/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.ProgressBar"]) {
	dojo._hasResource["dijit.ProgressBar"] = true;
	dojo.provide("dijit.ProgressBar");
	dojo.require("dojo.fx");
	dojo.require("dojo.number");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.declare("dijit.ProgressBar", [dijit._Widget, dijit._Templated], {progress:"0", maximum:100, places:0, indeterminate:false, name:"", templateString:dojo.cache("dijit", "templates/ProgressBar.html", "<div class=\"dijitProgressBar dijitProgressBarEmpty\"\n\t><div waiRole=\"progressbar\" dojoAttachPoint=\"internalProgress\" class=\"dijitProgressBarFull\"\n\t\t><div class=\"dijitProgressBarTile\"></div\n\t\t><span style=\"visibility:hidden\">&nbsp;</span\n\t></div\n\t><div dojoAttachPoint=\"label\" class=\"dijitProgressBarLabel\" id=\"${id}_label\">&nbsp;</div\n\t><img dojoAttachPoint=\"indeterminateHighContrastImage\" class=\"dijitProgressBarIndeterminateHighContrastImage\" alt=\"\"\n\t></img\n></div>\n"), _indeterminateHighContrastImagePath:dojo.moduleUrl("dijit", "themes/a11y/indeterminate_progress.gif"), postCreate:function () {
		this.inherited(arguments);
		this.indeterminateHighContrastImage.setAttribute("src", this._indeterminateHighContrastImagePath.toString());
		this.update();
	}, update:function (attributes) {
		dojo.mixin(this, attributes || {});
		var tip = this.internalProgress;
		var percent = 1, classFunc;
		if (this.indeterminate) {
			classFunc = "addClass";
			dijit.removeWaiState(tip, "valuenow");
			dijit.removeWaiState(tip, "valuemin");
			dijit.removeWaiState(tip, "valuemax");
		} else {
			classFunc = "removeClass";
			if (String(this.progress).indexOf("%") != -1) {
				percent = Math.min(parseFloat(this.progress) / 100, 1);
				this.progress = percent * this.maximum;
			} else {
				this.progress = Math.min(this.progress, this.maximum);
				percent = this.progress / this.maximum;
			}
			var text = this.report(percent);
			this.label.firstChild.nodeValue = text;
			dijit.setWaiState(tip, "describedby", this.label.id);
			dijit.setWaiState(tip, "valuenow", this.progress);
			dijit.setWaiState(tip, "valuemin", 0);
			dijit.setWaiState(tip, "valuemax", this.maximum);
		}
		dojo[classFunc](this.domNode, "dijitProgressBarIndeterminate");
		tip.style.width = (percent * 100) + "%";
		this.onChange();
	}, _setValueAttr:function (v) {
		if (v == Infinity) {
			this.update({indeterminate:true});
		} else {
			this.update({indeterminate:false, progress:v});
		}
	}, _getValueAttr:function () {
		return this.progress;
	}, report:function (percent) {
		return dojo.number.format(percent, {type:"percent", places:this.places, locale:this.lang});
	}, onChange:function () {
	}});
}

