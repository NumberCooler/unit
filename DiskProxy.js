// Disk Proxy
//		e.g.:
//			disk.a.b.c.d = "ok"

function DiskProxy(folder) {
	var fs = require("fs");
	var internal_data = {};
	var obj = {};
	var diskproxy = new Proxy(obj,{
		has : function(target,name) {
			if(fs.existsSync(folder+"/"+name) && fs.lstatSync(folder+"/"+name).isFile()) return true;
			return false;
		},
		set : function(target,prop,value) {
			//console.log("set begin ["+prop+"]");
			var parts = prop.split(".");
			var data = {};
			if(Object.prototype.toString.apply(value) == "[object String]") {
				data.type = "string";
				data.value = value;
				fs.writeFileSync(folder+"/"+prop,JSON.stringify(data),"utf8");
			} else if(Object.prototype.toString.apply(value) == "[object Object]") {
				var json = {};
				if(fs.existsSync(folder+"/"+prop)) {
					json = JSON.parse( fs.readFileSync(folder+"/"+prop,"utf8") );
				}
				internal_data[prop] = DiskProxy( folder + "/." + prop );
				
				data.type = "object";
				data.value = {};
				if("type" in json && json.type != data.type) {
					fs.writeFileSync(folder+"/"+prop,JSON.stringify(data),"utf8");
				} else if(!("type" in json)) {
					fs.writeFileSync(folder+"/"+prop,JSON.stringify(data),"utf8");
				}
				if(!fs.existsSync(folder+"/."+prop)) {
					fs.mkdirSync(folder+"/."+prop)
				}
				
			} else if(Object.prototype.toString.apply(value) == "[object Array]") {
				data.type = "array";
				data.value = value;
				fs.writeFileSync(folder+"/"+prop,JSON.stringify(data),"utf8");
			} else if(Object.prototype.toString.apply(value) == "[object Number]") {
				data.type = "number";
				data.value = value;
				fs.writeFileSync(folder+"/"+prop,JSON.stringify(data),"utf8");
			} else if(value == null) {
				data.type = "null";
				fs.writeFileSync(folder+"/"+prop,JSON.stringify(data),"utf8");
			}
			// store
			
			//console.log("set end ["+prop+"]");		
			
		},
		get: function(target, name) {
			if( typeof name === 'symbol' ) return name;
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
					return json.value;
				} else if(json.type == "null") {
					return null;
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
				} else if(json.type == "number") {
					fs.unlinkSync(folder+"/"+name);
				} else if(json.type == "object") {
					if( name in internal_data ) {
						//return internal_data[name];
						
					} else {
						//return internal_data[name] = DiskProxy(folder+"/."+name);
					}
				} else if(json.type == "array") {
					//return json.value;
				} else if(json.type == "null") {
					fs.unlinkSync(folder+"/"+name);
				}
			}
		}, 
		ownKeys : function (target) {
			// list folder
			var list = fs.readdirSync(folder);
			var r = [];
			for(var x = 0; x < list.length;x++) {
				if(list[x].indexOf(".")!=0) {
					//console.log(list[x]);
					r.push(list[x]);
				}
			}
			return r;
		},
		getOwnPropertyDescriptor: function(target, name) {
			//console.log('called: ' + name);
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
							return { configurable: true, enumerable: true, value: internal_data[name] = DiskProxy(folder+"/."+name) };
							//return internal_data[name] = DiskProxy(folder+"/."+name);
						}
					} else if(json.type == "array") {
						return { configurable: true, enumerable: true, value: json.value };
					} else if(json.type == "null") {
						return { configurable: true, enumerable: true, value: null };
					}
				} else {
					throw "must not get here";
				}
			} else {
				return { configurable: true, enumerable: false, value: undefined };
			}
		}
	});
	
	return diskproxy;
}
function dump(target,caption,level) {
	level = level || 0;
	caption = caption || "$";
	var ret = [];
	var tab = [];
	//for(var x = 0; x < level;x++) tab.push("    ");
	tab = tab.join("");
	if(level == 0) {
		ret.push("{");
	} else {
		ret.push(caption+":{");
	}
	var count = 0;
	var comma = "";
	for(var key in target) {
		if(Object.prototype.hasOwnProperty.apply(target,[key])) {
			//console.log("@"+key);
			if('symbol' === typeof target[key]) {
			} else {
				if(count>0) comma = ",";
				if(Object.prototype.toString.apply(target[key])=="[object String]") {
					ret.push(comma+JSON.stringify(key)+":"+JSON.stringify(target[key])+"");
					count += 1;
				} else if(Object.prototype.toString.apply(target[key])=="[object Number]") {
					ret.push(comma+JSON.stringify(key)+":"+target[key]);
					count += 1;
				} else if(Object.prototype.toString.apply(target[key])=="[object Object]") {
					ret.push( dump(target[key],comma+JSON.stringify(key),level+1) );
					count += 1;
				}
				
			}
			//console.log("@:"+key);
		}
	}
	ret.push("}");
	return ret.join("");
}
var diskproxy = DiskProxy("disk1");

console.log( dump(diskproxy) );
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
