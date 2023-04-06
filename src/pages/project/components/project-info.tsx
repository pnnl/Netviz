import { FC, ReactElement, useContext, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

import { IProjectContextState, ISessionContextState, ProjectContext, SelectableNetworkTypes, SessionContext } from "context";
import { Colors } from "theme";
import { Modal } from "common";
import { ProjectDetailsForm } from './project-details';
import { ICheckImportFileResponse, IProject, projectApi } from "api";

//#region DEFINE STYLED COMPONENTS

const StyledProjectInfo = styled.div`
    background: rgba(255, 255, 255, 0.9);
    border: 0.0625rem solid #eeeeee;
    box-sizing: border-box;
    box-shadow: 0 0.25rem 0.25rem rgba(0, 0, 0, 0.04);
    border-radius: 0.5rem;
    font-family: "Raleway";
    padding: 0.5rem 1.25rem 1rem 1.25rem;
`;

const StyledHeading = styled.h1`
    font-size: 2.5rem;
    line-height: 3.5rem;
    font-weight: 600;
    color: ${Colors.GrayTitle};
    display: inline-block;
    margin: 0 1rem 0.5rem 0;
    font-family: "Raleway";
`;

const StyledDetailsButton = styled.button`
    all: unset;
    display: inline-block;
    font-size: 1.25rem;
    line-height: 1.4375rem;
    cursor: pointer;
    color: ${Colors.ButtonBlue};
`;

type StyledNetworkButtonProps = {
    selected: boolean;
}

const StyledNetworkButton = styled.button<StyledNetworkButtonProps>`
    all: unset;
    display: inline-block;
    font-size: 1.5rem;
    line-height: 2.375rem;
    cursor: pointer;
    color: ${Colors.ButtonGray};
    margin: 0 2.5rem 0 0;
    color: ${props => props.selected ? Colors.ButtonBlue : Colors.ButtonGray};
    border-bottom: ${props => props.selected ? '0.0625rem solid blue' : 'none'};
`;

const StyledParagraph = styled.p`
    margin: 0 0;
    font-size: 1.25rem;
    font-weight: normal;
`;

const SubHeading = styled.p`
    margin-top: 1rem;
    margin-bottom: 0;
    font-size: 1rem;
    font-weight: normal;
`

//#endregion

export type ProjectInfoProps = {
    glmFileExists: boolean,
    nndFileExists: boolean,
    linkagesFileExists: boolean
}

export const ProjectInfo: FC<ProjectInfoProps> = ({glmFileExists, nndFileExists, linkagesFileExists}: ProjectInfoProps): ReactElement => {
    const session: ISessionContextState = useContext<ISessionContextState>(SessionContext);
    const projectContext: IProjectContextState = useContext<IProjectContextState>(ProjectContext);

    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedNetworkType, setSelectedNetworkType] = useState<SelectableNetworkTypes|undefined>(projectContext.selectedNetworkType);
    const [newProjectDetails, setNewProjectDetails] = useState<IProject|null>(null);
    const [newFileResp, setNewFileResp] = useState<ICheckImportFileResponse|null>(null);
    const [updatedProject, setUpdatedProject] = useState<IProject|null>(null);
    const history = useHistory();

	useEffect(() => {
        // set default network to load as Power
        if (projectContext.selectedNetworkType === undefined) {
            handleLoadPower();
        }
    }, []);

    const handleDetailsUpdate = () => {
        if (projectContext.project) {
            let newProject: IProject = projectContext.project;

            // Update project if project details (name or description) has changed
            if (newProjectDetails) {
                newProject = {...newProjectDetails};
            }

            // Update project if any of the files have changed
            if (newFileResp) {
                projectApi.importNewProject(projectContext.project, newFileResp)
        		.then(project => {
        			if (newFileResp.fileType == "NND") {
        				if (project && project.commsFile && projectContext.project) {
                            newProject = {...projectContext.project, commsFile: project.commsFile}
        				}
        			}
        			else if (newFileResp.fileType == "GLM-JSON") {
        				if (project && project.powerFile && projectContext.project) {
                            newProject = {...projectContext.project, powerFile: project.powerFile}
        				}
        			}
        			else if (newFileResp.fileType == "Linkages") {
        				if (project && project.linkagesFile && projectContext.project) {
        					newProject = {...projectContext.project, linkagesFile: project.linkagesFile}
        				}
        			}
        		})
        		.catch(error => {
        			console.log(error)
        		})	
            }

            projectApi.updateProject(newProject)
            .then((proj) => {
                setUpdatedProject(proj);
            })
        }
                
        setShowDetailsModal(false);
        setNewFileResp(null);
    }

    useEffect(() => {
        if (updatedProject && newProjectDetails) {
            projectContext.setProject(updatedProject);
            session.setProject(updatedProject);
            setNewProjectDetails(null);
        }
    }, [updatedProject])

    const handleLoadComms = () => {
        if (selectedNetworkType !== SelectableNetworkTypes.Communications) {
            setSelectedNetworkType(SelectableNetworkTypes.Communications);
            projectContext.setSelectedNetworkType(SelectableNetworkTypes.Communications);
            history.push("/project/comms-network");
        }
    }

    const handleLoadPower = () => {
        if (selectedNetworkType !== SelectableNetworkTypes.Power) {
            setSelectedNetworkType(SelectableNetworkTypes.Power);
            projectContext.setSelectedNetworkType(SelectableNetworkTypes.Power);
            history.push("/project/power-network");
        }
    }

    const handleLoadCommsCentric = () => {
        if (selectedNetworkType !== SelectableNetworkTypes.CommsCentric) {
            setSelectedNetworkType(SelectableNetworkTypes.CommsCentric);
            projectContext.setSelectedNetworkType(SelectableNetworkTypes.CommsCentric);
            history.push("/project/comms-centric-network");
        }
    }

    const handleLoadPowerCentric = () => {
        if (selectedNetworkType !== SelectableNetworkTypes.PowerCentric) {
            setSelectedNetworkType(SelectableNetworkTypes.PowerCentric);
            projectContext.setSelectedNetworkType(SelectableNetworkTypes.PowerCentric);
            history.push("/project/power-centric-network");
        }
    }

    return (
        <StyledProjectInfo>
            <StyledHeading>
                {projectContext.project?.name}
            </StyledHeading>
            <StyledDetailsButton onClick={() => setShowDetailsModal(!showDetailsModal)}>
                VIEW DETAILS
            </StyledDetailsButton>
            <StyledParagraph>Select Network Type</StyledParagraph>
            <StyledNetworkButton selected={selectedNetworkType === SelectableNetworkTypes.Communications} onClick={handleLoadComms}>
                Comms
            </StyledNetworkButton>
            <StyledNetworkButton selected={selectedNetworkType === SelectableNetworkTypes.Power} onClick={handleLoadPower}>
                Power
            </StyledNetworkButton>
            <SubHeading>Combined Visualizations</SubHeading>
            <StyledNetworkButton selected={selectedNetworkType === SelectableNetworkTypes.CommsCentric} onClick={handleLoadCommsCentric}>
                Comms-Centric View
            </StyledNetworkButton>
            <StyledNetworkButton selected={selectedNetworkType === SelectableNetworkTypes.PowerCentric} onClick={handleLoadPowerCentric}>
                Power-Centric View
            </StyledNetworkButton>
            {/* Project details modal accessed from the 'VIEW DETAILS' button */}
            {showDetailsModal && (
                <Modal
                    title="Project Details"
                    visible={showDetailsModal}
                    closeOnBlur={false}
                    width="50%"
                    height="75%"
                    onClose={() => setShowDetailsModal(false)}
                    onSuccess={handleDetailsUpdate}
                >
                    <ProjectDetailsForm 
                        glmFile={glmFileExists} 
                        nndFile={nndFileExists}
                        linkagesFile={linkagesFileExists}
                        setNewProjectDetails={setNewProjectDetails}
                        setNewFileResp={setNewFileResp}
                    />
                </Modal>
            )}
        </StyledProjectInfo>
    );
};
