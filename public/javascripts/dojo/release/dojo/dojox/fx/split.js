/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojox.fx.split"]) {
	dojo._hasResource["dojox.fx.split"] = true;
	dojo.provide("dojox.fx.split");
	dojo.require("dojo.fx");
	dojo.require("dojo.fx.easing");
	dojo.mixin(dojox.fx, {_split:function (args) {
		args.rows = args.rows || 3;
		args.columns = args.columns || 3;
		args.duration = args.duration || 1000;
		var node = args.node = dojo.byId(args.node), parentNode = node.parentNode, pNode = parentNode, body = dojo.body(), _pos = "position";
		while (pNode && pNode != body && dojo.style(pNode, _pos) == "static") {
			pNode = pNode.parentNode;
		}
		var pCoords = pNode != body ? dojo.position(pNode, true) : {x:0, y:0}, coords = dojo.position(node, true), nodeHeight = dojo.style(node, "height"), nodeWidth = dojo.style(node, "width"), hBorder = dojo.style(node, "borderLeftWidth") + dojo.style(node, "borderRightWidth"), vBorder = dojo.style(node, "borderTopWidth") + dojo.style(node, "borderBottomWidth"), pieceHeight = Math.ceil(nodeHeight / args.rows), pieceWidth = Math.ceil(nodeWidth / args.columns), container = dojo.create(node.tagName, {style:{position:"absolute", padding:0, margin:0, border:"none", top:coords.y - pCoords.y + "px", left:coords.x - pCoords.x + "px", height:nodeHeight + vBorder + "px", width:nodeWidth + hBorder + "px", background:"none", overflow:args.crop ? "hidden" : "visible", zIndex:dojo.style(node, "zIndex")}}, node, "after"), animations = [], pieceHelper = dojo.create(node.tagName, {style:{position:"absolute", border:"none", padding:0, margin:0, height:pieceHeight + hBorder + "px", width:pieceWidth + vBorder + "px", overflow:"hidden"}});
		for (var y = 0, ly = args.rows; y < ly; y++) {
			for (var x = 0, lx = args.columns; x < lx; x++) {
				var piece = dojo.clone(pieceHelper), pieceContents = dojo.clone(node), pTop = y * pieceHeight, pLeft = x * pieceWidth;
				pieceContents.style.filter = "";
				dojo.removeAttr(pieceContents, "id");
				dojo.style(piece, {border:"none", overflow:"hidden", top:pTop + "px", left:pLeft + "px"});
				dojo.style(pieceContents, {position:"static", opacity:"1", marginTop:-pTop + "px", marginLeft:-pLeft + "px"});
				piece.appendChild(pieceContents);
				container.appendChild(piece);
				var pieceAnimation = args.pieceAnimation(piece, x, y, coords);
				if (dojo.isArray(pieceAnimation)) {
					animations = animations.concat(pieceAnimation);
				} else {
					animations.push(pieceAnimation);
				}
			}
		}
		var anim = dojo.fx.combine(animations);
		dojo.connect(anim, "onEnd", anim, function () {
			container.parentNode.removeChild(container);
		});
		if (args.onPlay) {
			dojo.connect(anim, "onPlay", anim, args.onPlay);
		}
		if (args.onEnd) {
			dojo.connect(anim, "onEnd", anim, args.onEnd);
		}
		return anim;
	}, explode:function (args) {
		var node = args.node = dojo.byId(args.node);
		args.rows = args.rows || 3;
		args.columns = args.columns || 3;
		args.distance = args.distance || 1;
		args.duration = args.duration || 1000;
		args.random = args.random || 0;
		if (!args.fade) {
			args.fade = true;
		}
		if (typeof args.sync == "undefined") {
			args.sync = true;
		}
		args.random = Math.abs(args.random);
		args.pieceAnimation = function (piece, x, y, coords) {
			var pieceHeight = coords.h / args.rows, pieceWidth = coords.w / args.columns, distance = args.distance * 2, duration = args.duration, ps = piece.style, startTop = parseInt(ps.top), startLeft = parseInt(ps.left), delay = 0, randomX = 0, randomY = 0;
			if (args.random) {
				var seed = (Math.random() * args.random) + Math.max(1 - args.random, 0);
				distance *= seed;
				duration *= seed;
				delay = ((args.unhide && args.sync) || (!args.unhide && !args.sync)) ? (args.duration - duration) : 0;
				randomX = Math.random() - 0.5;
				randomY = Math.random() - 0.5;
			}
			var distanceY = ((coords.h - pieceHeight) / 2 - pieceHeight * y), distanceX = ((coords.w - pieceWidth) / 2 - pieceWidth * x), distanceXY = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2)), endTop = parseInt(startTop - distanceY * distance + distanceXY * randomY), endLeft = parseInt(startLeft - distanceX * distance + distanceXY * randomX);
			var pieceSlide = dojo.animateProperty({node:piece, duration:duration, delay:delay, easing:(args.easing || (args.unhide ? dojo.fx.easing.sinOut : dojo.fx.easing.circOut)), beforeBegin:(args.unhide ? function () {
				if (args.fade) {
					dojo.style(piece, {opacity:"0"});
				}
				ps.top = endTop + "px";
				ps.left = endLeft + "px";
			} : undefined), properties:{top:(args.unhide ? {start:endTop, end:startTop} : {start:startTop, end:endTop}), left:(args.unhide ? {start:endLeft, end:startLeft} : {start:startLeft, end:endLeft})}});
			if (args.fade) {
				var pieceFade = dojo.animateProperty({node:piece, duration:duration, delay:delay, easing:(args.fadeEasing || dojo.fx.easing.quadOut), properties:{opacity:(args.unhide ? {start:"0", end:"1"} : {start:"1", end:"0"})}});
				return (args.unhide ? [pieceFade, pieceSlide] : [pieceSlide, pieceFade]);
			} else {
				return pieceSlide;
			}
		};
		var anim = dojox.fx._split(args);
		if (args.unhide) {
			dojo.connect(anim, "onEnd", null, function () {
				dojo.style(node, {opacity:"1"});
			});
		} else {
			dojo.connect(anim, "onPlay", null, function () {
				dojo.style(node, {opacity:"0"});
			});
		}
		return anim;
	}, converge:function (args) {
		args.unhide = true;
		return dojox.fx.explode(args);
	}, disintegrate:function (args) {
		var node = args.node = dojo.byId(args.node);
		args.rows = args.rows || 5;
		args.columns = args.columns || 5;
		args.duration = args.duration || 1500;
		args.interval = args.interval || args.duration / (args.rows + args.columns * 2);
		args.distance = args.distance || 1.5;
		args.random = args.random || 0;
		if (typeof args.fade == "undefined") {
			args.fade = true;
		}
		var random = Math.abs(args.random), duration = args.duration - (args.rows + args.columns) * args.interval;
		args.pieceAnimation = function (piece, x, y, coords) {
			var randomDelay = Math.random() * (args.rows + args.columns) * args.interval, ps = piece.style, uniformDelay = (args.reverseOrder || args.distance < 0) ? ((x + y) * args.interval) : (((args.rows + args.columns) - (x + y)) * args.interval), delay = randomDelay * random + Math.max(1 - random, 0) * uniformDelay, properties = {};
			if (args.unhide) {
				properties.top = {start:(parseInt(ps.top) - coords.h * args.distance), end:parseInt(ps.top)};
				if (args.fade) {
					properties.opacity = {start:"0", end:"1"};
				}
			} else {
				properties.top = {end:(parseInt(ps.top) + coords.h * args.distance)};
				if (args.fade) {
					properties.opacity = {end:"0"};
				}
			}
			var pieceAnimation = dojo.animateProperty({node:piece, duration:duration, delay:delay, easing:(args.easing || (args.unhide ? dojo.fx.easing.sinIn : dojo.fx.easing.circIn)), properties:properties, beforeBegin:(args.unhide ? function () {
				if (args.fade) {
					dojo.style(piece, {opacity:"0"});
				}
				ps.top = properties.top.start + "px";
			} : undefined)});
			return pieceAnimation;
		};
		var anim = dojox.fx._split(args);
		if (args.unhide) {
			dojo.connect(anim, "onEnd", anim, function () {
				dojo.style(node, {opacity:"1"});
			});
		} else {
			dojo.connect(anim, "onPlay", anim, function () {
				dojo.style(node, {opacity:"0"});
			});
		}
		return anim;
	}, build:function (args) {
		args.unhide = true;
		return dojox.fx.disintegrate(args);
	}, shear:function (args) {
		var node = args.node = dojo.byId(args.node);
		args.rows = args.rows || 6;
		args.columns = args.columns || 6;
		args.duration = args.duration || 1000;
		args.interval = args.interval || 0;
		args.distance = args.distance || 1;
		args.random = args.random || 0;
		if (typeof (args.fade) == "undefined") {
			args.fade = true;
		}
		var random = Math.abs(args.random), duration = (args.duration - (args.rows + args.columns) * Math.abs(args.interval));
		args.pieceAnimation = function (piece, x, y, coords) {
			var colIsOdd = !(x % 2), rowIsOdd = !(y % 2), randomDelay = Math.random() * duration, uniformDelay = (args.reverseOrder) ? (((args.rows + args.columns) - (x + y)) * args.interval) : ((x + y) * args.interval), delay = randomDelay * random + Math.max(1 - random, 0) * uniformDelay, properties = {}, ps = piece.style;
			if (args.fade) {
				properties.opacity = (args.unhide ? {start:"0", end:"1"} : {end:"0"});
			}
			if (args.columns == 1) {
				colIsOdd = rowIsOdd;
			} else {
				if (args.rows == 1) {
					rowIsOdd = !colIsOdd;
				}
			}
			var left = parseInt(ps.left), top = parseInt(ps.top), distanceX = args.distance * coords.w, distanceY = args.distance * coords.h;
			if (args.unhide) {
				if (colIsOdd == rowIsOdd) {
					properties.left = colIsOdd ? {start:(left - distanceX), end:left} : {start:(left + distanceX), end:left};
				} else {
					properties.top = colIsOdd ? {start:(top + distanceY), end:top} : {start:(top - distanceY), end:top};
				}
			} else {
				if (colIsOdd == rowIsOdd) {
					properties.left = colIsOdd ? {end:(left - distanceX)} : {end:(left + distanceX)};
				} else {
					properties.top = colIsOdd ? {end:(top + distanceY)} : {end:(top - distanceY)};
				}
			}
			var pieceAnimation = dojo.animateProperty({node:piece, duration:duration, delay:delay, easing:(args.easing || dojo.fx.easing.sinInOut), properties:properties, beforeBegin:(args.unhide ? function () {
				if (args.fade) {
					ps.opacity = "0";
				}
				if (colIsOdd == rowIsOdd) {
					ps.left = properties.left.start + "px";
				} else {
					ps.top = properties.top.start + "px";
				}
			} : undefined)});
			return pieceAnimation;
		};
		var anim = dojox.fx._split(args);
		if (args.unhide) {
			dojo.connect(anim, "onEnd", anim, function () {
				dojo.style(node, {opacity:"1"});
			});
		} else {
			dojo.connect(anim, "onPlay", anim, function () {
				dojo.style(node, {opacity:"0"});
			});
		}
		return anim;
	}, unShear:function (args) {
		args.unhide = true;
		return dojox.fx.shear(args);
	}, pinwheel:function (args) {
		var node = args.node = dojo.byId(args.node);
		args.rows = args.rows || 4;
		args.columns = args.columns || 4;
		args.duration = args.duration || 1000;
		args.interval = args.interval || 0;
		args.distance = args.distance || 1;
		args.random = args.random || 0;
		if (typeof args.fade == "undefined") {
			args.fade = true;
		}
		var duration = (args.duration - (args.rows + args.columns) * Math.abs(args.interval));
		args.pieceAnimation = function (piece, x, y, coords) {
			var pieceHeight = coords.h / args.rows, pieceWidth = coords.w / args.columns, colIsOdd = !(x % 2), rowIsOdd = !(y % 2), randomDelay = Math.random() * duration, uniformDelay = (args.interval < 0) ? (((args.rows + args.columns) - (x + y)) * args.interval * -1) : ((x + y) * args.interval), delay = randomDelay * args.random + Math.max(1 - args.random, 0) * uniformDelay, properties = {}, ps = piece.style;
			if (args.fade) {
				properties.opacity = (args.unhide ? {start:0, end:1} : {end:0});
			}
			if (args.columns == 1) {
				colIsOdd = !rowIsOdd;
			} else {
				if (args.rows == 1) {
					rowIsOdd = colIsOdd;
				}
			}
			var left = parseInt(ps.left), top = parseInt(ps.top);
			if (colIsOdd) {
				if (rowIsOdd) {
					properties.top = args.unhide ? {start:top + pieceHeight * args.distance, end:top} : {start:top, end:top + pieceHeight * args.distance};
				} else {
					properties.left = args.unhide ? {start:left + pieceWidth * args.distance, end:left} : {start:left, end:left + pieceWidth * args.distance};
				}
			}
			if (colIsOdd != rowIsOdd) {
				properties.width = args.unhide ? {start:pieceWidth * (1 - args.distance), end:pieceWidth} : {start:pieceWidth, end:pieceWidth * (1 - args.distance)};
			} else {
				properties.height = args.unhide ? {start:pieceHeight * (1 - args.distance), end:pieceHeight} : {start:pieceHeight, end:pieceHeight * (1 - args.distance)};
			}
			var pieceAnimation = dojo.animateProperty({node:piece, duration:duration, delay:delay, easing:(args.easing || dojo.fx.easing.sinInOut), properties:properties, beforeBegin:(args.unhide ? function () {
				if (args.fade) {
					dojo.style(piece, "opacity", 0);
				}
				if (colIsOdd) {
					if (rowIsOdd) {
						ps.top = (top + pieceHeight * (1 - args.distance)) + "px";
					} else {
						ps.left = (left + pieceWidth * (1 - args.distance)) + "px";
					}
				} else {
					ps.left = left + "px";
					ps.top = top + "px";
				}
				if (colIsOdd != rowIsOdd) {
					ps.width = (pieceWidth * (1 - args.distance)) + "px";
				} else {
					ps.height = (pieceHeight * (1 - args.distance)) + "px";
				}
			} : undefined)});
			return pieceAnimation;
		};
		var anim = dojox.fx._split(args);
		if (args.unhide) {
			dojo.connect(anim, "onEnd", anim, function () {
				dojo.style(node, {opacity:"1"});
			});
		} else {
			dojo.connect(anim, "play", anim, function () {
				dojo.style(node, {opacity:"0"});
			});
		}
		return anim;
	}, unPinwheel:function (args) {
		args.unhide = true;
		return dojox.fx.pinwheel(args);
	}, blockFadeOut:function (args) {
		var node = args.node = dojo.byId(args.node);
		args.rows = args.rows || 5;
		args.columns = args.columns || 5;
		args.duration = args.duration || 1000;
		args.interval = args.interval || args.duration / (args.rows + args.columns * 2);
		args.random = args.random || 0;
		var random = Math.abs(args.random), duration = args.duration - (args.rows + args.columns) * args.interval;
		args.pieceAnimation = function (piece, x, y, coords) {
			var randomDelay = Math.random() * args.duration, uniformDelay = (args.reverseOrder) ? (((args.rows + args.columns) - (x + y)) * Math.abs(args.interval)) : ((x + y) * args.interval), delay = randomDelay * random + Math.max(1 - random, 0) * uniformDelay, pieceAnimation = dojo.animateProperty({node:piece, duration:duration, delay:delay, easing:(args.easing || dojo.fx.easing.sinInOut), properties:{opacity:(args.unhide ? {start:"0", end:"1"} : {start:"1", end:"0"})}, beforeBegin:(args.unhide ? function () {
				dojo.style(piece, {opacity:"0"});
			} : function () {
				piece.style.filter = "";
			})});
			return pieceAnimation;
		};
		var anim = dojox.fx._split(args);
		if (args.unhide) {
			dojo.connect(anim, "onEnd", anim, function () {
				dojo.style(node, {opacity:"1"});
			});
		} else {
			dojo.connect(anim, "onPlay", anim, function () {
				dojo.style(node, {opacity:"0"});
			});
		}
		return anim;
	}, blockFadeIn:function (args) {
		args.unhide = true;
		return dojox.fx.blockFadeOut(args);
	}});
}

