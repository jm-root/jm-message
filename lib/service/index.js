var jm = require('jm-common');
var ws = require("nodejs-websocket");

function createClient(conn){
    var o = {
        _matchPlatform:  function(platform){
            if(!platform) return true;
            return platform.indexOf(this.platform) >= 0;
        },

        _matchAlias:  function(alias){
            if(!alias) return true;
            return alias.indexOf(this.alias) >= 0;
        },

        _matchTag:  function(tag){
            if(!tag) return true;
            return this.hasTagAny(tag);
        },

        _matchTag_and:  function(tag_and){
            if(!tag_and) return true;
            return this.hasTagAll(tag);
        }
    };

    jm.enableTag(o);
    conn.client = o;
    return conn;
}

function createServer(o, port){
    var server = ws.createServer(function(conn){
        conn.sendJson = function(data){
            this.sendText(JSON.stringify(data));
        };

        conn.on("text", function (str) {
            var json = JSON.parse(str);
            o.emit('data', conn, json);
        });

        conn.on("close", function (code, reason) {
            o.emit('close', conn, code, reason);
        });

        conn.on("error", function (code, reason) {
            o.emit('error', conn, code, reason);
        });

        createClient(conn);
        o.emit('connect', conn);

    }).listen(port);

    o.server = server;
    return o;
}


module.exports =  function(opts){
    var o = {
        /*
        {
            tag : ["深圳", "北京"],
            tag_and : ["女", "未婚"],

            data : {
                type: 'notice',
                data: {
                    title: 'hello',
                    content: 'this is a test'
                }
            },

            options : {
                time_to_live : 60
            }
        }
        */
        send: function(msg){
            this.server.connections.forEach(function (conn, idx) {
                //if(!conn.client._matchPlatform(conn, msg.platform)) return;
                //if(!conn.client._matchAlias(conn, msg.alias)) return;
                if(!conn.client._matchTag(msg.tag)) return;
                if(!conn.client._matchTag_and(msg.tag_and)) return;
                o.emit('before_send', conn, msg);
                conn.sendJson(msg.data);
                o.emit('send', conn, msg);
            });
        }
    };

    jm.enableEvent(o);

    if(!opts.port) return;

    createServer(o, opts.port);

    return o;
};

