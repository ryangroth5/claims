/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.editor.plugins.Save"]) {
	dojo._hasResource["dojox.editor.plugins.Save"] = true;
	dojo.provide("dojox.editor.plugins.Save");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dijit.form.Button");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dojox.editor.plugins", "Save", null, "ROOT,cs,de,es,fr,hu,it,ja,ko,pl,pt,ru,zh,zh-tw");
	dojo.declare("dojox.editor.plugins.Save", dijit._editor._Plugin, {iconClassPrefix:"dijitAdditionalEditorIcon", url:"", logResults:true, _initButton:function () {
		var strings = dojo.i18n.getLocalization("dojox.editor.plugins", "Save");
		this.button = new dijit.form.Button({label:strings["save"], showLabel:false, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "Save", tabIndex:"-1", onClick:dojo.hitch(this, "_save")});
	}, setEditor:function (editor) {
		this.editor = editor;
		this._initButton();
	}, _save:function () {
		var content = this.editor.attr("value");
		this.save(content);
	}, save:function (content) {
		var headers = {"Content-Type":"text/html"};
		if (this.url) {
			var postArgs = {url:this.url, postData:content, headers:headers, handleAs:"text"};
			this.button.attr("disabled", true);
			var deferred = dojo.xhrPost(postArgs);
			deferred.addCallback(dojo.hitch(this, this.onSuccess));
			deferred.addErrback(dojo.hitch(this, this.onError));
		} else {
			console.log("No URL provided, no post-back of content: " + content);
		}
	}, onSuccess:function (resp, ioargs) {
		this.button.attr("disabled", false);
		if (this.logResults) {
			console.log(resp);
		}
	}, onError:function (error, ioargs) {
		this.button.attr("disabled", false);
		if (this.logResults) {
			console.log(error);
		}
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		var name = o.args.name.toLowerCase();
		if (name === "save") {
			o.plugin = new dojox.editor.plugins.Save({url:("url" in o.args) ? o.args.url : "", logResults:("logResults" in o.args) ? o.args.logResults : true});
		}
	});
}

