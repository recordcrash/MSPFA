import './styles.module.scss';
import Page from 'components/Page';
import type { PublicUser } from 'lib/client/users';
import { useUser } from 'lib/client/UserContext';
import { getUserByUnsafeID, getPublicUser } from 'lib/server/users';
import { withErrorPage } from 'lib/client/errors';
import { withStatusCode } from 'lib/server/errors';
import Section from 'components/Section';
import Link from 'components/Link';
import Row from 'components/Row';
import List from 'components/List';
import type { ListedStory } from 'components/StoryListing';
import StoryListing from 'components/StoryListing';
import { Perm } from 'lib/client/perms';
import type { integer } from 'lib/types';
import Button from 'components/Button';
import getRandomImageFilename from 'lib/server/getRandomImageFilename';
import findStoriesAsUser from 'lib/server/findStoriesAsUser';
import type { StoryID } from 'lib/server/stories';

type ServerSideProps = {
	publicUser: PublicUser,
	favsPublic: boolean,
	stories: ListedStory[],
	imageFilename?: string
} | {
	statusCode: integer
};

const Component = withErrorPage<ServerSideProps>(({ publicUser, favsPublic, stories, imageFilename }) => {
	const user = useUser();

	return (
		<Page withFlashyTitle heading="Favorite Adventures">
			<Section
				id="favs-section"
				heading={`${publicUser.name}'s Favorites`}
			>
				<Row>
					<Button
						className="small"
						href={`/user/${publicUser.id}`}
					>
						Back to Profile
					</Button>
				</Row>
				{!favsPublic && (
					<Row>
						<span id="favs-public-tip">
							Only you can see your favorites. If you want others to be able to see, enable public favorites in <Link href={`/user/${publicUser.id}/edit`}>your profile settings</Link>.
						</span>
					</Row>
				)}
				{stories.length ? (
					<Row>
						<List listing={StoryListing}>
							{stories}
						</List>
					</Row>
				) : (
					<>
						<Row>
							<img
								src={`/images/no-favs/${imageFilename!}`}
								alt="Artwork for No Favorites"
								title={`Artist: ${imageFilename!.slice(0, imageFilename!.indexOf('.'))}`}
							/>
						</Row>
						<Row>
							{(publicUser.id === user?.id
								? 'You have no favorite adventures.'
								: 'This user has no favorite adventures.'
							)}
						</Row>
					</>
				)}
			</Section>
		</Page>
	);
});

export default Component;

export const getServerSideProps = withStatusCode<ServerSideProps>(async ({ req, params }) => {
	const userFromParams = await getUserByUnsafeID(params.userID);

	if (!userFromParams) {
		return { props: { statusCode: 404 } };
	}

	const canSudoReadUserFromParams = !!(
		req.user && (
			req.user._id.equals(userFromParams._id)
			|| req.user.perms & Perm.sudoRead
		)
	);

	if (!(userFromParams.settings.favsPublic || canSudoReadUserFromParams)) {
		return { props: { statusCode: 403 } };
	}

	let stories: ListedStory[];

	const storiesFoundAsUser = findStoriesAsUser(req.user, canSudoReadUserFromParams, {
		_id: { $in: userFromParams.favs }
	});

	if (canSudoReadUserFromParams) {
		// If the user is viewing their own favorites, include unavailable stories.

		stories = [];
		const storyRecord: Record<StoryID, ListedStory> = {};

		for (const storyID of userFromParams.favs) {
			const story: ListedStory = {
				id: storyID
			};

			stories.push(story);
			storyRecord[storyID] = story;
		}

		await storiesFoundAsUser.forEach(story => {
			Object.assign(storyRecord[story.id], story);
		});
	} else {
		// If the user is viewing someone else's favorites, only include available stories.

		stories = await storiesFoundAsUser.toArray();
	}

	return {
		props: {
			publicUser: getPublicUser(userFromParams),
			favsPublic: userFromParams.settings.favsPublic,
			stories,
			...stories.length === 0 && {
				imageFilename: await getRandomImageFilename('public/images/no-favs')
			}
		}
	};
});