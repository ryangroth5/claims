/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.drawing.stencil.Text"]) {
	dojo._hasResource["dojox.drawing.stencil.Text"] = true;
	dojo.provide("dojox.drawing.stencil.Text");
	dojox.drawing.stencil.Text = dojox.drawing.util.oo.declare(dojox.drawing.stencil._Base, function (options) {
	}, {type:"dojox.drawing.stencil.Text", anchorType:"none", baseRender:true, align:"start", valign:"top", _lineHeight:1, setText:function (text) {
		this._text = text;
		this._textArray = [];
		this.created && this.render(text);
	}, getText:function () {
		return this._text;
	}, dataToPoints:function (o) {
		o = o || this.data;
		var w = o.width == "auto" ? 1 : o.width;
		var h = o.height || this._lineHeight;
		this.points = [{x:o.x, y:o.y}, {x:o.x + w, y:o.y}, {x:o.x + w, y:o.y + h}, {x:o.x, y:o.y + h}];
		return this.points;
	}, pointsToData:function (p) {
		p = p || this.points;
		var s = p[0];
		var e = p[2];
		this.data = {x:s.x, y:s.y, width:e.x - s.x, height:e.y - s.y};
		return this.data;
	}, render:function (text) {
		this.remove(this.shape, this.hit);
		!this.annotation && this.renderHit && this._renderOutline();
		if (text) {
			this._text = text;
			this._textArray = this._text.split("\n");
		}
		var d = this.pointsToData();
		var w = d.width;
		var h = this._lineHeight;
		var x = d.x + this.style.text.pad * 2;
		var y = d.y + this._lineHeight - (this.textSize * 0.4);
		if (this.valign == "middle") {
			y -= h / 2;
		}
		this.shape = this.container.createGroup();
		dojo.forEach(this._textArray, function (txt, i) {
			var tb = this.shape.createText({x:x, y:y + (h * i), text:unescape(txt), align:this.align}).setFont(this.style.currentText).setFill(this.style.currentText.color);
			this._setNodeAtts(tb);
		}, this);
		this._setNodeAtts(this.shape);
	}, _renderOutline:function () {
		if (this.annotation) {
			return;
		}
		var d = this.pointsToData();
		if (this.align == "middle") {
			d.x -= d.width / 2 - this.style.text.pad * 2;
		} else {
			if (this.align == "start") {
				d.x += this.style.text.pad;
			} else {
				if (this.align == "end") {
					d.x -= d.width - this.style.text.pad * 3;
				}
			}
		}
		if (this.valign == "middle") {
			d.y -= (this._lineHeight) / 2 - this.style.text.pad;
		}
		this.hit = this.container.createRect(d).setStroke(this.style.currentHit).setFill(this.style.currentHit.fill);
		this._setNodeAtts(this.hit);
		this.hit.moveToBack();
	}, makeFit:function (text, w) {
		var span = dojo.create("span", {innerHTML:text, id:"foo"}, document.body);
		var sz = 1;
		dojo.style(span, "fontSize", sz + "px");
		var cnt = 30;
		while (dojo.marginBox(span).w < w) {
			sz++;
			dojo.style(span, "fontSize", sz + "px");
			if (cnt-- <= 0) {
				break;
			}
		}
		sz--;
		var box = dojo.marginBox(span);
		dojo.destroy(span);
		return {size:sz, box:box};
	}});
	dojox.drawing.register({name:"dojox.drawing.stencil.Text"}, "stencil");
}

