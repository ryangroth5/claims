/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["zstaff.helpers.form"]) {
	dojo._hasResource["zstaff.helpers.form"] = true;
	dojo.provide("zstaff.helpers.form");
	dojo.require("dojo.io.iframe");
	zstaff.helpers.form.submit = function (update, form, url, content, load) {
		var so = {url:url, load:function (data, options, opt2) {
			if (load) {
				load();
			}
			if (options.xhr && options.xhr.getResponseHeader("content-type").match("text/javascript")) {
				dojo.eval(data);
			} else {
				if (update) {
					if (dojo.isObject(data) && (data instanceof Document)) {
						dojo.byId(update).innerHTML = data.body.innerHTML;
					} else {
						dojo.byId(update).innerHTML = data;
					}
					dojo.parser.parse(dojo.byId(update));
				}
			}
		}, error:function (data, err) {
			console.error("i/o failure %s %s", data, err);
			console.dir(data);
			console.dir(err);
		}};
		if (content) {
			so.content = content;
		}
		if (form.nodeName == "FORM") {
			so.form = form;
		}
		if (dojo.query("input[type='file']").length > 0) {
			if (!update) {
				throw "When using a file field in the form, return HTML and provide a content to update";
			}
			so.handleAs = "html";
			dojo.io.iframe.send(so);
		} else {
			dojo.xhrPost(so);
		}
		return false;
	};
}

