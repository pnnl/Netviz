import { FC } from 'react';
import styled, { css } from 'styled-components';
import { TypeOfIcon, IconAsSvg } from '../icons';
import { Colors } from 'theme';

//#region DEFINE STYLED COMPONENTS

export type StyledActionButtonProps = {
	color?: string;
	backgroundColor?: string;
	link?: boolean;
	height?: number;
	disabled?: boolean;
}

export const StyledActionButton = styled.button<StyledActionButtonProps>`
	justify-content: center;
	align-items: center;
	border: none;
	background: ${props => props.backgroundColor ? props.backgroundColor : Colors.TitleBackGround};
	font-size: ${props => props.height ? props.height * 0.6 : 14 }px;
	font-family: Raleway;
	font-style: normal;
	font-weight: 600;
	text-transform: uppercase;
	line-height: ${props => props.height ? props.height : 24 }px;
	text-align: center;
	color: ${props => props.disabled ? Colors.Disabled : props.color ? props.color : "white" };
	padding: ${props => props.height ? `${props.height*0.25}px ${props.height*0.5}px ${props.height*0.25}px ${props.height*0.25}px` : '6px 12px 6px 6px' };
	margin-right: 8px;

	${props => props && !props.link &&
		css`
			border: 2px solid ${props.disabled ? Colors.AltDisabled : props.backgroundColor && (props.backgroundColor.toLowerCase() === 'white' || props.backgroundColor.toLowerCase() === '#000000') ? Colors.TitleBackGround : props.backgroundColor};
			box-shadow: '0px 8px 10px rgba(0, 0, 0, 0.06), 0px 3px 14px rgba(0, 0, 0, 0.06), 0px 4px 5px rgba(0, 0, 0, 0.08)';
			border-radius: 4px;
	`}

	:hover, :focus & {
		cursor: pointer;
  }
`;
//#endregion

/* DEFINE COMPONENT */
export type ActionButtonProps = {
	label: string;
	asLink?: boolean;
	color?: string;
	backgroundColor?: string;
	iconType?: TypeOfIcon;
	height?: number;
	disabled?: boolean;
	onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const ActionButton: FC<ActionButtonProps> = (props: ActionButtonProps) => {
	const {
		label, asLink, color, backgroundColor,
		iconType, height, disabled,
		onClick
	} = props;

	return (
		<StyledActionButton
			onClick={onClick}
			color={color}
			backgroundColor={asLink ? backgroundColor : disabled ? Colors.AltDisabled : backgroundColor}
			link={asLink}
			height={height ? height : 24}
			disabled={disabled}
		>
			{iconType && <IconAsSvg iconType={iconType} color={disabled ? Colors.Disabled : color ? color : '#FFFFFF'} sizePx={height ? height : 24} />}
			&nbsp; {label}
		</StyledActionButton>
	);
}

export default ActionButton;