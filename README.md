Fake-Server
===========

Fake Server is a bridge between Jasmine and Sinon which provides a simplified interface for creating and mocking ajax requests when writing tests with Jasmine.

``` JavaScript
// Create the fake server
var server = new FakeServer();

// Setup routes
server.routes([
	{
		url: '/myRoute',
		headers: {
			'Content-Type': 'text/html',
			'Custom-Header': 'Custom-Header-Value'
		},
		body: '<p>some html</p>'
	}
]);

describe('myRoute', function () {
	var response, jqXHR;

	beforeEach(function () {
		$.ajax({
			url: '/myRoute',
			success: function (resp, textStatus, jqxhr) {
				response = resp;
				jqXHR = jqxhr;

				// let FakeServer know the ajax call is complete
				server.complete();
			},
			error: {
				jqXHR = jqxhr;

				// let FakeServer know the ajax call is complete
				server.complete();
			}
		});
	});
	
	afterEach(function () {
		response = undefined;
		jqXHR = undefined;
	});

	it('should return some html', function () {
		// Test the response once the ajax call is completed
		server.respond(function () {
			expect(response).toBe('<p>some html</p>');
		});
	});
});
```