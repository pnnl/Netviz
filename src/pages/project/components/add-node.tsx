import { FC } from 'react';
import styled, { css } from 'styled-components';
import { GLMNodeTypes, GLMNodeType, NndNodeType, NndNodeTypes } from "common";

//#region DEFINE STYLED COMPONENTS

type StyledAddNodesPanelProp = { widthInRem: number; }

const StyledAddNodesPanel = styled.div<StyledAddNodesPanelProp>`
    display: inline-block;
    width: ${props => props && props.widthInRem ? props.widthInRem : 22}rem;
    height: 5rem;
    border-radius: 0.5rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.06), 0 0.1875rem 0.25rem rgba(0, 0, 0, 0.06), 0px 0.0625rem 0.3125rem rgba(0, 0, 0, 0.08);
    border: 0.0625rem solid #eeeeee;
    font-family: "Raleway";
    margin: 1.25rem;
    border: 0.25rem solid transparent;
    background-color: white;
    opacity: 0.75;
`;

const StyledToolTip = styled.p`
    visibility: hidden;
    display: inline-block;
    position: absolute;
    bottom: 26px;

    color: transparent;
    background-color: transparent;

    width: 100px;
    height: 25px;

    text-align: center;
    border-radius: 6px;

    transition: visibility 0.5s, color 0.5s, background-color 0.5s, width 0.5s, padding 0.5s ease-in-out;
`;

type StyledNodeButtonProp = { selected: boolean; }

const StyledNodeButton = styled.div<StyledNodeButtonProp>`
    display: inline-block;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.5rem;

    display: table-cell;
    text-align: center;
    vertical-align: middle;

    border: 0.0625rem solid #eeeeee;
    font-family: "Raleway";
    border: 0.25rem transparent;    
    margin: 0.25rem;

    ${props => props && props.selected &&
        css`
            opacity: 1.0;
            background-color: #1d70f3;
    `}

    &:hover{
        cursor: pointer;
        ${props => props && !props.selected &&
            css`
                opacity: 0.75;
                background-color: #1d70f3;
        `}
    }
`;

const StyledTitle = styled.p`
    font-size: 1.25rem;
    line-height: 150%;
    height: 60%;
    word-break: break-word;
    overflow-y: auto;
    margin: 0 2rem 1.5rem 1.5rem;
`;

const StyledNodeType = styled.div`
    position: relative;
    bottom: 40px;
    left: 16px;

    display: inline-block;
    width: 2.5rem;
    height: 2.5rem;

    & ${StyledNodeButton}:hover + ${StyledToolTip} {
        visibility: visible;
        color: #fff;
        background-color: rgba(0, 0, 0, 0.8);
        width: 120px;
    }
`;

//#endregion

export type AddNodeCardProps = {
    changeGlmNodeType?: (newNodeType:GLMNodeType|null) => void;
    selectedGlmNodeType?: GLMNodeType|null;
    changeNndNodeType?: (newNodeType:NndNodeType|null) => void;
    selectedNndNodeType?: NndNodeType|null;
    onClick: React.MouseEventHandler<HTMLDivElement>;
    widthInRems: number;
}

export type NodeTypeButton = {
    type:GLMNodeType;
    onClick: React.MouseEventHandler<HTMLDivElement>;
}

const AddNodeCard: FC<AddNodeCardProps> = (props: AddNodeCardProps) => {
    const {
        changeGlmNodeType, 
        selectedGlmNodeType, 
        changeNndNodeType,
        selectedNndNodeType,
        widthInRems,
    } = props

    return (
        <StyledAddNodesPanel widthInRem={widthInRems}>
            <StyledTitle>Click to add node</StyledTitle>
            {changeGlmNodeType !== undefined && selectedGlmNodeType !== undefined &&
            GLMNodeTypes.map((nodeType, index) => {
                const isSelectedType = props.selectedGlmNodeType?.label === nodeType.label;

                return (
                    <StyledNodeType key={index}>
                        <StyledNodeButton selected={isSelectedType} onClick={() => changeGlmNodeType(isSelectedType ? null : nodeType)}>
                            {isSelectedType ? nodeType.getIcon() : nodeType.getIcon('white')}
                        </StyledNodeButton>
                        <StyledToolTip>
                            {nodeType.label}
                        </StyledToolTip>
                    </StyledNodeType>
                );
            })}
            {changeNndNodeType !== undefined && selectedNndNodeType !== undefined &&
            NndNodeTypes.map((nodeType, index) => {
                const isSelectedType = selectedNndNodeType?.label === nodeType.label;

                return (
                    <StyledNodeType key={index}>
                        <StyledNodeButton selected={isSelectedType} onClick={() => changeNndNodeType(isSelectedType ? null : nodeType)}>
                            {nodeType.getIcon()}
                        </StyledNodeButton>
                        <StyledToolTip>
                            {nodeType.label}
                        </StyledToolTip>
                    </StyledNodeType>
                );
            })}
        </StyledAddNodesPanel>
    );
}

export default AddNodeCard;