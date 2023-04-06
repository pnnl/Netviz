
import React from "react";
import { render } from "react-dom";
import { FC, useState, useContext} from 'react';
import styled from 'styled-components';
import { IFileJSONResp, GLMObject, IGLMObject } from "api/glm";
import { cpuUsage } from "process";
import { NndEdge, NndNode, GLMNode, GLMEdge } from 'api';
import { SessionContext, ISessionContextState, IProjectContextState, ProjectContext, SelectableNetworkTypes} from 'context';
import { PowerCanvas } from "pages/project/components";
import { MoveToOptions } from "vis-network";



//explicitly lay out possible column names so that we can index metaprops
//with passed list of column names
export type GlmColumnNames = "line_number" | "id" | "obj_type" | "file_name" | "name" | 
"from" | "to" | "X_pos" | "Y_pos" | "parent" | "len" | "length" | "weight" | "bustype" | "phases" |
"nominal_voltage"

//We need two types here beceause nodes/edges have different fields in nnd
export type NndNodeColumnNames = "nodeName" | "typeName"
export type NndEdgeColumnNames =  "toNode" | "fromNode"


export type TableProps = {
    data: GLMNode[]|GLMEdge[]|NndNode[]|NndEdge[];
    netType: SelectableNetworkTypes;
    GlmColumns: GlmColumnNames[]|undefined;
    NndColumns: any[]|undefined;


    
    //columns names that are shown on table
    dispColumns: string[];

    //the listKey maps the search box to the scrollable table
    filter: string;
    rowClick?: (editObj:string|null)=>void;
}

export const ScrollableTable: FC<TableProps> = (props: TableProps) => {
    //map columns to table columns, map each element to data to a row, 
    //then index into metaprops and use the populate the columns
    const projectContext: IProjectContextState = useContext<IProjectContextState>(ProjectContext);

    let cols:GlmColumnNames[]|NndNodeColumnNames[]|NndEdgeColumnNames[]|undefined = []

    if(props.netType == SelectableNetworkTypes.Power){
      cols = props.GlmColumns
    }else{
      cols = props.NndColumns
    }

    let filteredData:GLMNode[]|GLMEdge[]|NndNode[]|NndEdge[] = filter(props, props.filter, cols);


    const zoomToNode = (nodeName:string) => {
      var activeNet = undefined
      if(projectContext.selectedNetworkType == SelectableNetworkTypes.Power){
        var pos = projectContext.powerNetwork?.getPosition(nodeName);
        activeNet = projectContext.powerNetwork
      }else if(projectContext.selectedNetworkType == SelectableNetworkTypes.PowerCentric){
        var pos = projectContext.powerCentricNetwork?.getPosition(nodeName);
        activeNet = projectContext.powerCentricNetwork
      }else if(projectContext.selectedNetworkType == SelectableNetworkTypes.Communications){
        var pos = projectContext.commsNetwork?.getPosition(nodeName);
        activeNet = projectContext.commsNetwork
      }else if(projectContext.selectedNetworkType == SelectableNetworkTypes.CommsCentric){
        var pos = projectContext.commsCentricNetwork?.getPosition(nodeName);
        activeNet = projectContext.commsCentricNetwork
      }

      if(pos != undefined && activeNet != undefined){
        var x = pos?.x
        var y = pos?.y

        var moveToOptions:MoveToOptions = {
            position: {x:x, y:y},    // position to animate to (Numbers)
            scale: 1.0,              // scale to animate to  (Number)
            offset: {x:0, y:0},      // offset from the center in DOM pixels (Numbers)
            animation: {             // animation object, can also be Boolean
              duration: 1000,                 // animation duration in milliseconds (Number)
              easingFunction: "easeInOutQuad" // Animation easing function, available are:
            }                                   // linear, easeInQuad, easeOutQuad, easeInOutQuad,
        }
        activeNet.moveTo(moveToOptions)

      }
    };
    
    function handleRowClick(obj: GLMEdge|GLMNode|NndEdge|NndNode){
      {
        let obj_id = null
        if(obj instanceof GLMEdge || obj instanceof GLMNode) {
          obj_id = obj.meta_props['name'] ?? null
        }
    
        else {
          console.log(obj)
          let newObj:any = obj
          obj_id = newObj.nodeName ?? null
        }
        if(obj_id != null && (obj instanceof GLMNode || obj instanceof NndNode)){
          zoomToNode(obj_id);
        }
        //props.rowClick(obj_id);
      }   
    }

    return (

    <StyledTable>
        <div className="tableFixHead">
          <table>
            <thead>
              <tr>
              {props.dispColumns.map((column, index) => {
                return (
                    <th key={index.toString()}>{column}</th>
                );
                })}
              </tr>
            </thead>
            <tbody>

                {filteredData.map((obj, index) => {
                return (
                    <StyledTableRow key={index.toString()}
                      onClick={() => handleRowClick(obj)}
                    >
                    {
                      cols?.map((column, index) => {

                        if((obj instanceof GLMEdge || obj instanceof GLMNode) && (column !== "fromNode" && column!== "toNode" && column!== "typeName" && column!== "nodeName")){
                          if(column in obj.meta_props){
                            return(
                              <td key={index.toString()}>{obj.meta_props[column]}</td>
                            )
                          } else if (column in obj.glm_props){
                            return(
                              <td key={index.toString()}>{obj.glm_props[column]}</td>
                            )
                          } else {
                            return(
                              <td key={index.toString()}>{""}</td>
                            )                      
                          }

                        } else if (obj instanceof NndNode && (column == "typeName" || column == "nodeName")) {
                          return(
                              <td key={index.toString()}>{obj[column]}</td>
                          )
                        } else if (obj instanceof NndEdge && (column == "fromNode" || column == "toNode")) {
                            return(
                                <td key={index.toString()}>{obj[column]}</td>
                            )
                        } 
                      })
                    }</StyledTableRow>
                );
                })}
            </tbody>
          </table>
        </div>
    </StyledTable>


    );
}


