import { FC } from 'react';
import styled from 'styled-components';
import { TypeOfIcon, IconAsSvg } from '../icons';
import { Colors } from 'theme';
import { StyledActionButton, StyledActionButtonProps } from './action-button';

//#region DEFINE STYLED COMPONENTS

export const StyledImportButton = styled(StyledActionButton)<StyledActionButtonProps>`
	position: relative;
	left: 50%;
	transform: translate(-50%, 0);
`;

//#endregion

/* DEFINE COMPONENT */
export type ImportButtonProps = {
	label?: string,
	onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const ImportButton: FC<ImportButtonProps> = (props: ImportButtonProps) => {
	const { label, onClick } = props;
    let iconType = TypeOfIcon.FileDownload;

	return (
		<StyledImportButton
			onClick={onClick}
			color={Colors.TitleBackGround}
			backgroundColor={"white"}
			height={24}
		>
			{iconType && <IconAsSvg iconType={iconType} color={Colors.TitleBackGround} sizePx={24} />}
			&nbsp; {label}
		</StyledImportButton>
	);
}

export default ImportButton;