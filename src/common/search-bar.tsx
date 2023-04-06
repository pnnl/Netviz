import React, { useState } from "react";
import styled from "styled-components";

export type SearchBarProps = {
    changeFilter: (filter:string) => void;
    filter:string;
}

export const FilterTextbox = (props:SearchBarProps) => {
  const handleChange = (event: any) => {
    props.changeFilter(event.target.value);
  };
  return (
    //<form>
        <Input
          type="text"
          value={props.filter}
          onChange={handleChange}
          placeholder="Search"
          onSubmit={e => {
            e.preventDefault();
          }}
        />

    //</form>
  );
};

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

`;
