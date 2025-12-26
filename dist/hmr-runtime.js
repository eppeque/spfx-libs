(function(factory) {
  
  typeof define === 'function' && define.amd ? define([], factory) :
  factory();
})(function() {

//#region esm/hmr-runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __exportAll = (all, symbols) => {
		let target = {};
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
		if (symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
		return target;
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
			key = keys[i];
			if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: ((k) => from[k]).bind(null, key),
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));
	var __toCommonJS = (mod) => __hasOwnProp.call(mod, "module.exports") ? mod["module.exports"] : __copyProps(__defProp({}, "__esModule", { value: true }), mod);
	var __toDynamicImportESM = (isNodeMode) => (mod) => __toESM(mod.default, isNodeMode);
	var Module = class {
		exportsHolder = { exports: null };
		id;
		constructor(id) {
			this.id = id;
		}
		get exports() {
			return this.exportsHolder.exports;
		}
	};
	var DevRuntime = class {
		constructor(messenger) {
			this.messenger = messenger;
		}
		modules = {};
		createModuleHotContext(_moduleId) {
			throw new Error("createModuleHotContext should be implemented");
		}
		applyUpdates(_boundaries) {
			throw new Error("applyUpdates should be implemented");
		}
		registerModule(id, exportsHolder) {
			const module$1 = new Module(id);
			module$1.exportsHolder = exportsHolder;
			this.modules[id] = module$1;
			this.sendModuleRegisteredMessage(id);
		}
		loadExports(id) {
			const module$1 = this.modules[id];
			if (module$1) return module$1.exportsHolder.exports;
			else {
				console.warn(`Module ${id} not found`);
				return {};
			}
		}
		createEsmInitializer = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
		createCjsInitializer = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
		__toESM = __toESM;
		__toCommonJS = __toCommonJS;
		__exportAll = __exportAll;
		__toDynamicImportESM = __toDynamicImportESM;
		__reExport = __reExport;
		sendModuleRegisteredMessage = (() => {
			const cache = [];
			let timeout = null;
			let timeoutSetLength = 0;
			const self = this;
			return function sendModuleRegisteredMessage(module$1) {
				if (!self.messenger) return;
				cache.push(module$1);
				if (!timeout) {
					timeout = setTimeout(function flushCache() {
						if (cache.length > timeoutSetLength) {
							timeout = setTimeout(flushCache);
							timeoutSetLength = cache.length;
							return;
						}
						self.messenger.send({
							type: "hmr:module-registered",
							modules: cache
						});
						cache.length = 0;
						timeout = null;
						timeoutSetLength = 0;
					});
					timeoutSetLength = cache.length;
				}
			};
		})();
	};
	var BaseDevRuntime = DevRuntime;
	var ModuleHotContext = class {
		acceptCallbacks = [];
		constructor(moduleId, devRuntime) {
			this.moduleId = moduleId;
			this.devRuntime = devRuntime;
		}
		accept(...args) {
			if (args.length === 1) {
				const [cb] = args;
				const acceptingPath = this.moduleId;
				this.acceptCallbacks.push({
					deps: [acceptingPath],
					fn: cb
				});
			} else if (args.length === 0) {} else throw new Error("Invalid arguments for `import.meta.hot.accept`");
		}
		invalidate() {
			socket.send(JSON.stringify({
				type: "hmr:invalidate",
				moduleId: this.moduleId
			}));
		}
	};
	var DefaultDevRuntime = class extends BaseDevRuntime {
		constructor(socket$1) {
			const queuedMessages = [];
			const messenger = { send(message) {
				if (socket$1.readyState === WebSocket.OPEN) socket$1.send(JSON.stringify(message));
				else if (socket$1.readyState === WebSocket.CLOSED) {} else queuedMessages.push(JSON.stringify(message));
			} };
			socket$1.onopen = () => {
				for (const message of queuedMessages) socket$1.send(message);
				socket$1.onopen = null;
			};
			super(messenger);
		}
		moduleHotContexts = /* @__PURE__ */ new Map();
		moduleHotContextsToBeUpdated = /* @__PURE__ */ new Map();
		createModuleHotContext(moduleId) {
			const hotContext = new ModuleHotContext(moduleId, this);
			if (this.moduleHotContexts.has(moduleId)) this.moduleHotContextsToBeUpdated.set(moduleId, hotContext);
			else this.moduleHotContexts.set(moduleId, hotContext);
			return hotContext;
		}
		applyUpdates(boundaries) {
			for (let [moduleId, acceptedVia] of boundaries) {
				const hotContext = this.moduleHotContexts.get(moduleId);
				if (hotContext) hotContext.acceptCallbacks.filter((cb) => {
					cb.fn(this.modules[moduleId].exports);
				});
			}
			this.moduleHotContextsToBeUpdated.forEach((hotContext, moduleId) => {
				this.moduleHotContexts.set(moduleId, hotContext);
			});
			this.moduleHotContextsToBeUpdated.clear();
		}
	};
	function loadScript(url) {
		var script = document.createElement("script");
		script.src = url;
		script.type = "module";
		script.onerror = function() {
			console.error("Failed to load script: " + url);
		};
		document.body.appendChild(script);
	}
	console.debug("HMR runtime loaded", "localhost:3000");
	const addr = new URL("wss://localhost:4321");
	const socket = new WebSocket(addr);
	globalThis.__rolldown_runtime__ ??= new DefaultDevRuntime(socket);
	socket.onmessage = function(event) {
		const data = JSON.parse(event.data);
		console.debug("Received message:", data);
		if (data.type === "hmr:update") if (typeof process === "object") {
			import(data.path);
			console.debug(`[hmr]: Importing HMR patch: ${data.path}`);
		} else {
			console.debug(`[hmr]: Loading HMR patch: ${data.path}`);
			loadScript(data.url);
		}
		else if (data.type === "hmr:reload") {
			console.log("[hmr]: Full reload required, reloading page");
			if (typeof location !== "undefined") location.reload();
			else console.log("[hmr]: location is undefined, cannot reload page");
		}
	};

//#endregion
});