// This file is automatically generated by `scripts/generate-validators`. Do not edit directly.

import createAPIValidator from 'lib/server/api/createAPIValidator';

export default createAPIValidator({
	$schema: 'http://json-schema.org/draft-07/schema#',
	$ref: '#/definitions/RequestMethod',
	definitions: {
		RequestMethod: {
			type: 'string',
			const: 'PATCH'
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
								currentPassword: {
									$ref: '#/definitions/PasswordString'
								},
								newPassword: {
									$ref: '#/definitions/PasswordString'
								}
							},
							required: [
								'currentPassword',
								'newPassword'
							],
							additionalProperties: false
						},
						query: {
							type: 'object',
							properties: {
								userID: {
									type: 'string'
								}
							},
							required: [
								'userID'
							],
							additionalProperties: false
						},
						method: {
							type: 'string',
							const: 'PATCH'
						}
					},
					required: [
						'body',
						'method',
						'query'
					]
				},
				{
					not: {}
				}
			]
		},
		PasswordString: {
			type: 'string',
			minLength: 8
		}
	}
});