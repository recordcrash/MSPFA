import type { ServerComment } from 'lib/server/comments';
import type { StoryPageID } from 'lib/server/stories';
import type { DateNumber, integer } from 'lib/types';

/** All keys whose values have the same serializable type in both `ServerComment` and `ClientComment`. */
type ClientCommentKey = 'content';

/** A serializable version of `ServerComment` with only the properties that can safely be exposed to any client. */
export type ClientComment = Pick<ServerComment, ClientCommentKey> & {
	id: string,
	pageID: StoryPageID,
	posted: DateNumber,
	edited?: DateNumber,
	author: string,
	likeCount: integer,
	dislikeCount: integer,
	/** `1` if the user liked the comment, `-1` if they disliked the comment, or `0` if they haven't rated the comment. Undefined if there is no user. */
	userRating?: -1 | 0 | 1
};