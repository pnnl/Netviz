import { Network, Node, Edge, Options, IdType } from "vis-network/peer/esm/vis-network";
import { DataSet } from "vis-data/peer/esm/vis-data";

export type IBasePosition = {
    x: number;
    y: number;
    occupied: boolean;
    nodes: string[];
}

const DefaultNetworkOptions = {
    interaction: {
        hover: true,
    },
    physics: {
        enabled: false,
    },
    layout: {
        improvedLayout: false,
    },
    manipulation: {
        enabled: false,
    }
}

export class BaseNetwork extends Network {
    nodes: any;
    edges: any;
    clickPosition: IBasePosition|null = null;

    constructor(
        container: HTMLElement,
        nodes: Node[],
        edges: Edge[],
        options: Options = DefaultNetworkOptions
    ) {
        super(container, { nodes, edges }, options);
        
        this.nodes = new DataSet(nodes);
        this.edges = new DataSet(edges);
    }

    /*
    * User Interface Event Handlers
    */
    onClick = (callback: (params?: any) => void) => {
        super.on('click', (params) => {
            // set the click position using the params
            let occupied = (params.nodes.length != 0) || (params.edges.length != 0);
            this.clickPosition = {
                x: params.pointer.canvas.x,
                y: params.pointer.canvas.y,
                occupied: occupied,
                nodes: params.nodes,
            }
            callback(params);
        });
    }

    onDragStart = (callback: (params?: any) => void) => {
        super.on('dragStart', callback)
    }

    onZoom = (callback: (params?: any) => void) => {
        super.on('zoom', callback);
    }

    onDragEnd = (callback: (params?: any) => void) => {
        super.on('dragEnd', callback);
    }

    onContext = (callback: (params?: any) => void) => {
        super.on('oncontext', (cxtParams) => {
            // This adds a feature that if the user context clicked on a node or edge, that item is selected
            const { pointer } = cxtParams;
            
            // must have a point to get clicked edge or node
            if (pointer) {
                const selectedNodeId = this.getNodeAt(pointer.DOM);

                // check if a valid node was found at the point
                if (selectedNodeId) {
                    // force the node found to be selected
                    this.selectNodes([selectedNodeId]);
                } else {
                    const selectedEdgeId = this.getEdgeAt(pointer.DOM);

                    // check if a valid edge was found
                    if (selectedEdgeId) {
                        // force the edge found to be selected
                        this.selectEdges([selectedEdgeId]);
                    }
                }
            }
                
            callback(cxtParams);
        });
    }

    /*
    * Modification of Network Graph Handlers
    */
    addNode(node: Node) {
        // Only allow add node when the click was not over an existing object
        if (this.clickPosition && this.clickPosition.occupied === false) {
            this.nodes.add(node);
        }
    }

    addEdge(edge: Edge){
	    // TO DO:: Implement this on child classes - power net
        this.edges.add(edge)
    }

    updateNode(node: Node){
        let updatedNode = this.nodes._data.get(node.id)

        this.nodes.update([
            {...updatedNode}
        ])
    }

    updateEdge(edgeId: IdType) {
        let updatedEdge = this.edges._data.get(edgeId);

        this.edges.update([
            {...updatedEdge}
        ]);
    }

    removeSelection(selectedNodeIds: IdType[], selectedEdgeIds: IdType[]){
        this.setSelection({"nodes": selectedNodeIds, "edges": selectedEdgeIds})
        this.nodes.remove(selectedNodeIds)
        this.edges.remove(selectedEdgeIds)

        this.deleteSelected()
    }
}

