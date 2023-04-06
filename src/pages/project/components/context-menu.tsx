import { FC } from "react";
import styled from "styled-components";
import { ActionButton } from "common/buttons";


export type ContextMenuProps = {
    isOpen: boolean;
    x: number|null;
    y: number|null;
    onEdit: any;
    onRemove: any;
};

const ContextMenu: FC<ContextMenuProps> = (props: ContextMenuProps) => {
    const { isOpen, x, y, onEdit, onRemove} = props

    return (
        <StyledContextMenu isOpen={isOpen} x={x} y={y}>
            <ActionButton label="Edit" onClick={onEdit} height={20} />
            <ActionButton label="Remove" onClick={onRemove} height={20} />
        </StyledContextMenu>
    );
};


//#region DEFINE STYLED COMPONENTS

type StyledContextMenuProps = {
    isOpen: boolean;
    x: number|null;
    y: number|null;
};

const StyledContextMenu = styled.div<StyledContextMenuProps>`
    position: absolute;
    padding: 4px;
    z-index: 1000;
    top: ${props => props.y ? props.y:0}px;
    left: ${props => props.x ? props.x:0}px;
    border: 1px solid grey;
    border-radius: 7px;
    box-sizing: border-box;
    box-shadow: 2px 2px;
    fill: white;
    background-color: white;
    visibility: ${props => props.isOpen ? "visible":"hidden"};
    display: ${props => props.isOpen ? "block":"none"};
    & button {
        display: block;
        width: 100%;
    }
`;

//#endregion

export default ContextMenu;