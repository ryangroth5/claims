/*
	Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/



if (!dojo._hasResource["dojo._base.declare"]) {
	dojo._hasResource["dojo._base.declare"] = true;
	dojo.provide("dojo._base.declare");
	dojo.require("dojo._base.lang");
	dojo.require("dojo._base.array");
	(function () {
		var d = dojo, mix = d._mixin, op = Object.prototype, opts = op.toString, xtor = new Function, counter = 0, cname = "constructor";
		function err(msg) {
			throw new Error("declare: " + msg);
		}
		function c3mro(bases) {
			var result = [], roots = [{cls:0, refs:[]}], nameMap = {}, clsCount = 1, l = bases.length, i = 0, j, lin, base, top, proto, rec, name, refs;
			for (; i < l; ++i) {
				base = bases[i];
				if (!base) {
					err("mixin #" + i + " is null");
				}
				lin = base._meta ? base._meta.bases : [base];
				top = 0;
				for (j = lin.length - 1; j >= 0; --j) {
					proto = lin[j].prototype;
					if (!proto.hasOwnProperty("declaredClass")) {
						proto.declaredClass = "uniqName_" + (counter++);
					}
					name = proto.declaredClass;
					if (!nameMap.hasOwnProperty(name)) {
						nameMap[name] = {count:0, refs:[], cls:lin[j]};
						++clsCount;
					}
					rec = nameMap[name];
					if (top && top !== rec) {
						rec.refs.push(top);
						++top.count;
					}
					top = rec;
				}
				++top.count;
				roots[0].refs.push(top);
			}
			while (roots.length) {
				top = roots.pop();
				result.push(top.cls);
				--clsCount;
				while (refs = top.refs, refs.length == 1) {
					top = refs[0];
					if (!top || --top.count) {
						top = 0;
						break;
					}
					result.push(top.cls);
					--clsCount;
				}
				if (top) {
					for (i = 0, l = refs.length; i < l; ++i) {
						top = refs[i];
						if (!--top.count) {
							roots.push(top);
						}
					}
				}
			}
			if (clsCount) {
				err("can't build consistent linearization");
			}
			base = bases[0];
			result[0] = base ? base._meta && base === result[result.length - base._meta.bases.length] ? base._meta.bases.length : 1 : 0;
			return result;
		}
		function inherited(args, a, f) {
			var name, chains, bases, caller, meta, base, proto, opf, pos, cache = this._inherited = this._inherited || {};
			if (typeof args == "string") {
				name = args;
				args = a;
				a = f;
			}
			f = 0;
			caller = args.callee;
			name = name || caller.nom;
			if (!name) {
				err("can't deduce a name to call inherited()");
			}
			meta = this.constructor._meta;
			bases = meta.bases;
			pos = cache.p;
			if (name != cname) {
				if (cache.c !== caller) {
					pos = 0;
					base = bases[0];
					meta = base._meta;
					if (meta.hidden[name] !== caller) {
						chains = meta.chains;
						if (chains && typeof chains[name] == "string") {
							err("calling chained method with inherited: " + name);
						}
						do {
							meta = base._meta;
							proto = base.prototype;
							if (meta && (proto[name] === caller && proto.hasOwnProperty(name) || meta.hidden[name] === caller)) {
								break;
							}
						} while (base = bases[++pos]);
						pos = base ? pos : -1;
					}
				}
				base = bases[++pos];
				if (base) {
					proto = base.prototype;
					if (base._meta && proto.hasOwnProperty(name)) {
						f = proto[name];
					} else {
						opf = op[name];
						do {
							proto = base.prototype;
							f = proto[name];
							if (f && (base._meta ? proto.hasOwnProperty(name) : f !== opf)) {
								break;
							}
						} while (base = bases[++pos]);
					}
				}
				f = base && f || op[name];
			} else {
				if (cache.c !== caller) {
					pos = 0;
					meta = bases[0]._meta;
					if (meta && meta.ctor !== caller) {
						chains = meta.chains;
						if (!chains || chains.constructor !== "manual") {
							err("calling chained constructor with inherited");
						}
						while (base = bases[++pos]) {
							meta = base._meta;
							if (meta && meta.ctor === caller) {
								break;
							}
						}
						pos = base ? pos : -1;
					}
				}
				while (base = bases[++pos]) {
					meta = base._meta;
					f = meta ? meta.ctor : base;
					if (f) {
						break;
					}
				}
				f = base && f;
			}
			cache.c = f;
			cache.p = pos;
			if (f) {
				return a === true ? f : f.apply(this, a || args);
			}
		}
		function getInherited(name, args) {
			if (typeof name == "string") {
				return this.inherited(name, args, true);
			}
			return this.inherited(name, true);
		}
		function isInstanceOf(cls) {
			var bases = this.constructor._meta.bases;
			for (var i = 0, l = bases.length; i < l; ++i) {
				if (bases[i] === cls) {
					return true;
				}
			}
			return this instanceof cls;
		}
		function safeMixin(target, source) {
			var name, t, i = 0, l = d._extraNames.length;
			for (name in source) {
				t = source[name];
				if ((t !== op[name] || !(name in op)) && name != cname) {
					if (opts.call(t) == "[object Function]") {
						t.nom = name;
					}
					target[name] = t;
				}
			}
			for (; i < l; ++i) {
				name = d._extraNames[i];
				t = source[name];
				if ((t !== op[name] || !(name in op)) && name != cname) {
					if (opts.call(t) == "[object Function]") {
						t.nom = name;
					}
					target[name] = t;
				}
			}
			return target;
		}
		function extend(source) {
			safeMixin(this.prototype, source);
			return this;
		}
		function chainedConstructor(bases, ctorSpecial) {
			return function () {
				var a = arguments, args = a, a0 = a[0], f, i, m, l = bases.length, preArgs;
				if (ctorSpecial && (a0 && a0.preamble || this.preamble)) {
					preArgs = new Array(bases.length);
					preArgs[0] = a;
					for (i = 0; ; ) {
						a0 = a[0];
						if (a0) {
							f = a0.preamble;
							if (f) {
								a = f.apply(this, a) || a;
							}
						}
						f = bases[i].prototype;
						f = f.hasOwnProperty("preamble") && f.preamble;
						if (f) {
							a = f.apply(this, a) || a;
						}
						if (++i == l) {
							break;
						}
						preArgs[i] = a;
					}
				}
				for (i = l - 1; i >= 0; --i) {
					f = bases[i];
					m = f._meta;
					f = m ? m.ctor : f;
					if (f) {
						f.apply(this, preArgs ? preArgs[i] : a);
					}
				}
				f = this.postscript;
				if (f) {
					f.apply(this, args);
				}
			};
		}
		function singleConstructor(ctor, ctorSpecial) {
			return function () {
				var a = arguments, t = a, a0 = a[0], f;
				if (ctorSpecial) {
					if (a0) {
						f = a0.preamble;
						if (f) {
							t = f.apply(this, t) || t;
						}
					}
					f = this.preamble;
					if (f) {
						f.apply(this, t);
					}
				}
				if (ctor) {
					ctor.apply(this, a);
				}
				f = this.postscript;
				if (f) {
					f.apply(this, a);
				}
			};
		}
		function simpleConstructor(bases) {
			return function () {
				var a = arguments, i = 0, f;
				for (; f = bases[i]; ++i) {
					m = f._meta;
					f = m ? m.ctor : f;
					if (f) {
						f.apply(this, a);
						break;
					}
				}
				f = this.postscript;
				if (f) {
					f.apply(this, a);
				}
			};
		}
		function chain(name, bases, reversed) {
			return function () {
				var b, m, f, i = 0, step = 1;
				if (reversed) {
					i = bases.length - 1;
					step = -1;
				}
				for (; b = bases[i]; i += step) {
					m = b._meta;
					f = (m ? m.hidden : b.prototype)[name];
					if (f) {
						f.apply(this, arguments);
					}
				}
			};
		}
		d.declare = function (className, superclass, props) {
			var proto, i, t, ctor, name, bases, chains, mixins = 1, parents = superclass;
			if (typeof className != "string") {
				props = superclass;
				superclass = className;
				className = "";
			}
			props = props || {};
			if (opts.call(superclass) == "[object Array]") {
				bases = c3mro(superclass);
				t = bases[0];
				mixins = bases.length - t;
				superclass = bases[mixins];
			} else {
				bases = [0];
				if (superclass) {
					t = superclass._meta;
					bases = bases.concat(t ? t.bases : superclass);
				}
			}
			if (superclass) {
				for (i = mixins - 1; ; --i) {
					xtor.prototype = superclass.prototype;
					proto = new xtor;
					if (!i) {
						break;
					}
					t = bases[i];
					mix(proto, t._meta ? t._meta.hidden : t.prototype);
					ctor = new Function;
					ctor.superclass = superclass;
					ctor.prototype = proto;
					superclass = proto.constructor = ctor;
				}
			} else {
				proto = {};
			}
			safeMixin(proto, props);
			t = props.constructor;
			if (t !== op.constructor) {
				t.nom = cname;
				proto.constructor = t;
			}
			xtor.prototype = 0;
			for (i = mixins - 1; i; --i) {
				t = bases[i]._meta;
				if (t && t.chains) {
					chains = mix(chains || {}, t.chains);
				}
			}
			if (proto["-chains-"]) {
				chains = mix(chains || {}, proto["-chains-"]);
			}
			t = !chains || !chains.hasOwnProperty(cname);
			bases[0] = ctor = (chains && chains.constructor === "manual") ? simpleConstructor(bases) : (bases.length == 1 ? singleConstructor(props.constructor, t) : chainedConstructor(bases, t));
			ctor._meta = {bases:bases, hidden:props, chains:chains, parents:parents, ctor:props.constructor};
			ctor.superclass = superclass && superclass.prototype;
			ctor.extend = extend;
			ctor.prototype = proto;
			proto.constructor = ctor;
			proto.getInherited = getInherited;
			proto.inherited = inherited;
			proto.isInstanceOf = isInstanceOf;
			if (className) {
				proto.declaredClass = className;
				d.setObject(className, ctor);
			}
			if (chains) {
				for (name in chains) {
					if (proto[name] && typeof chains[name] == "string" && name != cname) {
						t = proto[name] = chain(name, bases, chains[name] === "after");
						t.nom = name;
					}
				}
			}
			return ctor;
		};
		d.safeMixin = safeMixin;
	})();
}

