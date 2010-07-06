/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.editor.plugins.Preview"]) {
	dojo._hasResource["dojox.editor.plugins.Preview"] = true;
	dojo.provide("dojox.editor.plugins.Preview");
	dojo.require("dijit._editor._Plugin");
	dojo.require("dijit.form.Button");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("dojox.editor.plugins", "Preview", null, "ROOT,cs,de,es,fr,hu,it,ja,ko,pl,pt,ru,zh,zh-tw");
	dojo.declare("dojox.editor.plugins.Preview", dijit._editor._Plugin, {useDefaultCommand:false, styles:"", stylesheets:null, iconClassPrefix:"dijitAdditionalEditorIcon", _initButton:function () {
		this._nlsResources = dojo.i18n.getLocalization("dojox.editor.plugins", "Preview");
		this.button = new dijit.form.Button({label:this._nlsResources["preview"], showLabel:false, iconClass:this.iconClassPrefix + " " + this.iconClassPrefix + "Preview", tabIndex:"-1", onClick:dojo.hitch(this, "_preview")});
	}, setEditor:function (editor) {
		this.editor = editor;
		this._initButton();
	}, _preview:function () {
		try {
			var content = this.editor.attr("value");
			var head = "\t\t<meta http-equiv='Content-Type' content='text/html; charset='UTF-8'>\n";
			var i;
			if (this.stylesheets) {
				for (i = 0; i < this.stylesheets.length; i++) {
					head += "\t\t<link rel='stylesheet' type='text/css' href='" + this.stylesheets[i] + "'>\n";
				}
			}
			if (this.styles) {
				head += ("\t\t<style>" + this.styles + "</style>\n");
			}
			content = "<html>\n\t<head>\n" + head + "\t</head>\n\t<body>\n" + content + "\n\t</body>\n</html>";
			var win = window.open("javascript: ''", this._nlsResources["preview"], "status=1,menubar=0,location=0,toolbar=0");
			win.document.open();
			win.document.write(content);
			win.document.close();
		}
		catch (e) {
			console.warn(e);
		}
	}});
	dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
		if (o.plugin) {
			return;
		}
		var name = o.args.name.toLowerCase();
		if (name === "preview") {
			o.plugin = new dojox.editor.plugins.Preview({styles:("styles" in o.args) ? o.args.styles : "", stylesheets:("stylesheets" in o.args) ? o.args.stylesheets : null});
		}
	});
}

