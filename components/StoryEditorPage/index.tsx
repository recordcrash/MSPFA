import './styles.module.scss';
import BoxSection from 'components/Box/BoxSection';
import type { ClientStoryPage } from 'modules/client/stories';
import type { FormikProps } from 'formik';
import { Field } from 'formik';
import Label from 'components/Label';
import BBField from 'components/BBCode/BBField';
import type { MouseEvent, MutableRefObject, RefObject } from 'react';
import React, { useCallback, useRef } from 'react';
import AddButton from 'components/Button/AddButton';
import type { Values } from 'pages/s/[storyID]/edit/p';
import RemoveButton from 'components/Button/RemoveButton';
import { isEqual } from 'lodash';
import Timestamp from 'components/Timestamp';
import InlineRowSection from 'components/Box/InlineRowSection';
import FieldBoxRow from 'components/Box/FieldBoxRow';
import Button from 'components/Button';
import type { StoryID } from 'modules/server/stories';

export type StoryEditorPageProps = {
	/** The `ClientStoryPage` being edited. */
	children: ClientStoryPage,
	storyID: StoryID,
	formikPropsRef: MutableRefObject<FormikProps<Values>>,
	/** A ref to the first page field's title `input` element. */
	firstTitleInputRef?: RefObject<HTMLInputElement>
};

