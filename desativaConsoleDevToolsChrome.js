/*
@victorvhpg
https://github.com/victorvhpg/desativaConsoleDevToolsChrome
19/03/2014

*/
(function() {

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
			clearInterval(this.timer);
			var cont = 0;
			this.timer = setInterval(function() {
				if ((++cont % 2) == 0) {
					setTimeout(Function.prototype.apply.bind(console.log, console, msg), 1);
				} else {
					that.injectedScriptHost.clearConsoleMessages();
				}
			}, 300);
		},

		desativa: function() {
			var that = this;
			var msg = ["%c" + this.config.msg, this.config.css];
			this.injectedScript._inspect = function() {
				alert(that.config.msg);
			};
			Object.defineProperty(this.injectedScriptHost, 'evaluate', {
				get: function() {
					return function() {
						that.pisca(msg);
						return "";
					}
				}
			});
		},

		init: function(config) {
			var that = this;
			this.config.css = config.css || _config.css;
			this.config.msg = config.msg || _config.msg;
			Object.defineProperty(console, '_commandLineAPI', {
				get: function() {
					if (!_init) {
						_init = true;
						that.injectedScriptHost = arguments.callee.caller.arguments[1];
						that.injectedScript = that.injectedScriptHost.functionDetails(arguments.callee.caller.arguments.callee).rawScopes[0].object.injectedScript;
						that.desativa();
					}
				}
			});
		}
	};
})();