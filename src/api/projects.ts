import axios from 'axios';
import { BASE_PATH } from './settings';

export type IProject = {
	type: string;
	name: string;
	description: string;
	commsFile: string|null;
	powerFile: string|null;
	linkagesFile: string|null;
	created: Date;
	modified: Date;
}

export type IProjectResponse = {
	projects: IProject[]|undefined;
	fileName: string;
	success: boolean;
}

export type ICheckImportFileResponse = {
	success: boolean;
	message: string;
	fileType: string;
	version: string;
	uploadedFileName: string;
} 



class _projectApi {
	apiBasePath = BASE_PATH;

	getProjects = async (): Promise<IProject[]|null> => {

		return await axios.get(`${this.apiBasePath}/projects/`)
			.then(({ status, data }) => {
				if (status !== 200) {
					console.error('Invalid response status code: ' + status);
					return null;
				}

				const resp: IProjectResponse = data;

				if (resp.success && resp.projects != undefined) {
					return resp.projects;
				}
				else return null;
			});
	}

	createNewProject = async (newProject: IProject): Promise<IProject|null> => {
		return await axios.post(`${this.apiBasePath}/projects/`, newProject)
			.then(({ status, data }) => {
				if (status !== 200) {
					console.error('Invalid response status code: ' + status);
					return null;
				}
				
				const resp: IProjectResponse = data;

				if (resp.success && resp.projects != undefined && resp.projects.length > 0) {
					return resp.projects[0];
				}
				else return null;
			});
	}

	deleteProject = async (project: IProject): Promise<boolean> => {
		return await axios.delete(`${this.apiBasePath}/projects/`, { data: project })
			.then(() => {
				return true;
			})
			.catch((error) => {
				console.error(error);
				return false;
			})
	}

	checkFileImportForProject = async (formDataWithFile: FormData): Promise<ICheckImportFileResponse|null> => {
		return await axios.post(`${this.apiBasePath}/projects/check-file`, formDataWithFile)
			.then(({ status, data }) => {
				if (status !== 200) {
					console.error('Invalid response status code: ' + status);
					return null;
				}
				const resp: ICheckImportFileResponse = data;

				return resp;
			});
	}

	importNewProject = async (
		newProject: IProject, nndFile?: ICheckImportFileResponse, glmFile?: ICheckImportFileResponse, linkagesFile?: ICheckImportFileResponse
	): Promise<IProject|null> => {
		let totalResp: IProject|null = null;
		if (nndFile) {
			const projectAndImportCheck = { project: totalResp === null ? newProject : totalResp, import: nndFile };
			let nndResp = await axios.post(`${this.apiBasePath}/projects/import-after-check`, projectAndImportCheck)
				.then(({ status, data }) => {
					if (status !== 200) {
						console.error('Invalid response status code: ' + status);
						return null;
					}
					
					const resp: IProjectResponse = data;
	
					if (resp.success && resp.projects != undefined && resp.projects.length > 0) {
						return resp.projects[0];
					}
					else return null;
				});
			totalResp = nndResp;
		}
		if (glmFile) {
			const projectAndImportCheck = { project: totalResp === null ? newProject : totalResp, import: glmFile };
			let glmResp = await axios.post(`${this.apiBasePath}/projects/import-after-check`, projectAndImportCheck)
				.then(({ status, data }) => {
					if (status !== 200) {
						console.error('Invalid response status code: ' + status);
						return null;
					}
					
					const resp: IProjectResponse = data;
	
					if (resp.success && resp.projects != undefined && resp.projects.length > 0) {
						return resp.projects[0];
					}
					else return null;
				});
			if (totalResp === null) {
				totalResp = glmResp;
			} else if (glmResp !== null) {
				totalResp.powerFile = glmResp.powerFile
			}
		}
		if (linkagesFile) {
			const projectAndImportCheck = { project: totalResp === null ? newProject : totalResp, import: linkagesFile };
			let linkagesResp = await axios.post(`${this.apiBasePath}/projects/import-after-check`, projectAndImportCheck)
				.then(({ status, data }) => {
					if (status !== 200) {
						console.error('Invalid response status code: ' + status);
						return null;
					}
					
					const resp: IProjectResponse = data;
	
					if (resp.success && resp.projects != undefined && resp.projects.length > 0) {
						return resp.projects[0];
					}
					else return null;
				});
			if (totalResp === null) {
				totalResp = linkagesResp;
			} else if (linkagesResp !== null) {
				totalResp.linkagesFile = linkagesResp.linkagesFile;
			}
		}

		return totalResp;
	}

	updateProject = async (project: IProject): Promise<IProject|null> => {
		return await axios.put(`${this.apiBasePath}/projects/update-project`, project)
			.then(({ status, data }) => {
				const resp = data;
				if (resp.success && resp.projects != undefined && resp.projects.length > 0) {
					return resp.projects[0];
				}
			})
	}


}

const projectApi = new _projectApi();
Object.freeze(projectApi);

export default projectApi;