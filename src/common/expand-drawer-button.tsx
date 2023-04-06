import { FC } from 'react';
import styled from 'styled-components';

const StyledDrawerButton = styled.div`
    align-items: center;
    justify-content: center;

    width: 5rem;
    border-radius: 0.5rem;
    position: sticky;
    float: right;

    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.06), 0 0.1875rem 0.25rem rgba(0, 0, 0, 0.06), 0px 0.0625rem 0.3125rem rgba(0, 0, 0, 0.08);

    border: 0.15rem solid;
    font-family: "Raleway";
    margin: 0.5rem 16rem;

    background-color: #FFFFFF;
    &:hover{
        cursor: pointer;
    }
`;

export type DrawerButtonProps = {
    onClick: React.MouseEventHandler<HTMLDivElement>;
}
  
const DrawerButton: FC<DrawerButtonProps> = (props: DrawerButtonProps) => {
    return (
        <StyledDrawerButton onClick={props.onClick}>
            &lt;
        </StyledDrawerButton>
    )
}

export default DrawerButton