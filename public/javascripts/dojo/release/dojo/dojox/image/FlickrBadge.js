/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.image.FlickrBadge"]) {
	dojo._hasResource["dojox.image.FlickrBadge"] = true;
	dojo.provide("dojox.image.FlickrBadge");
	dojo.require("dojox.image.Badge");
	dojo.require("dojox.data.FlickrRestStore");
	dojo.declare("dojox.image.FlickrBadge", dojox.image.Badge, {children:"a.flickrImage", userid:"", username:"", setid:"", tags:"", searchText:"", target:"", apikey:"8c6803164dbc395fb7131c9d54843627", _store:null, postCreate:function () {
		if (this.username && !this.userid) {
			var def = dojo.io.script.get({url:"http://www.flickr.com/services/rest/", preventCache:true, content:{format:"json", method:"flickr.people.findByUsername", api_key:this.apikey, username:this.username}, callbackParamName:"jsoncallback"});
			def.addCallback(this, function (data) {
				if (data.user && data.user.nsid) {
					this.userid = data.user.nsid;
					if (!this._started) {
						this.startup();
					}
				}
			});
		}
	}, startup:function () {
		if (this._started) {
			return;
		}
		if (this.userid) {
			var query = {userid:this.userid};
			if (this.setid) {
				query["setid"] = this.setid;
			}
			if (this.tags) {
				query.tags = this.tags;
			}
			if (this.searchText) {
				query.text = this.searchText;
			}
			var args = arguments;
			this._store = new dojox.data.FlickrRestStore({apikey:this.apikey});
			this._store.fetch({count:this.cols * this.rows, query:query, onComplete:dojo.hitch(this, function (items) {
				dojo.forEach(items, function (item) {
					var a = dojo.doc.createElement("a");
					dojo.addClass(a, "flickrImage");
					a.href = this._store.getValue(item, "link");
					if (this.target) {
						a.target = this.target;
					}
					var img = dojo.doc.createElement("img");
					img.src = this._store.getValue(item, "imageUrlThumb");
					dojo.style(img, {width:"100%", height:"100%"});
					a.appendChild(img);
					this.domNode.appendChild(a);
				}, this);
				dojox.image.Badge.prototype.startup.call(this, args);
			})});
		}
	}});
}

