import GridSection from 'components/Grid/GridSection';
import type { GridSectionProps } from 'components/Grid/GridSection';
import './styles.module.scss';

export type GridRowSectionProps = GridSectionProps;

/** A `GridSection` for containing `GridRow`s, by default with two columns. */
const GridRowSection = ({ className, ...props }: GridRowSectionProps) => (
	<GridSection
		className={`grid-row-section${className ? ` ${className}` : ''}`}
		{...props}
	/>
);

export default GridRowSection;