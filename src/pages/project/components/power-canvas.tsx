import { FC, ReactElement, useContext, useEffect, useState, MouseEvent } from 'react';
import styled from 'styled-components';
import { PowerNetwork, DefaultPowerNetworkOptions } from "common/networks";
import { Node } from "vis-network/peer/esm/vis-network";
import { GLMNodeType } from "common";
import { IFileJSONResp, GlmSelection, glmApi, GLMNode, GLMEdge, graphicalSettingsApi } from "api";
import { IProjectContextState, ProjectContext, SelectableNetworkTypes } from "context";
import { DeleteEdgeModal, EditEdgeModal, DeleteNodeModal } from 'pages';
import {jsPDF} from 'jspdf';


import "vis-network/styles/vis-network.min.css"; //Supposed to help with showing tooltips
import { AddNodeModal, EditNodeModal } from 'pages';
import { ContextMenu } from '.';
/* NOTE: Examples = https://visjs.github.io/vis-network/examples/ */


//#region STATE DATA

type AddGLMNodeModalState = {
    isOpen: boolean;
    node: Node|null;
    callback: (params?: any) => void;
};

type EditGLMNodeModalState = {
    isOpen: boolean;
    node: Node|null;
    callback: (params?: any) => void;
}

type ContextMenuState = {
    isOpen: boolean;
    x: number|null;
    y: number|null;
};

//#endregion

export type PowerCanvasProps = {
    netId?: string;
    addNodeType: GLMNodeType|null;
    glmJson?: IFileJSONResp|null;
    setEditObj: (editObj:string|null)=>void;
    setEdgeEdited: (edited: boolean) => void;
}

