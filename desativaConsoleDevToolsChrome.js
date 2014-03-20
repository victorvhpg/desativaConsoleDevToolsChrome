/*
@victorvhpg
https://github.com/victorvhpg/desativaConsoleDevToolsChrome
19/03/2014


//para desativar podemos apenas fazer isso: //versao <= 33 do chrome 
    Object.defineProperty(console, "_commandLineAPI", {
        get: function () {
            throw "Desativado";
        }
    });

 

*/
(function(window) {

    var _init = false;
    var _config = {
        css: "color:#000;background-color:yellow;font-weight:bolder;font-size:90px",
        msg: "-- DESATIVADO :( "
    };

    var desativaConsoleDevToolsChrome = {
        config: _config,
        timer: 0,
        pisca: function(msg) {
            var that = this;
           window.clearInterval(this.timer);
            var cont = 0;
            this.timer = window.setInterval(function() {
                if ((++cont % 2) == 0) {
                    window.setTimeout(Function.prototype.apply.bind(console.log, console, msg), 1);
                } else {
                    that.injectedScriptHost.clearConsoleMessages();
                }
            }, 300);
        },

        desativa: function() {
            var that = this;
            var msg = ["%c" + this.config.msg,this.config.css];
            Object.defineProperty(this.injectedScript, "_inspect", {
                get: function() {
                    return window.alert.bind(window, that.config.msg);
                }
            });
            Object.defineProperty(this.injectedScriptHost, "evaluate", {
                get: function() {
                    return function() {
                        that.pisca(msg);
                        return "";
                    };
                }
            });
        },

        initDesativa: function(c) {
            if (!_init) {
                Function.prototype.call = c;
                _init = true;
                this.injectedScriptHost = arguments.callee.caller.arguments[0];
                //console.log(arguments.callee.caller.arguments.callee.caller.arguments.callee)
                this.injectedScript = this.injectedScriptHost.functionDetails(arguments.callee.caller.arguments.callee.caller.arguments.callee).rawScopes[0].object.injectedScript;
                this.desativa();
            }
        },

        init: function(config) {
            if (!window.chrome) {
                return;
            }
            var that = this;
            this.config.css = config.css || _config.css;
            this.config.msg = config.msg || _config.msg;
            //para versao > 33 do chrome 
            // por enquanto fazendo gambiarra sobreescrevendo metodo nativo .call :(
            //testado ate  versao 35.0.1899.0 canary
            var call = Function.prototype.call;
            Function.prototype.call = function(thisObj) {
                if (arguments.length > 0 && this.name === "evaluate") {
                    that.initDesativa(call);
                }
                return call.apply(this, call.apply([].slice, [arguments]));
            };

            //para versao <= 33  do chrome 
            Object.defineProperty(console, "_commandLineAPI", {
                get: function() {
                    that.initDesativa(call);
                }
            });
        }
    };

    window.desativaConsoleDevToolsChrome = desativaConsoleDevToolsChrome;
})(this);