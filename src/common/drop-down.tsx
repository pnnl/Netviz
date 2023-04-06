import { FC, ReactElement } from "react";
import styled from "styled-components";


export type DropdownProps = {
  action: any;
  onChange: any;
  formLabel: any;
  value?: any;
  children: ReactElement<any>[]|ReactElement<any>;
};

export type OptionProps = {
  value: any;
  label?: any;
  selected?: boolean;
};


export const Dropdown: FC<DropdownProps> = (props: DropdownProps) => {
  return (
    <DropdownWrapper action={props.action} onChange={props.onChange}>
      <StyledLabel>{props.formLabel}</StyledLabel>
      <StyledSelect defaultValue={props.value ?? null}>
        {props.children}
      </StyledSelect>
    </DropdownWrapper>
  );
};

export const Option: FC<OptionProps> = (props: OptionProps) => {
  return <StyledOption selected={props.selected} value={props.value}>{props.label ? props.label : props.value}</StyledOption>;
};


//#region DEFINE STYLED COMPONENTS

export const DropdownWrapper = styled.form`
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  height: 1.5rem;
  margin-bottom: 2rem;


`;

export const StyledSelect = styled.select`
  max-width: 90%;
  height: 1.5rem;
  border: 2px solid #aaa;
  font-size: 16px;
  border-radius: 4px;

  margin-bottom: 1rem;

`;

export const StyledOption = styled.option`
  height: 1.5rem;

  color: ${(props) => (props.selected ? "lightgrey" : "black")};
`;

export const StyledLabel = styled.label`
  margin-bottom: 0.4rem;
`;

//#endregion