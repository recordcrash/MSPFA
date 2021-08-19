import validate from './index.validate';
import type { APIHandler } from 'lib/server/api';
import type { ServerNews } from 'lib/server/news';
import { getClientNews } from 'lib/server/news';
import stories, { getStoryByUnsafeID } from 'lib/server/stories';
import { authenticate } from 'lib/server/auth';
import type { ClientNews } from 'lib/client/news';
import { Perm } from 'lib/client/perms';
import { StoryPrivacy } from 'lib/client/stories';

const Handler: APIHandler<{
	query: {
		storyID: string,
		newsID: string
	}
} & (
	{
		method: 'GET'
	} | {
		method: 'DELETE'
	} | {
		method: 'PUT',
		body: any // TODO
	}
), {
	method: 'GET',
	body: ClientNews
} | {
	method: 'DELETE'
} | {
	method: 'PUT',
	body: ClientNews
}> = async (req, res) => {
	await validate(req, res);

	const story = await getStoryByUnsafeID(req.query.storyID, res);

	/** Gets and returns the requested news post. If the news post doesn't exist, responds with an error and never resolves. */
	const getNewsPost = () => new Promise<ServerNews>(resolve => {
		const newsPost = story.news.find(({ id }) => id.toString() === req.query.newsID);

		if (!newsPost) {
			res.status(404).send({
				message: 'No news post was found with the specified ID.'
			});
			return;
		}

		resolve(newsPost);
	});

	if (req.method === 'GET') {
		if (story.privacy === StoryPrivacy.Private) {
			const { user } = await authenticate(req, res);

			if (!(
				user && (
					story.owner.equals(user._id)
					|| story.editors.some(userID => userID.equals(user._id))
					|| user.perms & Perm.sudoRead
				)
			)) {
				res.status(403).send({
					message: 'You do not have permission to access the news of the specified adventure.'
				});
				return;
			}
		}

		res.send(await getNewsPost());
		return;
	}

	const { user } = await authenticate(req, res);

	if (req.method === 'DELETE') {
		if (!(
			user && (
				story.owner.equals(user._id)
				|| story.editors.some(userID => userID.equals(user._id))
				|| user.perms & Perm.sudoDelete
			)
		)) {
			res.status(403).send({
				message: 'You do not have permission to delete news on the specified adventure.'
			});
			return;
		}

		await stories.updateOne({
			_id: story._id
		}, {
			$pull: {
				news: {
					id: (await getNewsPost()).id
				}
			}
		});

		res.end();
		return;
	}

	// If this point is reached, `req.method === 'PUT'`.


};

export default Handler;