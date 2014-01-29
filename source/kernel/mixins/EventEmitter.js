(function (enyo) {
	
	var forEach = enyo.forEach
		, toArray = enyo.toArray
		, find = enyo.find
		, filter = enyo.filter
		, uid = enyo.uid
		, eventTable = {};
	
	/**
		@private
	*/
	function addListener(obj, e, fn, ctx) {

		obj.listeners().push({
			event: e,
			method: fn,
			ctx: ctx || obj
		});
		
		return obj;
	}
	
	/**
		@private
	*/
	function emit(obj, args) {
		var len = args.length
			, e = args[0]
			, listeners = obj.listeners(e);
			
		if (listeners.length) {
			if (len > 1) {
				args = toArray(args);
				args.unshift(obj);
			} else {
				args = [obj, e];
			}
			
			forEach(listeners, function (ln) {
				ln.method.apply(ln.ctx, args);
			});
			
			return true;
		}
		
		return false;
	}
	
	/**
		@public
		@mixin
	*/
	enyo.EventEmitter = {
		name: "EventEmitter",
		
		/**
			@private
		*/
		_silenced: false,
		
		/**
			@private
		*/
		_silenceCount: 0,
		
		/**
			@public
			@method
		*/
		silence: function () {
			this._silenced = true;
			this._silenceCount++;
		},
		
		/**
			@public
			@method
		*/
		unsilence: function () {
			this._silenceCount && this._silenceCount--;
			this._silenceCount === 0 && (this._silenced = false);
		},
		
		/**
			@public
			@method
		*/
		isSilenced: function () {
			return this._silenced;
		},
		
		/**
			@public
			@method
		*/
		addListener: function (e, fn, ctx) {			
			return addListener(this, e, fn, ctx);
		},
		
		/**
			@public
			@method
			@alias addListener
		*/
		on: function (e, fn, ctx) {
			return addListener(this, e, fn, ctx);
		},
		
		/**
			@public
			@method
		*/
		removeListener: function (e, fn, ctx) {
			var listeners = this.listeners()
				, idx;
			
			if (listeners.length) {
				idx = find(listeners, function (ln) {
					return ln.event == e && ln.method === fn && ctx? ln.ctx === ctx: true;
				});
				idx >= 0 && listeners.splice(idx, 1);
			}
			return this;
		},
		
		/**
			@public
			@method
		*/
		removeAllListeners: function (e) {
			var euid = this.euid
				, loc = euid && eventTable[euid];
			
			if (loc) {
				if (e) {
					eventTable[euid] = filter(loc, function (ln) {
						return ln.event != e;
					});
				} else {
					eventTable[euid] = null;
				}
			}
			
			return this;
		},
		
		/**
			@public
			@method
		*/
		listeners: function (e) {
			var euid = this.euid || (this.euid = uid("e"))
				, loc = eventTable[euid] || (eventTable[euid] = []);
			
			return !e? loc: filter(loc, function (ln) {
				return ln.event == e;
			});
		},
		
		/**
			@public
			@method
			@alias emit
		*/
		triggerEvent: function () {
			return emit(this, arguments);
		},
		
		/**
			@public
			@method
		*/
		emit: function () {
			return emit(this, arguments);
		}
	};
	
	/**
		@public
		@mixin
	*/
	enyo.RegisteredEventSupport = enyo.EventEmitter;
	
})(enyo);
