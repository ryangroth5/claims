/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["zstaff.widget.AttachmentBox"]) {
	dojo._hasResource["zstaff.widget.AttachmentBox"] = true;
	dojo.provide("zstaff.widget.AttachmentBox");
	dojo.declare("zstaff.widget.AttachmentBox", [dijit._Widget, dijit._Templated], {templateString:"<div>\nFrom\n<select dojoAttachPoint=\"selectzero\"  dojoAttachEvent=\"onchange: step1\" >\n\t<option value='person'>people...</option>\n\t<option value='position'>position...</option>\n\t<option value='organization'>organization...</option>\n</select>\nchoose: \n<div dojoAttachPoint='selectone' ></div>\ndocument: \n<div dojoAttachPoint='selecttwo' ></div>\n<input value='add' type='button' dojoAttachPoint=\"button\" dojoAttachEvent=\"onclick: step4\" > \n<div dojoAttachPoint=\"container\" ></div>\n</div>\n", wselectone:null, wselecttwo:null, wcontainer:null, icon:"", name:"", values:{}, url:"", url2:"", step1:function () {
		var url2 = this.url + this.selectzero.value;
		this.wselectone.store = new dojox.data.QueryReadStore({url:url2});
		this.wselectone.setDisabled(false);
	}, step2:function () {
		var url2 = this.url2 + this.selectzero.value + "=" + this.wselectone.getValue();
		this.wselecttwo.store = new dojo.data.ItemFileReadStore({url:url2});
		this.wcontainer.store = this.wselecttwo.store;
		this.wselecttwo.setDisabled(false);
	}, step3:function () {
	}, step4:function () {
		this.wcontainer.add(this.wselecttwo.getValue());
	}, postCreate:function () {
		this.inherited(arguments);
		console.log("moog");
		var sel1p = {disabled:true, autoComplete:false, onChange:dojo.hitch(this, this.step2), id:this.id + "-3"};
		this.wselectone = new zstaff.widget.SelectBox(sel1p, this.selectone);
		var sel2p = {disabled:true, autoComplete:false, id:this.id + "-2"};
		this.wselecttwo = new zstaff.widget.SelectBox(sel2p, this.selecttwo);
		s = new dojo.data.ItemFileReadStore({url:this.url2});
		var wscp = {icon:this.icon, name:this.name, store:s, values:this.values, id:this.id + "-1"};
		this.wcontainer = new zstaff.widget.SelectContainer(wscp, this.container);
		this.step1();
	}});
}