export const PowerCanvas: FC<PowerCanvasProps> = ({
    netId = 'PowerCanvas',
    addNodeType,
    glmJson = null,
    setEditObj = (editObj:null|string)=>{},
    setEdgeEdited
}) : ReactElement => {
    const projectContext: IProjectContextState = useContext<IProjectContextState>(ProjectContext);
    const [contextMenuState, setContextMenuState] = useState<ContextMenuState>({isOpen: false, x: null, y: null});
    const [addGLMNodeModalState, setAddGLMNodeModalState] = useState<AddGLMNodeModalState>({
        isOpen: false,
        node: null,
        callback: () => {}
    });
    const [editGLMNodeModalState, setEditGLMNodeModalState] = useState<EditGLMNodeModalState>({
        isOpen: false,
        node: null,
        callback: () => {}
    });
    const [contextData, setContextData] = useState<GlmSelection|null>(null);
    const [selectedNode, setSelectedNode] = useState<string[]>([]);
    const [showEditEdgeModal, setShowEditEdgeModal] = useState<boolean>(false);
    const [showDeleteEdgeModal, setShowDeleteEdgeModal] = useState<boolean>(false);
    const [showDeleteNodeModal, setShowDeleteNodeModal] = useState<boolean>(false);

    useEffect(() => {
        // check if the network canvas needs to be initialized
        const options = {
            ...DefaultPowerNetworkOptions,
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
            },
            manipulation: {
                enabled: false,
                editNode: editNodeHandler,
                addNode: addNodeHandler,
            }
        };

        if (projectContext.powerNetwork === null) {
            const container = document.getElementById(netId);

            if (container && glmJson) {

                // initialize the GLM Nodes and Edges
                const glmNodeObjects = glmJson?.glm_json.objects.nodes;
                const glmEdgeObjects = glmJson?.glm_json.objects.edges;
    

                const mappedNetNodes = glmNodeObjects?.map((glmNode, i) => {
                    return glmNode.getNetworkNode();
                });

                const mappedNetEdges = glmEdgeObjects?.map((glmEdge, i) => {
                    return glmEdge.getNetworkEdge();
                });

                let network = new PowerNetwork(container, mappedNetNodes ?? [], mappedNetEdges ?? [], options);


                
                // Assign the Power Network Object
                projectContext.setPowerNetwork(network);
            }
        } else {
            // if the network has already been initialize, we can skip all the node fetchign and just use the existing network to rebuild with
            const container = document.getElementById(netId);


            if (container && glmJson) {
                const netNodes = glmJson.glm_json.objects.nodes.map((item, i) => {
                    return item.getNetworkNode();
                });

                const netEdges = glmJson.glm_json.objects.edges.map((item, i) => {
                    return item.getNetworkEdge();
                });

                let network = new PowerNetwork(container, netNodes, netEdges, options);

                // network.on("afterDrawing", function (ctx) {
                //     console.log(ctx)
                //     var img = ctx.canvas.toDataURL("image/jpeg", 1);
                //     var doc = new jsPDF('l', 'px', [1200, 1200]);
                //     doc.addImage(img, 'jpeg', 0, 0, 1200, 1200);
                //     doc.output('dataurlnewwindow');
                //     doc.save("sample.pdf");
                //   });

                // Assign the Power Network Object
                projectContext.setPowerNetwork(network);
            }
        }
        setEdgeEdited(false);
    }, [glmJson]);

    useEffect(() => {
        if (projectContext.powerNetwork !== null) {

            // Need to create an event that tracks the mouse position for clicks (add node)
            projectContext.powerNetwork.onClick(selectNode);

            projectContext.powerNetwork.onDragStart(hideContextMenu);

            projectContext.powerNetwork.onZoom(hideContextMenu);

            //Called upon end of drag action
            projectContext.powerNetwork.onDragEnd(function(params) {
                updateNodePositions(params.nodes, projectContext.powerNetwork);
            });
            
            //Called upon right-clicking action
            projectContext.powerNetwork.onContext(function(params) {
                onContext(params.event, projectContext.powerNetwork);
            });
        }
    }, [projectContext.powerNetwork]);

    // This use Effect only triggers on the addNodeType change
    useEffect(() => {
        if (addNodeType && projectContext.powerNetwork) {
            // Add the handler to the options -- needs to be added at time of value change for addNodeType
            projectContext.powerNetwork.setOptions({
                manipulation: {
                    enabled: false,
                    editNode: editNodeHandler,
                    addNode: addNodeHandler,
                }
            });
            // Toggle the edit mode an dthe type for new Node options
            projectContext.powerNetwork.addNodeMode();
        } else if (projectContext.powerNetwork) {
            projectContext.powerNetwork.disableEditMode();
        }

    }, [addNodeType]);

    const showContextMenu = (left: number, top: number) => {
        setContextMenuState({
            isOpen: true,
            x: left,
            y: top,
        });
    }

    const hideContextMenu = () => {
        setContextMenuState({...contextMenuState, isOpen: false });
    };

    const selectNode = () => {
        if (projectContext.powerNetwork?.clickPosition) {
            if (projectContext.powerNetwork?.clickPosition.occupied) {
                setSelectedNode(projectContext.powerNetwork?.clickPosition?.nodes);
            }
        }
        hideContextMenu();
    }

    const onContext = (event: any, network: PowerNetwork|null) => {
        if (event && network) {
            const { nodes: networkNodes, edges: networkEdges } = network.getSelection();
            
            let selectedGlmNodes: GLMNode[] = [];
            let selectedGlmEdges: GLMEdge[] = [];
            
            if (networkNodes && networkNodes.length) {
                networkNodes.forEach(nodeId => {
                    const glmNode = projectContext.getNodeById(SelectableNetworkTypes.Power, nodeId.toString());
                    if (glmNode && glmNode instanceof GLMNode) selectedGlmNodes.push(glmNode);
                });
            }
    
            if (networkEdges && networkEdges.length) {
                networkEdges.forEach(edgeId => {
                    const glmEdge = projectContext.getEdgeById(SelectableNetworkTypes.Power, edgeId.toString());
                    if (glmEdge && glmEdge instanceof GLMEdge) selectedGlmEdges.push(glmEdge);
                })
            }

            setContextData(new GlmSelection({
                glmNodes: selectedGlmNodes,
                glmEdges: selectedGlmEdges,
                netNodeIds: networkNodes,
                netEdgeIds: networkEdges
            }));
    
            // only show context menu when an edge or node is selected
            if (selectedGlmNodes.length || selectedGlmEdges.length)
                showContextMenu(event.pageX, event.pageY);
        }
    };

    const onContextEdit = () => {
        if (contextData) {
            if (contextData.glmNodes.length === 0 && contextData.glmEdges.length > 0) {
                setShowEditEdgeModal(true);
            }

            if (contextData.glmNodes.length > 0) {
                // activate the edit mode -- calls editNodeHandler
                projectContext.powerNetwork?.editNode();
            }

            hideContextMenu();
        }
        else console.log("Cannot edit node: context data is undefined!");
    };

    const onContextRemove = () => {
        if (contextData) {
            
            if (contextData.glmNodes.length === 0 && contextData.glmEdges.length > 0) {
                setShowDeleteEdgeModal(true);
            }
            
            if (contextData.glmNodes.length > 0) {
                setShowDeleteNodeModal(true);
            }

            hideContextMenu();
        }
        else console.log("Cannot remove node: context data is undefined!");
    };

    const updateNodePositions = async (nodeIDs: any[], network: any) => {
        if (nodeIDs.length > 0) {
            nodeIDs.forEach((nodeID) => {

                const networkNode = network.body.nodes[nodeID];
                let nodeUpdateData = projectContext.getNodeById(SelectableNetworkTypes.Power, nodeID);

                if (nodeUpdateData) {
                    nodeUpdateData.setPosition(networkNode.x, networkNode.y);
                    projectContext.updateNode(SelectableNetworkTypes.Power, nodeUpdateData);
                }
            });
        }
    };

    const addNodeHandler = async (data: Node, callback: (params?: any) => void) => {
        // the scope of this is the mutation of the base Network object
        if(addNodeType && projectContext.powerNetwork) {
            const { clickPosition } = projectContext.powerNetwork;
            console.log(clickPosition);
            // only allow add node when the click was not over an existing object
            if (clickPosition && clickPosition.occupied === false) {
                // open modal to get node data
                setAddGLMNodeModalState({
                    isOpen: true,
                    node: data,
                    callback: callback
                });
            }
        }
    };

    const editNodeHandler = (data: Node, callback: (params?: any) => void) => {
        // open modal to get node data
        // sizes are 10 = Small, 20 = Medium, 50 = Large, and 100 = X-Large
        setEditGLMNodeModalState({
            isOpen: true,
            node: data,
            callback: callback
        });
    };

    const hideAddGLMNodeModal = () => {
        setAddGLMNodeModalState({
            isOpen: false,
            node: null,
            callback: () => {}
        });
    };

    const hideEditGLMNodeModal = () => {
        setEditGLMNodeModalState({
            isOpen: false,
            node: null,
            callback: () => {}
        });
    };

    return (
        <div>
            <div id='power_canvas'>
                <StyledCanvas id={netId} addNodeType={addNodeType}/>
            </div>

            <ContextMenu
                isOpen={contextMenuState.isOpen}
                x={contextMenuState.x}
                y={contextMenuState.y}
                onEdit={onContextEdit}
                onRemove={onContextRemove}
            />

            {addGLMNodeModalState.isOpen &&
            <AddNodeModal
                isOpen={addGLMNodeModalState.isOpen}
                networkType={SelectableNetworkTypes.Power}
                glmInfo={{
                    node: addGLMNodeModalState.node,
                    callback: addGLMNodeModalState.callback,
                    nodeType: addNodeType,
                    setEditObj: setEditObj
                }}
                onCancel={hideAddGLMNodeModal}
            />}

            {editGLMNodeModalState.isOpen &&
            <EditNodeModal
                isOpen={editGLMNodeModalState.isOpen}
                networkType={SelectableNetworkTypes.Power}
                glmInfo={{
                    node: editGLMNodeModalState.node,
                    callback: editGLMNodeModalState.callback,
                    setEditObj: setEditObj,
                    defaultGlmId: contextData ? contextData.glmNodes[0].meta_props.id : "",
                    defaultGlmLabel: contextData ? contextData.glmNodes[0].meta_props.name: "",
                    defaultGlmSize: contextData ? contextData.glmNodes[0].dot_props.width: "",
                }}
                onCancel={() => {
                    hideEditGLMNodeModal();
                }}
            />}

            {showDeleteEdgeModal &&
            <DeleteEdgeModal
                showModal={showDeleteEdgeModal}
                setShowModal={setShowDeleteEdgeModal}
                contextData={contextData}
                networkType={SelectableNetworkTypes.Power}
            />}

            {showDeleteNodeModal &&
            <DeleteNodeModal
                showModal={showDeleteNodeModal}
                setShowModal={setShowDeleteNodeModal}
                contextData={contextData}
                networkType={SelectableNetworkTypes.Power}
            />}

            {showEditEdgeModal &&
            <EditEdgeModal
				showModal={showEditEdgeModal}
				setShowModal={setShowEditEdgeModal}
                contextData={contextData}
                networkType={SelectableNetworkTypes.Power}
                setEdgeEdited={setEdgeEdited}
			/>}
        </div>
    );
};

//#region DEFINE STYLED COMPONENTS

type StyledCanvasProps = {
    addNodeType: GLMNodeType|null;
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