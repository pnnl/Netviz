import React, { FC, ReactElement, useContext, useState } from 'react';
import { SessionContext, ISessionContextState } from '../../context';
import { IPdfResp, nndApi, glmApi } from '../../api';
import { Modal, ActionButton, TypeOfIcon } from 'common';
import styled from 'styled-components';

//#region DEFINE STYLED COMPONENTS
//#endregion

export type OpenExportModalProps = {
	showModal: boolean;
	setShowModal: (showModal: boolean) => void;
}

const OpenExports : FC<OpenExportModalProps> = (props: OpenExportModalProps) : ReactElement => {
	const session : ISessionContextState = useContext<ISessionContextState>(SessionContext);

	const { setShowModal, showModal } = props;

	const closeExportModal = (evt: React.MouseEvent<HTMLButtonElement> | undefined) => {
		//session.setShowPopUpByName('');
		setShowModal(false);
	}

	const downloadGlmPdfFile = async () => {
		const glmJsonFile = session.selectedProject?.powerFile;

		if (glmJsonFile) {
			const glmPdfResp = await glmApi.exportPdf(glmJsonFile);

			if (glmPdfResp) {
				await glmApi.openPdfWindow(glmPdfResp);
			}
		}
	}

	const downloadNndPdfFile = async () => {
		const commsJsonFile = session.selectedProject?.commsFile;

		if (commsJsonFile) {
			const nndPdfResp = await nndApi.exportPdf(commsJsonFile);

			if (nndPdfResp) {
				await nndApi.openPdfWindow(nndPdfResp);
			}
		}
	}
	
	return (
		<Modal
			title="Open Export Files"
			visible={showModal}
			closeOnBlur={false}
			width="50%"
			height="25%"
			onClose={closeExportModal}
			successButton={false}
			cancelButton={false}
		>
			<div>
				{session.selectedProject?.powerFile && (
					<div>
						<p>Open the Power System PDF in new Window?</p>
						<ActionButton
							label="Yes"
							iconType={TypeOfIcon.FileDownload}
							height={24}
							disabled={false}
							onClick={downloadGlmPdfFile}
						/>
					</div>
				)}
				{session.selectedProject?.commsFile && (
					<div>
						<p>Open the Communication Network PDF in new Window?</p>
						<ActionButton
							label="Yes"
							iconType={TypeOfIcon.FileDownload}
							height={24}
							disabled={false}
							onClick={downloadNndPdfFile}
						/>
					</div>
				)}
			</div>
		</Modal>
	);
};

export default OpenExports;