/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.widget.UpgradeBar"]) {
	dojo._hasResource["dojox.widget.UpgradeBar"] = true;
	dojo.provide("dojox.widget.UpgradeBar");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dojo.fx");
	dojo.require("dojo.cookie");
	dojo.experimental("dojox.widget.UpgradeBar");
	dojo.declare("dojox.widget.UpgradeBar", [dijit._Widget, dijit._Templated], {notifications:[], buttonCancel:"Close for now", noRemindButton:"Don't Remind Me Again", templateString:dojo.cache("dojox.widget", "UpgradeBar/UpgradeBar.html", "<div class=\"dojoxUpgradeBar\">\n\t<div class=\"dojoxUpgradeBarMessage\" dojoAttachPoint=\"messageNode\">message</div>\n\t<div class=\"dojoxUpgradeBarReminderButton\" dojoAttachPoint=\"dontRemindButtonNode\" dojoAttachEvent=\"onclick:_onDontRemindClick\">${noRemindButton}</div>\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dojoxUpgradeBarCloseIcon\" dojoAttachEvent=\"onclick: hide, onmouseenter: _onCloseEnter, onmouseleave: _onCloseLeave\" title=\"${buttonCancel}\"></span>\n</div>\n"), constructor:function (props, node) {
		if (!props.notifications && node) {
			dojo.forEach(node.childNodes, function (n) {
				if (n.nodeType == 1) {
					var val = dojo.attr(n, "validate");
					this.notifications.push({message:n.innerHTML, validate:function () {
						var evals = true;
						try {
							evals = dojo.eval(val);
						}
						catch (e) {
						}
						return evals;
					}});
				}
			}, this);
		}
	}, checkNotifications:function () {
		if (!this.notifications.length) {
			return;
		}
		for (var i = 0; i < this.notifications.length; i++) {
			var evals = this.notifications[i].validate();
			if (evals) {
				this.notify(this.notifications[i].message);
				break;
			}
		}
	}, postCreate:function () {
		this.inherited(arguments);
		if (this.domNode.parentNode) {
			dojo.style(this.domNode, "display", "none");
		}
		dojo.mixin(this.attributeMap, {message:{node:"messageNode", type:"innerHTML"}});
		if (!this.noRemindButton) {
			dojo.destroy(this.dontRemindButtonNode);
		}
		if (dojo.isIE == 6) {
			var self = this;
			var setWidth = function () {
				var v = dijit.getViewport();
				dojo.style(self.domNode, "width", v.w + "px");
			};
			this.connect(window, "resize", function () {
				setWidth();
			});
			setWidth();
		}
		dojo.addOnLoad(this, "checkNotifications");
	}, notify:function (msg) {
		if (dojo.cookie("disableUpgradeReminders")) {
			return;
		}
		if (!this.domNode.parentNode) {
			document.body.appendChild(this.domNode);
		} else {
			dojo.style(this.domNode, "display", "");
		}
		if (msg) {
			this.attr("message", msg);
		}
	}, show:function () {
		this._bodyMarginTop = dojo.style(dojo.body(), "marginTop");
		this._size = dojo.contentBox(this.domNode).h;
		dojo.style(this.domNode, {display:"block", height:0, opacity:0});
		if (!this._showAnim) {
			this._showAnim = dojo.fx.combine([dojo.animateProperty({node:dojo.body(), duration:500, properties:{marginTop:this._bodyMarginTop + this._size}}), dojo.animateProperty({node:this.domNode, duration:500, properties:{height:this._size, opacity:1}})]);
		}
		this._showAnim.play();
	}, hide:function () {
		if (!this._hideAnim) {
			this._hideAnim = dojo.fx.combine([dojo.animateProperty({node:dojo.body(), duration:500, properties:{marginTop:this._bodyMarginTop}}), dojo.animateProperty({node:this.domNode, duration:500, properties:{height:0, opacity:0}})]);
			dojo.connect(this._hideAnim, "onEnd", this, function () {
				dojo.style(this.domNode, "display", "none");
			});
		}
		this._hideAnim.play();
	}, _onDontRemindClick:function () {
		dojo.cookie("disableUpgradeReminders", true, {expires:3650});
		this.hide();
	}, _onCloseEnter:function () {
		dojo.addClass(this.closeButtonNode, "dojoxUpgradeBarCloseIcon-hover");
	}, _onCloseLeave:function () {
		dojo.removeClass(this.closeButtonNode, "dojoxUpgradeBarCloseIcon-hover");
	}});
}

