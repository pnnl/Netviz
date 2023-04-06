import { FC, useEffect, useState } from "react";
import styled from "styled-components";

export type TextBoxProps = {
    label: string;
    defaultValue?: string;
    disabled?: boolean;
    onTextChange: any;
}

export const LabeledTextBox: FC<TextBoxProps> = (props:TextBoxProps) => {
  const [curText, setCurText] = useState<string>(props.defaultValue ?? "");

  const handleChange = (event: any) => {
    props.onTextChange(event.target.value);
    setCurText(event.target.value);
  };

  return (
    <div>
        <StyledLabel>{props.label}</StyledLabel>
        <Input
          type="text"
          defaultValue={curText}
          onChange={handleChange}
          onSubmit={e => {
            e.preventDefault();
          }}
          disabled={props.disabled}
        />
    </div>
  );
};

const StyledLabel = styled.p`
font-size: 1.0rem;
line-height: 150%;
word-break: break-word;
margin: 0.0rem;
`;

const Input = styled.input`
  height: 1.5rem;
  font-size: 16px;
  margin: 10 auto;
  margin-bottom: 10px;

  width: 90%;
  border: 2px solid #aaa;
  border-radius: 4px;
  outline: none;
  box-sizing: border-box;
  padding-left: 5px;
  cursor: text;

  &:focus {
    border-color: dodgerBlue;
    box-shadow: 0 0 8px 0 dodgerBlue;
  }
  &:disabled{
    color: #CCCCCC;
    border: 1px solid #CCCCCC;
    cursor: default;
  }

`;
