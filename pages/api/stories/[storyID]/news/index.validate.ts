// This file is automatically generated by `scripts/generate-validators`. Do not edit directly.

import { createValidator } from 'lib/server/api';

export default createValidator({
	$schema: 'http://json-schema.org/draft-07/schema#',
	$ref: '#/definitions/RequestMethod',
	definitions: {
		RequestMethod: {
			type: 'string',
			enum: [
				'POST',
				'GET'
			]
		}
	}
}, {
	$schema: 'http://json-schema.org/draft-07/schema#',
	$ref: '#/definitions/Request',
	definitions: {
		Request: {
			anyOf: [
				{
					type: 'object',
					additionalProperties: false,
					properties: {
						body: {
							type: 'object',
							properties: {
								content: {
									type: 'string',
									minLength: 1,
									maxLength: 20000
								}
							},
							required: [
								'content'
							],
							additionalProperties: false
						},
						query: {
							type: 'object',
							properties: {
								storyID: {
									type: 'string'
								}
							},
							required: [
								'storyID'
							],
							additionalProperties: false
						},
						method: {
							type: 'string',
							const: 'POST'
						}
					},
					required: [
						'body',
						'method',
						'query'
					]
				},
				{
					type: 'object',
					additionalProperties: false,
					properties: {
						body: {},
						query: {
							type: 'object',
							properties: {
								storyID: {
									type: 'string'
								}
							},
							required: [
								'storyID'
							],
							additionalProperties: false
						},
						method: {
							type: 'string',
							const: 'GET'
						}
					},
					required: [
						'method',
						'query'
					]
				}
			]
		}
	}
});