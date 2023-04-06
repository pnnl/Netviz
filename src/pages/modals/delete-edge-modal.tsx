import React, { FC, ReactElement, useContext, useEffect, useState } from 'react';
import { Modal } from 'common';
import { SelectableNetworkTypes } from 'context';
import { NndSelection, GlmSelection, NndEdge, GLMEdge } from 'api';
import { IProjectContextState, ProjectContext } from 'context';

export type DeleteEdgeModalProps = {
    showModal: boolean;
    setShowModal: (showModal: boolean) => void;
    contextData: NndSelection|GlmSelection|null;
    networkType: SelectableNetworkTypes;
};

const DeleteEdgeModal : FC<DeleteEdgeModalProps> = (props: DeleteEdgeModalProps) : ReactElement => {
    const projectContext: IProjectContextState = useContext<IProjectContextState>(ProjectContext);
    let { showModal, setShowModal, contextData, networkType } = props;
    const [edge, setEdge] = useState<NndEdge|GLMEdge|null>(null);

    useEffect(() => {
        if (contextData !== null) {
            if (contextData instanceof NndSelection) {
                setEdge(contextData.nndEdges[0])
            }
            else if (contextData instanceof GlmSelection) {
                setEdge(contextData.glmEdges[0])
            }
            
        }
    }, [contextData])

    const closeModal = (evt: React.MouseEvent<HTMLButtonElement> | undefined) => {
		setShowModal(false);
	}

    const deleteEdge = (evt: React.MouseEvent<HTMLButtonElement> | undefined) => {
        if (contextData !== null) {
            projectContext.removeSelection(networkType, contextData);
            setShowModal(false);
        }
    }

    return (
        <Modal 
            title="Delete Edge?"
            visible={showModal}
            closeOnBlur={false}
            width="50%"
            height="auto"
            onClose={closeModal}
            onSuccess={deleteEdge}
            cancelButton={true}
        >
            {edge instanceof NndEdge &&
                <div>
                    {edge.fromNode ?
                    <div style={{height: "1.5rem", marginBottom: "1rem", marginTop: "1rem"}}>
                        <span style={{float: "left"}}><b>Source Node Name</b></span>
                        <span style={{float: "right"}}>{edge.fromNode}</span>
                    </div>
                    : null}

                    {edge.fromIpAddr ?
                    <div style={{height: "1.5rem", marginBottom: "1rem", marginTop: "1rem"}}>
                        <span style={{float: "left"}}><b>Source Node IP Address</b></span>
                        <span style={{float: "right"}}>{edge.fromIpAddr}</span>
                    </div>
                    : null}

                    {edge.toNode ?
                    <div style={{height: "1.5rem", marginBottom: "1rem", marginTop: "1rem"}}>
                        <span style={{float: "left"}}><b>Destination Node Name</b></span>
                        <span style={{float: "right"}}>{edge.toNode}</span>
                    </div>
                    : null}

                    {edge.toIpAddr ?
                    <div style={{height: "1.5rem", marginBottom: "1rem", marginTop: "1rem"}}>
                        <span style={{float: "left"}}><b>Destination Node IP Address</b></span>
                        <span style={{float: "right"}}>{edge.toIpAddr}</span>
                    </div>
                    : null}
                </div>
            }
            {edge instanceof GLMEdge &&
                <div>
                    {edge.meta_props.from ?
                    <div style={{height: "1.5rem", marginBottom: "1rem", marginTop: "1rem"}}>
                        <span style={{float: "left"}}><b>Source Node Name</b></span>
                        <span style={{float: "right"}}>{edge.meta_props.from}</span>
                    </div>
                    : null}

                    {edge.meta_props.to ? 
                    <div style={{height: "1.5rem", marginBottom: "1rem", marginTop: "1rem"}}>
                        <span style={{float: "left"}}><b>Destination Node Name</b></span>
                        <span style={{float: "right"}}>{edge.meta_props.to}</span>
                    </div>
                    : null}
                </div>
            }

        </Modal>
    )

}

export default DeleteEdgeModal;
