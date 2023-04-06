import { FC } from 'react';
import styled, { css } from 'styled-components';

export enum DrawerPosition {
    Right = 'right',
    Left = 'left',
}

export type DrawerProps = {
    isOpen: boolean;
    width: number;
    position: DrawerPosition;
    children: React.ReactElement<any>[]|React.ReactElement<any>;
}

const SideDrawer: FC<DrawerProps> = (props:DrawerProps) => {
    const { isOpen, width, position, children } = props;

    return(
        <StyledDrawer isOpen={isOpen} position={position} width={width}>
            {children}
        </StyledDrawer>
    )
};

export default SideDrawer

//#region DEFINE STYLED COMPONENTS

type StyledDrawerProps = {
	width?: number;
	position: DrawerPosition;
    isOpen: boolean;
}

const StyledDrawer = styled.div<StyledDrawerProps>`
    font-family: Raleway;
    height: 100vh;
    width: ${props => props.width ? `${props.width}px` : '300px'};
    transition: all 0.3s ease-in-out;
    transform: ${props => props.width ? `translate(${props.width + 20}px)` : 'translate(300px)'};
    position: fixed;
    background: #FFFFFF;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.06), 0 0.1875rem 0.25rem rgba(0, 0, 0, 0.06), 0px 0.0625rem 0.3125rem rgba(0, 0, 0, 0.08);
    
    ${props => props && props.position &&
        css`${props.position.toString()}: 0;`
    }

    ${props => props && props.isOpen &&
        css`transform: translate(0);`
    }
`;

//#endregion