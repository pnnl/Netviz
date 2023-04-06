import { FC, ReactNode, useRef } from 'react';
import styled from 'styled-components';
import ActionButton from './buttons/action-button';
import { TypeOfIcon } from './icons';
import { Colors } from 'theme';

//#region DEFINE STYLED COMPONENTS

const StyledModal = styled.div`
	display: 'block'; /* Hidden by default */
	position: fixed; /* Stay in place */
	z-index: 10000; /* Sit on top or below*/
	padding-top: 100px; /* Location of the box */
	left: 0;
	top: 0;
	width: 100%; /* Full width */
	height: 100%; /* Full height */
	overflow: auto; /* Enable scroll if needed */
	background-color: rgb(0,0,0); /* Fallback color */
	background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
`;

type StyledModalContentProps = {
	width?: string;
	height?: string;
}

const StyledModalContent = styled.div<StyledModalContentProps>`
	background-color: #fefefe;
	position: relative;
	margin: auto;
	padding: 20px;
	border: 1px solid #888;
	border-radius: 4px;
	box-shadow: '0px 8px 10px rgba(0, 0, 0, 0.06), 0px 3px 14px rgba(0, 0, 0, 0.06), 0px 4px 5px rgba(0, 0, 0, 0.08)';
	width: ${props => props.width ? props.width : '80%'};
	min-width: ${props => props.width ? (parseInt(props.width) < 50 ? props.width : '50%') : '50%'};
	height: ${props => props.height ? props.height : 'auto'};
	min-height: 30%;
	overflow: auto; /* Enable scroll if needed */
`;

const StyledModalClose = styled.span`
	color: #aaaaaa;
	float: right;
	font-size: 28px;
	font-weight: bold;
	padding-right: 10px;
	:hover, :focus & {
		color: #000;
		text-decoration: none;
		cursor: pointer;
  }
`;

const StyledModalTitle = styled.div`
	font-family: Raleway;
	font-style: normal;
	font-weight: 600;
	font-size: 32px;
	line-height: 38px;
	display: flex;
	align-items: center;
	font-feature-settings: 'pnum' on, 'lnum' on;
	color: ${Colors.GrayTitle};
`;

const StyledModalButtons = styled.div`
	float: right;
`;

//#endregion

export type ModalProps = {
	children: ReactNode;
	visible: boolean;
	title?: string;
	width?: string;
	height?: string;
	closeOnBlur?: boolean;
	onClose?: React.MouseEventHandler<HTMLButtonElement>;
	onSuccess?: React.MouseEventHandler<HTMLButtonElement>;
	disableSuccess?: boolean;
	successButton?: boolean;
	cancelButton?: boolean;
}

const _Modal: FC<ModalProps> = ({
	children,
	title,
	visible = false,
	closeOnBlur = true,
	width = '75%',
	height = '75%',
	onClose,
	onSuccess,
	disableSuccess,
	successButton = true,
	cancelButton = true,
}: ModalProps) => {
	const modalEl = useRef(null);

	const closeModal: React.MouseEventHandler<HTMLButtonElement> = (evt) => {
		if (onClose !== undefined) {
			onClose(evt);
		}
	}

	const successModal: React.MouseEventHandler<HTMLButtonElement> = (evt) => {
		if (onSuccess !== undefined) {
			onSuccess(evt);
		}
	}

	const checkForClose = (evt: any) => {
		if (closeOnBlur && evt.target === modalEl.current && onClose !== undefined) {
			onClose(evt);
		}
	}

  return visible ? (
		<StyledModal ref={modalEl} onClick={checkForClose}>
			<StyledModalContent width={width} height={height}>
				<StyledModalClose onClick={closeModal}>&times;</StyledModalClose>
				{title !== undefined ? <StyledModalTitle>{title}</StyledModalTitle> : <br />}
				{children}
				<StyledModalButtons>
						{cancelButton &&
						<ActionButton
							label="Cancel"
							height={24}
							onClick={closeModal}
							backgroundColor={Colors.AltDisabled}
							color='#000'
						/>}

						{successButton && <ActionButton
							label="Submit"
							iconType={TypeOfIcon.Check}
							height={24}
							disabled={disableSuccess}
							onClick={successModal}
						/>}
				</StyledModalButtons>
			</StyledModalContent>
		</StyledModal>
  ) : <span style={{ display: 'none'}} />;
}

export default _Modal