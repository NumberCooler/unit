// Disk Proxy
//		e.g.:
//			disk.a.b.c.d = "ok"

function DiskProxy(folder,ftype) {
	ftype = ftype || "object";
	var fs = require("fs");
	var internal_data = {};
	var internal_operations = {};
	var obj = {};
	
	
	var diskproxy = new Proxy(obj,{
		construct: function(target, argumentsList, newTarget) {
			console.log("[CTOR]");
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
			console.log("set begin ["+prop+"]");
			//var parts = prop.split(".");
			var data = {};
			if(Object.prototype.toString.apply(value) == "[object String]") {
				data.type = "string";
				data.value = value;
				fs.writeFileSync(folder+"/"+prop,JSON.stringify(data),"utf8");
				return value;
			} else if(Object.prototype.toString.apply(value) == "[object Object]") {
				console.log(".object");
				if("type" in value) {
					if(value.type == "object") {
						console.log(".object.object");
						var json = {};
						if(fs.existsSync(folder+"/"+prop)) {
							json = JSON.parse( fs.readFileSync(folder+"/"+prop,"utf8") );
						}
						internal_data[prop] = DiskProxy( folder + "/." + prop , "object");
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
						for(var key in value) {
							internal_data[prop][key] = value[key];
						}
						return internal_data[prop];
					} else if(value.type == "array") {
						//console.log("0:ARRAY SET");
						var json = {};
						if(fs.existsSync(folder+"/"+prop)) {
							json = JSON.parse( fs.readFileSync(folder+"/"+prop,"utf8") );
						}
						internal_data[prop] = DiskProxy( folder + "/." + prop, "array" );
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
						//console.log("0:ARRAY SET END");
						return internal_data[prop];
					} else if(value.type == "function") {
						
					}
				} else {
					var json = {};
					if(fs.existsSync(folder+"/"+prop)) {
						json = JSON.parse( fs.readFileSync(folder+"/"+prop,"utf8") );
					}
					internal_data[prop] = DiskProxy( folder + "/." + prop , "object");
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
					for(var key in value) {
						internal_data[prop][key] = value[key];
					}
					return internal_data[prop];
				}
			} else if(Object.prototype.toString.apply(value) == "[object Array]") {
				//console.log("1:ARRAY SET");
				var json = {};
				if(fs.existsSync(folder+"/"+prop)) {
					json = JSON.parse( fs.readFileSync(folder+"/"+prop,"utf8") );
				}
				internal_data[prop] = DiskProxy( folder + "/." + prop, "array" );
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
				//console.log("1:ARRAY SET END");
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
				
				//console.log("FUNCTION");
				if(ftype == "array") {
					console.log("ARRAY PROTOTYPE");
				} else if(ftype == "object") {
					console.log("OBJECT PROTOTYPE");
				}
				
			}
			// store
			
			//console.log("set end ["+prop+"]");		
		},
		get: function(target, name) {
			if( typeof name === 'symbol' ) return name;
			if(ftype == "array" && name == "push") {
				var f = function(val) {
					console.log("RUNNING PUSH");
					var len = this.get(target,"length");
					console.log(len);
					this.set(target,len,val);
					//this.length = len + 1;
					this.set(target,"length",len+1);
					console.log(dump(target,"obj"));
					console.log("RUNNING PUSH END");
				};
				return f.bind(this);
			} else if(ftype == "array"  && name == "pop") {
				var f = function() {
					//console.log("RUNNING POP");
					var len = this.get(target,"length");
					var ret = null;
					if(len>0) {
						console.log(len);
						ret = this.get(target,len-1);
						this.deleteProperty(target,""+(len-1));
						//this.length = len + 1;
						this.set(target,"length",parseInt( len-1 ) )
					};
					//console.log(dump(target,"obj"));
					//console.log("RUNNING POP END");
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
						if( this.type(target,parseInt(x)) == "array" ) {
							r.push( this.get(target,parseInt(x)).toArray() );
						} else {
							r.push(this.get(target,parseInt(x)));
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
			} else if(name == "type") {
				var parts = folder.split("/");
				var last = parts.pop();
				var name = last.substring(1);
				parts.push(name);
				var fullname = parts.join("/");
				if(!fs.existsSync(fullname)) {
					//console.log("load1");
					return "undefined";
				} else if(fs.lstatSync(fullname).isFile()) {
					// delete file
					//console.log("load begin");
					var json = JSON.parse( fs.readFileSync(fullname,"utf8") );
					//console.log(JSON.stringify(json));
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
					// recursive remove
					// do nothing
				}	
			}
			// load
			//console.log("load begin:"+name);
			if(name == "toJSON") {
				return function() {
					if(!fs.existsSync(folder+"/"+name)) {
						return undefined;
					} else if(fs.lstatSync(folder+"/"+name).isFile()) {
						
					}
					console.log("[TOJSON]");
				}
			}
			//console.log(name);
			if(!fs.existsSync(folder+"/"+name)) {
				//console.log("load1");
					
				return undefined;
			} else if(fs.lstatSync(folder+"/"+name).isFile()) {
				// delete file
				//console.log("load begin");
				var json = JSON.parse( fs.readFileSync(folder+"/"+name,"utf8") );
				//console.log(JSON.stringify(json));
				if(json.type == "string") {
					return json.value;
				} else if(json.type == "number") {
					return json.value;
				} else if(json.type == "object") {
					if( name in internal_data ) {
						return internal_data[name];
					} else {
						return internal_data[name] = DiskProxy(folder+"/."+name);
					}
				} else if(json.type == "array") {
					//console.log("ARRAY GET:"+name);
					var obj2 = null;
					if( name in internal_data ) {
						obj2 = internal_data[name];
					} else {
						obj2 = internal_data[name] = DiskProxy(folder+"/."+name,"array");
						
					}
					//console.log("ARRAY GET END");
					//console.log(obj2);
					//console.log(obj2.push);
					return obj2;
				} else if(json.type == "null") {
					return null;
				} else if(json.type == "function") {
					//console.log("load function:"+json.value.value);
					
					//console.log("set function");
					eval( "var func = " + json.value.value );
					var code = json.value.value;
					if(code.indexOf("*/")!=-1) throw "storage functions cant contain long comments";
					var str = "internal_operations[name] = function() {\r\n/*" + code + "*/\r\n"+
						"//console.log(\"CALL\" +name);\r\n"+
						"var args = [];\r\n"+
						"for(var x = 0; x < arguments.length;x++) args.push(arguments[x]);\r\n"+
						"if(this == internal_operations)\r\n"+
							"return func.apply(diskproxy,args);\r\n"+
						"else return func.apply(this,args);\r\n"+
					"}";
					//console.log("[["+str+"]]");
					eval(str);
					internal_operations[name].toString = function() {
						return code;
					}
					//console.log(internal_operations[name]);
					//internal_operations[name]();
					return internal_operations[name];
				}
				
			} else {
				throw "unknown";
				// recursive remove
				// do nothing
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
					//recursive delete folder
					function rrmdir(folder1) {
						console.log("delete.rrmdir.folder1:"+folder1);
						console.log("delete.rrmdir.abspath:"+folder+"/." +folder1);
						var list = fs.readdirSync(folder + "/." + folder1);
						console.log("delete.rrmdir list begin :");
						for(var x = 0; x < list.length;x++) {
							console.log(list[x]);
						}
						console.log("delete.rrmdir list end");
						for(var x = 0; x < list.length;x++) {
							console.log("delete.rrmdir in1:"+list[x]+";1");
							if( fs.lstatSync(folder + "/." + folder1 + "/" + list[x]).isDirectory() ) {
							} else {
								console.log("trying to read :"+folder + "/." + folder1 + "/" + list[x]+" .");
								var json2 = fs.readFileSync(folder + "/." + folder1 + "/" + list[x],"utf8")
								console.log("delete.rrmdir in|at:"+list[x]+";2");
								json2 = JSON.parse( json2 );
								if(json2.type =="string" || json2.type =="number" || json2.type =="null" || json2.type =="function") {
									console.log("delete.rrmdir.type[PRIMITIVE]");
									fs.unlinkSync(folder + "/." + folder1 + "/" + list[x]);	
								} else if(json2.type == "array" || json2.type == "object" ) {
									console.log("delete.rrmdir.type[FOLDER]");
									rrmdir(folder1 + "/." + list[x]);
									console.log("delete.rmdir.type[FOLDER].1:"+folder + "./" + folder1 + "/" + list[x]);
									fs.unlinkSync(folder + "/." + folder1 + "/" + list[x]);	
								} else {
									
									console.log("UNKNOWN");
								}
								
							}
							console.log("delete.rrmdir out1:"+list[x]+";1");
						}
						
						console.log("--");
						console.log("delete.rrmdir out01:"+folder+"./"+folder1);
						fs.rmdirSync(folder+"/."+folder1);
						console.log("delete.rrmdir out02");
					}
					try {
						console.log("#1");
						rrmdir(name);
						console.log("#2");
						fs.unlinkSync(folder+"/"+name);
						console.log("#3");
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
						console.log("delete.rrmdir.folder1:"+folder1);
						console.log("delete.rrmdir.abspath:"+folder+"/." +folder1);
						var list = fs.readdirSync(folder + "/." + folder1);
						console.log("delete.rrmdir list begin :");
						for(var x = 0; x < list.length;x++) {
							console.log(list[x]);
						}
						console.log("delete.rrmdir list end");
						for(var x = 0; x < list.length;x++) {
							console.log("delete.rrmdir in1:"+list[x]+";1");
							if( fs.lstatSync(folder + "/." + folder1 + "/" + list[x]).isDirectory() ) {
							} else {
								console.log("trying to read :"+folder + "/." + folder1 + "/" + list[x]+" .");
								var json2 = fs.readFileSync(folder + "/." + folder1 + "/" + list[x],"utf8")
								console.log("delete.rrmdir in|at:"+list[x]+";2");
								json2 = JSON.parse( json2 );
								if(json2.type =="string" || json2.type =="number" || json2.type =="null" || json2.type =="function") {
									console.log("delete.rrmdir.type[PRIMITIVE]");
									fs.unlinkSync(folder + "/." + folder1 + "/" + list[x]);	
								} else if(json2.type == "array" || json2.type == "object" ) {
									console.log("delete.rrmdir.type[FOLDER]");
									rrmdir(folder1 + "/." + list[x]);
									console.log("delete.rmdir.type[FOLDER].1:"+folder + "./" + folder1 + "/" + list[x]);
									fs.unlinkSync(folder + "/." + folder1 + "/" + list[x]);	
								} else {
									
									console.log("UNKNOWN");
								}
								
							}
							console.log("delete.rrmdir out1:"+list[x]+";1");
						}
						
						console.log("--");
						console.log("delete.rrmdir out01:"+folder+"./"+folder1);
						fs.rmdirSync(folder+"/."+folder1);
						console.log("delete.rrmdir out02");
					}
					try {
						console.log("#1");
						rrmdir(name);
						console.log("#2");
						fs.unlinkSync(folder+"/"+name);
						console.log("#3");
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
			// list folder
			//console.log("OWNKEYS BEGIN");
			var list = fs.readdirSync(folder);
			var r = [];
			for(var x = 0; x < list.length;x++) {
				if(list[x].indexOf(".")!=0) {
					//console.log(list[x]);
					r.push(list[x]);
				}
			}
			//console.log("OWNKEYS END:"+JSON.stringify(r));
			return r;
		},
		getOwnPropertyDescriptor: function(target, name) {
			//console.log('getOwnPropertyDescriptor BEGIN: ' + name);
			if(fs.existsSync(folder+"/"+name)) {
				if(fs.lstatSync(folder+"/"+name).isFile()) {
					var json = JSON.parse( fs.readFileSync(folder+"/"+name,"utf8") );
					//console.log(JSON.stringify(json));
					if(json.type == "string") {
						return { configurable: true, enumerable: true, value: json.value };
					} else if(json.type == "number") {
						return { configurable: true, enumerable: true, value: json.value };
					} else if(json.type == "object") {
						if( name in internal_data ) {
							return { configurable: true, enumerable: true, value: internal_data[name] };
						} else {
							var obj1 = internal_data[name] = DiskProxy(folder+"/."+name);
							
							return { configurable: true, enumerable: true, value: obj1 };
							//return internal_data[name] = DiskProxy(folder+"/."+name);
						}
					} else if(json.type == "array") {
						var obj1 = internal_data[name] = DiskProxy(folder+"/."+name,"array");
						return { configurable: true, enumerable: true, value: obj1 };
					} else if(json.type == "null") {
						return { configurable: true, enumerable: true, value: null };
					} else if(json.type == "function") {
						//console.log("AAA");
						if( name in internal_operations ) {
							return { configurable: true, enumerable: true, value: internal_operations[name] };
						} else {
							//console.log("set function");
							eval( "var func = " + json.value.value );
							var code = json.value.value;
							//console.log(code);
							if(code.indexOf("*/")!=-1) throw "storage functions cant contain long comments";
							var str = "internal_operations[name] = function() {\r\n/*" + code + "*/\r\n"+
								"//console.log(\"CALL\" +name);\r\n"+
								"var args = [];\r\n"+
								"for(var x = 0; x < arguments.length;x++) args.push(arguments[x]);\r\n"+
								"func.apply(diskproxy,args);\r\n"+
							"}";
							//console.log("[["+str+"]]");
							eval(str);
							internal_operations[name].toString = function() {
								return code;
							}
							//console.log(internal_operations[name]);
							//internal_operations[name]();
							return { configurable : true, enumerable : false, value : internal_operations[name] };
						}
						//console.log("getOwnPropertyDescriptor:func");
						
					}
				} else {
					console.log("#ERROR");
					throw "must not get here";
				}
			} else {
				if(name == "constructor") {
					var self = this;
					return { configurable: true, enumerable: false, value: this.constructor };
				}
				
				console.log(name + "!!!");
				return { configurable: true, enumerable: false, value: undefined };
			}
		}
	});
	
	
	
	return diskproxy;
}
function dump(target,caption,level,type) {
	
	type = type || "object";
	
	level = level || 0;
	
	//console.log("DUMP:"+caption+":"+level+":"+type);
	caption = caption || "$";
	var ret = [];
	var tab = [];
	//for(var x = 0; x < level;x++) tab.push("    ");
	tab = tab.join("");
	if(level == 0) {
		if(type == "array") {
			ret.push("[");
		} else if(type == "object") {
			ret.push("{");
		}
	} else {
		if(type == "array") {
			ret.push("[");
		} else if(type == "object") {
			ret.push(caption+":{");
		}
		
	}
	var count = 0;
	
	var comma = "";
	if(type == "object") {
		for(var key in target) {
			//console.log("@"+key);
			if(Object.prototype.hasOwnProperty.apply(target,[key])) {
				//console.log("@"+key);
				if('symbol' === typeof target[key]) {
				} else {
					if(count>0) comma = ",";
					if(Object.prototype.toString.apply(target[key])=="[object String]") {
						//console.log("OBJ STRING");
						ret.push(comma+JSON.stringify(key)+":"+JSON.stringify(target[key])+"");
						count += 1;
					} else if(Object.prototype.toString.apply(target[key])=="[object Number]") {
						//console.log("OBJ NUMBER");
						ret.push(comma+JSON.stringify(key)+":"+target[key]);
						count += 1;
					} else if(Object.prototype.toString.apply(target[key])=="[object Object]") {
						//console.log("OBJ OBJ");
						//console.log("stringify:"+key+":"+JSON.stringify(target[key]));
						ret.push( dump(target[key],comma+JSON.stringify(key),level+1) );
						count += 1;
					} else if(Object.prototype.toString.apply(target[key])=="[object Array]") {
						//console.log("OBJ ARRAY");
						ret.push( dump(target[key],comma+JSON.stringify(key),level+1,"array") );
						count += 1;
					} else if(Object.prototype.toString.apply(target[key]) =="[object Function]") {
						ret.push(comma+JSON.stringify(key)+":"+JSON.stringify(""+target[key])+"");
						count += 1;
						//console.log("OBJ FUN");
						//console.log("DUMP FUNCTION");
					}
					
				}
				//console.log("@:"+key);
			}
		}
	} else if(type == "array") {
		console.log("#ARRAY");
		console.log( target.length );
		
	}
	
	if(type == "array") {
		ret.push("]");
	} else if(type == "object") {
		ret.push("}");
	}
	//console.log("RET DUMP");
	return ret.join("");
}
module.exports = {
	DiskProxy : DiskProxy,
	dump : dump,
	mem : function(target) {
		console.log(JSON.parse(dump(target)));
	}
};
//var diskproxy = DiskProxy("disk1");

//console.log( dump(diskproxy) );
//diskproxy.unit.options = {};

//delete diskproxy.unit.options.a;
//delete diskproxy.unit.options.b;
//delete diskproxy.unit.options.c;
//diskproxy.unit.options.a = "A";
//diskproxy.unit.options.b = "B";
//diskproxy.unit.options.c = "C";
//diskproxy.unit.a = 40;
//diskproxy.unit.b = 50;
//diskproxy.unit.c = 60;
//console.log( diskproxy.unit.options.a);
