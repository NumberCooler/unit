//require
var dp = require("./lib/DiskProxy");
var fs = require("fs");
var repl = require("repl");
var express = require("express");
var request = require("request");
var webfile = require("./lib/WebFile");

//alias
var DiskProxy = dp.DiskProxy;
var dump = dp.dump;
var memory = dp.mem;
//set
var context = {};
var swap = dp.setSwap(DiskProxy("swap","object",null));
context.rt = swap;
var rt = dp.getSwap();

var ram = {};

context.ram = ram;
var lib = {
	fs : fs,
	express : express,
	express_util : {
		routeHandler : function(options) {
			if( options.type == "file" ) {
				return function(req,res) {
					options.box.filepath
				}
			}
		}
	},
	webfile : webfile,
	request : request,
	lang : {
			utils : {
					runExtended : function(target,name,funktionList) {
							var a;
							target[name] = function() {
								return target["$"+name].run($);
							}
							if( arguments.length < 3 ) {
								console.log("target name functionList...");
								return;
							}
							var args = [];
							for(var x = 2; x < arguments.length;x++) {
								args.push(arguments[x]);
							}
							target["$" + name ] = {
								data : args,
								run : function(ctx) {
									this.target = {};
									var base = this.target;
									for(var x = 0; x < this.data.length;x++) {
										base = this.data[x](ctx,base);
									}
									return base;
								}
							};
							
					}
			}
	}
};
context.lib = lib;
var diskproxy = DiskProxy("disk/alpha","object",context);
context.disk = diskproxy;
var documentation = DiskProxy("docs","object",context);
context.help = documentation;

function _eval(code) {
	eval(code);
}

const r = repl.start('> ');
function initialize() {
	Object.defineProperty(r.context,"$",{
		configurable: false,
		enumerable: true,
		value: r.context
	});
	Object.defineProperty(r.context,"eval",{
		configurable: false,
		enumerable: true,
		value: function() {
			var args = [];
			for(var x = 0; x < arguments.length;x++) args.push(arguments[x]);
			return _eval.apply(r.context,args);
		}
	});
	Object.defineProperty(r.context,"lib",{
		configurable: false,
		enumerable: true,
		value: lib
	});
	Object.defineProperty(r.context, 'ram', {
	  configurable: false,
	  enumerable: true,
	  value: ram
	});
	
	Object.defineProperty(r.context,"disk",{
		configurable: false,
		enumerable: true,
		value: diskproxy
	});

	Object.defineProperty(r.context, 'help', {
	  configurable: false,
	  enumerable: true,
	  value: documentation
	});

	Object.defineProperty(r.context, 'dump', {
	  configurable: false,
	  enumerable: true,
	  value: dump
	});

	Object.defineProperty(r.context, 'memory', {
	  configurable: false,
	  enumerable: true,
	  value: memory
	});

	Object.defineProperty(r.context, 'rt', {
	  configurable: false,
	  enumerable: true,
	  value: rt
	});
	
	
	diskproxy.boot.start(diskproxy,r.context);
}
initialize();
r.on('exit', () => {
  diskproxy.shutdown.start(diskproxy,r.context);
  process.exit();
});
r.on('reset',() => {
	diskproxy.shutdown.start(diskproxy,r.context);
	initialize();
});
