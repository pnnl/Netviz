import { FC, useState, useContext} from 'react';
import styled from 'styled-components';
import {LabeledTextBox} from "../../../common/labeled-textbox";
import {Dropdown, Option} from "../../../common/drop-down";
import {IProjectContextState, ProjectContext} from "../../../context";
import { IFileJSONResp, GLMNode, IGLMObject, IGLMMeta } from "../../../api/glm";


export type ColumnName = "line_number" | "id" | "obj_type" | "file_name" | "name" | 
"from" | "to" | "X_pos" | "Y_pos" | "parent" | "len" | "length" | "weight" | "bustype"


export type ObjEditProps = {
    objId: string|null;
    glmJson?: IFileJSONResp|null;
    setGLMJson: any;
    changeEditObj: any;
}

const ObjEdit: FC<ObjEditProps> = (props: ObjEditProps) => {

    const projectContext: IProjectContextState = useContext<IProjectContextState>(ProjectContext);
    let glmJson = props.glmJson
    let glmJsonNodes= glmJson ? glmJson.glm_json.objects.nodes : []
    let obj = getObj(props)
    if(obj === null){
        return(
        <p>OBJECT NOT FOUND</p>
        )
    }

    const setObjProperty = async (objID: string, propName: string, propValue: any) => {
        if (glmJson != null) {
            const glmJsonNode = getGlmJsonNodeByID(objID);
            if (glmJsonNode && glmJsonNode.meta_props) {
                switch(propName){
                    case "id":
                        glmJsonNode.meta_props["id"] = propValue;
                        break;
                    case "name":
                        glmJsonNode.meta_props["name"] = propValue;
                        props.changeEditObj(propValue)
                        break;
                    case "from":
                        glmJsonNode.meta_props["from"] = propValue;
                        break;
                    case "to":
                        glmJsonNode.meta_props["to"] = propValue;
                        break;
                    case "parent":
                        glmJsonNode.meta_props["parent"] = propValue;
                        break;
                    case "len":
                        glmJsonNode.meta_props["len"] = propValue;
                        break;
                    case "length":
                        glmJsonNode.meta_props["length"] = propValue;
                        break;
                    case "weight":
                        glmJsonNode.meta_props["weight"] = propValue;
                        break;
                    case "bustype":
                        glmJsonNode.meta_props["bustype"] = propValue;
                        break;
                    case "X_pos":
                        glmJsonNode.meta_props["X_pos"] = propValue;
                        break;
                    case "Y_pos":
                        glmJsonNode.meta_props["Y_pos"] = propValue;
                        break;
                    case "line_number":
                        glmJsonNode.meta_props["line_number"] = propValue;
                        break;
                    case "file_name":
                        glmJsonNode.meta_props["file_name"] = propValue;
                        break;
                    case "obj_type":
                        glmJsonNode.meta_props["obj_type"] = propValue;
                }
            }
            props.setGLMJson(glmJson)

            //Write updated glmJson to file
            //await projectContext.writeGlmJson(glmJson);
        }
    };
    
    const getGlmJsonNodeByID = (nodeID: string): IGLMObject|undefined => {
        // will not find nodes by index if no meta_props.name was found
        
        return glmJsonNodes.find((item) => {
            return item.meta_props.name === nodeID;
        });
    };


    return (
        <StyledObjList>
            <StyledTitle>
                {props.objId}
            </StyledTitle>
            {obj && Object.keys(obj.meta_props).map((key:string, index:number) => {
                if (obj && obj?.meta_props && obj.meta_props.name) {
                    const metaAny: any = obj.meta_props;
                    return (
                        propToComponent(key, index.toString(), metaAny[key], setObjProperty, obj.meta_props.name)
                    );
                }
            })}

        </StyledObjList>
    )
}

function getObj(props:ObjEditProps):GLMNode|undefined {
    if(props.glmJson === null || props.glmJson === undefined){
        return undefined;
    }
    //use filter instead
    return props.glmJson?.glm_json.objects.nodes.find(obj => {
        return obj.meta_props.name === props.objId;
    });
}

function propToComponent(metaProp: string, index:string, value: any, onChange: any, objID: string) {
    let nodeTypes = ['Node',
        'Capacitor',
        'Substation',
        'Load',
        'Meter',
        'Triplex Meter',
        'Triplex Node',
        'House'
    ]
    switch(metaProp){
        case "id":
        case "from":
        case "to":
        case "parent":
        case "len":
        case "length":
        case "weight":
        case "bustype":
            return (
                <LabeledTextBox
                    key={index.toString()}
                    label={metaProp}
                    defaultValue = {value}
                    disabled = {false}
                    onTextChange = {onChange}
                />
            )
        case "X_pos":
        case "Y_pos":
        case "line_number":
        case "file_name":
        case "name":
            return (
                <LabeledTextBox
                    key={index.toString()}
                    label={metaProp}
                    defaultValue = {value}
                    disabled = {true}
                    onTextChange = {onChange}
                />
            )
        case "obj_type":
            const [optionValue, setOptionValue] = useState("");
            const handleSelect = (e:any) => {
              onChange(objID, metaProp, e.target.value)
              //setOptionValue(e.target.value);
            };
            return       <Dropdown
            formLabel= {metaProp}
            onChange={handleSelect}
            action="https://jsonplaceholder.typicode.com/posts"
          >
            {
                //Loop through possible obj types and create drop down options, select the one that matches value
                nodeTypes.map((nodeType: string, typeIndex: number) => {
                    if(nodeType === value){
                        return <Option selected value={value} key={typeIndex} />
                    }
                    return (<Option value={nodeType} key={typeIndex}/>);
                })
                
            }

          </Dropdown>
    }
}


export default ObjEdit;

//#region DEFINE STYLED COMPONENTS

const StyledObjList = styled.div`
    display: inline-block;
    width: 100%;
    padding: 0.5rem;
    height: 100%;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.06), 0 0.1875rem 0.25rem rgba(0, 0, 0, 0.06), 0px 0.0625rem 0.3125rem rgba(0, 0, 0, 0.08);
    border: 0.0625rem solid #eeeeee;
    font-family: "Raleway";
    background-color: white;
    opacity: 0.75;
`;

const StyledTitle = styled.p`
font-size: 1.25rem;
line-height: 150%;
margin: 0.0rem;
text-overflow: ellipsis;
width: 8rem;
overflow: hidden;
`;