/** A `BoxSection` for a page in the story editor. */
const StoryEditorPage = React.memo<StoryEditorPageProps>(({
	children: page,
	storyID,
	formikPropsRef,
	firstTitleInputRef
}) => {
	const onClickRemoveNextPage = useCallback((event: MouseEvent<HTMLButtonElement & HTMLAnchorElement> & { target: HTMLButtonElement }) => {
		// The `parentNode` of this `RemoveButton` will be the `div.story-editor-next-page` element.
		const nextPageElement = event.target.parentNode as HTMLDivElement;

		/** The index of the value in `page.nextPages` being removed, equal to the index of the `nextPageElement` in its parent `div.story-editor-next-page-container` element. */
		const nextPageIndex = Array.prototype.indexOf.call(nextPageElement.parentNode!.childNodes, nextPageElement);

		formikPropsRef.current.setFieldValue(`pages.${page.id}.nextPages`, [
			...page.nextPages.slice(0, nextPageIndex),
			...page.nextPages.slice(nextPageIndex + 1, page.nextPages.length)
		]);
	}, [formikPropsRef, page.id, page.nextPages]);

	const lastNextPageInputRef = useRef<HTMLInputElement>(null);

	// Check if this page is deeply equal to a saved page with the same ID to determine whether this page is saved.
	const saved = isEqual(page, formikPropsRef.current.initialValues.pages[page.id]);

	const pageStatus = (
		page.published === undefined
			? 'draft' as const
			: page.published < Date.now()
				? 'scheduled' as const
				: 'published' as const
	);

	const sectionRef = useRef<HTMLDivElement>(null!);

	/** Reports the validity of all form elements in this page section. If one of them is found invalid, stops reporting and returns `false`. If all elements are valid, returns `true`. */
	const reportPageValidity = useCallback(() => {
		for (const element of sectionRef.current.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select')) {
			if (!element.reportValidity()) {
				return false;
			}
		}

		return true;
	}, []);

	const savePage = useCallback(() => {
		if (!reportPageValidity()) {
			return;
		}

		console.log('save!');
	}, [reportPageValidity]);

	const publishPage = useCallback(() => {
		if (!reportPageValidity()) {
			return;
		}

		console.log('publish!');
	}, [reportPageValidity]);

	return (
		<BoxSection
			className={`story-editor-page-section${saved ? ' saved' : ''} ${pageStatus}`}
			heading={
				pageStatus === 'draft'
					// These are two separate templates in order to avoid React inserting unnecessary comments between text nodes in the HTML sent from the server.
					? `Page ${page.id} (Draft)`
					: (
						<>
							{
								`Page ${page.id} (${
									pageStatus === 'published'
										? 'Published'
										: 'Scheduled'
								} `
							}
							<Timestamp short withTime>
								{page.published!}
							</Timestamp>
							)
						</>
					)
			}
			ref={sectionRef}
		>
			<div className="page-field-container-title">
				<Label
					block
					htmlFor={`field-pages-${page.id}-title`}
					help="The text displayed at the top of this page. This text also appears in any link to this page from the commands at the bottom of another page."
				>
					Page Title/Command
				</Label>
				<Field
					id={`field-pages-${page.id}-title`}
					name={`pages.${page.id}.title`}
					required
					maxLength={500}
					autoComplete="off"
					innerRef={firstTitleInputRef}
				/>
			</div>
			<div className="page-field-container-content">
				<Label block htmlFor={`field-pages-${page.id}-content`}>
					Content
				</Label>
				<BBField
					name={`pages.${page.id}.content`}
					rows={6}
					html
				/>
			</div>
			<div className="page-field-columns">
				<div className="page-field-container-next-pages">
					<Label
						block
						help={'The page numbers of the commands to link at the bottom of this page (in order). By default, each newly added page will already link to the page after it.\n\nThis is particularly useful for skipping hidden pages or adding multiple page links in branching stories.'}
					>
						Next Pages
					</Label>
					<div className="story-editor-next-page-container">
						{page.nextPages.map((pageID, nextPageIndex) => (
							<div
								key={nextPageIndex}
								className="story-editor-next-page"
							>
								<Field
									type="number"
									name={`pages.${page.id}.nextPages.${nextPageIndex}`}
									className="story-editor-next-page-input spaced"
									min={1}
									required
									innerRef={
										nextPageIndex === page.nextPages.length - 1
											? lastNextPageInputRef
											: undefined
									}
								/>
								<RemoveButton
									className="spaced"
									title="Remove Page"
									onClick={onClickRemoveNextPage}
								/>
							</div>
						))}
						<div>
							<AddButton
								title="Add Page"
								onClick={
									useCallback(() => {
										formikPropsRef.current.setFieldValue(`pages.${page.id}.nextPages`, [
											...page.nextPages,
											''
										]);

										// Wait for the newly added next page to render.
										setTimeout(() => {
											lastNextPageInputRef.current?.focus();
										});
									}, [formikPropsRef, page.id, page.nextPages])
								}
							/>
						</div>
					</div>
				</div>
				<InlineRowSection className="page-field-container-misc">
					{page.id !== 1 && (
						<FieldBoxRow
							type="checkbox"
							name={`pages.${page.id}.unlisted`}
							label="Unlisted"
							help="Unlisted pages are not included in new update notifications and do not show in your adventure's log. Comments on an unlisted page will not appear under any other page."
						/>
					)}
					<FieldBoxRow
						type="checkbox"
						name={`pages.${page.id}.disableControls`}
						label="Disable Controls"
						help={'Disallows users from using MSPFA\'s controls on this page (e.g. left and right arrow keys to navigate between pages).\n\nIt\'s generally only necessary to disable controls if a script or embedded game has custom controls which conflict with MSPFA\'s.'}
					/>
				</InlineRowSection>
			</div>
			<div className="story-editor-page-actions">
				{saved ? (
					<>
						<Button
							href={`/s/${storyID}/p/${page.id}?preview=1`}
							target="_blank"
						>
							Preview
						</Button>
						<Button onClick={publishPage}>
							Publish
						</Button>
					</>
				) : (
					<Button onClick={savePage}>
						{pageStatus === 'draft' ? 'Save Draft' : 'Save'}
					</Button>
				)}
				<Button
					onClick={
						useCallback(() => {
							const newPages: Values['pages'] = {};

							for (const pageID in formikPropsRef.current.values.pages) {
								const newPage = {
									...formikPropsRef.current.values.pages[pageID]
								};

								if (+pageID > page.id) {
									newPage.id--;
								}

								newPages[pageID] = newPage;
							}

							formikPropsRef.current.setFieldValue('pages', newPages);
						}, [formikPropsRef, page.id])
					}
				>
					Delete
				</Button>
			</div>
		</BoxSection>
	);
});

export default StoryEditorPage;