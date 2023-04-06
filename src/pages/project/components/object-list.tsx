import { FC, useState } from 'react';
import styled from 'styled-components';
import {FilterTextbox} from "../../../common/search-bar";
import {ScrollableTable, GlmColumnNames, NndNodeColumnNames, NndEdgeColumnNames} from "../../../common/scrollable-table";
import { NndEdge, NndNode, GLMNode, GLMEdge } from 'api';
import {SelectableNetworkTypes } from 'context';




const StyledObjList = styled.div`
    display: inline-block;
    width: 100%;
    padding: 0.5rem;
    height: 41%;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.06), 0 0.1875rem 0.25rem rgba(0, 0, 0, 0.06), 0px 0.0625rem 0.3125rem rgba(0, 0, 0, 0.08);
    border: 0.0625rem solid #eeeeee;
    font-family: "Raleway";
    background-color: white;
    opacity: 0.75;
`;

const StyledTitle = styled.p`
font-size: 1.25rem;
line-height: 150%;
word-break: break-word;
margin: 0.0rem;
`;

export type ObjListProps = {
    Title: string;
    objList: GLMNode[]|GLMEdge[]|NndNode[]|NndEdge[];
    glmColumns: GlmColumnNames[];
    nndColumns: NndNodeColumnNames[]|NndEdgeColumnNames[];
    dispColumns: string[];
    rowClick?: (editObj:string|null)=>void;
    netType: SelectableNetworkTypes;
}




const ObjList: FC<ObjListProps> = (props: ObjListProps) => {
    const [filter, setFilter] = useState("");


    const changeFilter = (filter:string) => {
		setFilter(filter)
	}
    
    return (
        <StyledObjList>
            <StyledTitle>{props.Title}</StyledTitle>
            
            <FilterTextbox 
            changeFilter = {changeFilter}
            filter = {filter}
            />

            <ScrollableTable
            data={props.objList}
            GlmColumns={props.glmColumns}
            netType= {props.netType}
            NndColumns = {props.nndColumns}
            dispColumns={props.dispColumns}
            rowClick={props.rowClick}

            filter={filter}
            />

        </StyledObjList>

        
    )
    
}

export default ObjList;