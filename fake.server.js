var FakeServer = function() {
	var self = this;
	this.sinonServer = sinon.fakeServer.create();
	this.asyncComplete = false;
	this.complete = function () {
		return self._complete.apply(self, arguments);
	};
};

FakeServer.prototype.addRoute = function (options) {
	options.method = options.method || 'GET'
	options.status = options.status || 200;
	options.headers = options.headers || { 'Content-Type': 'text/plain' };
	options.body = options.body || '';
	
	if (typeof options.body === 'object') { 
		options.body = JSON.stringify(options.body);
		options.headers['Content-Type'] = 'application/json';
	};

	this.sinonServer.respondWith(
		options.type,
		options.url,
		function (xhr, id) {
			xhr.respond(
				options.status,
				options.headers,
				options.body
			);
		}
	);
};

FakeServer.prototype.routes = function (responses) {
	var self = this;
	responses.forEach(function (response) {
		self.addRoute.call(self, response);
	});
};

FakeServer.prototype.respond = function (callback) {
	var self = this;

	runs(function () {
		self.sinonServer.respond();
	});

	waitsFor(function () {
		return self.asyncComplete;
	});

	runs(function () {
		self.asyncComplete = false;
		callback();
	});
};

FakeServer.prototype._complete = function () {
	this.asyncComplete = true;
};
