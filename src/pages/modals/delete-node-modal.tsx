import React, { FC, ReactElement, useContext, useEffect, useState } from 'react';
import { GLMNodeType, Modal } from 'common';
import { SelectableNetworkTypes } from 'context';
import { NndSelection, GlmSelection, NndNode, GLMNode } from 'api';
import { IProjectContextState, ProjectContext } from 'context';
import styled from 'styled-components';

export type DeleteNodeModalProps = {
    showModal: boolean;
    setShowModal: (showModal: boolean) => void;
    contextData: NndSelection|GlmSelection|null;
    networkType: SelectableNetworkTypes;
};

const DeleteNodeModal : FC<DeleteNodeModalProps> = (props: DeleteNodeModalProps) : ReactElement => {
    const projectContext: IProjectContextState = useContext<IProjectContextState>(ProjectContext);
    let {showModal, setShowModal, contextData, networkType} = props;
    const [node, setNode] = useState<NndNode|GLMNode|null>(null);

    const closeModal = (evt: React.MouseEvent<HTMLButtonElement> | undefined) => {
		setShowModal(false);
	}

    const deleteNode = (evt: React.MouseEvent<HTMLButtonElement> | undefined) => {
        if (contextData !== null) {
            projectContext.removeSelection(networkType, contextData);
            setShowModal(false);
        }
    }

    useEffect(() => {
        if (contextData !== null) {
            if (contextData instanceof NndSelection) {
                setNode(contextData.nndNodes[0]);
            }
            else if (contextData instanceof GlmSelection) {
                setNode(contextData.glmNodes[0]);
            }
        }
    }, [contextData])

    return (
        <Modal 
            title="Delete Node?"
            visible={showModal}
            closeOnBlur={false}
            width="40%"
            height="70%"
            onClose={closeModal}
            onSuccess={deleteNode}
            cancelButton={true}
        >
            {node instanceof NndNode && contextData instanceof NndSelection &&
            <div>
                <NodeInfo>
                    <span style={{float: "left"}}><b>Name</b></span>
                    <span style={{float: "right"}}>{node.nodeName}</span>
                </NodeInfo>

                {node.interfaces.length && node.interfaces[0].ipAddr &&
                <NodeInfo>
                    <span style={{float: "left"}}><b>IP Address</b></span>
                    <span style={{float: "right"}}>{node.interfaces[0].ipAddr}</span>
                </NodeInfo>}

                {node.interfaces.length && node.interfaces[0].macAddr &&
                <NodeInfo>
                    <span style={{float: "left"}}><b>MAC Address</b></span>
                    <span style={{float: "right"}}>{node.interfaces[0].macAddr}</span>
                </NodeInfo>}

                <EdgeList>
                    <span style={{float: "left"}}><b>Edges to be deleted:</b></span>
                    {contextData.nndEdges.map((edge, index) => {
                        return (
                            <EdgeContainer key={`delete-edge-list-${index}`}>
                                <div style={{height: "1.5rem"}} key={`delete-edge-list-node-src-${index}`}>
                                    <span style={{float: "left"}} key={`delete-edge-list-node-src-span1-${index}`}>
                                        <b>Source Node</b>
                                    </span>
                                    <span style={{float: "right"}} key={`delete-edge-list-node-src-span2-${index}`}>
                                        {edge.fromNode}
                                    </span>
                                </div>
                                <div style={{height: "1.5rem"}} key={`delete-edge-list-node-dest-${index}`}>
                                    <span style={{float: "left"}} key={`delete-edge-list-node-dest-span1-${index}`}>
                                        <b>Destination Node</b>
                                    </span>
                                    <span style={{float: "right"}} key={`delete-edge-list-node-dest-span2-${index}`}>
                                        {edge.toNode}
                                    </span>
                                </div>
                            </EdgeContainer>
                        )
                    })}
                </EdgeList>
            </div>
            }

            {node instanceof GLMNode && contextData instanceof GlmSelection &&
            <div>
                <NodeInfo>
                    <span style={{float: "left"}}><b>Name</b></span>
                    <span style={{float: "right"}}>{node.meta_props.name}</span>
                </NodeInfo>

                <EdgeList>
                    <span style={{float: "left"}}><b>Edges to be deleted:</b></span>
                    {contextData.glmEdges.map((edge, index) => {
                        return (
                            <EdgeContainer key={`delete-edge-list-${index}`}>
                                <div key={`delete-edge-list-node-src-${index}`} style={{height: "1.5rem"}}>
                                    <span style={{float: "left"}} key={`delete-edge-list-node-src-span1-${index}`}>
                                        <b>Source Node</b>
                                    </span>
                                    <span style={{float: "right"}} key={`delete-edge-list-node-src-span2-${index}`}>
                                        {edge.meta_props.from}
                                    </span>
                                </div>
                                <div key={`delete-edge-list-node-dst-${index}`} style={{height: "1.5rem"}}>
                                    <span style={{float: "left"}} key={`delete-edge-list-node-dest-span1-${index}`}>
                                        <b>Destination Node</b>
                                    </span>
                                    <span style={{float: "right"}} key={`delete-edge-list-node-dest-span2-${index}`}>
                                        {edge.meta_props.to}
                                    </span>
                                </div>
                            </EdgeContainer>
                        )
                    })}
                </EdgeList>
            </div>
            }
        </Modal>
    );
}

const NodeInfo = styled.div`
    height: 1.5rem;
    margin-top: 1rem;
`;

const EdgeList = styled.div`
    height: auto; 
    margin-bottom: 1rem;
    margin-top: 1rem;
`;

const EdgeContainer = styled.div`
    height: 3rem;
    clear: both;
    border-style: solid;
    border-radius: 5px;
    position: relative;
    top: 0.5rem;
    margin-top: 0.5rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;   
`;

export default DeleteNodeModal;