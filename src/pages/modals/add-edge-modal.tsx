import React, { FC, ReactElement, useContext, useEffect, useState } from 'react';
import { Modal } from 'common';
import { IProjectContextState, ProjectContext, SelectableNetworkTypes } from 'context';
import { NndNode, GLMNode, NndEdge, GLMEdge, nndApi, glmApi } from 'api';
import { Edge } from 'vis-network';
import styled from 'styled-components';


export type AddEdgeModalProps = {
    showModal: boolean;
    setShowModal: (showModal: boolean) => void;
    fromNode: NndNode|GLMNode|null;
    networkType: SelectableNetworkTypes;
    toNode: NndNode|GLMNode|null;
    nodeData: Edge;
    edgeType?: string;
    callback: (params?: any) => void;
    setInAddEdgeModeCallback: (mode: boolean) => void;
    setEdgeAdded?: (added: boolean) => void;
}

const headerStyle = {
    marginTop: "0",
    marginBottom: "5px"
};

const AddEdgeModal : FC<AddEdgeModalProps> = (props: AddEdgeModalProps) : ReactElement => {
    const projectContext: IProjectContextState = useContext<IProjectContextState>(ProjectContext);
    let { 
        showModal, 
        setShowModal, 
        fromNode, 
        networkType, 
        toNode,
        nodeData,
        edgeType,
        callback,
        setInAddEdgeModeCallback,
        setEdgeAdded
    } = props;
    const [newNndEdge, setNewNndEdge] = useState<NndEdge|null>(null);
    const [newGlmEdge, setNewGlmEdge] = useState<GLMEdge|null>(null);
    const [selectedSubnet, setSelectedSubnet] = useState<string>("");
    const [edgeLoopError, setEdgeLoopError] = useState<boolean>(false);
    const [switchEdgeError, setSwitchEdgeError] = useState<boolean>(false);
    const [nodeEdgeError, setNodeEdgeError] = useState<boolean>(false);
    const [maxNodesError, setMaxNodesError] = useState<boolean>(false);
    const [duplicateEdgeError, setDuplicateEdgeError] = useState<boolean>(false);

    const closeModal = (evt: React.MouseEvent<HTMLButtonElement> | undefined) => {
        setNewGlmEdge(null);
        setNewNndEdge(null);
		setShowModal(false);
	}
    
    const createNewEdge = (evt: React.MouseEvent<HTMLButtonElement> | undefined) => {
        let edgeAdded;
        switch(networkType) {
            case(SelectableNetworkTypes.Communications):
                if (newNndEdge) {

                    try{
                        edgeAdded = projectContext.addEdge(networkType, newNndEdge, selectedSubnet)
                    }
                    catch {
                        setMaxNodesError(true);
                    }
                }
        
                if (edgeAdded && projectContext.commsNetwork && setEdgeAdded) {
                    callback(newNndEdge?.getNetworkEdge());
                    projectContext.commsNetwork.disableEditMode();
                    setInAddEdgeModeCallback(false);
                    setEdgeAdded(true);
                    setNewNndEdge(null);
                }
                break;
            case(SelectableNetworkTypes.Power):
                if (newGlmEdge) {
                    edgeAdded = projectContext.addEdge(networkType, newGlmEdge);
                }

                if (edgeAdded && projectContext.powerNetwork) {
                    callback(newGlmEdge?.getNetworkEdge());
                    projectContext.powerNetwork.disableEditMode();
                    setInAddEdgeModeCallback(false);
                    setNewGlmEdge(null);
                }
                break;
            default:
                break;
        }
        setShowModal(false);
    }

    const updateNndEdge = (event: any) => {
        switch(event.target.name) {
            case("label"):
                const newLabel = event.target.value;
                if (newNndEdge !== null) {
                    const updatedNndEdge = newNndEdge;
                    updatedNndEdge.label = newLabel;
                    setNewNndEdge(updatedNndEdge)
                }
                break;
            default:
                break;
        }
    }

    const updateGlmEdge = (event : any) => {
        let updatedGlmEdge = newGlmEdge;

        switch(event.target.id) {
            case("name"):
                if (updatedGlmEdge !== null) {
                    updatedGlmEdge.meta_props.name = event.target.value;
                }
                setNewGlmEdge(updatedGlmEdge);
                break;
            case("type"):
                if (updatedGlmEdge !== null) {
                    updatedGlmEdge.meta_props.obj_type = event.target.value;
                }
                setNewGlmEdge(updatedGlmEdge);
                break;
            case("line-number"):
                if (updatedGlmEdge !== null) {
                    updatedGlmEdge.meta_props.line_number = event.target.value;
                }
                setNewGlmEdge(updatedGlmEdge);
                break;
            case("file-name"):
                if (updatedGlmEdge !== null) {
                    updatedGlmEdge.meta_props.file_name = event.target.value;
                }
                setNewGlmEdge(updatedGlmEdge);
                break;
            default:
                break;
        }
    }

    useEffect(() => {
        if (fromNode !== null && toNode !== null) {
            if (fromNode instanceof NndNode && toNode instanceof NndNode && projectContext.nndJson) {
                let existingEdges = projectContext.getEdges(SelectableNetworkTypes.Communications, null, fromNode.nodeName, toNode.nodeName);
                if (existingEdges && existingEdges.length > 0) {
                    setDuplicateEdgeError(true);
                    return;
                }
                else if (Object.keys(fromNode.applications).includes("switch") && Object.keys(toNode.applications).includes("switch")) {
                    setSwitchEdgeError(true);
                    return;
                }
                else if (!Object.keys(fromNode.applications).includes("switch") && !Object.keys(toNode.applications).includes("switch")) {
                    setNodeEdgeError(true);
                    return;
                }
                else {
                    setSwitchEdgeError(false);
                    setNodeEdgeError(false);
                    setDuplicateEdgeError(false);
                }
                //this assumes user will not put direct edge between two switches or between two nodes
                let switchNode = fromNode
                if(Object.keys(toNode.applications).includes("switch")){
                    switchNode = toNode       
                }

                setSelectedSubnet(nndApi.getSubnetFromSwitch(projectContext.nndJson.nnd_json, switchNode.nodeName));

                const subnetInfo = {
                    subnetName: selectedSubnet
                }

                const newNndEdge = nndApi.createNndEdge(nodeData, fromNode, toNode, subnetInfo);
                if (newNndEdge !== null) setNewNndEdge(newNndEdge);
            }
            else if (fromNode instanceof GLMNode && toNode instanceof GLMNode) {
                let existingEdges = projectContext.getEdges(SelectableNetworkTypes.Power, null, fromNode.meta_props.name ?? null, toNode.meta_props.name ?? null);
                if (existingEdges && existingEdges.length > 0) {
                    setDuplicateEdgeError(true);
                    return;
                }
                else {
                    setDuplicateEdgeError(false);
                }

                const newGlmEdge = glmApi.createGlmEdge(nodeData, edgeType ?? "line");
                if (newGlmEdge !== null && newGlmEdge !== undefined) setNewGlmEdge(newGlmEdge);
            }
        }
    }, [fromNode, toNode])

    return (
        
        <Modal
            title="Add New Edge"
            visible={showModal}
            closeOnBlur={false}
            width="40%"
            height="70%"
            onClose={closeModal}
            onSuccess={createNewEdge}
            disableSuccess={edgeLoopError || switchEdgeError || nodeEdgeError || maxNodesError || duplicateEdgeError}
        >
            <hr/>

            {edgeLoopError &&
            <StyledError>
                Error: The source node and destination node cannot be the same node.
            </StyledError>}

            {switchEdgeError &&
            <StyledError>
                Error: In order to create an edge between two switches, they must exist in the same subnet.
            </StyledError>}

            {nodeEdgeError &&
            <StyledError>
                Error: The ability to connect two nodes without a switch is not supported. Each node must be connected to at least one switch.
            </StyledError>}

            {maxNodesError &&
            <StyledError>
                Error: You have reached the maximum number of nodes and IP addresses allowed for the subnet.
            </StyledError>}

            {duplicateEdgeError &&
            <StyledError>
                Error: An edge already exists between these nodes.
            </StyledError>}

            <h3 style={headerStyle}>
                Source Node
            </h3>
            <div style={{height: "1.5rem"}}>
                <span style={{float: "left"}}>Name</span>
                <span style={{float: "right"}}>
                    {fromNode !== null ? (fromNode instanceof NndNode ? fromNode.nodeName : fromNode.meta_props.name) : ""}
                </span>
            </div>
            <h3 style={headerStyle}>
                Destination Node
            </h3>
            <div style={{height: "1.5rem"}}>
                <span style={{float: "left"}}>Name</span>
                <span style={{float: "right"}}>
                    {toNode !== null ? (toNode instanceof NndNode ? toNode.nodeName : toNode.meta_props.name) : ""}
                </span>
            </div>
            <hr/>
            {networkType === SelectableNetworkTypes.Communications ?
            <form style={{marginBottom: "1rem"}}>
                <label>
                    Label:
                    <input 
                        name="label"
                        className="field-input"
                        type="text"
                        style={{ width: "100%", marginBottom: "1rem" }}
                        defaultValue={newNndEdge ? newNndEdge.label : ""}
                        onChange={updateNndEdge}    
                    />
                </label>
            </form>
            :
            <form style={{marginBottom: "1rem"}}>
                <label>
                    Name:
                    <input
                        className="field-input"
                        type="text"
                        id="name"
                        style={{ width: "100%"}}
                        defaultValue={newGlmEdge ? newGlmEdge.meta_props.name : ""}
                        onChange={updateGlmEdge}
                    />
                </label>
                <label>
                    Type:
                    <input
                        className="field-input"
                        type="text"
                        id="type"
                        style={{ width: "100%"}}
                        defaultValue={newGlmEdge ? newGlmEdge.meta_props.obj_type : ""}
                        onChange={updateGlmEdge}
                    />
                </label>  
            </form>}
        </Modal>
    )

}

const StyledError = styled.h4`
    font-family: Raleway;
    color: red;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
`

export default AddEdgeModal;
