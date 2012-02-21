// Provide a _no_persistence_ mechanism to backbone
// 
// Models will be saved as a copy to memory and will not persist
// between sessions
//
// Some of the code was taken from backbone.localStorage, available at
// https://github.com/jeromegn/Backbone.localStorage/
//
// It's a simple replacement for `Backbone.Sync(...)`. You can call all
// standard Backbone methods available but all collections will be saved
// in memory only. This is useful for testing or when your app does not
// need persistence between sessions. It's also useful if you want to
// test your application using Rhino and you can't use localStorage.
// 
// All you need to do is to assign a new instance of bnp.NoPersistence to a
// field named noPersistence in each Collection in your
// application. Alternatively you can also simply import this js file after
// backbone.js and `NoPersistence` instances will be injected in your
// collections or models.
// 
// Simão Mata http://simaomata.com


(function () {
    window.bnp = { };

    var s4 = function () {
	return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };

    var guid = function () {
	return (s4()+s4()+"-"+s4()+"-"+s4()+"-"+s4()+"-"+s4()+s4()+s4());
    };

    // Each collection must assign a new bnp.Nopersistence instance
    // to a field named noPersistence
    bnp.NoPersistence = function(maxSize) {
	this.id = guid();
	this.data = {};
        this.maxSize = maxSize;
    };

    _.extend(bnp.NoPersistence.prototype, {
	create : function (model) {
            if(!_.isUndefined(this.maxSize) && _.size(this.data) > this.maxSize) {
                throw "Max collection size exceeded";
            }
	    if (!model.id) model.id = model.attributes.id = guid();
	    this.data[model.id] = _.extend({}, model);
	    return model;
	},

	find : function(model) {
	    return this.data[model.id];
	},

	findAll : function() {
	    return _.values(this.data);
	},

	update : function (model) {
	    this.data[model.id] = _.extend({}, model);
	    return model;
	},

	destroy : function (model) {
	    delete this.data[model.id];
	    return model;
	}
    });
    

    // Override `Backbone.sync` to use delegate to the model or collection's
    // *noPersistence* property, which should be an instance of `bnp.NoPersistence`.
    Backbone.sync = function(method, model, options, error) {

	// Backwards compatibility with Backbone <= 0.3.3
	if (typeof options == 'function') {
	    options = {
		success: options,
		error: error
	    };
	}

	var resp;
        var modelOrCollection  = model.collection || model;
        var noPersistence = modelOrCollection.noPersistence;
        
        if(_.isUndefined(noPersistence)) {
            modelOrCollection.noPersistence = new bnp.NoPersistence();
            noPersistence = modelOrCollection.noPersistence;
        }
        
	switch (method) {
	case "read": resp = model.id ? noPersistence.find(model) : noPersistence.findAll(); break;
	case "create": resp = noPersistence.create(model); break;
	case "update": resp = noPersistence.update(model); break;
	case "delete": resp = noPersistence.destroy(model); break;
	}

	if (resp) {
	    options.success(resp);
	} else {
	    options.error("Record not found");
	}
    };
})();
