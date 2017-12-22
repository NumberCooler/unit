var dp = require("./lib/DiskProxy");
var repl = require("repl");
var DiskProxy = dp.DiskProxy;
var dump = dp.dump;
var memory = dp.mem;
var diskproxy = DiskProxy("disk1","object");
var documentation = DiskProxy("docs","object");

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
console.log( JSON.parse(dump(diskproxy)) );
//console.log(diskproxy.x.push);
//console.log(diskproxy.x[0]);

const r = repl.start('> ');
Object.defineProperty(r.context, 'disk', {
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