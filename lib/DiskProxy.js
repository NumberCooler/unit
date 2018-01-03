
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
// Disk Proxy
//		e.g.:
//			disk.a.b.c.d = "ok"
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
		//console.log(code);
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
		
		//console.log(code);
		if(code.indexOf("*/")!=-1) throw "storage functions cant contain long comments cause it code is listed inside long comments.";
		var str = "internal_operations[name] = function() {\r\n/*" + code + "*/\r\n"+
			"//console.log(\"CALL\" +name);\r\n"+
			"var args = [];\r\n"+
			"for(var x = 0; x < arguments.length;x++) args.push(arguments[x]);\r\n"+
			//"console.log(\"@@\"+this);\r\n"+
			"return func.apply(this,args);\r\n"+
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
			//console.log("set begin ["+prop+"]");
			//var parts = prop.split(".");
			var data = {};
			if(Object.prototype.toString.apply(value) == "[object String]") {
				data.type = "string";
				data.value = value;
				fs.writeFileSync(folder+"/"+prop,JSON.stringify(data),"utf8");
				return value;
			} else if(Object.prototype.toString.apply(value) == "[object Object]") {
				//console.log(".object");
				if("type" in value) {
					
					if(value.type == "object") {
						console.log("INNER SETUP 1");
						//console.log(".object.object");
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
						console.log("INNER SETUP 2");
						//console.log("0:ARRAY SET");
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
						//console.log("0:ARRAY SET END");
						
						return internal_data[prop];
					} else if(value.type == "function") {
						console.log("INNER SETUP 3");
					} else {
						console.log("INNER SETUP 4");
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
				//console.log("1:ARRAY SET");
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
			}
			// store
			
			//console.log("set end ["+prop+"]");		
		},
		get: function(target, name) {
			//console.log("GET[0]:"+folder+":"+name.toString());
			if( typeof name === 'symbol' ) {
				//console.log("GET[0a]");
				return name;
			}
			//console.log("GET[1]");
			if(ftype == "array" && name == "push") {
				var f = function(val) {
					//console.log("RUNNING PUSH");
					var len = this.get(target,"length");
					//console.log(len);
					this.set(target,len,val);
					//this.length = len + 1;
					this.set(target,"length",len+1);
					
					//console.log("RUNNING PUSH END");
				};
				//console.log("GET >> [array.push]");
				return f.bind(this);
			} else if(ftype == "array"  && name == "pop") {
				var f = function() {
					//console.log("RUNNING POP");
					var len = this.get(target,"length");
					var ret = null;
					if(len>0) {
						//console.log(len);
						ret = this.get(target,len-1);
						//console.log("@1");
						
						// se deletar na proxima instrucao, nao vai ter o valor de retorno pra ser lido depois do pop
						// precisa copiar para lugar temporario
						
						this.deleteProperty(target,""+(len-1));
						//console.log("@2");
						//this.length = len + 1;
						this.set(target,"length",parseInt( len-1 ) )
					};
					//console.log("@3");
					//console.log("RUNNING POP END");
					return ret;
				};
				//console.log("GET >> [array.pop]");
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
				//console.log("GET >> [array.unshift]");
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
				//console.log("GET >> [array.shift]");
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
				//console.log("GET >> [array.indexOf]");
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
				//console.log("GET >> [array.remove]");
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
				//console.log("GET >> [array.removeAt]");
				return f.bind(this);
			} else if(ftype =="array"  && name == "show") {
				var f = function() {
					var len = this.get(target,"length");
					for(var x = 0; x < len;x++) {
						console.log("["+x+"]:" +this.get(target,parseInt(x)));
					}
				};
				//console.log("GET >> [array.show]");
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
								//if("type" in i) { console.log(i.type); }
								//console.log("@"+this.get(target,parseInt(x)));
								r.push(this.get(target,parseInt(x)).toObject() );
							}
						}
					}
					return r;
				};
				//console.log("GET >> [array.toArray]");
				return f.bind(this);
			} else if(ftype =="object" && name =="show") {
				var f = function() {
					var keys = this.ownKeys(target);
					for(var x = 0; x < keys.length;x++) {
						console.log("["+keys[x]+"]:"+this.get(target,keys[x]) );
					}
				};
				//console.log("GET >> [object.show]");
				return f.bind(this);
			} else if(ftype == "object" && name == "toObject") {
				var self = this;
				var f = function() {
					var obj = {};
					var keys = self.ownKeys(self);
					for(var x = 0; x < keys.length;x++) {
						//console.log(keys[x]);
						var a = self.get(self,keys[x]);
						if( a.type == "object" ) {
							obj[keys[x]] = a.toObject();
						} else if(a.type == "array") {
							obj[keys[x]] = a.toArray();
						} else if(a.type == "function") {
							//console.log(a.toString());
							eval("var f = " + a.toString());
							obj[keys[x]] = f;
						} else {
							obj[ keys[x] ] = a;
						}
					}
					
					return obj;
				};
				//console.log("GET >> [object.toObject]");
				return f.bind(this);
			} else if(name == "type") {
				var parts = folder.split("/");
				var last = parts.pop();
				var name = last.substring(1);
				parts.push(name);
				var fullname = parts.join("/");
				//console.log("GET >> [type]");
				if(!fs.existsSync(fullname)) {
					//console.log("find file:"+fullname);
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
			} else if(name == "parent") {
				var parts = folder.split("/")
				//console.log("folder :",folder);
				var name2 = parts.pop();
				var bfolder = parts.join("/");
				//console.log("bfolder :",bfolder);
				//console.log("pop from folder :",name2);
				var pfolder = parts.join("/");
				//console.log("GET >> [parent]");
				if(parts.length>1) {
					parts.pop();
					var name3 = name2.substring(1);
					var pfile = parts.join("/") + "/" +name3;
					//console.log("=>>",pfolder + "/"+ name3);
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
						
						//pfolder + "/." + name3
						return DiskProxy(pfolder,json.type,swap);
						
						//throw "doing";
						//return DiskProxy(parts.join("/") + "/." +name,json.type,swap);
					} else {
						throw "new type.parent not defined.";
					}
				} else if(parts.length==1) {
					return DiskProxy(parts.join("/"),"object",swap);
				} else {
					return null;
				}
				//console.log("=>>"+folder);
			}
			// load
			//console.log("load begin:"+name);
			if(name == "toJSON") {
				//console.log("GET >> [toJSON]");
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
				//console.log("find file:"+folder+"/"+name);
				//console.log("GET >> undefined");
				return undefined;
			} else if(fs.lstatSync(folder+"/"+name).isFile()) {
				// delete file
				//console.log("load begin");
				var json = JSON.parse( fs.readFileSync(folder+"/"+name,"utf8") );
				//console.log(JSON.stringify(json));
				if(json.type == "string") {
					//console.log("GET >> string");
					return json.value;
				} else if(json.type == "number") {
					//console.log("GET >> number");
					return json.value;
				} else if(json.type == "object") {
					//console.log("GET >> object");
					if( name in internal_data ) {
						return internal_data[name];
					} else {
						return internal_data[name] = DiskProxy(folder+"/."+name,"object",swap);
					}
				} else if(json.type == "array") {
					//console.log("ARRAY GET:"+name);
					//console.log("GET >> array");
					var obj2 = null;
					if( name in internal_data ) {
						obj2 = internal_data[name];
					} else {
						obj2 = internal_data[name] = DiskProxy(folder+"/."+name,"array",swap);
						
					}
					//console.log("ARRAY GET END");
					//console.log(obj2);
					//console.log(obj2.push);
					
					return obj2;
				} else if(json.type == "null") {
					//console.log("GET >> null");
					return null;
				} else if(json.type == "function") {
					//console.log("GET >> function");
					var f = generateFunction(name,json.value.value);
					return f;
					
				}
				
			} else {
				console.log("GET >> unknown");
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
							if(fs.existsSync( folder + "/." + folder1 + "/" + list[x] ) ) {
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
										console.log("delete.rmdir.type[FOLDER].1a:"+folder + "/." + folder1 + "/" + list[x]);
										fs.unlinkSync(folder + "/." + folder1 + "/" + list[x]);	
									} else {
										
										console.log("UNKNOWN");
									}
									
								}
							}
							console.log("delete.rrmdir out1:"+list[x]+";1");
						}
						
						console.log("--");
						console.log("delete.rrmdir outa01:"+folder+"./"+folder1);
						fs.rmdirSync(folder+"/."+folder1);
						console.log("delete.rrmdir outa02");
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
							if(fs.existsSync(folder + "/." + folder1 + "/" + list[x])) {
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
										console.log("delete.rmdir.type[FOLDER].1b:"+folder + "./" + folder1 + "/" + list[x]);
										fs.unlinkSync(folder + "/." + folder1 + "/" + list[x]);	
									} else {
										
										console.log("UNKNOWN");
									}
									
								}
							}
							console.log("delete.rrmdir out1:"+list[x]+";1");
						}
						
						console.log("--");
						console.log("delete.rrmdir outb01:"+folder+"./"+folder1);
						fs.rmdirSync(folder+"/."+folder1);
						console.log("delete.rrmdir outb02");
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
			if(fs.existsSync(folder)) {
				var list = fs.readdirSync(folder);
				var r = [];
				for(var x = 0; x < list.length;x++) {
					if(list[x].indexOf(".")!=0) {
						//console.log(list[x]);
						
						//if(ftype == "array" && list[x] =="length"){
							
						//} else {
							r.push(list[x]);
						//}
					}
				}
				//console.log("OWNKEYS END:"+JSON.stringify(r));
				return r;
			} else {
				return [];
			}
			
		},
		getOwnPropertyDescriptor: function(target, name) {
			//console.log('getOwnPropertyDescriptor BEGIN: ' + name);
			//console.log(folder+"/"+name);
			if(fs.existsSync(folder+"/"+name)) {
				if(fs.lstatSync(folder+"/"+name).isFile()) {
					var str = fs.readFileSync(folder+"/"+name,"utf8");
					//console.log(str);
					var json = JSON.parse( str );
					//console.log(JSON.stringify(json));
					if(json.type == "string") {
						return { configurable: true, enumerable: true, value: json.value };
					} else if(json.type == "number") {
						//console.log("@NUMBER");
						return { configurable: true, enumerable: true, value: json.value };
					} else if(json.type == "object") {
						if( name in internal_data ) {
							return { configurable: true, enumerable: true, value: internal_data[name] };
						} else {
							var obj1 = internal_data[name] = DiskProxy(folder+"/."+name,"object",swap);
							
							return { configurable: true, enumerable: true, value: obj1 };
							//return internal_data[name] = DiskProxy(folder+"/."+name);
						}
					} else if(json.type == "array") {
						//console.log("@ARRAY");
						var obj1 = internal_data[name] = DiskProxy(folder+"/."+name,"array","object",swap);
						return { configurable: true, enumerable: true, value: obj1 };
					} else if(json.type == "null") {
						return { configurable: true, enumerable: true, value: null };
					} else if(json.type == "function") {
						//console.log("@FUNCTION");
						var f = generateFunction(name,json.value.value);
						return { configurable : true, enumerable : true, value : f };
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
				
				//console.log(name + "!!!");
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


function test() {
	var diskproxy = DiskProxy("disk1","object");
//delete diskproxy.x;
//diskproxy.x = [];
//diskproxy.x[0] = 1;


//for(var x = 0; x < 10;x++) diskproxy.x.push(x);
//for(var x = 0; x < 10;x++) diskproxy.x.pop();

//for(var x = 0; x < 10;x++) diskproxy.x.unshift(x);
//for(var x = 0; x < 10;x++) diskproxy.x.shift();
//diskproxy.z = 200;
//diskproxy.help = function() {
	//this.$help = {};
	
	//this.$help.a = 10;
	//delete this.$help.a;
	
	//console.log("OK");
//}
//diskproxy.help()
//diskproxy.t.y();
//diskproxy.t.y = function () {
//   console.log("TY");
//   console.log(this.z);
//}

//console.log(diskproxy.t.y);
//console.log("!!0");

//console.log(">>"+diskproxy.y);
//diskproxy.y();

//console.log(diskproxy.x);
//console.log( JSON.parse(dump(diskproxy)) );
//console.log(diskproxy.x.push);
//console.log(diskproxy.x[0]);

}

	
module.exports = {
	DiskProxy : DiskProxy,
	setSwap : function(target) { 
		return _swap.setSwap(target);
	},
	getSwap : function() {
		return _swap.getSwap();
	},
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
