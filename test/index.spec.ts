// test/index.spec.ts
import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('Survey worker', () => {
	it('[GET] responds with error status and message', async () => {
		const request = new IncomingRequest('http://example.com');
		// Create an empty context to pass to `worker.fetch()`.
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		// Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
		await waitOnExecutionContext(ctx);
		expect(await response.json()).toMatchInlineSnapshot(`
			{
			  "message": "GET: Method does not exist",
			  "status": 400,
			}
		`);
	});

	// This test means nothing as we are not actually receiving the request from example.com or any other.
	// So this is basically pointless.
	it('[POST] responds with error status and message, request is from other domain', async () => {
		const request = new IncomingRequest('http://example.com',{
			method : "POST",
			body : JSON.stringify({message : "Test 1"})
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(await response.json()).toMatchInlineSnapshot(`
				{
				  "message": "Failed",
				  "status": 403,
				}
			`);
	});


});
