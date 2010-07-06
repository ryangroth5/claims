/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["drails.monkey"]) {
	dojo._hasResource["drails.monkey"] = true;
	dojo.provide("drails.monkey");
	(function () {
		var _d = dojo;
		if (!_d.fieldToObject) {
			_d.fieldToObject = function (inputNode) {
				var ret = null;
				var item = _d.byId(inputNode);
				if (item) {
					var type = (item.type || "").toLowerCase();
					var _in = item.value;
					if (_in && type && !item.disabled) {
						if (type == "radio" || type == "checkbox") {
							if (item.checked) {
								ret = item.value;
							}
						} else {
							if (item.multiple) {
								ret = [];
								_d.query("option", item).forEach(function (opt) {
									if (opt.selected) {
										ret.push(opt.value);
									}
								});
							} else {
								ret = item.value;
							}
						}
					}
				}
				return ret;
			};
		}
	})();
}

