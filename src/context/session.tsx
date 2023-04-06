import { createContext, useState, FC, useEffect } from "react";
import {
	IProject,
	projectApi
} from 'api';

export type ISessionContextState = {
	loading: boolean;
	projects: IProject[]|null;
	selectedProject?: IProject;
	showPopUpByName?: string;
	setProject:	(project: IProject|undefined) => void;
	addProject:	(project: IProject) => boolean;
	removeProject:	(project: IProject) => void;
	setShowPopUpByName: (value: string) => React.Dispatch<React.SetStateAction<string | undefined>>|void;
};

export const SessionContext = createContext<ISessionContextState>({
	loading: false,
	projects: [],
	selectedProject: undefined,
	showPopUpByName: undefined,
	setProject: () => { return false; },
	addProject: () => { return false; },
	removeProject:	() => { return false; },
	setShowPopUpByName: () => {}
});

export const SessionProvider: FC = ({ children }) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [projects, setProjects] = useState<IProject[]|null>([]);
	const [selectedProject, setSelectedProject] = useState<IProject|undefined>(undefined);
	const [showPopUpByName, setShowPopUpByName] = useState<string|undefined>(undefined);
	
	useEffect(() => {
			(async () => {
				setLoading(true);
				setProjects(await projectApi.getProjects());
				setLoading(false);
			})();
	}, []);

	const setProject = (project: IProject|undefined) => {
		setSelectedProject(project);
	}

	const addProject = (project: IProject): boolean => {
		if (projects) {
			setProjects([...projects, project]);
		} else {
			setProjects([project]);
		}

		setSelectedProject(project);

		return project === selectedProject;
	}

	const removeProject = (project: IProject): void => {
		if (projects) {
			let newProjArray = projects;
			newProjArray = projects.filter((proj) => {
				if (proj !== project) {
					return true;
				}
			});
			setProjects(newProjArray);
		}
	}

	return (
		<SessionContext.Provider
			value={{
				loading,
				projects,
				selectedProject,
				showPopUpByName,
				setProject,
				addProject,
				removeProject,
				setShowPopUpByName,
			}}>
			{children}
		</SessionContext.Provider>
	);
};