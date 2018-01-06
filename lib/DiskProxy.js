
var _swap = {
	value : null
};
_swap.setSwap = function(target) { 
	this.value = target;
	return this.value;
};
_swap.getSwap = function() {
	return this.value;
};

var __instance_id__ = 0;

function DiskProxy(folder,ftype,swap) {
	
	
	ftype = ftype || "object";
	var fs = require("fs");
	var internal_data = {};
	var internal_operations = {};
	var obj = null;
	if(ftype =="array") {
		obj = {};
	} else {
		obj = {};
	}
	obj.__instance_id__ = __instance_id__++;
	function generateFunction(name,code) {
		if(swap!=null) {
			eval( 
				"var func = (function($) {" + 
					"return " + code +
				"})(swap);"
			);
		} else {
			eval( 
				"var func = (function() {" + 
					"return " + code +
				"})();"
			);
		}
		if(code.indexOf("*/")!=-1) throw "storage functions cant contain long comments cause it code is listed inside long comments.";
		var str = "internal_operations[name] = function() {\r\n/*" + code + "*/\r\n"+
			"var args = [];\r\n"+
			"for(var x = 0; x < arguments.length;x++) args.push(arguments[x]);\r\n"+
			"return func.apply(this,args);\r\n"+
		"}";
		eval(str);
		internal_operations[name].toString = function() {
			return code;
		}
		return internal_operations[name];
	}
	var diskproxy = new Proxy(obj,{
		construct: function(target, argumentsList, newTarget) {
			if( ftype == "object" ) {
				var ret = {};
				return ret;
			} else if(ftype == "array") {
				return [];
			}
		},
		has : function(target,name) {
			if(fs.existsSync(folder+"/"+name) && fs.lstatSync(folder+"/"+name).isFile()) return true;
			return false;
		},
		set : function(target,prop,value) {
			var data = {};
			if(Object.prototype.toString.apply(value) == "[object String]") {
				data.type = "string";
				data.value = value;
				fs.writeFileSync(folder+"/"+prop,JSON.stringify(data),"utf8");
				return value;
			} else if(Object.prototype.toString.apply(value) == "[object Object]") {
				if("type" in value) {
					if(value.type == "object") {
						var json = {};
						if(fs.existsSync(folder+"/"+prop)) {
							json = JSON.parse( fs.readFileSync(folder+"/"+prop,"utf8") );
						}
						internal_data[prop] = DiskProxy( folder + "/." + prop , "object",swap);
						if(!fs.existsSync(folder+"/."+prop)) {
							fs.mkdirSync(folder+"/."+prop)
						}
						data.type = "object";
						data.value = { type : "object" };
						if("type" in json && json.type != data.type) {
							fs.writeFileSync(folder+"/"+prop,JSON.stringify(data),"utf8");
						} else if(!("type" in json)) {
							fs.writeFileSync(folder+"/"+prop,JSON.stringify(data),"utf8");
						}
						
						for(var key in internal_data[prop]) {
							delete internal_data[prop][key];
						}
						
						for(var key in value) {
							internal_data[prop][key] = value[key];
						}
						
						return internal_data[prop];
					} else if(value.type == "array") {
						var json = {};
						if(fs.existsSync(folder+"/"+prop)) {
							json = JSON.parse( fs.readFileSync(folder+"/"+prop,"utf8") );
						}
						internal_data[prop] = DiskProxy( folder + "/." + prop, "array" ,swap);
						if(!fs.existsSync(folder+"/."+prop)) {
							fs.mkdirSync(folder+"/."+prop)
							internal_data[prop].length = 0;
						}
						data.type = "array";
						data.value = { type : "array" };
						if("type" in json && json.type != data.type) {
							fs.writeFileSync(folder+"/"+prop,JSON.stringify(data),"utf8");
						} else if(!("type" in json)) {
							fs.writeFileSync(folder+"/"+prop,JSON.stringify(data),"utf8");
						}
						return internal_data[prop];
					} else if(value.type == "function") {
						
					} else {
						
					}
				} else {
					var json = {};
					if(fs.existsSync(folder+"/"+prop)) {
						json = JSON.parse( fs.readFileSync(folder+"/"+prop,"utf8") );
					}
					internal_data[prop] = DiskProxy( folder + "/." + prop , "object",swap);
					if(!fs.existsSync(folder+"/."+prop)) {
						fs.mkdirSync(folder+"/."+prop)
					}
					data.type = "object";
					data.value = { type : "object" };
					if("type" in json && json.type != data.type) {
						fs.writeFileSync(folder+"/"+prop,JSON.stringify(data),"utf8");
					} else if(!("type" in json)) {
						fs.writeFileSync(folder+"/"+prop,JSON.stringify(data),"utf8");
					}
					
					for(var key in internal_data[prop]) {
						delete internal_data[prop][key];
					}
					
					for(var key in value) {
						internal_data[prop][key] = value[key];
					}
					
					return internal_data[prop];
				}
			} else if(Object.prototype.toString.apply(value) == "[object Array]") {
				var json = {};
				if(fs.existsSync(folder+"/"+prop)) {
					json = JSON.parse( fs.readFileSync(folder+"/"+prop,"utf8") );
				}
				internal_data[prop] = DiskProxy( folder + "/." + prop, "array",swap );
				if(!fs.existsSync(folder+"/."+prop)) {
					fs.mkdirSync(folder+"/."+prop)
					internal_data[prop].length = 0;
				}
				data.type = "array";
				data.value = { type : "array" };
				if("type" in json && json.type != data.type) {
					fs.writeFileSync(folder+"/"+prop,JSON.stringify(data),"utf8");
				} else if(!("type" in json)) {
					fs.writeFileSync(folder+"/"+prop,JSON.stringify(data),"utf8");
				}
				for(var x = internal_data[prop]["length"] - 1;x>=0;x--) {
					delete internal_data[prop][x];
				}
				internal_data[prop]["length"] = 0;
				for(var x = 0; x < value.length;x++) {
					internal_data[prop].push( value[x] );
				}
				return internal_data[prop];
				
			} else if(Object.prototype.toString.apply(value) == "[object Number]") {
				data.type = "number";
				data.value = value;
				fs.writeFileSync(folder+"/"+prop,JSON.stringify(data),"utf8");
				return value;
			} else if(value == null) {
				data.type = "null";
				fs.writeFileSync(folder+"/"+prop,JSON.stringify(data),"utf8");
				return null;
			} else if(Object.prototype.toString.apply(value) == "[object Function]") {
				data.type = "function";
				data.value = { type : "function", value : "" + value };
				fs.writeFileSync(folder+"/"+prop,JSON.stringify(data),"utf8");
				return value;
			}
		},
		get: function(target, name) {
			if( typeof name === 'symbol' ) {
				return name;
			}
			if(ftype == "array" && name == "push") {
				var f = function(val) {
					var len = this.get(target,"length");
					this.set(target,len,val);
					this.set(target,"length",len+1);
				};
				return f.bind(this);
			} else if(ftype == "array"  && name == "pop") {
				var f = function() {
					var len = this.get(target,"length");
					var ret = null;
					if(len>0) {
						ret = this.get(target,len-1);
						this.deleteProperty(target,""+(len-1));
						this.set(target,"length",parseInt( len-1 ) )
					};
					return ret;
				};
				return f.bind(this);
			} else if(ftype == "array" && name =="unshift") {
				var f = function(val) {
					var len = this.get(target,"length");
					for(var x = len-1; x >= 0;x--) {
						this.set(target,x+1,this.get(target,x));
					}
					this.set(target,0,val);
					this.set(target,"length",len+1);
				};
				return f.bind(this);
			} else if(ftype == "array" && name =="shift") {
				var f = function() {
					var len = this.get(target,"length");
					var ret = this.get(target,0);
					for(var x = 1; x < len;x++) {
						this.set(target,x-1,this.get(target,x));
					}
					this.deleteProperty(len-1);
					this.set(target,"length",len-1);
					return ret;
				};
				return f.bind(this);
			} else if(ftype == "array"  && name == "indexOf") {
				var f = function(item,start) {
					start = start || 0;
					var len = this.get(target,"length");
					for(var x = start; x < len;x++) {
						if(this.get(target,x) == item) {
							return x;
						}
					}
					return -1;
				};
				return f.bind(this);
			} else if(ftype =="array" && name == "remove") {
				var f = function(item,start) {
					start = start || 0;
					var len = this.get(target,"length");
					for(var x = start; x < len;x++) {
						if(this.get(target,x) == item) {
							for(var y = x+1;y<len;y++) {
								this.set(target,y-1,this.get(target,y));
							}
							this.deleteProperty(target,len-1);
							this.set(target,"length",len-1);
							return true;
						}
					}
					return false;
				};
				return f.bind(this);
			} else if(ftype =="array" && name =="removeAt") {
				var f = function(index) {
					var len = this.get(target,"length");
					if(index >= 0 && index < len) {
						for(var y = index+1;y<len;y++) {
							this.set(target,(y-1),this.get(target,y));
						}
						this.deleteProperty(target,len-1);
						this.set(target,"length",len-1);
						return true;
					}
					return false;
				};
				return f.bind(this);
			} else if(ftype =="array"  && name == "show") {
				var f = function() {
					var len = this.get(target,"length");
					for(var x = 0; x < len;x++) {
						console.log("["+x+"]:" +this.get(target,parseInt(x)));
					}
				};
				return f.bind(this);
			} else if(ftype =="array" && name =="toArray") {
				var f = function() {
					var r = [];
					var len = this.get(target,"length");
					for(var x = 0; x < len;x++) {
						var i = this.get(target,x);
						var t = Object.prototype.toString.apply(i);
						if(t == "[object Number]" | t == "[object String]") {
							r.push(this.get(target,parseInt(x)));
						} else if(t == "[object Function]") {
							eval("var f = " + this.get(target,parseInt(x)).toString());
							r.push( f );
						} else {
							if("type" in i && i.type =="array") {
								r.push( this.get(target,parseInt(x)).toArray() );
							} else if("type" in i && i.type == "function") {
								eval("var f = " + this.get(target,parseInt(x)).toString());
								r.push( f.bind(r) );
							} else {
								r.push(this.get(target,parseInt(x)).toObject() );
							}
						}
					}
					return r;
				};
				return f.bind(this);
			} else if(ftype =="object" && name =="show") {
				var f = function() {
					var keys = this.ownKeys(target);
					for(var x = 0; x < keys.length;x++) {
						console.log("["+keys[x]+"]:"+this.get(target,keys[x]) );
					}
				};
				return f.bind(this);
			} else if(ftype == "object" && name == "toObject") {
				var self = this;
				var f = function() {
					var obj = {};
					var keys = self.ownKeys(self);
					for(var x = 0; x < keys.length;x++) {
						var a = self.get(self,keys[x]);
						if( a.type == "object" ) {
							obj[keys[x]] = a.toObject();
						} else if(a.type == "array") {
							obj[keys[x]] = a.toArray();
						} else if(a.type == "function") {
							eval("var f = " + a.toString());
							obj[keys[x]] = f;
						} else {
							obj[ keys[x] ] = a;
						}
					}
					return obj;
				};
				return f.bind(this);
			} else if(name == "type") {
				var parts = folder.split("/");
				var last = parts.pop();
				var name = last.substring(1);
				parts.push(name);
				var fullname = parts.join("/");
				if(!fs.existsSync(fullname)) {
					return "undefined";
				} else if(fs.lstatSync(fullname).isFile()) {
					var json = JSON.parse( fs.readFileSync(fullname,"utf8") );
					if(json.type == "string") {
						return "string";
					} else if(json.type == "number") {
						return "number";
					} else if(json.type == "object") {
						return "object";
					} else if(json.type == "array") {
						return "array";
					} else if(json.type == "null") {
						return "null";
					} else if(json.type == "function") {
						return "function";
					}
				} else {
					return "unknown";
				}	
			} else if(name == "parent") {
				var parts = folder.split("/")
				var name2 = parts.pop();
				var bfolder = parts.join("/");
				var pfolder = parts.join("/");
				if(parts.length>1) {
					parts.pop();
					var name3 = name2.substring(1);
					var pfile = parts.join("/") + "/" +name3;
					var pofile = fs.readFileSync(pfolder + "/" + name3,"utf8");
					var json = JSON.parse(pofile);
					if(
						json.type == "string" ||
						json.type == "number" ||
						json.type == "null" ||
						json.type == "function"
					) {
						throw "bug in the filesystem";
					}
					if(
						json.type == "array" ||
						json.type == "object"
					) {
						return DiskProxy(pfolder,json.type,swap);
					} else {
						throw "new type.parent not defined.";
					}
				} else if(parts.length==1) {
					return DiskProxy(parts.join("/"),"object",swap);
				} else {
					return null;
				}
			}
			if(name == "toJSON") {
				return function() {
					if(!fs.existsSync(folder+"/"+name)) {
						return undefined;
					} else if(fs.lstatSync(folder+"/"+name).isFile()) {
						
					}
				}
			}
			if(!fs.existsSync(folder+"/"+name)) {
				return undefined;
			} else if(fs.lstatSync(folder+"/"+name).isFile()) {
				var json = JSON.parse( fs.readFileSync(folder+"/"+name,"utf8") );
				if(json.type == "string") {
					return json.value;
				} else if(json.type == "number") {
					return json.value;
				} else if(json.type == "object") {
					if( name in internal_data ) {
						return internal_data[name];
					} else {
						return internal_data[name] = DiskProxy(folder+"/."+name,"object",swap);
					}
				} else if(json.type == "array") {
					var obj2 = null;
					if( name in internal_data ) {
						obj2 = internal_data[name];
					} else {
						obj2 = internal_data[name] = DiskProxy(folder+"/."+name,"array",swap);
					}
					return obj2;
				} else if(json.type == "null") {
					return null;
				} else if(json.type == "function") {
					var f = generateFunction(name,json.value.value);
					return f;
				}
			} else {
				throw "unknown";
			}
		},
		deleteProperty : function (target,name) {
			if(!fs.existsSync(folder+"/"+name)) return;
			if(fs.lstatSync(folder+"/"+name).isFile()) {
				var json = JSON.parse( fs.readFileSync(folder+"/"+name,"utf8") );
				if(json.type == "string") {
					fs.unlinkSync(folder+"/"+name);
					return true;
				} else if(json.type == "number") {
					fs.unlinkSync(folder+"/"+name);
					return true;
				} else if(json.type == "object") {
					function rrmdir(folder1) {
						var list = fs.readdirSync(folder + "/." + folder1);
						for(var x = 0; x < list.length;x++) {
							if(fs.existsSync( folder + "/." + folder1 + "/" + list[x] ) ) {
								if( fs.lstatSync(folder + "/." + folder1 + "/" + list[x]).isDirectory() ) {
									
								} else {
									var json2 = fs.readFileSync(folder + "/." + folder1 + "/" + list[x],"utf8")
									json2 = JSON.parse( json2 );
									if(json2.type =="string" || json2.type =="number" || json2.type =="null" || json2.type =="function") {
										fs.unlinkSync(folder + "/." + folder1 + "/" + list[x]);	
									} else if(json2.type == "array" || json2.type == "object" ) {
										rrmdir(folder1 + "/." + list[x]);
										fs.unlinkSync(folder + "/." + folder1 + "/" + list[x]);	
									} else {
									}
									
								}
							}
						}
						fs.rmdirSync(folder+"/."+folder1);
					}
					try {
						rrmdir(name);
						fs.unlinkSync(folder+"/"+name);
					} catch(e) {
						console.log(e.errno);
						console.log(e.code);
						console.log(e.syscall);
						//console.log(e.getMessage());
						console.log(e.message);
						console.log(e.stacktrace);
						return false;
					}
					return true;
				} else if(json.type == "array") {
					//recursive delete folder
					function rrmdir(folder1) {
						var list = fs.readdirSync(folder + "/." + folder1);
						for(var x = 0; x < list.length;x++) {
							if(fs.existsSync(folder + "/." + folder1 + "/" + list[x])) {
								if( fs.lstatSync(folder + "/." + folder1 + "/" + list[x]).isDirectory() ) {
								} else {
									var json2 = fs.readFileSync(folder + "/." + folder1 + "/" + list[x],"utf8")
									json2 = JSON.parse( json2 );
									if(json2.type =="string" || json2.type =="number" || json2.type =="null" || json2.type =="function") {
										fs.unlinkSync(folder + "/." + folder1 + "/" + list[x]);	
									} else if(json2.type == "array" || json2.type == "object" ) {
										rrmdir(folder1 + "/." + list[x]);
										fs.unlinkSync(folder + "/." + folder1 + "/" + list[x]);	
									} else {
									}
									
								}
							}
						}
						fs.rmdirSync(folder+"/."+folder1);
					}
					try {
						rrmdir(name);
						fs.unlinkSync(folder+"/"+name);
					} catch(e) {
						console.log(e.errno);
						console.log(e.code);
						console.log(e.syscall);
						console.log(e.message);
						console.log(e.stacktrace);
						return false;
					}
					return true;
				} else if(json.type == "null") {
					fs.unlinkSync(folder+"/"+name);
					return true;
				} else if(json.type == "function") {
					fs.unlinkSync(folder+"/"+name);
					return true;
				} else {
					return false;
				}
			}
		}, 
		ownKeys : function (target) {
			if(fs.existsSync(folder)) {
				var list = fs.readdirSync(folder);
				var r = [];
				for(var x = 0; x < list.length;x++) {
					if(list[x].indexOf(".")!=0) {
						r.push(list[x]);
					}
				}
				return r;
			} else {
				return [];
			}
			
		},
		getOwnPropertyDescriptor: function(target, name) {
			if(fs.existsSync(folder+"/"+name)) {
				if(fs.lstatSync(folder+"/"+name).isFile()) {
					var str = fs.readFileSync(folder+"/"+name,"utf8");
					var json = JSON.parse( str );
					if(json.type == "string") {
						return { configurable: true, enumerable: true, value: json.value };
					} else if(json.type == "number") {
						return { configurable: true, enumerable: true, value: json.value };
					} else if(json.type == "object") {
						if( name in internal_data ) {
							return { configurable: true, enumerable: true, value: internal_data[name] };
						} else {
							var obj1 = internal_data[name] = DiskProxy(folder+"/."+name,"object",swap);
							return { configurable: true, enumerable: true, value: obj1 };
						}
					} else if(json.type == "array") {
						var obj1 = internal_data[name] = DiskProxy(folder+"/."+name,"array","object",swap);
						return { configurable: true, enumerable: true, value: obj1 };
					} else if(json.type == "null") {
						return { configurable: true, enumerable: true, value: null };
					} else if(json.type == "function") {
						var f = generateFunction(name,json.value.value);
						return { configurable : true, enumerable : true, value : f };
					}
				} else {
					throw "must not get here";
				}
			} else {
				if(name == "constructor") {
					var self = this;
					return { configurable: true, enumerable: false, value: this.constructor };
				}
				return { configurable: true, enumerable: false, value: undefined };
			}
		}
	});
	return diskproxy;
}

module.exports = {
	DiskProxy : DiskProxy,
	setSwap : function(target) { 
		return _swap.setSwap(target);
	},
	getSwap : function() {
		return _swap.getSwap();
	}
};