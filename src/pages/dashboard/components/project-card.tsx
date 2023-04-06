import { FC, useContext } from 'react';
import { useHistory } from "react-router-dom";
import styled from 'styled-components';
import { IconAsSvg, TypeOfIcon } from 'common';
import { Colors } from 'theme';
import { SessionContext, ISessionContextState } from 'context';
import { IProject, projectApi } from "api";

//#region DEFINE STYLED COMPONENTS

const StyledCard = styled.div`
    display: inline-block;
    width: 31.5rem;
    height: 20rem;
    border-radius: 0.5rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.06), 0 0.1875rem 0.25rem rgba(0, 0, 0, 0.06), 0px 0.0625rem 0.3125rem rgba(0, 0, 0, 0.08);
    border: 0.0625rem solid #eeeeee;
    font-family: "Raleway";
    margin-top: 1.25rem;
    margin-bottom: 1.25rem;
    border: 0.25rem solid transparent;
    &:hover {
        border: 0.25rem solid #1d70f3;
        cursor: pointer;
    }
`;

const StyledProjectName = styled.h2`
    color: #1d70f3;
    font-weight: 600;
    font-size: 2rem;
    line-height: 2.375rem;
    margin: 1.5rem 0 0.5rem 2rem;
`;

const StyledDateTime = styled.p`
    font-size: 1rem;
    line-height: 150%;
    color: #696969;
    margin: 0 2rem 1.5rem 2rem;
`;

const StyledDescription = styled.p`
    font-size: 1rem;
    line-height: 150%;
    color: #696969;
    height: 60%;
    word-break: break-word;
    overflow-y: auto;
    margin: 0 2rem 1.5rem 2rem
`;

const StyledButton = styled.button`
    border: none;
    background: none;
    position: relative;
    bottom: 19rem;
`

//#endregion

export type ProjectCardProps = {
    project: IProject;
    title: string;
    modified: Date;
    description: string;
    onClick: React.MouseEventHandler<HTMLDivElement>;
    setProjectDeleted: (del: boolean) => void;
}

const formatModifiedDateTime = (modifiedDate: Date) => {
    const properDate = new Date(modifiedDate);
    const hours = properDate.getHours();
    const minutes = properDate.getMinutes();
    const day = String(properDate.getDate()).padStart(2, "0");
    const month = String(properDate.getMonth() + 1).padStart(2, "0");
    const year = String(properDate.getFullYear()).slice(2)

    return `${hours}:${minutes} ${month}/${day}/${year}`
}

const ProjectCard: FC<ProjectCardProps> = (props: ProjectCardProps) => {
    const { project, title, modified, description, onClick, setProjectDeleted } = props;
    const session : ISessionContextState = useContext<ISessionContextState>(SessionContext);

    const removeProject = () => {
        session.removeProject(project);
        projectApi.deleteProject(project);
        setProjectDeleted(true);
    }

    return (
        <div>
            <StyledCard onClick={onClick}>
                <StyledProjectName>{title}</StyledProjectName>
                <StyledDateTime>Last saved {formatModifiedDateTime(modified)}</StyledDateTime>
                <StyledDescription>{description}</StyledDescription>
            </StyledCard>
            <StyledButton onClick={removeProject}>
                <IconAsSvg iconType={TypeOfIcon.Delete} color={Colors.ButtonBlue} sizePx={24}/>
            </StyledButton>
        </div>
    )
}

export default ProjectCard;