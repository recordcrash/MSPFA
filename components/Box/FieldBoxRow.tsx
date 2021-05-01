import { Field } from 'formik';
import type { FieldAttributes } from 'formik';
import { toKebabCase } from 'modules/client/utilities';
import LabeledBoxRow from 'components/Box/LabeledBoxRow';
import type { LabeledBoxRowProps } from 'components/Box/LabeledBoxRow';

export type ExclusiveFieldBoxRowProps = Pick<LabeledBoxRowProps, 'label' | 'help'> & {
	/**
	 * The form `Field`'s `name` prop of this setting. Must be unique within the page.
	 *
	 * Automatically used to determine the `Field`'s `id`.
	 */
	name: string
};

export type FieldBoxRowProps = FieldAttributes<unknown> & { id?: never } & ExclusiveFieldBoxRowProps;

/** A `LabeledBoxRow` containing a `Field`. Defaults to a checkbox. Accepts any props which `Field` accepts. */
const FieldBoxRow = ({
	label,
	name,
	type = 'checkbox',
	help,
	...props
}: FieldBoxRowProps) => {
	// Determine the form `Field`'s `id` based on its `name`, converting from camelCase to kebab-case.
	const fieldID = `field-${toKebabCase(name)}`;

	return (
		<LabeledBoxRow
			label={label}
			htmlFor={fieldID}
			help={help}
		>
			<Field
				id={fieldID}
				name={name}
				type={props.as ? undefined : type}
				{...props}
			/>
		</LabeledBoxRow>
	);
};

export default FieldBoxRow;