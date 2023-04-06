import { FC } from 'react';
import React from 'react';
import styled from 'styled-components';
import { Colors } from 'theme';

export type CombinedGraphKeyProps = {
    commsCentric?: boolean;
    powerCentric?: boolean
}

export const CombinedGraphKey: FC<CombinedGraphKeyProps> = ({commsCentric = false, powerCentric = false}) => {

    return (
        <StyledKey>
            <StyledHeading>Key:</StyledHeading>
            <div>
                <img src="/node-images/combinedGraphKey.png" height={75} />
                {commsCentric && 
                <StyledText>
                    Represents node in the power network providing power to this communication device
                </StyledText>}
                {powerCentric &&
                <StyledText>
                    Represents communication network device powered by this power node
                </StyledText>}
            </div>
        </StyledKey>
    )
}

const StyledKey = styled.div`
    display: flex;
    flex-direction: column;
	float: right;
    align-items: center;
	background: rgba(255, 255, 255, 0.9);
    border: 0.0625rem solid #eeeeee;
    box-sizing: border-box;
    box-shadow: 0 0.25rem 0.25rem rgba(0, 0, 0, 0.04);
    border-radius: 0.5rem;
    font-family: "Raleway";
    padding: 1rem;
	position: relative;
    top: 1.5rem;
    right: 18rem;
`;

const StyledHeading = styled.div`
    font-size: 20px;
    font-weight: 600;
    color: ${Colors.GrayTitle};
    display: inline-block;
    margin: 0;
    font-family: "Raleway";
`;

const StyledFlexBox = styled.div`
    display: flex;
`;

const StyledText = styled.div`
    width: 200px;
`;