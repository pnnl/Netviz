import { FC, ReactElement, useState, useContext, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, useRouteMatch, useHistory } from "react-router-dom";
import styled from "styled-components";

import PrimaryLayout from "layout/primary";
import { PowerNetwork } from "./power-network";
import { CommsNetwork } from "./comms-network";
import { CommsCentricNetwork } from "./comms-centric-network";
import { PowerCentricNetwork } from "./power-centric-network";
import { SessionContext, ISessionContextState } from "context";
import { ProjectContext, IProjectContextState, ProjectProvider } from "context";
import { ProjectInfo } from "./components";
import { ActionButton, Modal } from "common";
import { ProjectDetailsForm } from './components/project-details';
import { ICheckImportFileResponse, IProject, projectApi } from "api";

//#region DEFINE STYLED COMPONENTS

const StyledDiv = styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    column-gap: 15px;
    position: absolute;
    top: 5.5rem;
`

//#endregion

const ProjectPage: FC = (): ReactElement => {
    const session: ISessionContextState = useContext<ISessionContextState>(SessionContext);
    const projectContext: IProjectContextState = useContext<IProjectContextState>(ProjectContext);

    const history = useHistory();
    const [glmFileExists, setGlmFileExists] = useState<boolean>(true);
    const [nndFileExists, setNndFileExists] = useState<boolean>(true);
    const [linkagesFileExists, setLinkagesFileExists] = useState<boolean>(true);
    let { path } = useRouteMatch();

    useEffect(() => {
        if (projectContext.project) {
            projectApi.updateProject(projectContext.project)
        }
    }, [projectContext.project])

    useEffect(() => {
        // check if the session has a selected project, if not then redirect the route to the project selection page
        if (!session.selectedProject) {
            history.push('/projects');
        }
        if (!session.selectedProject?.powerFile) {
            setGlmFileExists(false);
        }
        if (!session.selectedProject?.commsFile) {
            setNndFileExists(false);
        }
        if (!session.selectedProject?.linkagesFile) {
            setLinkagesFileExists(false);
        }
    }, [session.selectedProject]);

    return (
        <ProjectProvider project={session.selectedProject} >
            <PrimaryLayout>
                <Router>
                    <StyledDiv>
                        <ProjectInfo glmFileExists={glmFileExists} nndFileExists={nndFileExists} linkagesFileExists={linkagesFileExists} />
                        {/* {<ActionButton label="Refresh" onClick={() => window.location.reload()} />} */}
                    </StyledDiv>
                    <Switch>
                        <Route path={`${path}/power-network`}>
                            <PowerNetwork glmFile={glmFileExists} />
                        </Route>
                        <Route path={`${path}/comms-network`}>
                            <CommsNetwork nndFile={nndFileExists} />
                        </Route>
                        <Route path={`${path}/power-centric-network`}>
                            <PowerCentricNetwork glmFileExists={glmFileExists} nndFileExists={nndFileExists} />
                        </Route>
                        <Route path={`${path}/comms-centric-network`}>
                            <CommsCentricNetwork glmFileExists={glmFileExists} nndFileExists={nndFileExists} />
                        </Route>
                    </Switch>
                </Router>
            </PrimaryLayout>
        </ProjectProvider>
    );
};

export default ProjectPage;
