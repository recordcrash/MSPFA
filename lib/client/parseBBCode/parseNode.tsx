import type { integer } from 'lib/types';
import type { Key, ReactNode, ReactNodeArray } from 'react';
import attributesToProps from 'lib/client/parseBBCode/attributesToProps';
import BBTags from 'components/BBCode/BBTags';

/** Returns whether `node instanceof Element`. */
const isElementNode = (node: Node): node is Element => (
	node.nodeType === 1
);

/** Returns whether `element instanceof HTMLElement`. */
const isHTMLElement = (element: Element): element is HTMLElement => {
	if (element.ownerDocument.defaultView) {
		return element instanceof element.ownerDocument.defaultView.HTMLElement;
	}

	let prototype = element;
	while (prototype = Object.getPrototypeOf(prototype)) {
		if (prototype.constructor.name === 'HTMLElement') {
			return true;
		}
	}
	return false;
};

/** Returns whether `node instanceof Text`. */
const isTextNode = (node: Node): node is Text => (
	node.nodeType === 3
);

/** Returns whether `node instanceof DocumentFragment`. */
const isDocumentFragmentNode = (node: Node): node is DocumentFragment => (
	node.nodeType === 11
);

/** Returns whether `node instanceof HTMLTextAreaElement`. */
const isHTMLTextAreaElement = (node: Node): node is HTMLTextAreaElement => (
	node.nodeName === 'TEXTAREA'
);

/** A key of an opening tag match array that maps to the index of the opening tag in the output `htmlString`. */
const _htmlIndex = Symbol('htmlIndex');

type BBTagMatch = RegExpExecArray & {
	[_htmlIndex]: integer
};

export type ParseNodeOptions<RemoveBBTags extends boolean | undefined = boolean | undefined> = {
	/** Whether to strip all BB tags from the input and keep only their children. */
	removeBBTags?: RemoveBBTags
};

/**
 * Returns a `ReactNode` representation of the input, with the inputted string or child nodes parsed as BBCode recursively.
 *
 * ⚠️ Assumes the input is already sanitized.
 */
const parseNode = <
	KeepHTMLTags extends boolean | undefined = undefined,
	RemoveBBTags extends boolean | undefined = undefined
>(
	node: string | DocumentFragment | Element | Text,
	options: ParseNodeOptions<RemoveBBTags>,
	key: Key = 0
): (
	KeepHTMLTags extends true
		? ReactNode
		: RemoveBBTags extends true
			? string
			: ReactNode
) => {
	if (typeof node === 'string') {
		return node;
	}

	if (isTextNode(node)) {
		return node.nodeValue!;
	}

	/** Returns a `Node`'s children as a `ReactNode` with parsed BBCode. */
	const parseNodeChildren = () => {
		const childrenArray: ReactNodeArray = [];

		for (let i = 0; i < node.childNodes.length; i++) {
			// We can assert this because any `ChildNode` is necessarily an `Element | Text | Comment`, and `Comment`s are sanitized out.
			const childNode = node.childNodes[i] as Element | Text;

			if (isTextNode(childNode)) {
				if (
					// Check if there is a previously pushed node.
					i > 0
					// Check if the previously pushed node is a string.
					&& typeof childrenArray[childrenArray.length - 1] === 'string'
				) {
					// If the previously pushed node is also a string, merge this one into it.
					childrenArray[childrenArray.length - 1] += childNode.nodeValue!;
				} else {
					// We're able to push the string without wrapping it in a fragment with a `key` because strings don't need React keys.
					childrenArray.push(childNode.nodeValue);
				}
			} else {
				// If this point is reached, `childNode instanceof Element`.
				childrenArray.push(
					parseNode(childNode, options, i)
				);
			}
		}

		return (
			childrenArray.length === 0
				? undefined
				: childrenArray.length === 1
					? childrenArray[0]
					: childrenArray
		);
	};

	if (isDocumentFragmentNode(node)) {
		return parseNodeChildren() as any;
	}

	const TagName: any = (
		isHTMLElement(node)
			// `HTMLElement`s have uppercase tag names, and React requires them to be lowercase.
			? node.nodeName.toLowerCase()
			// Other `Element`s (such as `SVGElement`s) may have case-sensitive tag names, so their case must not be modified.
			: node.nodeName
	);

	const props: ReturnType<typeof attributesToProps> & {
		children?: ReactNode
	} = attributesToProps(node);

	if (isHTMLTextAreaElement(node)) {
		// If this is a `textarea`, set its `defaultValue` instead of parsing its `children`.
		props.defaultValue = node.value;
	} else {
		// Otherwise, set its `children`.
		props.children = parseNodeChildren();
	}

	return (
		<TagName
			key={key}
			{...props}
		/>
	) as any;
};

export default parseNode;