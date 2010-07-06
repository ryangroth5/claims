/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._base.wai"]) {
	dojo._hasResource["dijit._base.wai"] = true;
	dojo.provide("dijit._base.wai");
	dijit.wai = {onload:function () {
		var div = dojo.create("div", {id:"a11yTestNode", style:{cssText:"border: 1px solid;" + "border-color:red green;" + "position: absolute;" + "height: 5px;" + "top: -999px;" + "background-image: url(\"" + (dojo.config.blankGif || dojo.moduleUrl("dojo", "resources/blank.gif")) + "\");"}}, dojo.body());
		var cs = dojo.getComputedStyle(div);
		if (cs) {
			var bkImg = cs.backgroundImage;
			var needsA11y = (cs.borderTopColor == cs.borderRightColor) || (bkImg != null && (bkImg == "none" || bkImg == "url(invalid-url:)"));
			dojo[needsA11y ? "addClass" : "removeClass"](dojo.body(), "dijit_a11y");
			if (dojo.isIE) {
				div.outerHTML = "";
			} else {
				dojo.body().removeChild(div);
			}
		}
	}};
	if (dojo.isIE || dojo.isMoz) {
		dojo._loaders.unshift(dijit.wai.onload);
	}
	dojo.mixin(dijit, {_XhtmlRoles:/banner|contentinfo|definition|main|navigation|search|note|secondary|seealso/, hasWaiRole:function (elem, role) {
		var waiRole = this.getWaiRole(elem);
		return role ? (waiRole.indexOf(role) > -1) : (waiRole.length > 0);
	}, getWaiRole:function (elem) {
		return dojo.trim((dojo.attr(elem, "role") || "").replace(this._XhtmlRoles, "").replace("wairole:", ""));
	}, setWaiRole:function (elem, role) {
		var curRole = dojo.attr(elem, "role") || "";
		if (!this._XhtmlRoles.test(curRole)) {
			dojo.attr(elem, "role", role);
		} else {
			if ((" " + curRole + " ").indexOf(" " + role + " ") < 0) {
				var clearXhtml = dojo.trim(curRole.replace(this._XhtmlRoles, ""));
				var cleanRole = dojo.trim(curRole.replace(clearXhtml, ""));
				dojo.attr(elem, "role", cleanRole + (cleanRole ? " " : "") + role);
			}
		}
	}, removeWaiRole:function (elem, role) {
		var roleValue = dojo.attr(elem, "role");
		if (!roleValue) {
			return;
		}
		if (role) {
			var t = dojo.trim((" " + roleValue + " ").replace(" " + role + " ", " "));
			dojo.attr(elem, "role", t);
		} else {
			elem.removeAttribute("role");
		}
	}, hasWaiState:function (elem, state) {
		return elem.hasAttribute ? elem.hasAttribute("aria-" + state) : !!elem.getAttribute("aria-" + state);
	}, getWaiState:function (elem, state) {
		return elem.getAttribute("aria-" + state) || "";
	}, setWaiState:function (elem, state, value) {
		elem.setAttribute("aria-" + state, value);
	}, removeWaiState:function (elem, state) {
		elem.removeAttribute("aria-" + state);
	}});
}

