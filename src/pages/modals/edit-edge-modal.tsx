import React, { FC, ReactElement, useContext, useEffect, useState } from 'react';
import { Modal } from 'common';
import { NndSelection, GlmSelection, NndNode, GLMNode, NndEdge, GLMEdge } from 'api';
import { SelectableNetworkTypes, IProjectContextState, ProjectContext } from 'context';
import styled from 'styled-components';

export type EditEdgeModalProps = {
    showModal: boolean;
    setShowModal: (showModal: boolean) => void;
    contextData: NndSelection|GlmSelection|null;
    networkType: SelectableNetworkTypes;
    setEdgeEdited?: (edited: boolean) => void;
};

const EditEdgeModal : FC<EditEdgeModalProps> = (props: EditEdgeModalProps) : ReactElement => {
    const projectContext: IProjectContextState = useContext<IProjectContextState>(ProjectContext);
    const {showModal, setShowModal, contextData, networkType} = props;
    const [sourceNode, setSourceNode] = useState<string>("");
    const [destinationNode, setDestinationNode] = useState<string>("");
    const [nodeOptions, setNodeOptions] = useState<(GLMNode | NndNode)[]>([]);
    const [edge, setEdge] = useState<NndEdge|GLMEdge|null>(null);
    const [edgeLoopError, setEdgeLoopError] = useState<boolean>(false);
    const [switchEdgeError, setSwitchEdgeError] = useState<boolean>(false);
    const [nodeEdgeError, setNodeEdgeError] = useState<boolean>(false);
    const [maxNodesError, setMaxNodesError] = useState<boolean>(false);
    const [duplicateEdgeError, setDuplicateEdgeError] = useState<boolean>(false);

    const closeModal = (evt: React.MouseEvent<HTMLButtonElement> | undefined) => {
		setShowModal(false);
	}

    const editEdge = (evt: React.MouseEvent<HTMLButtonElement> | undefined) => {
        if (edge !== null) {
            try {
                projectContext.updateEdge(networkType, edge, sourceNode, destinationNode);
            }
            catch {
                setMaxNodesError(true);
            }
        }
        if (props.setEdgeEdited) {
            props.setEdgeEdited(true);
        }
        setShowModal(false);
	}

    const handleSourceChange = (event: any) => {
        setSourceNode(event.target.value)
    }

    const handleDestinationChange = (event: any) => {
        setDestinationNode(event.target.value)
    }

    useEffect(() => {
        if (contextData !== null) {
            if (contextData instanceof NndSelection) {
                setEdge(contextData.nndEdges[0])
            }
            else if (contextData instanceof GlmSelection) {
                setEdge(contextData.glmEdges[0])
            }
            
        }
    }, [contextData]);

    useEffect(() => {
        if (edge instanceof NndEdge) {
            setSourceNode(edge.fromNode);
            setDestinationNode(edge.toNode);
        }
        else if (edge instanceof GLMEdge) {
            if (edge.meta_props.from !== undefined && edge.meta_props.to !== undefined) {
                setSourceNode(edge.meta_props.from);
                setDestinationNode(edge.meta_props.to);
            }

        }
    }, [edge]);

    useEffect(() => {
        if (sourceNode !== "" || destinationNode !== "") {
            sourceNode === destinationNode ? setEdgeLoopError(true) : setEdgeLoopError(false);

            let existingEdges = projectContext.getEdges(networkType, null, sourceNode, destinationNode);
            if (existingEdges && existingEdges.length > 0) {
                setDuplicateEdgeError(true);
            }
            else if (existingEdges && existingEdges.length === 0) {
                setDuplicateEdgeError(false);
            }

            if (networkType === SelectableNetworkTypes.Communications) {
                if (sourceNode.startsWith("switch") && destinationNode.startsWith("switch")) {
                    setSwitchEdgeError(true);
                }
                else if (!sourceNode.startsWith("switch") && !destinationNode.startsWith("switch")) {
                    setNodeEdgeError(true);
                }
                else {
                    setSwitchEdgeError(false);
                    setNodeEdgeError(false);
                }
            }
            else {
                setMaxNodesError(false);
            }
        }
    }, [sourceNode, destinationNode])

    useEffect(() => {
        var nodes = projectContext.getNodes(networkType, null);
        if (nodes) {
            nodes = nodes.sort((a, b) => {
                if (a instanceof NndNode && b instanceof NndNode) {
                    if (a.nodeName.toLowerCase() < b.nodeName.toLowerCase()) {
                        return -1;
                    }
                    else if (a.nodeName.toLowerCase() > b.nodeName.toLowerCase()) {
                        return 1;
                    }
                } 
                else if (a instanceof GLMNode && b instanceof GLMNode) {
                    let nodeA = a.getNetworkNode();
                    let nodeB = b.getNetworkNode();
                    if (nodeA.label && nodeB.label) {
                        if (nodeA.label?.toLowerCase() < nodeB.label?.toLowerCase()) {
                            return -1;
                        }
                        else if (nodeA.label?.toLowerCase() > nodeB.label?.toLowerCase()) {
                            return 1;
                        }
                    }
                }
                return 0;
            })

            setNodeOptions(nodes);
        }
    }, []);

    return (
        <Modal
            title="Edit Edge"
            visible={showModal}
            closeOnBlur={false}
            width="30%"
            height="auto"
            onClose={closeModal}
            onSuccess={editEdge}
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
                An edge already exists between these nodes.
            </StyledError>}

            <h3 style={{marginTop: "0", marginBottom: "5px"}}>
                Source Node
            </h3>
            
            {networkType === SelectableNetworkTypes.Communications &&
            <select 
                value={sourceNode} 
                onChange={handleSourceChange} 
                className='field-input'
                style={{width: "100%", marginBottom: "0.5rem"}}
            >
                {nodeOptions.map((node) => {
                    if (node instanceof NndNode) {
                        return (
                            <option value={node.nodeName} key={node.id}>{node.nodeName}</option>
                        )
                    }
                })}
            </select>}

            {networkType === SelectableNetworkTypes.Power &&
            <select 
                value={sourceNode} 
                onChange={handleSourceChange} 
                className='field-input'
                style={{width: "100%", marginBottom: "0.5rem"}}
            >
                {nodeOptions.map((node) => {
                    if (node instanceof GLMNode) {
                        return (
                            <option value={node.meta_props.name} key={node.id}>{node.meta_props.name}</option>
                        )
                    }
                })}
            </select>}

            <hr/>
            <h3 style={{marginTop: "0", marginBottom: "5px"}}>
                Destination Node
            </h3>

            {networkType === SelectableNetworkTypes.Communications ?
                <select 
                    value={destinationNode} 
                    onChange={handleDestinationChange}
                    className='field-input'
                    style={{width: "100%", marginBottom: "0.5rem"}}
                >
                    {nodeOptions.map((node) => {
                        if (node instanceof NndNode) {
                            return (
                                <option value={node.nodeName} key={node.id}>{node.nodeName}</option>
                            )
                        }
                    })}
                </select>
            : networkType === SelectableNetworkTypes.Power ?
                <select 
                    value={destinationNode} 
                    onChange={handleDestinationChange}
                    className='field-input'
                    style={{width: "100%", marginBottom: "0.5rem"}}
                >
                    {nodeOptions.map((node) => {
                        if (node instanceof GLMNode) {
                            return (
                                <option value={node.meta_props.name} key={node.id}>{node.meta_props.name}</option>
                            )
                        }
                    })}
                </select>
            : null}
        </Modal>
    );
}

const StyledError = styled.h4`
    font-family: Raleway;
    color: red;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
`

export default EditEdgeModal;
