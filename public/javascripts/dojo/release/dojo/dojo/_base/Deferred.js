/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo._base.Deferred"]) {
	dojo._hasResource["dojo._base.Deferred"] = true;
	dojo.provide("dojo._base.Deferred");
	dojo.require("dojo._base.lang");
	dojo.Deferred = function (canceller) {
		this.chain = [];
		this.id = this._nextId();
		this.fired = -1;
		this.paused = 0;
		this.results = [null, null];
		this.canceller = canceller;
		this.silentlyCancelled = false;
		this.isFiring = false;
	};
	dojo.extend(dojo.Deferred, {_nextId:(function () {
		var n = 1;
		return function () {
			return n++;
		};
	})(), cancel:function () {
		var err;
		if (this.fired == -1) {
			if (this.canceller) {
				err = this.canceller(this);
			} else {
				this.silentlyCancelled = true;
			}
			if (this.fired == -1) {
				if (!(err instanceof Error)) {
					var res = err;
					var msg = "Deferred Cancelled";
					if (err && err.toString) {
						msg += ": " + err.toString();
					}
					err = new Error(msg);
					err.dojoType = "cancel";
					err.cancelResult = res;
				}
				this.errback(err);
			}
		} else {
			if ((this.fired == 0) && (this.results[0] instanceof dojo.Deferred)) {
				this.results[0].cancel();
			}
		}
	}, _resback:function (res) {
		this.fired = ((res instanceof Error) ? 1 : 0);
		this.results[this.fired] = res;
		this._fire();
	}, _check:function () {
		if (this.fired != -1) {
			if (!this.silentlyCancelled) {
				throw new Error("already called!");
			}
			this.silentlyCancelled = false;
			return;
		}
	}, callback:function (res) {
		this._check();
		this._resback(res);
	}, errback:function (res) {
		this._check();
		if (!(res instanceof Error)) {
			res = new Error(res);
		}
		this._resback(res);
	}, addBoth:function (cb, cbfn) {
		var enclosed = dojo.hitch.apply(dojo, arguments);
		return this.addCallbacks(enclosed, enclosed);
	}, addCallback:function (cb, cbfn) {
		return this.addCallbacks(dojo.hitch.apply(dojo, arguments));
	}, addErrback:function (cb, cbfn) {
		return this.addCallbacks(null, dojo.hitch.apply(dojo, arguments));
	}, addCallbacks:function (cb, eb) {
		this.chain.push([cb, eb]);
		if (this.fired >= 0 && !this.isFiring) {
			this._fire();
		}
		return this;
	}, _fire:function () {
		this.isFiring = true;
		var chain = this.chain;
		var fired = this.fired;
		var res = this.results[fired];
		var self = this;
		var cb = null;
		while ((chain.length > 0) && (this.paused == 0)) {
			var f = chain.shift()[fired];
			if (!f) {
				continue;
			}
			var func = function () {
				var ret = f(res);
				if (typeof ret != "undefined") {
					res = ret;
				}
				fired = ((res instanceof Error) ? 1 : 0);
				if (res instanceof dojo.Deferred) {
					cb = function (res) {
						self._resback(res);
						self.paused--;
						if ((self.paused == 0) && (self.fired >= 0)) {
							self._fire();
						}
					};
					this.paused++;
				}
			};
			if (dojo.config.debugAtAllCosts) {
				func.call(this);
			} else {
				try {
					func.call(this);
				}
				catch (err) {
					fired = 1;
					res = err;
				}
			}
		}
		this.fired = fired;
		this.results[fired] = res;
		this.isFiring = false;
		if ((cb) && (this.paused)) {
			res.addBoth(cb);
		}
	}});
}

