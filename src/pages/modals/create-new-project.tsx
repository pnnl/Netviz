import React, { FC, ReactElement, useContext, useState } from 'react';
import { SessionContext, ISessionContextState } from '../../context';
import { useHistory } from "react-router-dom";
import { IProject, projectApi } from '../../api';
import Modal from '../../common/modal';
import styled from 'styled-components';

//#region DEFINE STYLED COMPONENTS

//#endregion

type NewProjectError = {
	name: string;
	message: string;
}

const DEFAULT_NEW_PROJECT: IProject = {
	type: 'NetViz-1.0.1-ProjectFile',
	name: '',
	description: '',
	commsFile: null,
	powerFile: null,
	linkagesFile: null,
	created: (new Date()),
	modified: (new Date()),
};

const CreateNewProjectPage : FC = () : ReactElement => {
	const session : ISessionContextState = useContext<ISessionContextState>(SessionContext);
	let history = useHistory();

	const [newProject, setNewProject] = useState<IProject>(DEFAULT_NEW_PROJECT);
	const [errors, setErrors] = useState<NewProjectError[]>([]);

	const closeNewProject = (evt: React.MouseEvent<HTMLButtonElement> | undefined) => {
		session.setShowPopUpByName('');
	}

	const loadNewProject = (project: IProject) => {
		session.addProject(project);
		session.setShowPopUpByName('');
		history.push("/project");
	}

	const addNewProject = () => {
		let hasError = false;
		let newErrors: NewProjectError[] = [];

		if (newProject.description === undefined || newProject.description === null || newProject.description === '') {
			newErrors.push({ name: 'description', message: 'Description must be provided.'});
			hasError = true;
		}
		if (newProject.name === undefined || newProject.name === null || newProject.name === '') {
			newErrors.push({ name: 'name', message: 'Name must be provided'});
			hasError = true;
		}
		
		if (hasError) {
			setErrors(newErrors);
			return;
		}

		projectApi.createNewProject(newProject)
			.then(project => {
				if (project) {
					loadNewProject(project);
				}
				else {
					setErrors([{ name: 'name', message: 'Project with name provided exist, please choose another name.'}]);
				}
			});
	}

  const handleNameChange = (evt: React.FormEvent<HTMLInputElement>) => {
		const target = evt.currentTarget;
		setNewProject({...newProject, name: target.value });
		setErrors(errors.filter(item => { return item.name !== 'name' }))
  }

  const handleDescriptionChange = (evt: React.FormEvent<HTMLTextAreaElement>) => {
		const target = evt.currentTarget;
		setNewProject({...newProject, description: target.value });
		setErrors(errors.filter(item => { return item.name !== 'description' }))
  }

	const nameErrors = errors.filter((item) => {
		return item.name === 'name';
	});

	const descriptionErrors = errors.filter((item) => {
		return item.name === 'description';
	});
	
	return (
		<Modal
			title="Create New Project"
			visible={true}
			closeOnBlur={false}
			width="50%"
			height="65%"
			onClose={closeNewProject}
			onSuccess={addNewProject}
			cancelButton={true}
		>
			<form>
				<label className='field-label'>
					Name:
					<br />
					<input className='field-input' type="text" style={{ width: '100%' }} name='name' value={newProject.name} onChange={handleNameChange} />
					{nameErrors && nameErrors.length > 0 && nameErrors.map((item, index) => {
						return <span key={`name-error-${index}`} className='error'>{item.message}<br /></span>;
					})}
				</label>
				<br />
				<label className='field-label'>
					Description:
					<br />
					<textarea className='field-input' style={{ width: '100%' }} name='description' defaultValue={newProject.description} rows={6} onChange={handleDescriptionChange}>
					</textarea>
					{descriptionErrors && descriptionErrors.length > 0 && descriptionErrors.map((item, index) => {
						return <span key={`description-error-${index}`} className='error'>{item.message}<br /></span>;
					})}
				</label>
				<br />
			</form>
		</Modal>
	);
};

export default CreateNewProjectPage;