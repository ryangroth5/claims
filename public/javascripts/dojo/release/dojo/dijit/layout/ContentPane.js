/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dijit.layout.ContentPane"]) {
	dojo._hasResource["dijit.layout.ContentPane"] = true;
	dojo.provide("dijit.layout.ContentPane");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Contained");
	dojo.require("dijit.layout._LayoutWidget");
	dojo.require("dojo.parser");
	dojo.require("dojo.string");
	dojo.require("dojo.html");
	dojo.requireLocalization("dijit", "loading", null, "ROOT,ar,ca,cs,da,de,el,es,fi,fr,he,hu,it,ja,ko,nb,nl,pl,pt,pt-pt,ru,sk,sl,sv,th,tr,zh,zh-tw");
	dojo.declare("dijit.layout.ContentPane", dijit._Widget, {href:"", extractContent:false, parseOnLoad:true, preventCache:false, preload:false, refreshOnShow:false, loadingMessage:"<span class='dijitContentPaneLoading'>${loadingState}</span>", errorMessage:"<span class='dijitContentPaneError'>${errorState}</span>", isLoaded:false, baseClass:"dijitContentPane", doLayout:true, ioArgs:{}, isContainer:true, isLayoutContainer:true, onLoadDeferred:null, attributeMap:dojo.delegate(dijit._Widget.prototype.attributeMap, {title:[]}), postMixInProperties:function () {
		this.inherited(arguments);
		var messages = dojo.i18n.getLocalization("dijit", "loading", this.lang);
		this.loadingMessage = dojo.string.substitute(this.loadingMessage, messages);
		this.errorMessage = dojo.string.substitute(this.errorMessage, messages);
		if (!this.href && this.srcNodeRef && this.srcNodeRef.innerHTML) {
			this.isLoaded = true;
		}
	}, buildRendering:function () {
		this.inherited(arguments);
		if (!this.containerNode) {
			this.containerNode = this.domNode;
		}
	}, postCreate:function () {
		this.domNode.title = "";
		if (!dojo.attr(this.domNode, "role")) {
			dijit.setWaiRole(this.domNode, "group");
		}
		dojo.addClass(this.domNode, this.baseClass);
	}, startup:function () {
		if (this._started) {
			return;
		}
		var parent = dijit._Contained.prototype.getParent.call(this);
		this._childOfLayoutWidget = parent && parent.isLayoutContainer;
		this._needLayout = !this._childOfLayoutWidget;
		if (this.isLoaded) {
			dojo.forEach(this.getChildren(), function (child) {
				child.startup();
			});
		}
		if (this._isShown() || this.preload) {
			this._onShow();
		}
		this.inherited(arguments);
	}, _checkIfSingleChild:function () {
		var childNodes = dojo.query("> *", this.containerNode).filter(function (node) {
			return node.tagName !== "SCRIPT";
		}), childWidgetNodes = childNodes.filter(function (node) {
			return dojo.hasAttr(node, "dojoType") || dojo.hasAttr(node, "widgetId");
		}), candidateWidgets = dojo.filter(childWidgetNodes.map(dijit.byNode), function (widget) {
			return widget && widget.domNode && widget.resize;
		});
		if (childNodes.length == childWidgetNodes.length && candidateWidgets.length == 1) {
			this._singleChild = candidateWidgets[0];
		} else {
			delete this._singleChild;
		}
		dojo.toggleClass(this.containerNode, this.baseClass + "SingleChild", !!this._singleChild);
	}, setHref:function (href) {
		dojo.deprecated("dijit.layout.ContentPane.setHref() is deprecated. Use attr('href', ...) instead.", "", "2.0");
		return this.attr("href", href);
	}, _setHrefAttr:function (href) {
		this.cancel();
		this.onLoadDeferred = new dojo.Deferred(dojo.hitch(this, "cancel"));
		this.href = href;
		if (this._created && (this.preload || this._isShown())) {
			this._load();
		} else {
			this._hrefChanged = true;
		}
		return this.onLoadDeferred;
	}, setContent:function (data) {
		dojo.deprecated("dijit.layout.ContentPane.setContent() is deprecated.  Use attr('content', ...) instead.", "", "2.0");
		this.attr("content", data);
	}, _setContentAttr:function (data) {
		this.href = "";
		this.cancel();
		this.onLoadDeferred = new dojo.Deferred(dojo.hitch(this, "cancel"));
		this._setContent(data || "");
		this._isDownloaded = false;
		return this.onLoadDeferred;
	}, _getContentAttr:function () {
		return this.containerNode.innerHTML;
	}, cancel:function () {
		if (this._xhrDfd && (this._xhrDfd.fired == -1)) {
			this._xhrDfd.cancel();
		}
		delete this._xhrDfd;
		this.onLoadDeferred = null;
	}, uninitialize:function () {
		if (this._beingDestroyed) {
			this.cancel();
		}
		this.inherited(arguments);
	}, destroyRecursive:function (preserveDom) {
		if (this._beingDestroyed) {
			return;
		}
		this.inherited(arguments);
	}, resize:function (changeSize, resultSize) {
		if (!this._wasShown) {
			this._onShow();
		}
		this._resizeCalled = true;
		if (changeSize) {
			dojo.marginBox(this.domNode, changeSize);
		}
		var cn = this.containerNode;
		if (cn === this.domNode) {
			var mb = resultSize || {};
			dojo.mixin(mb, changeSize || {});
			if (!("h" in mb) || !("w" in mb)) {
				mb = dojo.mixin(dojo.marginBox(cn), mb);
			}
			this._contentBox = dijit.layout.marginBox2contentBox(cn, mb);
		} else {
			this._contentBox = dojo.contentBox(cn);
		}
		this._layoutChildren();
	}, _isShown:function () {
		if (this._childOfLayoutWidget) {
			if (this._resizeCalled && "open" in this) {
				return this.open;
			}
			return this._resizeCalled;
		} else {
			if ("open" in this) {
				return this.open;
			} else {
				var node = this.domNode;
				return (node.style.display != "none") && (node.style.visibility != "hidden") && !dojo.hasClass(node, "dijitHidden");
			}
		}
	}, _onShow:function () {
		if (this.href) {
			if (!this._xhrDfd && (!this.isLoaded || this._hrefChanged || this.refreshOnShow)) {
				this.refresh();
			}
		} else {
			if (!this._childOfLayoutWidget && this._needLayout) {
				this._layoutChildren();
			}
		}
		this.inherited(arguments);
		this._wasShown = true;
	}, refresh:function () {
		this.cancel();
		this.onLoadDeferred = new dojo.Deferred(dojo.hitch(this, "cancel"));
		this._load();
		return this.onLoadDeferred;
	}, _load:function () {
		this._setContent(this.onDownloadStart(), true);
		var self = this;
		var getArgs = {preventCache:(this.preventCache || this.refreshOnShow), url:this.href, handleAs:"text"};
		if (dojo.isObject(this.ioArgs)) {
			dojo.mixin(getArgs, this.ioArgs);
		}
		var hand = (this._xhrDfd = (this.ioMethod || dojo.xhrGet)(getArgs));
		hand.addCallback(function (html) {
			try {
				self._isDownloaded = true;
				self._setContent(html, false);
				self.onDownloadEnd();
			}
			catch (err) {
				self._onError("Content", err);
			}
			delete self._xhrDfd;
			return html;
		});
		hand.addErrback(function (err) {
			if (!hand.canceled) {
				self._onError("Download", err);
			}
			delete self._xhrDfd;
			return err;
		});
		delete this._hrefChanged;
	}, _onLoadHandler:function (data) {
		this.isLoaded = true;
		try {
			this.onLoadDeferred.callback(data);
			this.onLoad(data);
		}
		catch (e) {
			console.error("Error " + this.widgetId + " running custom onLoad code: " + e.message);
		}
	}, _onUnloadHandler:function () {
		this.isLoaded = false;
		try {
			this.onUnload();
		}
		catch (e) {
			console.error("Error " + this.widgetId + " running custom onUnload code: " + e.message);
		}
	}, destroyDescendants:function () {
		if (this.isLoaded) {
			this._onUnloadHandler();
		}
		var setter = this._contentSetter;
		dojo.forEach(this.getChildren(), function (widget) {
			if (widget.destroyRecursive) {
				widget.destroyRecursive();
			}
		});
		if (setter) {
			dojo.forEach(setter.parseResults, function (widget) {
				if (widget.destroyRecursive && widget.domNode && widget.domNode.parentNode == dojo.body()) {
					widget.destroyRecursive();
				}
			});
			delete setter.parseResults;
		}
		dojo.html._emptyNode(this.containerNode);
		delete this._singleChild;
	}, _setContent:function (cont, isFakeContent) {
		this.destroyDescendants();
		var setter = this._contentSetter;
		if (!(setter && setter instanceof dojo.html._ContentSetter)) {
			setter = this._contentSetter = new dojo.html._ContentSetter({node:this.containerNode, _onError:dojo.hitch(this, this._onError), onContentError:dojo.hitch(this, function (e) {
				var errMess = this.onContentError(e);
				try {
					this.containerNode.innerHTML = errMess;
				}
				catch (e) {
					console.error("Fatal " + this.id + " could not change content due to " + e.message, e);
				}
			})});
		}
		var setterParams = dojo.mixin({cleanContent:this.cleanContent, extractContent:this.extractContent, parseContent:this.parseOnLoad}, this._contentSetterParams || {});
		dojo.mixin(setter, setterParams);
		setter.set((dojo.isObject(cont) && cont.domNode) ? cont.domNode : cont);
		delete this._contentSetterParams;
		if (!isFakeContent) {
			dojo.forEach(this.getChildren(), function (child) {
				if (!this.parseOnLoad || child.getParent) {
					child.startup();
				}
			}, this);
			this._scheduleLayout();
			this._onLoadHandler(cont);
		}
	}, _onError:function (type, err, consoleText) {
		this.onLoadDeferred.errback(err);
		var errText = this["on" + type + "Error"].call(this, err);
		if (consoleText) {
			console.error(consoleText, err);
		} else {
			if (errText) {
				this._setContent(errText, true);
			}
		}
	}, _scheduleLayout:function () {
		if (this._isShown()) {
			this._layoutChildren();
		} else {
			this._needLayout = true;
		}
	}, _layoutChildren:function () {
		if (this.doLayout) {
			this._checkIfSingleChild();
		}
		if (this._singleChild && this._singleChild.resize) {
			var cb = this._contentBox || dojo.contentBox(this.containerNode);
			this._singleChild.resize({w:cb.w, h:cb.h});
		} else {
			dojo.forEach(this.getChildren(), function (widget) {
				if (widget.resize) {
					widget.resize();
				}
			});
		}
		delete this._needLayout;
	}, onLoad:function (data) {
	}, onUnload:function () {
	}, onDownloadStart:function () {
		return this.loadingMessage;
	}, onContentError:function (error) {
	}, onDownloadError:function (error) {
		return this.errorMessage;
	}, onDownloadEnd:function () {
	}});
}

