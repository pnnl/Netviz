import React, { FC, useState } from 'react';
import styled from 'styled-components';
import { Colors } from 'theme';


export const MoveNodesCard: FC = () => {
    const [open, setOpen] = useState<boolean>(true);

    if (open === false) {
        return (
            <StyledMinimizedCard>
                <StyledButton onClick={() => setOpen(!open)}><img src="/node-images/add.png" height="20" /></StyledButton>
            </StyledMinimizedCard>
        )
    }
    return (
        <StyledCard>
            <StyledTitle>Moving nodes</StyledTitle>
            <StyledButton onClick={() => setOpen(!open)} style={{marginLeft: "auto"}}><img src="/node-images/minimize-sign.png" height="20" /></StyledButton>
            <div>
                Nodes may appear grouped together and/or on top of each other.
                Click and hold on any node to move it wherever you please. 
                Node positions will be saved. 
            </div>
        </StyledCard>
    )
}

const StyledButton = styled.button`
    border: none;
    border-radius: 4px;
    background-color: ${Colors.AltDisabled};
    padding: 5px;
`;

const StyledCard = styled.div`
    position: absolute;
    top: 330px;
    left: 20px;
    background: rgba(255, 255, 255, 0.9);
    border: 0.0625rem solid #eeeeee;
    box-sizing: border-box;
    box-shadow: 0 0.25rem 0.25rem rgba(0, 0, 0, 0.04);
    border-radius: 0.5rem;
    font-family: "Raleway";
    padding: 1rem 1rem 1rem 1.5rem;
    width: 300px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
`;

const StyledMinimizedCard = styled.div`
    position: absolute;
    top: 330px;
    left: 20px;
    background: rgba(255, 255, 255, 0.9);
    border: 0.0625rem solid #eeeeee;
    box-sizing: border-box;
    box-shadow: 0 0.25rem 0.25rem rgba(0, 0, 0, 0.04);
    border-radius: 0.5rem;
    font-family: "Raleway";
    width: 60px;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
`

const StyledTitle = styled.p`
    font-size: 1.25rem;
    height: 60%;
    word-break: break-word;
    overflow-y: auto;
    margin-bottom: 0.5rem;
    margin-top: 0;
    color: #515151;
`;