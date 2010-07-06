/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit._base.popup"]) {
	dojo._hasResource["dijit._base.popup"] = true;
	dojo.provide("dijit._base.popup");
	dojo.require("dijit._base.focus");
	dojo.require("dijit._base.place");
	dojo.require("dijit._base.window");
	dijit.popup = new function () {
		var stack = [], beginZIndex = 1000, idGen = 1;
		this.moveOffScreen = function (node) {
			var s = node.style;
			s.visibility = "hidden";
			s.position = "absolute";
			s.top = "-9999px";
			if (s.display == "none") {
				s.display = "";
			}
			dojo.body().appendChild(node);
		};
		var getTopPopup = function () {
			for (var pi = stack.length - 1; pi > 0 && stack[pi].parent === stack[pi - 1].widget; pi--) {
			}
			return stack[pi];
		};
		var wrappers = [];
		this.open = function (args) {
			var widget = args.popup, orient = args.orient || (dojo._isBodyLtr() ? {"BL":"TL", "BR":"TR", "TL":"BL", "TR":"BR"} : {"BR":"TR", "BL":"TL", "TR":"BR", "TL":"BL"}), around = args.around, id = (args.around && args.around.id) ? (args.around.id + "_dropdown") : ("popup_" + idGen++);
			var wrapperobj = wrappers.pop(), wrapper, iframe;
			if (!wrapperobj) {
				wrapper = dojo.create("div", {"class":"dijitPopup"}, dojo.body());
				dijit.setWaiRole(wrapper, "presentation");
			} else {
				wrapper = wrapperobj[0];
				iframe = wrapperobj[1];
			}
			dojo.attr(wrapper, {id:id, style:{zIndex:beginZIndex + stack.length, visibility:"hidden", top:"-9999px"}, dijitPopupParent:args.parent ? args.parent.id : ""});
			var s = widget.domNode.style;
			s.display = "";
			s.visibility = "";
			s.position = "";
			s.top = "0px";
			wrapper.appendChild(widget.domNode);
			if (!iframe) {
				iframe = new dijit.BackgroundIframe(wrapper);
			} else {
				iframe.resize(wrapper);
			}
			var best = around ? dijit.placeOnScreenAroundElement(wrapper, around, orient, widget.orient ? dojo.hitch(widget, "orient") : null) : dijit.placeOnScreen(wrapper, args, orient == "R" ? ["TR", "BR", "TL", "BL"] : ["TL", "BL", "TR", "BR"], args.padding);
			wrapper.style.visibility = "visible";
			var handlers = [];
			handlers.push(dojo.connect(wrapper, "onkeypress", this, function (evt) {
				if (evt.charOrCode == dojo.keys.ESCAPE && args.onCancel) {
					dojo.stopEvent(evt);
					args.onCancel();
				} else {
					if (evt.charOrCode === dojo.keys.TAB) {
						dojo.stopEvent(evt);
						var topPopup = getTopPopup();
						if (topPopup && topPopup.onCancel) {
							topPopup.onCancel();
						}
					}
				}
			}));
			if (widget.onCancel) {
				handlers.push(dojo.connect(widget, "onCancel", args.onCancel));
			}
			handlers.push(dojo.connect(widget, widget.onExecute ? "onExecute" : "onChange", function () {
				var topPopup = getTopPopup();
				if (topPopup && topPopup.onExecute) {
					topPopup.onExecute();
				}
			}));
			stack.push({wrapper:wrapper, iframe:iframe, widget:widget, parent:args.parent, onExecute:args.onExecute, onCancel:args.onCancel, onClose:args.onClose, handlers:handlers});
			if (widget.onOpen) {
				widget.onOpen(best);
			}
			return best;
		};
		this.close = function (popup) {
			while (dojo.some(stack, function (elem) {
				return elem.widget == popup;
			})) {
				var top = stack.pop(), wrapper = top.wrapper, iframe = top.iframe, widget = top.widget, onClose = top.onClose;
				if (widget.onClose) {
					widget.onClose();
				}
				dojo.forEach(top.handlers, dojo.disconnect);
				if (widget && widget.domNode) {
					this.moveOffScreen(widget.domNode);
				}
				wrapper.style.top = "-9999px";
				wrapper.style.visibility = "hidden";
				wrappers.push([wrapper, iframe]);
				if (onClose) {
					onClose();
				}
			}
		};
	}();
	dijit._frames = new function () {
		var queue = [];
		this.pop = function () {
			var iframe;
			if (queue.length) {
				iframe = queue.pop();
				iframe.style.display = "";
			} else {
				if (dojo.isIE) {
					var burl = dojo.config["dojoBlankHtmlUrl"] || (dojo.moduleUrl("dojo", "resources/blank.html") + "") || "javascript:\"\"";
					var html = "<iframe src='" + burl + "'" + " style='position: absolute; left: 0px; top: 0px;" + "z-index: -1; filter:Alpha(Opacity=\"0\");'>";
					iframe = dojo.doc.createElement(html);
				} else {
					iframe = dojo.create("iframe");
					iframe.src = "javascript:\"\"";
					iframe.className = "dijitBackgroundIframe";
					dojo.style(iframe, "opacity", 0.1);
				}
				iframe.tabIndex = -1;
			}
			return iframe;
		};
		this.push = function (iframe) {
			iframe.style.display = "none";
			queue.push(iframe);
		};
	}();
	dijit.BackgroundIframe = function (node) {
		if (!node.id) {
			throw new Error("no id");
		}
		if (dojo.isIE || dojo.isMoz) {
			var iframe = dijit._frames.pop();
			node.appendChild(iframe);
			if (dojo.isIE < 7) {
				this.resize(node);
				this._conn = dojo.connect(node, "onresize", this, function () {
					this.resize(node);
				});
			} else {
				dojo.style(iframe, {width:"100%", height:"100%"});
			}
			this.iframe = iframe;
		}
	};
	dojo.extend(dijit.BackgroundIframe, {resize:function (node) {
		if (this.iframe && dojo.isIE < 7) {
			dojo.style(this.iframe, {width:node.offsetWidth + "px", height:node.offsetHeight + "px"});
		}
	}, destroy:function () {
		if (this._conn) {
			dojo.disconnect(this._conn);
			this._conn = null;
		}
		if (this.iframe) {
			dijit._frames.push(this.iframe);
			delete this.iframe;
		}
	}});
}