function filter(props:TableProps, filter:string, cols: GlmColumnNames[]|NndEdgeColumnNames[]|NndNodeColumnNames[]|undefined) {
    let filteredData:any[] = [];
    filter = filter.toLowerCase();
    props.data.map((obj, index) => {
        //this is used to prevent duplicate objects from being added 
        let objAdded:Boolean = false;
        cols?.map((column, index) => {

          let val = undefined
          if(obj instanceof GLMEdge || obj instanceof GLMNode){
            //this check is used to prevent typescript errors, possibly better way to do this.
            if(column !== "fromNode" && column!== "toNode" && column!== "typeName" && column!== "nodeName"){
              val = obj.meta_props[column]
            }
          }else if (obj instanceof NndNode && (column == "typeName" || column == "nodeName")) {
            val = obj[column]
          } else if (obj instanceof NndEdge && (column == "fromNode" || column == "toNode")) {
            val = obj[column]
          } 

          if(val != undefined){
              val = String(val)
              val = val.toLowerCase()
              if(val.includes(filter) && !objAdded){
                  filteredData.push(obj)
                  objAdded = true;
              }
          }
          })    
    })

    return filteredData
}


//#region DEFINE STYLED COMPONENTS

const StyledTable = styled.div`

.tableFixHead {
    overflow-y: auto;
    border-radius: 0.5rem;
    width: 90%;

  
    /*TODO: remove hardcoding*/
    height: 290px;
    border: 1px solid #ccc;

  
  }
  .tableFixHead thead th {
    border: 1px solid #ccc;
    position: sticky;
    top: 0;
  }
  
  table {
    border-collapse: collapse;
  
  }
  th,
  td {
    white-space: nowrap;
    font-size: 10px;
    padding: 0.2rem 0.5rem;
    border: 1px solid #ccc;
  }
  th {
    font-size: 14px;
  
    background: #eee;
    border: 1px solid #ccc;
  
  }  
`;

const StyledTableRow = styled.tr`
  cursor: pointer;

`;


