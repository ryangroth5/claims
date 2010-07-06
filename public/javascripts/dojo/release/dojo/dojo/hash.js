/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.hash"]) {
	dojo._hasResource["dojo.hash"] = true;
	dojo.provide("dojo.hash");
	(function () {
		dojo.hash = function (hash, replace) {
			if (!arguments.length) {
				return _getHash();
			}
			if (hash.charAt(0) == "#") {
				hash = hash.substring(1);
			}
			if (replace) {
				_replace(hash);
			} else {
				location.href = "#" + hash;
			}
			return hash;
		};
		var _recentHash = null, _ieUriMonitor = null, _pollFrequency = dojo.config.hashPollFrequency || 100;
		function _getHash() {
			var h = location.href, i = h.indexOf("#");
			return (i >= 0) ? h.substring(i + 1) : "";
		}
		function _dispatchEvent() {
			dojo.publish("/dojo/hashchange", [_getHash()]);
		}
		function _pollLocation() {
			if (_getHash() === _recentHash) {
				return;
			}
			_recentHash = _getHash();
			_dispatchEvent();
		}
		function _replace(hash) {
			if (_ieUriMonitor) {
				if (_ieUriMonitor.isTransitioning()) {
					setTimeout(dojo.hitch(null, _replace, hash), _pollFrequency);
					return;
				}
				var href = _ieUriMonitor.iframe.location.href;
				var index = href.indexOf("?");
				_ieUriMonitor.iframe.location.replace(href.substring(0, index) + "?" + hash);
				return;
			}
			location.replace("#" + hash);
			_pollLocation();
		}
		function IEUriMonitor() {
			var ifr = document.createElement("iframe"), IFRAME_ID = "dojo-hash-iframe", ifrSrc = dojo.config.dojoBlankHtmlUrl || dojo.moduleUrl("dojo", "resources/blank.html");
			ifr.id = IFRAME_ID;
			ifr.src = ifrSrc + "?" + _getHash();
			ifr.style.display = "none";
			document.body.appendChild(ifr);
			this.iframe = dojo.global[IFRAME_ID];
			var recentIframeQuery, transitioning, expectedIFrameQuery, docTitle, ifrOffline, iframeLoc = this.iframe.location, winLoc = dojo.global.location;
			function resetState() {
				_recentHash = winLoc.hash;
				recentIframeQuery = ifrOffline ? _recentHash : iframeLoc.search;
				transitioning = false;
				expectedIFrameQuery = null;
			}
			this.isTransitioning = function () {
				return transitioning;
			};
			this.pollLocation = function () {
				if (!ifrOffline) {
					try {
						iframeLoc.search;
						if (document.title != docTitle) {
							docTitle = this.iframe.document.title = document.title;
						}
					}
					catch (e) {
						ifrOffline = true;
						console.error("dojo.hash: Error adding history entry. Server unreachable.");
					}
				}
				if (transitioning && _recentHash === winLoc.hash) {
					if (ifrOffline || iframeLoc.search === expectedIFrameQuery) {
						resetState();
						_dispatchEvent();
					} else {
						setTimeout(dojo.hitch(this, this.pollLocation), 0);
						return;
					}
				} else {
					if (_recentHash === winLoc.hash && (ifrOffline || recentIframeQuery === iframeLoc.search)) {
					} else {
						if (_recentHash !== winLoc.hash) {
							_recentHash = winLoc.hash;
							transitioning = true;
							expectedIFrameQuery = "?" + _getHash();
							ifr.src = ifrSrc + expectedIFrameQuery;
							ifrOffline = false;
							setTimeout(dojo.hitch(this, this.pollLocation), 0);
							return;
						} else {
							if (!ifrOffline) {
								winLoc.href = "#" + iframeLoc.search.substring(1);
								resetState();
								_dispatchEvent();
							}
						}
					}
				}
				setTimeout(dojo.hitch(this, this.pollLocation), _pollFrequency);
			};
			resetState();
			setTimeout(dojo.hitch(this, this.pollLocation), _pollFrequency);
		}
		dojo.addOnLoad(function () {
			if ("onhashchange" in dojo.global && (!dojo.isIE || (dojo.isIE >= 8 && document.compatMode != "BackCompat"))) {
				dojo.connect(dojo.global, "onhashchange", _dispatchEvent);
			} else {
				if (document.addEventListener) {
					_recentHash = _getHash();
					setInterval(_pollLocation, _pollFrequency);
				} else {
					if (document.attachEvent) {
						_ieUriMonitor = new IEUriMonitor();
					}
				}
			}
		});
	})();
}

