import type { APIHandler } from 'modules/server/api';
import users from 'modules/server/users';
import type { ExternalAuthMethod, InternalAuthMethod, UserDocument } from 'modules/server/users';
import { checkExternalAuthMethod, createSession } from 'modules/server/auth';
import validate from './index.validate';
import argon2 from 'argon2';

export type SessionBody = {
	authMethod: ExternalAuthMethod
} | {
	email: UserDocument['email'],
	authMethod: Pick<InternalAuthMethod, 'type' | 'value'>
};

const Handler: APIHandler<(
	{
		method: 'DELETE',
		body: undefined
	} | {
		method: 'POST',
		body: SessionBody
	}
)> = async (req, res) => {
	await validate(req, res);
	
	if (req.method === 'POST') {
		let user: UserDocument | undefined | null;
		
		if (req.body.authMethod.type === 'password') {
			user = await users.findOne({
				email: (req.body as { email: string }).email.toLowerCase()
			});
			
			if (user) {
				let incorrect = true;
				for (const authMethod of user.authMethods) {
					if (
						authMethod.type === 'password'
						&& await argon2.verify(authMethod.value, req.body.authMethod.value)
					) {
						incorrect = false;
						break;
					}
				}
				if (incorrect) {
					res.status(401).send({
						message: 'The specified password is incorrect.'
					});
					return;
				}
			} else {
				res.status(404).send({
					message: 'No user was found with the specified email.'
				});
				return;
			}
		} else {
			user = await users.findOne({
				authMethods: {
					type: req.body.authMethod.type,
					value: (await checkExternalAuthMethod(req, res)).value
				}
			});
			
			if (!user) {
				res.status(404).send({
					message: 'No user was found with the specified sign-in method.'
				});
				return;
			}
		}

		// Authentication succeeded.
		
		await createSession(req, res, user);
		
		res.status(200).send(user); // TODO: Sanitize user data
	}
};

export default Handler;