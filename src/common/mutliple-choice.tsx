import { FC } from 'react';
import styled from 'styled-components';


export type MultipleChoiceProps = {
    formLabel: any;
    choices: any[];
    onChange: any;
    preSelected?: any;
};


export const MultipleChoice: FC<MultipleChoiceProps> = (props: MultipleChoiceProps) => {
    const {
        formLabel,
        choices,
        onChange,
        preSelected
    } = props;

    const handleChange = (event: any) => {
        onChange(event.target.id);
    };

    return (
        <MultipleChoiceWrapper onChange={handleChange}>
            <StyledLabel>{formLabel}</StyledLabel>
            {preSelected ?
                Object.keys(preSelected).map((choice) => {
                    return (
                        <StyledLabel key={choice}>
                            <StyledInput type="checkbox" id={choice} defaultChecked={preSelected[choice]}/>{choice}
                        </StyledLabel>
                    );
                })
            :
                choices.map((choice) => {
                    return (
                        <StyledLabel key={choice}>
                            <StyledInput type="checkbox" id={choice}/>{choice}
                        </StyledLabel>
                    );
                })
            }
        </MultipleChoiceWrapper>
    );
};


//#region DEFINE STYLED COMPONENTS

const MultipleChoiceWrapper = styled.form`
    display: flex;
    flex-flow: column;
    justify-content: flex-start;
    margin-bottom: 1rem;
`;

const StyledLabel = styled.label`
    word-wrap:break-word
`;

const StyledInput = styled.input`

`;

//#endregion