import React, { FC, ReactElement, useContext, useEffect, useState } from 'react';
import { SessionContext, ISessionContextState } from 'context';
import { useHistory } from "react-router-dom";
import { IProject, ICheckImportFileResponse, projectApi } from 'api';
import { Modal, FormError } from 'common';
import { Colors } from 'theme';
import styled from 'styled-components';

//#region DEFINE STYLED COMPONENTS

const StyledError = styled.h4`
    color: ${Colors.TitleBackGround};
    margin-top: 0.5rem;
	margin-bottom: 0;
`;

//#endregion

const DEFAULT_IMPORT_PROJECT: IProject = {
	type: 'NetViz-1.0.1-ProjectFile',
	name: '',
	description: '',
	commsFile: null,
	powerFile: null,
	linkagesFile: null,
	created: (new Date()),
	modified: (new Date()),
};

const ImportProjectPage : FC = () : ReactElement => {
	const session : ISessionContextState = useContext<ISessionContextState>(SessionContext);
	let history = useHistory();

	const [importProject, setImportProject] = useState<IProject>(DEFAULT_IMPORT_PROJECT);
	
	const [errors, setErrors] = useState<FormError[]>([]);
	const [glmImported, setGlmImported] = useState<boolean>(false);
	const [nndImported, setNndImported] = useState<boolean>(false);
	const [linkagesImported, setLinkagesImported] = useState<boolean>(false);
	const [importNndFileResp, setImportNndFileResp] = useState<ICheckImportFileResponse|undefined>(undefined);
	const [importGlmFileResp, setImportGlmFileResp] = useState<ICheckImportFileResponse|undefined>(undefined);
	const [importLinkagesFileResp, setImportLinkagesFileResp] = useState<ICheckImportFileResponse|undefined>(undefined);
	const [importFileErrors, setImportFileErrors] = useState<FormError[]>([]);
	const [nameErrors, setNameErrors] = useState<FormError[]>([]);
	const [descriptionErrors, setDescriptionErrors] = useState<FormError[]>([]);

	useEffect(() => {
		setImportFileErrors(errors.filter((item) => {
			return item.name === 'import-nnd-file' || item.name === 'import-glm-file' || 'import-linkages-file';
		}));
	
		setNameErrors(errors.filter((item) => {
			return item.name === 'name';
		}));
	
		setDescriptionErrors(errors.filter((item) => {
			return item.name === 'description';
		}));
	}, [errors])

	const closeNewProject = (evt: React.MouseEvent<HTMLButtonElement> | undefined) => {
		session.setShowPopUpByName('');
	}

	const loadImportedProject = (project: IProject) => {
		session.setShowPopUpByName('');
		session.addProject(project);
		history.push("/project");
	}

	const addImportProject = () => {
		let hasError = false;
		let newErrors: FormError[] = [];

		if (importProject.description === undefined || importProject.description === null || importProject.description === '') {
			newErrors.push({ name: 'description', message: 'Description must be provided.'});
			hasError = true;
		}
		if (importProject.name === undefined || importProject.name === null || importProject.name === '') {
			newErrors.push({ name: 'name', message: 'Name must be provided'});
			hasError = true;
		}
		
		if (hasError) {
			setErrors(newErrors);
			return;
		}

		projectApi.importNewProject(importProject, importNndFileResp, importGlmFileResp, importLinkagesFileResp)
			.then(project => {
				if (project) {
					loadImportedProject(project);
				}
				else {
					setErrors([{ name: 'name', message: 'Project with name provided exist, please choose another name.'}]);
				}
			});
	}

	const handleFileChange = async (evt: React.FormEvent<HTMLInputElement>) => {
		const target = evt.currentTarget;
		
		if (target != null && target.files != null) {
			const formData = new FormData();
			// attach the binary file
			formData.append("check-file", target.files[0], target.files[0].name);
			
			// add the local file path
			const anyFileInfo: any = target.files[0];	// needed to cast as any type to get the path attr
			formData.append("file-path", anyFileInfo.path);

			const checkResp: ICheckImportFileResponse|null = await projectApi.checkFileImportForProject(formData);

			if (target.name === 'import-nnd-file') {
				if (checkResp && checkResp.success && checkResp.fileType === "NND") {
					setImportNndFileResp(checkResp);
					setNndImported(true);
					// clear old errors with valid selection
					setErrors(errors.filter(item => { return item.name !== 'import-nnd-file' }));
				}
				else {
					setImportNndFileResp(undefined);
					if (checkResp?.fileType !== "NND") {
						setErrors([{ name: 'import-nnd-file', message: 'Incorrect file type' }]);
					}
					else {
						setErrors([{ name: 'import-nnd-file', message: checkResp ? checkResp.message : 'Unable to analyze import file.' }]);
					}
				}
			}
			else if (target.name === 'import-glm-file') {
				if (checkResp && checkResp.success && checkResp.fileType === "GLM-JSON") {
					setImportGlmFileResp(checkResp);
					setGlmImported(true);
					// clear old errors with valid selection
					setErrors(errors.filter(item => { return item.name !== 'import-glm-file' }))
				}
				else {
					setImportGlmFileResp(undefined);
					if (checkResp?.fileType !== "GLM-JSON") {
						setErrors([{ name: 'import-glm-file', message: 'Incorrect file type' }]);
					}
					else {
						setErrors([{ name: 'import-glm-file', message: checkResp ? checkResp.message : 'Unable to analyze import file.' }]);
					}
				}
			}
			else if (target.name === 'import-linkages-file') {
				if (checkResp && checkResp.success && checkResp.fileType === "Linkages") {
					setImportLinkagesFileResp(checkResp);
					setLinkagesImported(true);
					// clear old errors with valid selection
					setErrors(errors.filter(item => { return item.name !== 'import-linkages-file' }));
				}
				else {
					setImportLinkagesFileResp(undefined);
					if (checkResp?.fileType !== "Linkages") {
						setErrors([{ name: 'import-linkages-file', message: 'Incorrect file type' }]);
					}
					else {
						setErrors([{ name: 'import-linkages-file', message: checkResp ? checkResp.message : 'Unable to analyze import file.' }]);
					}
				}
			}
		}
	}

	const handleNameChange = (evt: React.FormEvent<HTMLInputElement>) => {
		const target = evt.currentTarget;
		setImportProject({...importProject, name: target.value });
		// clear out the errors on change
		setErrors(errors.filter(item => { return item.name !== 'name' }))
  	}

  	const handleDescriptionChange = (evt: React.FormEvent<HTMLTextAreaElement>) => {
		const target = evt.currentTarget;
		setImportProject({...importProject, description: target.value });
		// clear out the errors on change
		setErrors(errors.filter(item => { return item.name !== 'description' }))
  	}

	const noImportFile = (importNndFileResp === undefined ||  importNndFileResp.success === false) && 
	(importGlmFileResp === undefined ||  importGlmFileResp.success === false);
	
	return (
		<Modal
			title="Import Project"
			visible={true}
			closeOnBlur={false}
			width="50%"
			height="75%"
			onClose={closeNewProject}
			onSuccess={addImportProject}
			disableSuccess={noImportFile || (linkagesImported && (!glmImported || !nndImported))}
			cancelButton={true}
		>	
			<form>
				<label className={`field-label`}>
					GLM file
					<br />
					<input
						className={`field-input`}
						type="file"
						style={{ width: '100%' }}
						name='import-glm-file'
						onChange={handleFileChange}
					/>
					{importFileErrors.length > 0 && importFileErrors.map((item, index) => {
						if (item.name === 'import-glm-file') {
							return <span key={`import-glm-file-error-${index}`} className='error'>{item.message}<br /></span>;
						}
					})}
				</label>
				<label className={`field-label`}>
					NND file
					<br />
					<input
						className={`field-input`}
						type="file"
						style={{ width: '100%' }}
						name='import-nnd-file'
						onChange={handleFileChange}
					/>
					{importFileErrors && importFileErrors.length > 0 && importFileErrors.map((item, index) => {
						if (item.name === 'import-nnd-file') {
							return <span key={`import-nnd-file-error-${index}`} className='error'>{item.message}<br /></span>;
						}
					})}
				</label>
				<label className={`field-label`}>
					Linkages file
					<br />
					<input
						className={`field-input`}
						type="file"
						style={{ width: '100%' }}
						name='import-linkages-file'
						onChange={handleFileChange}
						disabled={!glmImported || !nndImported}
					/>
					{importFileErrors && importFileErrors.length > 0 && importFileErrors.map((item, index) => {
						if (item.name === 'import-linkages-file') {
							return <span key={`import-linkages-file-error-${index}`} className='error'>{item.message}<br /></span>;
						}
					})}
				</label>
				{(!glmImported || !nndImported) &&
				<StyledError>
					You must import both an NND file and a GLM file in order to include a linkages file for the project.
				</StyledError>}
				<br />
				<label className={`field-label ${noImportFile && 'disabled-label' }`}>
					Name:
					<br />
					<input
						className={`field-input ${noImportFile && 'disabled-input' }`}
						type="text"
						style={{ width: '100%' }}
						name='name'
						value={importProject.name}
						onChange={handleNameChange}
						disabled={noImportFile}
					/>
					{nameErrors && nameErrors.length > 0 && nameErrors.map((item, index) => {
						return <span key={`name-error-${index}`} className='error'>{item.message}<br /></span>;
					})}
				</label>
				<br />
				<label className={`field-label ${noImportFile && 'disabled-label' }`}>
					Description:
					<br />
					<textarea 
						className={`field-input ${noImportFile && 'disabled-input' }`} 
						style={{ width: '100%' }} 
						name='description' 
						defaultValue={importProject.description} 
						rows={6} 
						onChange={handleDescriptionChange}
					/>
					{descriptionErrors && descriptionErrors.length > 0 && descriptionErrors.map((item, index) => {
						return <span key={`description-error-${index}`} className='error'>{item.message}<br /></span>;
					})}
				</label>
				<br />
			</form>
		</Modal>
	);
};

export default ImportProjectPage;