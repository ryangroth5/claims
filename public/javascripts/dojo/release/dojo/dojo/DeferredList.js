/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo.DeferredList"]) {
	dojo._hasResource["dojo.DeferredList"] = true;
	dojo.provide("dojo.DeferredList");
	dojo.declare("dojo.DeferredList", dojo.Deferred, {constructor:function (list, fireOnOneCallback, fireOnOneErrback, consumeErrors, canceller) {
		this.list = list;
		this.resultList = new Array(this.list.length);
		this.chain = [];
		this.id = this._nextId();
		this.fired = -1;
		this.paused = 0;
		this.results = [null, null];
		this.canceller = canceller;
		this.silentlyCancelled = false;
		if (this.list.length === 0 && !fireOnOneCallback) {
			this.callback(this.resultList);
		}
		this.finishedCount = 0;
		this.fireOnOneCallback = fireOnOneCallback;
		this.fireOnOneErrback = fireOnOneErrback;
		this.consumeErrors = consumeErrors;
		dojo.forEach(this.list, function (d, index) {
			d.addCallback(this, function (r) {
				this._cbDeferred(index, true, r);
				return r;
			});
			d.addErrback(this, function (r) {
				this._cbDeferred(index, false, r);
				return r;
			});
		}, this);
	}, _cbDeferred:function (index, succeeded, result) {
		this.resultList[index] = [succeeded, result];
		this.finishedCount += 1;
		if (this.fired !== 0) {
			if (succeeded && this.fireOnOneCallback) {
				this.callback([index, result]);
			} else {
				if (!succeeded && this.fireOnOneErrback) {
					this.errback(result);
				} else {
					if (this.finishedCount == this.list.length) {
						this.callback(this.resultList);
					}
				}
			}
		}
		if (!succeeded && this.consumeErrors) {
			result = null;
		}
		return result;
	}, gatherResults:function (deferredList) {
		var d = new dojo.DeferredList(deferredList, false, true, false);
		d.addCallback(function (results) {
			var ret = [];
			dojo.forEach(results, function (result) {
				ret.push(result[1]);
			});
			return ret;
		});
		return d;
	}});
}

