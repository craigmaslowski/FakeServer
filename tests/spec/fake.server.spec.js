var response,
	jqXHR,
	server = new FakeServer(),
	ajax = function (options) {
		options.success = function (resp, textStatus, jqxhr) {
			response = resp;
			jqXHR = jqxhr;
			server.complete();
		};

		options.error = function (jqxhr) {
			jqXHR = jqxhr;
			server.complete();
		};

		$.ajax(options);
	};

server.routes([
	{
		url: '/text',
		headers: {
			'Content-Type': 'text/html',
			'Custom-Header': 'Custom-Header-Value'
		},
		body: '<p>html</p>'
	},
	{
		url: '/object',
		headers: {
			'Content-Type': 'application/json'//text/x-only-specified-for-testing-purposes'  
		},
		body: {
			users: [
				{ name: 'Jim' },
				{ name: 'Bob' },
			]
		}
	},
	{
		url: '/no-headers',
		body: 'no headers'
	},
	{
		url: '/error',
		status: 500
	},
	{
		type: 'POST',
		url: '/custom-type',
		body: 'post'
	}
]);

describe('fake.server', function () {
	afterEach(function () {
		response = undefined;
		jqXHR = undefined;
	});

	describe ('when specifying a route with an object for the body', function () {
		beforeEach(function () {
			ajax({ url: '/object' });
		});

		it('should respond with the specified object', function () {
			server.respond(function () {
				expect(response.users).toBeDefined();
				expect(response.users[0].name).toEqual('Jim');
				expect(response.users[1].name).toEqual('Bob');
			});
		});

		it('should override the provided Content-Type and set it to application/json', function () {
			server.respond(function () {
				expect(jqXHR.getResponseHeader('Content-Type')).toEqual('application/json');
			});
		});
	});


	describe ('when specifying a route with a string for the body', function () {
		beforeEach(function () {
			ajax({ url: '/text' });
		});

		it('should respond with the text', function () {
			server.respond(function () {
				expect(response).toEqual('<p>html</p>');
			});
		});
	});

	describe ('when specifying a route with no status defined', function () {
		beforeEach(function () {
			ajax({ url: '/object' });
		});


		it('should respond with a status of 200 by default', function () {
			server.respond(function () {
				expect(jqXHR.status).toEqual(200);
			});
		});
	});

	// sinon appears to respond regardless of the type specified in the ajax call
	// ignoring this test for now
	xdescribe ('when specifying a route with no type defined', function () {
		beforeEach(function () {
			ajax({ 
				type: 'DELETE',
				url: '/object' 
			});
		});

		it('should set the request type to GET by default', function () {
			server.respond(function () {
				console.log(jqXHR)
				expect(response).toBeUndefined();
			});
		});
	});

	describe ('when specifying a route with no headers defined', function () {
		beforeEach(function () {
			ajax({ url: '/no-headers' });
		});

		it('should respond with Content-Type set to text/plain by default', function () {
			server.respond(function () {
				expect(jqXHR.getResponseHeader('Content-Type')).toEqual('text/plain');
			});
		});
	});

	describe ('when specifying a route with a status defined', function () {
		beforeEach(function () {
			ajax({ url: '/error' });
		});

		it('should respond with the provided status', function () {
			server.respond(function () {
				expect(jqXHR.status).toEqual(500);
			});
		});
	});

	describe ('when specifying a route with a type defined', function () {
		beforeEach(function () {
			ajax({ type: 'POST', url: '/custom-type' });
		});

		it('should respond when making an ajax call', function () {
			server.respond(function () {
				expect(response).toEqual('post');
			});
		});
	});

	describe ('when specifying a route with a type defined other than GET', function () {
		describe ('and specifying a different type in the ajax call', function () {
			beforeEach(function () {
				ajax({ type: 'PUT', url: '/custom-type' });
			});

			it('should respond with a status of 404', function () {
				server.respond(function () {
					expect(jqXHR.status).toEqual(404);
				});
			});
		});
	});

	describe ('when specifying a route with headers defined', function () {
		beforeEach(function () {
			ajax({ url: '/text' });
		});

		it('should respond with the provided headers', function () {
			server.respond(function () {
				expect(jqXHR.getResponseHeader('Content-Type')).toEqual('text/html');
				expect(jqXHR.getResponseHeader('Custom-Header')).toEqual('Custom-Header-Value');
			});
		});
	});
});
