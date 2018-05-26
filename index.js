var dp = require("./lib/DiskProxy");
var fs = require("fs");
var repl = require("repl");
var DiskProxy = dp.DiskProxy;
var dump = dp.dump;
var memory = dp.mem;
var context = {};
var swap = dp.setSwap(DiskProxy("swap","object",null));
context.rt = swap;
var rt = dp.getSwap();
var ram = {};
context.ram = ram;
const crypto = require('crypto');
const readline = require("readline");
context.lib = lib;
var diskproxy = DiskProxy("disk/alpha","object",context);
context.disk = diskproxy;

var alias = DiskProxy("disk/alias","object",context);

var documentation = DiskProxy("docs","object",context);
context.help = documentation;




var lib = {
	fs : fs,
	format : {
		disk : function($) {
			//console.log("$.disk.login.username + (?:password) = hmac digest");
			//console.log( crypto.createHmac('sha256', $.disk.password).digest("hex") );
			// for(var key in diskproxy) { delete diskproxy[key]; }
		}
	}
};



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
	
	Object.defineProperty(r.context, "disk",{
		configurable: false,
		enumerable: true,
		get : function() {
			return diskproxy;
		}
	});
	
	Object.defineProperty(r.context, "env",{
		configurable: false,
		enumerable: true,
		get : function() {
			return alias;
		}
	});

	Object.defineProperty(r.context, 'help', {
	  configurable: false,
	  enumerable: true,
	  value: documentation
	});

	Object.defineProperty(r.context, 'rt', {
	  configurable: false,
	  enumerable: true,
	  value: rt
	});
	try { delete diskproxy.mock; } catch(e) {}
	try { delete alias.mock; } catch(e) {}
	try { delete documentation.mock; } catch(e) {}
	try { delete swap.mock; } catch(e) {}
	function set(key,val) {
		Object.defineProperty(r.context, key, {
		  configurable: false,
		  enumerable: true,
		  value: val
		});
	}
	for(var key in alias) {
		var $ = r.context;
		eval("var f = " + alias[key]);
		set(key,f);
	}
}
initialize();
r.on('exit', () => {
	// shutdown
	diskproxy.mock = 0;
	alias.mock = 0;
	swap.mock = 0;
	documentation.mock = 0;
	process.exit();
});
for(var x in diskproxy)
	console.log(x);
r.on('reset',() => {
	// shutdown
	diskproxy.mock = 0;
	alias.mock = 0;
	swap.mock = 0;
	documentation.mock = 0;
	initialize();
});
