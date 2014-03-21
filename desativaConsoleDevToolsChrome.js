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
    var _aguardandoPermissao = false;
    var _config = {
        webcam: false,
        videoSrc: "",
        css: "color:#000;background-color:yellow;font-weight:bolder;font-size:90px",
        msg: "-- DESATIVADO :( "
    };

    var desativaConsoleDevToolsChrome = {
        config: _config,
        timer: 0,
        srcWebCam: "",
        canvas: null,
        ctx: null,
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

        exibeVideo: function(src) {
            var largura, altura, video, that;
            that = this;
            largura = 600;
            altura = 300;
            if (!this.ctx) {
                this.canvas = document.createElement("canvas");
                this.ctx = this.canvas.getContext("2d");
                this.canvas.width = largura;
                this.canvas.height = altura;
            }
            window.clearInterval(this.timer);
            video = document.createElement("video");
            video.width = largura;
            video.height = altura;
            video.src = src;
            video.onloadedmetadata = function(e) {
                video.play();
                var limpa = 0;
                that.timer = window.setInterval(function() {
                    if (++limpa % 30 == 0) {
                        that.injectedScriptHost.clearConsoleMessages();
                    }
                    that.ctx.drawImage(video, 0, 0, largura, altura);
                    var src = that.canvas.toDataURL("image/png");
                    var log = ["%c", "font-size:1px;padding:" + (altura / 2) + "px " + (largura / 2) + "px;background: url(" + src + ");line-height:" + altura + "px; color: transparent;"];
                    window.setTimeout(Function.prototype.apply.bind(console.log, console, log), 1);
                },400);
            };
        },

        getWebCam: function(fnOk, fnErro) {
            var that = this;
            if (_aguardandoPermissao) {
                return;
            }
            if (this.srcWebCam) {
                fnOk.apply(this, [this.srcWebCam]);
                return;
            }
            _aguardandoPermissao = true;
            window.navigator.webkitGetUserMedia({
                video: true
            }, function(localMediaStream) {
                _aguardandoPermissao = false;
                that.srcWebCam = window.URL.createObjectURL(localMediaStream);
                fnOk.apply(that, [that.srcWebCam]);
            }, function(err) {
                _aguardandoPermissao = false;
                that.srcWebCam = "";
                alert("Erro ao obter webcam");
                fnErro.apply(that);
            });
        },

        desativa: function() {
            var that = this;
            var msg = ["%c" + this.config.msg, this.config.css];
            Object.defineProperty(this.injectedScript, "_inspect", {
                get: function() {
                    return window.alert.bind(window, that.config.msg);
                }
            });
            Object.defineProperty(this.injectedScriptHost, "evaluate", {
                get: function() {
                    return function() {

                        if (that.config.webcam) {
                            that.getWebCam(function(src) {
                                that.exibeVideo(src);
                            }, function() {
                                that.pisca(msg);
                            });
                        } else if (that.config.videoSrc) {
                            that.exibeVideo(that.config.videoSrc);
                        } else {
                            that.pisca(msg);
                        }
                        return (that.config.webcam && _aguardandoPermissao) ? "De permissao na webcam!!" : "";
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
            this.config.webcam = config.webcam || _config.webcam;
            this.config.videoSrc = config.videoSrc || _config.videoSrc;           
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