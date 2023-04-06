import { FC, ReactElement, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { NndNodeType } from "common";
import { nndAppType } from 'api/nnd';
import { CommsNetwork, DefaultCommsNetworkOptions } from "common/networks";
import { INndFileJSONResp, NndSelection, nndApi, NndNode, NndEdge, graphicalSettingsApi } from "api";
import { IProjectContextState, ProjectContext, SelectableNetworkTypes } from "context";
import { ContextMenu } from '.';
import { AddNodeModal, EditNodeModal } from 'pages';
import { Node } from "vis-network/peer/esm/vis-network";
import { DeleteNodeModal, DeleteEdgeModal, EditEdgeModal } from 'pages';

/* NOTE: Examples = https://visjs.github.io/vis-network/examples/ */

//#region DEFINE STYLED COMPONENTS

type StyledCanvasProps = {
    addNodeType: NndNodeType|null;
}

const StyledCanvas = styled.div<StyledCanvasProps>`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: -1;
    &:hover{
        cursor: ${props => props.addNodeType != null ? "crosshair":"default"}
    }
`;

//#endregion

export type PositionMetadata = {
    x: number;
    y: number;
    occupied: boolean;
}

export type CommsCanvasProps = {
    netId?: string;
    addNodeType: NndNodeType|null;
    nndJson?: INndFileJSONResp|null;
    setEditObj: (editObj:string|null)=>void;
}

type AddNndNodeModalState = {
    isOpen: boolean;
    node: Node|null;
    callback: (params?: any) => void;
};

type EditNndNodeModalState = {
    isOpen: boolean;
    node: Node|null;
    callback: (params?: any) => void;
};

type ContextMenuState = {
    isOpen: boolean;
    x: number|null;
    y: number|null;
};

export const CommsCanvas: FC<CommsCanvasProps> = ({
    netId = 'CommsCanvas',
    addNodeType,
    nndJson = null,
    setEditObj = (editObj:null|string)=>{},
}) : ReactElement => {
    const projectContext: IProjectContextState = useContext<IProjectContextState>(ProjectContext);
    const [contextMenuState, setContextMenuState] = useState<ContextMenuState>({isOpen: false, x: null, y: null});
    const [addNndNodeModalState, setAddNndNodeModalState] = useState<AddNndNodeModalState>({
        isOpen: false,
        node: null,
        callback: () => {}
    });
    const [editNndNodeModalState, setEditNndNodeModalState] = useState<EditNndNodeModalState>({
        isOpen: false,
        node: null,
        callback: () => {}
    });
    const [addAtPosition, setAddAtPosition] = useState<PositionMetadata>();
    const [contextData, setContextData] = useState<NndSelection|null>(null);
    const [selectedNode, setSelectedNode] = useState<string[]>([]);
    const [showEditEdgeModal, setShowEditEdgeModal] = useState<boolean>(false);
    const [showDeleteEdgeModal, setShowDeleteEdgeModal] = useState<boolean>(false);
    const [showDeleteNodeModal, setShowDeleteNodeModal] = useState<boolean>(false);
    const [defaultNndApps, setDefaultNndApps] = useState<{}>({});

    useEffect(() => {
        const container = document.getElementById(netId);

        if (container) {
            if (nndJson != null) {
                let mappedNetNodes = [];
                let mappedNetEdges = [];
                
                mappedNetNodes = nndJson.nodes.map((item, i) => {
                    return item.getNetworkNode();
                });

                mappedNetEdges = nndJson.edges.map((item, i) => {
                    return item.getNetworkEdge();
                });

                const options = {
                    ...DefaultCommsNetworkOptions,
                    physics: {
                        enabled: false
                    },
                    nodes: {
                        font: {
                            size: graphicalSettingsApi.setup?.Labels.NodeFontSize,
                        }
                    },
                    edges: {
                        font: {
                            size: graphicalSettingsApi.setup?.Labels.EdgeFontSize,
                        },
                        color: {
                            color: graphicalSettingsApi.setup?.EdgeColors.DefaultEdge,
                        },
                        smooth: true
                    },
                    manipulation: {
                        enabled: false,
                        editNode: editNodeHandler,
                        addNode: addNodeHandler,
                    }
                };
                let network = new CommsNetwork(container, mappedNetNodes, mappedNetEdges, options);
                projectContext.setCommsNetwork(network)
            }
        }
    }, [nndJson]);

    useEffect(() => {
        if (projectContext.commsNetwork !== null) {
            // Need to create an event that tracks the mouse position for clicks (add node)
            projectContext.commsNetwork.onClick(selectNode);

            projectContext.commsNetwork.onDragStart(hideContextMenu);

            projectContext.commsNetwork.onZoom(hideContextMenu);

            //Called upon right-clicking action
            projectContext.commsNetwork.onContext(function(params) {
                if (projectContext.commsNetwork) {
                    onContext(params.event, projectContext.commsNetwork);
                }
            });

            //Called upon end of drag action
            projectContext.commsNetwork.onDragEnd(function(params) {
                updateNodePositions(params.nodes, projectContext.commsNetwork);
            });
        }
    }, [projectContext.commsNetwork])

    // This use Effect only triggers on the addNodeType change
    useEffect(() => {
        if (addNodeType && projectContext.commsNetwork) {
            // Add the handler to the options -- needs to be added at time of value cahneg for addNodeType
            projectContext.commsNetwork.setOptions({
                manipulation: {
                    enabled: false,
                    addNode: addNodeHandler,
                    editNode: editNodeHandler,
                }
            });
            // Toggle the edit mode and the type for new Node options
            projectContext.commsNetwork.addNodeMode();
        } else if (projectContext.commsNetwork) {
            projectContext.commsNetwork.disableEditMode();
        }

    }, [addNodeType]);

    const hideContextMenu = () => {
        setContextMenuState({...contextMenuState, isOpen: false });
    };

    const selectNode = () => {
        if (projectContext.commsNetwork?.clickPosition) {
            if (projectContext.commsNetwork?.clickPosition.occupied) {
                setSelectedNode(projectContext.commsNetwork?.clickPosition?.nodes);
            }
        }
        hideContextMenu();
    }

    const updateNodePositions = async (nodeIDs: string[], network: any) => {
        if (projectContext.commsNetwork != null) {
            if (nodeIDs.length > 0) {
                nodeIDs.forEach((nodeID) => {
                    const networkNode = network.body.nodes[nodeID];
                    let nodeUpdateData = projectContext.getNodeById(SelectableNetworkTypes.Communications, nodeID);

                    if (nodeUpdateData) {
                        nodeUpdateData.setPosition(networkNode.x, networkNode.y);
                        projectContext.updateNode(SelectableNetworkTypes.Communications, nodeUpdateData);
                    }
                });
            }
        }
    };

    const addNodeHandler = async (data: Node, callback: (params?: any) => void) => {
        // the scope of this is the mutation of the base Network object
        if(addNodeType && projectContext.commsNetwork) {    
            // open modal to get node data
            setAddNndNodeModalState({
                isOpen: true,
                node: data,
                callback: callback
            });
        }
    };

    const editNodeHandler = (data: Node, callback: (params?: any) => void) => {
        // open modal to get node data
        setEditNndNodeModalState({
            isOpen: true,
            node: data,
            callback,
        });
    };

    const onContext = (event: any, network: CommsNetwork) => {
        if (event && network) {
            const { nodes: networkNodes, edges: networkEdges } = network.getSelection();

            let selectedNndNodes: NndNode[] = [];
            let selectedNndEdges: NndEdge[] = [];

            if (networkNodes && networkNodes.length) {
                networkNodes.forEach(nodeId => {
                    const nndNode = projectContext.getNodeById(SelectableNetworkTypes.Communications, nodeId.toString());
                    if (nndNode && nndNode instanceof NndNode) selectedNndNodes.push(nndNode);
                });
            }

            if (networkEdges && networkEdges.length) {
                networkEdges.forEach(edgeId => {
                    const nndEdge = projectContext.getEdgeById(SelectableNetworkTypes.Communications, edgeId.toString());
                    if (nndEdge && nndEdge instanceof NndEdge) selectedNndEdges.push(nndEdge);
                });
            }

            setContextData(new NndSelection({
                nndNodes: selectedNndNodes,
                nndEdges: selectedNndEdges,
                netNodeIds: networkNodes,
                netEdgeIds: networkEdges
            }));

            // only show context menu when an edge or node is selected
            if (selectedNndNodes.length || selectedNndEdges.length) {
                setContextMenuState({
                    isOpen: true,
                    x: event.pageX,
                    y: event.pageY,
                });
            }
        }
    };

    const onContextEdit = () => {
        if (contextData) {
            if (contextData.nndNodes.length === 0 && contextData.nndEdges.length > 0) {
                setShowEditEdgeModal(true);
            }

            if (contextData.nndNodes.length > 0) {
                // activate the edit mode -- calls editNodeHandler
                var nndApps = {
                    "ICS Server": false,
                    "On/Off Application": false,
                    "Packet Sink": false,
                    "Fox Sensor": false,
                    "Basic Sensor": false,
                    "Switch": false,
                    "Controller": false,
                    "Router": false,
                    "Wireless Access Point": false
                };
                Object.keys(contextData.nndNodes[0].applications).forEach((app: string) => {
                    switch (app) {
                        case "ICSServer":
                            nndApps["ICS Server"] = true;
                            break;
                        case "onOffApp":
                            nndApps["On/Off Application"] = true;
                            break;
                        case "packetSink":
                            nndApps["Packet Sink"] = true;
                            break;
                        case "foxSensor":
                            nndApps["Fox Sensor"] = true;
                            break;
                        case "basicSensor":
                            nndApps["Basic Sensor"] = true;
                            break;
                        case "switch":
                            nndApps["Switch"] = true;
                            break;
                        case "controller":
                            nndApps["Controller"] = true;
                            break; 
                        case "router":
                            nndApps["Router"] = true;
                            break;
                        case "wirelessAccessPoint":
                            nndApps["Wireless Access Point"] = true;
                            break;
                        default:
                            break;
                    }
                });
                setDefaultNndApps(nndApps);
                projectContext.commsNetwork?.editNode();
            }

            hideContextMenu();
        }
        else console.log("Cannot edit node: context data is undefined!");
    };

    const onContextRemove = () => {
        if (contextData) {
             
            if (contextData.nndNodes.length === 0 && contextData.nndEdges.length > 0) {
                setShowDeleteEdgeModal(true);
            }
            
            if (contextData.nndNodes.length > 0) {
                setShowDeleteNodeModal(true);
            }
            
            hideContextMenu();
        }
        else console.log("Cannot remove node: context data is undefined!");
    };

    const hideAddNndNodeModal = () => {
        setAddNndNodeModalState({
            isOpen: false,
            node: null,
            callback: () => {}
        });
    };

    const hideEditNndNodeModal = () => {
        setEditNndNodeModalState({
            isOpen: false,
            node: null,
            callback: () => {}
        });
    };

    return (
        <div>
            <StyledCanvas id={netId} addNodeType={addNodeType} />
            <ContextMenu
                isOpen={contextMenuState.isOpen}
                x={contextMenuState.x}
                y={contextMenuState.y}
                onEdit={onContextEdit}
                onRemove={onContextRemove}
            />

            <AddNodeModal
                isOpen={addNndNodeModalState.isOpen}
                networkType={SelectableNetworkTypes.Communications}
                nndInfo={{
                    node: addNndNodeModalState.node,
                    callback: addNndNodeModalState.callback,
                    nodeType: addNodeType,
                    setEditObj: setEditObj
                }}
                onCancel={hideAddNndNodeModal}
            />
            
            {editNndNodeModalState.isOpen &&
            <EditNodeModal
                isOpen={editNndNodeModalState.isOpen}
                networkType={SelectableNetworkTypes.Communications}
                nndInfo={{
                    node: editNndNodeModalState.node,
                    callback: editNndNodeModalState.callback,
                    setEditObj: setEditObj,
                    defaultNndName: contextData ? contextData.nndNodes[0].nodeName : "",
                    defaultNndDevType: contextData ? contextData.nndNodes[0].typeName : "",
                    defualtNndApps: defaultNndApps
                }}
                onCancel={() => {
                    hideEditNndNodeModal();
                }}
            />}

            {showDeleteEdgeModal &&
            <DeleteEdgeModal
                showModal={showDeleteEdgeModal}
                setShowModal={setShowDeleteEdgeModal}
                contextData={contextData}
                networkType={SelectableNetworkTypes.Communications}
            />}

            {showDeleteNodeModal &&
            <DeleteNodeModal
                showModal={showDeleteNodeModal}
                setShowModal={setShowDeleteNodeModal}
                contextData={contextData}
                networkType={SelectableNetworkTypes.Communications}
            />}

            {showEditEdgeModal &&
            <EditEdgeModal
				showModal={showEditEdgeModal}
				setShowModal={setShowEditEdgeModal}
                contextData={contextData}
                networkType={SelectableNetworkTypes.Communications}
			/>}
        </div>
    );
};