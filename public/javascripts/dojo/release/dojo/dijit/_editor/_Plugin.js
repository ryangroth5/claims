/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._editor._Plugin"]) {
	dojo._hasResource["dijit._editor._Plugin"] = true;
	dojo.provide("dijit._editor._Plugin");
	dojo.require("dijit._Widget");
	dojo.require("dijit.Editor");
	dojo.require("dijit.form.Button");
	dojo.declare("dijit._editor._Plugin", null, {constructor:function (args, node) {
		this.params = args || {};
		dojo.mixin(this, this.params);
		this._connects = [];
	}, editor:null, iconClassPrefix:"dijitEditorIcon", button:null, command:"", useDefaultCommand:true, buttonClass:dijit.form.Button, getLabel:function (key) {
		return this.editor.commands[key];
	}, _initButton:function () {
		if (this.command.length) {
			var label = this.getLabel(this.command);
			var className = this.iconClassPrefix + " " + this.iconClassPrefix + this.command.charAt(0).toUpperCase() + this.command.substr(1);
			if (!this.button) {
				var props = dojo.mixin({label:label, showLabel:false, iconClass:className, dropDown:this.dropDown, tabIndex:"-1"}, this.params || {});
				this.button = new this.buttonClass(props);
			}
		}
	}, destroy:function () {
		dojo.forEach(this._connects, dojo.disconnect);
		if (this.dropDown) {
			this.dropDown.destroyRecursive();
		}
	}, connect:function (o, f, tf) {
		this._connects.push(dojo.connect(o, f, this, tf));
	}, updateState:function () {
		var e = this.editor, c = this.command, checked, enabled;
		if (!e || !e.isLoaded || !c.length) {
			return;
		}
		if (this.button) {
			try {
				enabled = e.queryCommandEnabled(c);
				if (this.enabled !== enabled) {
					this.enabled = enabled;
					this.button.attr("disabled", !enabled);
				}
				if (typeof this.button.checked == "boolean") {
					checked = e.queryCommandState(c);
					if (this.checked !== checked) {
						this.checked = checked;
						this.button.attr("checked", e.queryCommandState(c));
					}
				}
			}
			catch (e) {
				console.log(e);
			}
		}
	}, setEditor:function (editor) {
		this.editor = editor;
		this._initButton();
		if (this.command.length && !this.editor.queryCommandAvailable(this.command)) {
			if (this.button) {
				this.button.domNode.style.display = "none";
			}
		}
		if (this.button && this.useDefaultCommand) {
			this.connect(this.button, "onClick", dojo.hitch(this.editor, "execCommand", this.command, this.commandArg));
		}
		this.connect(this.editor, "onNormalizedDisplayChanged", "updateState");
	}, setToolbar:function (toolbar) {
		if (this.button) {
			toolbar.addChild(this.button);
		}
	}});
}

