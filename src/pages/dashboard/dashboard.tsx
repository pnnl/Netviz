import { FC, ReactElement, useContext, memo, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { SessionContext, ISessionContextState } from "context";
import PrimaryLayout from "layout/primary";
import { IProject, projectApi } from "api";
import { ProjectCard } from "./components";
import styled from "styled-components";

const StyledProjects = styled.div`
    width: 100%;
    margin: 0 calc(10.25rem - 20px - 1.25rem);
`;

const _DashboardPage: FC = (): ReactElement => {
    const session: ISessionContextState = useContext<ISessionContextState>(SessionContext);
    const [projects, setProjects] = useState<IProject[]>([]);
    const [projectDeleted, setProjectDeleted] = useState<boolean>(false);
    let history = useHistory();

    const fetchProjects = async () => {
        return await projectApi.getProjects() || [];
    }

    // I want the projects page to reset the selected project to undefined each time this route is loaded
    useEffect(() => {
        setProjectDeleted(false);
        session.setProject(undefined);

        let mounted = true;
        fetchProjects().then((projects) => {
            if (mounted) {
                setProjects(projects);
            }
        })

        return () => {
            mounted = false;
        }
    }, [projectDeleted]);

    const goToProject = (event: any, project: IProject) => {
        session.setProject(project);
        history.push("/project");
    }

    return (
        <PrimaryLayout>
            <StyledProjects>
                <h1 style={{"margin": "1.5rem 0 0 1.5rem"}}>
                    Saved Projects
                </h1>
                {projects.map((project, index) => {
                    return (
                        <ProjectCard
                            project={project}
                            title={project.name}
                            modified={project.modified}
                            description={project.description}
                            onClick={(event) => goToProject(event, project)}
                            key={`project-${index}`}
                            setProjectDeleted={setProjectDeleted}
                        />
                    );
                })}
            </StyledProjects>
        </PrimaryLayout>
    );
};

const DashboardPage = memo(_DashboardPage);
export default DashboardPage;
