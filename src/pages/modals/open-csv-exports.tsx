import React, { FC, ReactElement, useContext, useState } from 'react';
import { SessionContext, ISessionContextState, SelectableNetworkTypes, ProjectContext, IProjectContextState} from '../../context';
import { IPdfResp, nndApi, glmApi, NndEdge, NndNode, GLMNode, GLMEdge, IFileJSONResp} from '../../api';
import { Modal, ActionButton, TypeOfIcon } from 'common';
import styled from 'styled-components';

//#region DEFINE STYLED COMPONENTS
//#endregion

//explicitly lay out possible column names so that we can index metaprops
//with passed list of column names
type GlmColumnNames = "line_number" | "id" | "obj_type" | "file_name" | "name" | 
"from" | "to" | "X_pos" | "Y_pos" | "parent" | "len" | "length" | "weight" | "bustype" | "phases" |
"nominal_voltage"

//We need two types here beceause nodes/edges have different fields in nnd
type NndNodeColumnNames = "nodeName" | "typeName"
type NndEdgeColumnNames =  "toNode" | "fromNode"


type TableProps = {
    data: GLMNode[]|GLMEdge[]|NndNode[]|NndEdge[];
    GlmColumns: GlmColumnNames[]|undefined;
    NndColumns: any[]|undefined;
}


function createCsvJson(netType: SelectableNetworkTypes, objType: string, projectContext: IProjectContextState): any {

    //map columns to table columns, map each element to data to a row, 
    //then index into metaprops and use the populate the columns
    let glmJson = projectContext.glmJson;
    let nndJson = projectContext.nndJson;
    let cols:GlmColumnNames[]|NndNodeColumnNames[]|NndEdgeColumnNames[]|undefined = []

    let data:any = {}
    if(netType == SelectableNetworkTypes.Power){
      if(objType == "node"){
        cols = ["name", "obj_type", "bustype", "phases", "nominal_voltage"]
		if(glmJson){
			data = projectContext.getNodes(SelectableNetworkTypes.Power, null)??[]
		}
      }else{
        if(glmJson){
			data = projectContext.getEdges(SelectableNetworkTypes.Power, null, null, null)??[]
		}
        cols = ["name", "obj_type", "from", "to"]
      }
    }else{
        if(objType == "node"){
            cols = ["nodeName", "typeName"]
            data = projectContext.getNodes(SelectableNetworkTypes.Communications, null)??[]
          }else{
            cols = ["toNode" , "fromNode"]
            data = projectContext.getEdges(SelectableNetworkTypes.Communications, null, null, null)??[]
          }
    }
    let objects:any[] = [];
    let csvJson = {objects}
    data.forEach((network_obj:any) => {
        let new_obj:any = {}
        cols?.forEach(col=>{
            if (netType == SelectableNetworkTypes.Power){
                if(network_obj.meta_props[col] != undefined){
                    new_obj[col] = network_obj.meta_props[col];
                } else if (network_obj.glm_props[col] != undefined){
                    new_obj[col] = network_obj.glm_props[col];
                } else {
                    new_obj[col] = ""
                }
            }else{
                if(objType == "node" && (col == "typeName" || col == "nodeName")){
                    new_obj[col] = network_obj[col]
                }else if(col == "fromNode" || col == "toNode"){
                    new_obj[col] = network_obj[col]
                }
            }
        });
        csvJson.objects.push(new_obj);
    });
    return(csvJson)


}





export type OpenCsvExportModalProps = {
	showCsvModal: boolean;
	setShowCsvModal: (showsCsvModal: boolean) => void;
}

const OpenCsvExports : FC<OpenCsvExportModalProps> = (props: OpenCsvExportModalProps) : ReactElement => {
	const session : ISessionContextState = useContext<ISessionContextState>(SessionContext);
    const projectContext: IProjectContextState = useContext<IProjectContextState>(ProjectContext);
    let time = new Date();
    let timeString = "_"+ time.toLocaleString().replace(/ /g, "_").replace(/:/g, "").replace(/\//g, "").replace(/,/g, "");

	const { setShowCsvModal, showCsvModal } = props;

	const closeExportModal = (evt: React.MouseEvent<HTMLButtonElement> | undefined) => {
		//session.setShowPopUpByName('');
		setShowCsvModal(false);
	}

	const downloadGlmCsvFile = async () => {
		const glmJsonFile = session.selectedProject?.powerFile;
        
        let nodesCsvJson = createCsvJson(SelectableNetworkTypes.Power,"node", projectContext);
        let edgesCsvJson = createCsvJson(SelectableNetworkTypes.Power,"edge", projectContext);
		if (glmJsonFile) {
			const glmPdfResp1 = await glmApi.exportCsv(glmJsonFile, timeString, nodesCsvJson, 'nodes');
            const glmPdfResp2 = await glmApi.exportCsv(glmJsonFile, timeString, edgesCsvJson, 'edges');

			if (glmPdfResp1 && glmPdfResp2) {
				alert("Power network CSVs Downloaded to your computer's 'downloads' folder");
			}
		}
	}

	const downloadNndCsvFile = async () => {
		const commsJsonFile = session.selectedProject?.commsFile;
        
        let nodesCsvJson = createCsvJson(SelectableNetworkTypes.Communications,"node", projectContext);
        let edgesCsvJson = createCsvJson(SelectableNetworkTypes.Communications,"edge", projectContext);
		if (commsJsonFile) {
			const commsPdfResp1 = await nndApi.exportCsv(commsJsonFile, timeString, nodesCsvJson, 'nodes');
            const commsPdfResp2 = await nndApi.exportCsv(commsJsonFile, timeString, edgesCsvJson, 'edges');

			if (commsPdfResp1 && commsPdfResp2) {
				alert("Communication network CSVs Downloaded to your computer's 'downloads' folder");
			}
		}
	}
	
	return (
		<Modal
			title="Open Export Files"
			visible={showCsvModal}
			closeOnBlur={false}
			width="50%"
			height="25%"
			onClose={closeExportModal}
			successButton={false}
			cancelButton={false}
		>
			<div>
				{session.selectedProject?.powerFile && (
					<div>
						<p>Download Power Network CSV?</p>
						<ActionButton
							label="Yes"
							iconType={TypeOfIcon.FileDownload}
							height={24}
							disabled={false}
							onClick={downloadGlmCsvFile}
						/>
					</div>
				)}
				{session.selectedProject?.commsFile && (
					<div>
						<p>Download Communication Network CSV?</p>
						<ActionButton
							label="Yes"
							iconType={TypeOfIcon.FileDownload}
							height={24}
							disabled={false}
							onClick={downloadNndCsvFile}
						/>
					</div>
				)}
			</div>
		</Modal>
	);
};


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

export default OpenCsvExports;