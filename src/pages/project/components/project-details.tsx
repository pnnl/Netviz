import { FC, ReactElement, useContext, useState, useEffect } from "react";
import { IProjectContextState, ProjectContext } from "context";
import { ICheckImportFileResponse, IProject, projectApi } from 'api';
import { FormError } from "common";
import { Colors } from 'theme';
import styled from 'styled-components';

//#region DEFINE STYLED COMPONENTS

const StyledWarning = styled.h4`
    color: ${Colors.TitleBackGround};
    margin-top: 0.5rem;
		margin-bottom: 0;
`;

//#endregion

export type ProjectDetailsFormProps = {
	glmFile: boolean,
	nndFile: boolean,
	linkagesFile: boolean,
	setNewProjectDetails: (proj: IProject | null) => void,
	setNewFileResp: (file: ICheckImportFileResponse | null) => void
}

export const ProjectDetailsForm: FC<ProjectDetailsFormProps> = (props: ProjectDetailsFormProps): ReactElement => {
	const projectContext: IProjectContextState = useContext<IProjectContextState>(ProjectContext);
	const [errors, setErrors] = useState<FormError[]>([]);
	const [glmFileName, setGlmFileName] = useState<string>("");
	const [nndFileName, setNndFileName] = useState<string>("");
	const [linkagesFileName, setLinkagesFileName] = useState<string>("");
	const [projName, setProjName] = useState<string | undefined>(projectContext.project?.name);
	const [projDescription, setProjDescription] = useState<string | undefined>(projectContext.project?.description);
	const [glmImported, setGlmImported] = useState<boolean>(props.glmFile);
	const [nndImported, setNndImported] = useState<boolean>(props.nndFile);


	const importFileErrors = errors.filter((item) => {
		return item.name === 'import-glm-file' || item.name === 'import-nnd-file';
	});
	
	// Used to check if a prop has an entry error, or to clear existing errors
	const hasPropError = (errorPropName: string, curValue: any, inValidValues: any[]): boolean => {
		// get all errors except the current prop name errors -- keep other historical
		let newErrors: FormError[] = errors.filter((item: FormError) => {
			return item.name !== errorPropName;
		});
		let hasErrorForProp: boolean = false;

		inValidValues.forEach(item => {
			if (curValue === item) {
				newErrors.push({ name: errorPropName, message: `Value cannot be ${curValue.toString()}`});
				hasErrorForProp = true;
			}
		});

		setErrors(newErrors);
		return hasErrorForProp;
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
			
			if (checkResp && checkResp.success) {
				if (checkResp.fileType == "NND") {
					setNndImported(true);
				}
				else if (checkResp.fileType == "GLM-JSON") {
					setGlmImported(true);
				}
				if (props.setNewFileResp) {
					props.setNewFileResp(checkResp);
				}
			}
			else if (checkResp) {
				if (checkResp.fileType == "NND") {
					setErrors([{ name: 'import-nnd-file', message: checkResp ? checkResp.message : 'Unable to analyze NND file.' }]);
				}
				else if (checkResp.fileType == "GLM-JSON") {
					setErrors([{ name: 'import-glm-file', message: checkResp ? checkResp.message : 'Unable to analyze GLM file.' }]);
				}
			}
			else {
				setErrors([{ name: 'import-glm-file', message: 'Unable to analyze GLM file.' }]);
				setErrors([{ name: 'import-nnd-file', message: 'Unable to analyze NND file.' }]);
			}
		}
	}

	const setProjectName = (event: any) => {
		let newNameValue = event.target.value
		if ( hasPropError('name', newNameValue, [undefined, null, '']) ) {
			return;
		}

		setProjName(newNameValue)

		const timer = setTimeout(() => {
			if (projectContext && projectContext.project) {
				const newProject: IProject = {...projectContext.project, name: newNameValue};
				props.setNewProjectDetails(newProject);
			}
		}, 1500)

		return () => clearTimeout(timer);
	}

	const setProjectDescription = (event: any) => {
		let newDescriptionValue = event.target.value
		if ( hasPropError('description', newDescriptionValue, [undefined, null, '']) ) {
			return;
		}

		setProjDescription(newDescriptionValue)

		const timer = setTimeout(() => {
			if (projectContext && projectContext.project) {
				const newProject: IProject|null = {...projectContext.project, description: newDescriptionValue};
				props.setNewProjectDetails(newProject);
			}
		}, 1500)

		return () => clearTimeout(timer);
	}

	useEffect(() => {
		if (projectContext.project && projectContext.project.commsFile) {
			let path = projectContext.project.commsFile.split("/")
			setNndFileName(path[path.length - 1])
		}
		if (projectContext.project && projectContext.project.powerFile) {
			let path = projectContext.project.powerFile.split("/")
			setGlmFileName(path[path.length - 1])
		}
		if (projectContext.project && projectContext.project.linkagesFile) {
			let path = projectContext.project.linkagesFile.split("/")
			setLinkagesFileName(path[path.length - 1])
		}
	}, [])
	
	return (
		<form>
			{(props.glmFile && props.nndFile && props.linkagesFile) &&
			<StyledWarning>
				NND and GLM files cannot be changed when a linkages file is present as the linkages file is dependent on the original NND and GLM files.
			</StyledWarning>}
			<label className={`field-label`} >
				GLM file: <b>{glmFileName}</b>
				<br />
				<input
					className={`field-input`}
					type="file"
					style={{ width: '100%' }}
					name='import-glm-file'
					onChange={handleFileChange}
					disabled={props.glmFile && props.nndFile && props.linkagesFile}
				/>
				{importFileErrors && importFileErrors.length > 0 && importFileErrors.map((item, index) => {
					return <span key={`import-file-error-${index}`} className='error'>{item.message}<br /></span>;
				})}
			</label>
			<label className={`field-label`}>
				NND file: <b>{nndFileName}</b>
				<br />
				<input
					className={`field-input`}
					type="file"
					style={{ width: '100%' }}
					name='import-nnd-file'
					onChange={handleFileChange}
					disabled={props.glmFile && props.nndFile && props.linkagesFile}
				/>
				{importFileErrors && importFileErrors.length > 0 && importFileErrors.map((item, index) => {
					return <span key={`import-file-error-${index}`} className='error'>{item.message}<br /></span>;
				})}
			</label>
			<label className={`field-label`}>
				Linkages file: <b>{linkagesFileName}</b>
				<br />
				<input
					className={`field-input`}
					type="file"
					style={{ width: '100%' }}
					name='import-linkages-file'
					onChange={handleFileChange}
					disabled={props.linkagesFile || (!glmImported || !nndImported)}
				/>
				{importFileErrors && importFileErrors.length > 0 && importFileErrors.map((item, index) => {
					return <span key={`import-file-error-${index}`} className='error'>{item.message}<br /></span>;
				})}
			</label>
			{(!glmImported || !nndImported) &&
			<StyledWarning>
				You must import both an NND file and a GLM file in order to include a linkages file for the project.
			</StyledWarning>}
			<label className="field-label">
				Project Name (required):
				<br />
				<input
					className="field-input"
					type="text"
					style={{ width: "100%" }}
					name="projectname"
					value={projName}
					onChange={setProjectName}
				/>
			</label>
			{errors.length > 0 &&
				errors.map((item, index) => {
					return (
						<span key={`project-info-error-${index}`} className="error">
							{item.message}
						</span>
					);
				})}
			<label className="field-label">
				Project Description:
				<br />
				<textarea
					className="field-input"
					name="projectdescription"
					style={{ width: "100%", resize: "none" }}
					// defaultValue={session.selectedProject?.description}
					value={projDescription}
					rows={5}
					onChange={setProjectDescription}
				/>
			</label>
		</form>
    );
};
