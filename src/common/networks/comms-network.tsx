import { Node, Edge, Options, IdType } from "vis-network/peer/esm/vis-network";
import { BaseNetwork } from "./base-network";
import { NndSelection } from "api";

export const DefaultNetworkOptions = {
    interaction: {
        hover: true,
    },
    manipulation: {
        enabled: false,
    }
}

export class CommsNetwork extends BaseNetwork {    
    constructor(
        container: HTMLElement,
        nodes: Node[],
        edges: Edge[],
        options: Options = DefaultNetworkOptions
    ) {
        super(container, nodes, edges, options);
    }

    addNode(node: Node) {
        super.addNode(node)
    }

    removeNndSelection(selectedItems: NndSelection) {
        super.removeSelection(selectedItems.netNodeIds, selectedItems.netEdgeIds);
    }

    updateNode(node: Node) {
        super.updateNode(node)
    }

    addEdge(edge: Edge) {
        super.addEdge(edge)
    }

    updateEdge(edgeId: IdType) {
        super.updateEdge(edgeId);
    }

}