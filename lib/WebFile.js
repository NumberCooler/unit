
var fs = require("fs");
var request = require("request");
var vm = require("vm");
// this is raw, it do not check credentials or assert path 
function webfile(acl) {
    this.raw = [];
    this.objects = [];
    this.started = false;
    this.acl = acl;
}

webfile.prototype.import = function(path,options) {
    // check if css or js
    // now must load by /load then it checks credentials, if got and error throw error page with errors
    if(Object.prototype.toString.apply(options) == "[object String]") {
        var data = {
            type : "import",
            ext : options,
            file : path,
            body : "",
            status : 0,
            date : new Date(),
            loaded : true
        };
    } else if(Object.prototype.toString.apply(options) == "[object Object]") {
        var ext = path.split(".").pop();
        var data = {
            type : "import",
            ext : ext,
            file : path,
            body : "",
            status : 0,
            date : new Date(),
            loaded : true
        };
    } else {
        var ext = path.split(".").pop();
        var data = {
            type : "import",
            ext : ext,
            file : path,
            body : "",
            status : 0,
            date : new Date(),
            loaded : true
        };
    }
    
    // sample
    this.objects.push(data);
}
webfile.prototype.style = function(data) {
    var data = {
        type : "style",
        ext : "css",
        body : data,
        date : new Date(),
        loaded : true
    }
    this.objects.push(data);
}
webfile.prototype.script = function(data) {
    var data = {
        type : "script",
        ext : "js",
        body : data,
        date : new Date(),
        loaded : true
    }
    this.objects.push(data);
}
webfile.prototype.part = function(path) {
    // components goes here
    var ext = path.split(".").pop();
    var data = {
        type : "part",
        ext : ext,
        file : path,
        body : "",
        date : new Date(),
        loaded : true
    };
    // warning (leakage) error
    
    this.objects.push(data)
}
webfile.prototype.page = function(name,path) {
    // it is the page definition
    
    var data = {
        type : "page",
        file : path,
        name : name,
        body : "",
        date : new Date(),
        loaded : true
    }
    this.objects.push(data);
}
webfile.prototype.start = function(path) {
    var ext = path.split(".").pop();
    var data = {
        type : "start",
        ext : ext,
        file : path,
        body : "",
        date : new Date(),
        loaded : true
    }
    this.objects.push(data);
}
function mount(webfile,acl,callback,error_callback) {

    for(var x = 0; x < webfile.objects.length;x++) {
        if(!webfile.objects[x].loaded) {
            setTimeout(function() {
                mount(webfile,callback);
            },100);
            return;
        }
    }
    //console.log("MOUNTING");
    try {
        var output = [];
        output.push("<!doctype html>");
        output.push("<html>");
        var head = [];
        var body = [];
        var script = [];
        if("acl" in webfile && "clientParams" in webfile.acl) {
            script.push("<script> window.WebFile = " + JSON.stringify( webfile.acl.clientParams ) + ";</script>");
        }
        script.push("<script>");
        var pages = [];
        var src = "";
        pages.push("function ___load_pages() {");
        for(var x = 0; x < webfile.objects.length;x++) {
            var obj = webfile.objects[x];
            if(obj.type == "page") {
                pages.push("UI.Window.Router.page('" + obj.name + "',function(args) {")
                if( fs.existsSync(obj.file + "/" + obj.name + "/load.js") ) {
                    // warning
                    src = fs.readFileSync(obj.file + "/" + obj.name + "/load.js","utf8");
                    pages.push( src );
                }
                src = "";
                pages.push("},function() {");
                if( fs.existsSync(obj.file + "/" + obj.name + "/unload.js")) {
                    src = fs.readFileSync(obj.file + "/" + obj.name + "/unload.js","utf8");
                    pages.push( src );
                }
                src = "";
                pages.push("});");

            }
        }
        pages.push("}");
        script.push(pages.join("\r\n"));
        for(var x = 0; x < webfile.objects.length;x++) {
            var obj = webfile.objects[x];
            if( obj.type == "import" ) {
                if(obj.ext == "css") {
                    // warning
                    if(obj.file.indexOf("/public/")==0) {
                        head.push("<link rel='stylesheet' type='text/css' href='" + obj.file + "'/>");
                    } else {
                        src = fs.readFileSync(obj.file,"utf8");
                        head.push(
                            "<style type='text/css'>\r\n" + 
                            "/** " + obj.file + " **/\r\n" +
                            src + 
                            "\r\n</style>"
                        );
                        src = "";
                    }
                } else if(obj.ext == "js") {
                    // warning
                    if(obj.file.indexOf("/public/")==0) {
                        head.push("<script type='text/javascript' src='" + obj.file + "'></script>");
                    } else if(obj.file.indexOf("https://maps.googleapis.com/")==0) {
                        head.push("<script type='text/javascript' src='" + obj.file + "'></script>");
                    } else {
                        src = fs.readFileSync(obj.file,"utf8");
                        head.push(
                            "<script type='text/javascript'>\r\n"+
                            "/** " + obj.file + " **/\r\n" +
                            src+
                            "\r\n</script>"
                        );
                        src = "";
                    }
                }
            } else if(obj.type == "style") {
                head.push("<style type='text/css'>\r\n" + obj.body + "\r\n</style>");
            } else if(obj.type == "script") {
                // warning
                head.push("<script type='text/javascript'>\r\n" + obj.body + "\r\n</script>");
            } else if(obj.type == "part") {
                // warning !!!!!!!
                
                src = fs.readFileSync(obj.file,"utf8");
                script.push(src);
                src = "";
            } else if(obj.type == "start") {
                script.push("UI.init(function(){");
                script.push("___load_pages();");
                src = fs.readFileSync(obj.file,"utf8");
                script.push(src);
                src = "";
                script.push("});");
            }
        }
        script.push("</script>");

        head.push(script.join("\r\n"));
        output.push("<head>");
        output.push(head.join("\r\n"));
        output.push("</head>");
        output.push("<body>");
        output.push(body.join(""));
        output.push("</body>");
        output.push("</html>");
        //console.log(output.join("\r\n"));
        callback && callback(output.join("\r\n"));
    } catch(e) {
        console.log(e);
        console.log(e.stack);
        error_callback && error_callback();
    }
}
function _load(res,path,acl) {
    //console.log("LOADING PACKET" + path);
    var data = fs.readFileSync(path + "/index.js","utf8");
    // get filename
    var wf = new webfile(acl);
    var vm = require("vm");
    Object.freeze(wf);
    var sandbox = { webfile: wf, console:console, __dirname : path };
    var script = new vm.Script(data);
    var context = new vm.createContext(sandbox);
    try {

        script.runInContext(context);
        //console.log(util.inspect(sandbox));
        // if call async request then we loose context to res.send
    } catch(e) {
        console.log(e);
        console.log(e.stack);
        res.status(500).send("Error");
        return;
    }
    mount(wf,acl,function(data) {
        //console.log("DATA SENT");
        res.send(data);
    },function() {
        res.status(500).send("Error");
        return;
    });
}
function _get(path) {
    // return all components
    var data = fs.readFileSync(path);
    // get filename
    var wf = new webfile();
    Object.freeze(wf);
    var sandbox = { webfile: wf };
    var script = new global.vm.Script(data);
    var context = new global.vm.createContext(sandbox);
    try {
        script.runInContext(context);
        //console.log(util.inspect(sandbox));
        // if call async request then we loose context to res.send
    } catch(e) {
        console.log(e);
    }
    return wf.objects;
}
function _set(path,value) {
    // mount index.js file of that path with value

}

module.exports = {
    load : _load,
    get : _get,
    set : _set
}