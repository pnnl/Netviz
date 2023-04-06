import { createContext, useState, FC, useEffect } from "react";
import {
	IProject,
	glmApi,
	nndApi,
	linkagesApi,
	projectApi,
	IFileJSONResp,
	INndFileJSONResp,
	IWriteJSONResp,
	LinkagesFileResp,
	GLMNode,
	NndNode,
	GLMEdge,
	NndEdge,
	GlmSelection,
	NndSelection,
} from 'api';
import { PowerNetwork, CommsNetwork } from "common";
import { INndInterface } from "api/nnd";

export enum SelectableNetworkTypes {
	Communications = 'Comms',
	Power = 'Power',
	CommsCentric = 'CommsCentric',
	PowerCentric = 'PowerCentric'
}

export type IProjectContextState = {
	// Project
	project?: IProject;
	setProject: (proj: IProject) => React.Dispatch<React.SetStateAction<IProject | undefined>>|void;
	
	// GLM JSON
	glmJson: IFileJSONResp|null;
	getGlmJson: () => Promise<IFileJSONResp|null>;
	writeGlmJson: () => Promise<IWriteJSONResp|null>;
	
	
	// NND JSON
	nndJson: INndFileJSONResp|null;
	getNndJson: () => Promise<INndFileJSONResp|null>;
	writeNndJson: () => Promise<IWriteJSONResp|null>; // TO DO: Implement the write Nnd using context

	// Network linkages JSON
	linkagesJson: LinkagesFileResp|null,
	getLinkagesJson: () => Promise<any>;
	
	// Power Network Graph
	powerNetwork: PowerNetwork|null;
	setPowerNetwork: (net: PowerNetwork|null) => React.Dispatch<React.SetStateAction<PowerNetwork | null>>|void;
	
	// Communication Network Graph
	commsNetwork: CommsNetwork|null;
	setCommsNetwork: (net: CommsNetwork|null) => React.Dispatch<React.SetStateAction<CommsNetwork | null>>|void;

	// Comms Centric Combined Graph
	commsCentricNetwork: CommsNetwork|null;
	setCommsCentricNetwork: (net: CommsNetwork|null) => React.Dispatch<React.SetStateAction<CommsNetwork | null>>|void;

	// Power Centric Combined Graph
	powerCentricNetwork: PowerNetwork|null;
	setPowerCentricNetwork: (net: PowerNetwork|null) => React.Dispatch<React.SetStateAction<PowerNetwork | null>>|void;
	
	// Network Type
	selectedNetworkType: SelectableNetworkTypes|undefined;
	setSelectedNetworkType:	(networkType: SelectableNetworkTypes|undefined) => React.Dispatch<React.SetStateAction<SelectableNetworkTypes | undefined>>|void;

	// Network Graph Interfaces
	getNodes: (networkType: SelectableNetworkTypes, searchStr: string|null) => Array<GLMNode|NndNode>|null;
	getNodeById: (networkType: SelectableNetworkTypes, nodeId: string) => NndNode|GLMNode|null;
	addNode: (networkType: SelectableNetworkTypes, addedNode: NndNode|GLMNode, netmask?: string) => Promise<boolean>;
	updateNode: (networkType: SelectableNetworkTypes, updatedNode: NndNode|GLMNode) => Promise<boolean>;
	removeSelection: (networkType: SelectableNetworkTypes, deleteSelection: GlmSelection|NndSelection) => Promise<boolean>;

	getEdges: (networkType: SelectableNetworkTypes, edgeId:string|null, fromNodeName: string|null, toNodeName: string|null) => Array<GLMEdge|NndEdge>|null;
	getEdgeById: (networkType: SelectableNetworkTypes, edgeId: string) => NndEdge|GLMEdge|null;
	addEdge: (networkType: SelectableNetworkTypes, newEdge: NndEdge|GLMEdge, subnet?: string) => Promise<boolean>;
	updateEdge: (networkType: SelectableNetworkTypes, updatedEdge: NndEdge|GLMEdge, sourceNode: string, destinationNode: string) => Promise<boolean>;
};

export const ProjectContext = createContext<IProjectContextState>({
	project: undefined,
	setProject: (proj: IProject) => {},
	
	glmJson: null,
	getGlmJson: async () => { return null; },
	writeGlmJson: async () => { return null; },
	nndJson: null,
	getNndJson: async () => { return null; },
	writeNndJson: async () => { return null; },
	linkagesJson: null,
	getLinkagesJson: async () => { return null; },

	powerNetwork: null,
	setPowerNetwork: (net: PowerNetwork|null) => {},

	commsNetwork: null,
	setCommsNetwork: (net: CommsNetwork|null) => {},

	commsCentricNetwork: null,
	setCommsCentricNetwork: (net: CommsNetwork|null) => {},

	powerCentricNetwork: null,
	setPowerCentricNetwork: (net: PowerNetwork|null) => {},

	selectedNetworkType: undefined,
	setSelectedNetworkType: (networkType: SelectableNetworkTypes|undefined) => {},

	getNodes: (networkType: SelectableNetworkTypes, searchStr: string|null) => { return null; },
	getNodeById: (networkType: SelectableNetworkTypes, nodeId: string, netmask?: string) => { return null; },
	addNode: async (networkType: SelectableNetworkTypes, newNode: GLMNode|NndNode) => { return false; },
	updateNode: async (networkType: SelectableNetworkTypes, updatedNode: GLMNode|NndNode) => { return false; },
	removeSelection: async (networkType: SelectableNetworkTypes, deleteSelection: GlmSelection|NndSelection) => { return false; },

	getEdges: (networkType: SelectableNetworkTypes,  edgeId:string|null, fromNodeName: string|null, toNodeName: string|null) => { return null; },
	getEdgeById: (networkType: SelectableNetworkTypes, edgeId: string) => { return null; },
	addEdge: async (networkType: SelectableNetworkTypes, newEdge: NndEdge|GLMEdge, subnet?: string) => { return false; },
	updateEdge: async (networkType: SelectableNetworkTypes, updatedEdge: NndEdge|GLMEdge, sourceNode: string, destinationNode: string) => { return false; },
});

type ProjectProviderProps = {
	children?: React.ReactNode;
	project?: IProject;
	showNetworkType?: SelectableNetworkTypes;
}

export const ProjectProvider: FC<ProjectProviderProps> = (props) => {
	const { children, project: defaultProject, showNetworkType } = props;
	const [project, setProject] = useState<IProject|undefined>();
	const [glmJson, setGlmJson] = useState<IFileJSONResp|null>(null);
	const [nndJson, setNndJson] = useState<INndFileJSONResp|null>(null);
	const [linkagesJson, setLinkagesJson] = useState<LinkagesFileResp|null>(null);
	const [selectedNetworkType, setSelectedNetworkType] = useState<SelectableNetworkTypes|undefined>(showNetworkType);
	const [powerNetwork, setPowerNetwork] = useState<PowerNetwork|null>(null);
	const [commsNetwork, setCommsNetwork] = useState<CommsNetwork|null>(null);
	const [commsCentricNetwork, setCommsCentricNetwork] = useState<CommsNetwork|null>(null);
	const [powerCentricNetwork, setPowerCentricNetwork] = useState<PowerNetwork|null>(null);

	useEffect(() => {
		setProject(defaultProject);
	}, []);


	const getGlmJson = async (): Promise<IFileJSONResp|null> => {
		if (project && project.powerFile) {
			const glmJsonResult: IFileJSONResp|null = await glmApi.parseJson(project.powerFile);
			setGlmJson(glmJsonResult);

			return glmJsonResult;
		}

		return null;
	}

	const writeGlmJson = async (): Promise<IWriteJSONResp|null> => {
		if (project) {
			return await glmApi.writeJson(glmJson, project);
		}
	
		return null;
	}

	const writeLinkagesJson = async (): Promise<IWriteJSONResp|null> => {
		if (project) {
			return await linkagesApi.writeJson(linkagesJson?.linkages, project);
		}
	
		return null;
	}

	const getNndJson = async (): Promise<INndFileJSONResp|null> => {
		if (project && project.commsFile) {
			const nndJsonResult: INndFileJSONResp|null = await nndApi.parseJson(project.commsFile);
			setNndJson(nndJsonResult);

			return nndJsonResult;
		}

		return null;
	}

	const getLinkagesJson = async (): Promise<any> => {
		if (project && project.linkagesFile) {
			const linkagesResult: LinkagesFileResp|null = await linkagesApi.getLinkagesFile(project.linkagesFile);
			setLinkagesJson(linkagesResult);

			return linkagesResult;
		}

		return null;
	}

	const writeNndJson = async (): Promise<IWriteJSONResp|null> => {
		if (project) {
			return await nndApi.writeJson(nndJson, project);
		}

		return null;
	}

	//#region NETWORK GRAPH INTERFACES

	const getNodes = (
		networkType: SelectableNetworkTypes,
		searchStr: string|null = null
	): Array<GLMNode|NndNode>|null => {

		if (project) {
			const searchStrRexEx = searchStr ? new RegExp(searchStr, "i") : null;

			switch (networkType) {
				case SelectableNetworkTypes.Power:
					if (glmJson !== null) {

						// When no search string is provided, return all the nodes
						if (searchStrRexEx === null)
							return glmJson.glm_json.objects.nodes.map(node => new GLMNode(node));
							
						// get nodes from glmJson
						const nodes = glmJson.glm_json.objects.nodes.filter((node) => {
							// Check if the name on the node's meta props matches the regex, then check if the id on the node meta props matches the regex
							return node.meta_props.name
								? node.meta_props.name.match(searchStrRexEx) !== null
								: node.meta_props.id.match(searchStrRexEx) !== null;
						});

						if (nodes)
							return nodes.map(node => new GLMNode(node));
					}
					break;
					
				case SelectableNetworkTypes.Communications:
					if (nndJson !== null) {
						// When no search string is provided, return all the nodes
						if (searchStrRexEx === null) {
							return nndJson.nodes;
						}

						// get nodes from nndGraph
						return nndJson.nodes.filter((node: NndNode) => {
							// Check if the name on the node's meta props matches the regex
							return node.nodeName.match(searchStrRexEx) !== null;
						});
					}
					break;

				default:
					break;

			} /* end switch for network type */
		}

		return null;
	}

	const getNodeById = (
		networkType: SelectableNetworkTypes,
		nodeId: string
	): NndNode|GLMNode|null => {
		if (project) {
			switch(networkType) {
				case SelectableNetworkTypes.Power:
					// Use project context getNodes to find nodeID from existing GLM nodes
					const nodes = getNodes(networkType, nodeId)

					// get the fist node found if it exist
					const glmNode = nodes && nodes.length ? nodes[0] : undefined;
			
					if (glmNode instanceof GLMNode) {
						return glmNode
					}
					break;
				case SelectableNetworkTypes.Communications:
					// call the project context getNodes -- can return multiple (not likely)
					const nodesFound = getNodes(networkType, nodeId);
            
					// get the fist node found if it exist
					const nndNode = nodesFound && nodesFound.length ? nodesFound[0] : undefined;
		
					if (nndNode instanceof NndNode) {
						return nndNode;
					}
					break;
				default:
					break;
			}
		}
		return null;
	}

	const addNode = async (
		networkType: SelectableNetworkTypes,
		addedNode: NndNode|GLMNode,
		netmask?: string
	): Promise<boolean> => {

		if (project) {

			switch (networkType) {

				case SelectableNetworkTypes.Power:
					// check if the glmJson is not NULL and the type of node is a GLMNode
					if (glmJson != null && addedNode instanceof GLMNode) {
						
						// add GLM node to glmJson
						const sizeBefore = glmJson.glm_json.objects.nodes.length;
						const newJson = glmApi.appendNodeToJson(glmJson.glm_json, addedNode)
						setGlmJson({ ...glmJson, glm_json: newJson});

						// check if the size of the node collection changed
						if (sizeBefore < newJson.objects.nodes.length) {
							//Add new node to the network graph canvas
							powerNetwork?.addNode(addedNode.getNetworkNode());
							setPowerNetwork(powerNetwork);

							// write the glmJson changes back to the project file
							await writeGlmJson().then((result) => {
								if (result && !result.success) {
									handleWriteError(networkType, result.message);
								}
							});

							return true;
						}
					}
					break;

				case SelectableNetworkTypes.Communications:
					if (nndJson != null && addedNode instanceof NndNode) {
						// add NND node to nndJson
						const sizeBefore = Object.keys(nndJson.nnd_json.network.nodes).length;
						const newJson = nndApi.appendNodeToJson(nndJson.nnd_json, addedNode, netmask);
						setNndJson({
							...nndJson,
							nnd_json: newJson,
							nodes: [...nndJson.nodes, addedNode],
						});
						if (sizeBefore < Object.keys(newJson.network.nodes).length) {
							// add new node to the network graph canvas
							commsNetwork?.addNode(addedNode.getNetworkNode());

							// write the nndJson changes back to the project file
							await writeNndJson().then((result) => {
								if (result && !result.success) {
									handleWriteError(networkType, result.message);
								}
							});

							return true;
						}
					}
					break;

				default:
					break;

			}

		}

		return false;
	}

	const updateNode = async (
		networkType: SelectableNetworkTypes,
		updatedNode: NndNode|GLMNode
	): Promise<boolean> => {

		if (project) {

			switch (networkType) {

				case SelectableNetworkTypes.Power:
					if (glmJson != null && updatedNode instanceof GLMNode) {
						// find the existing node
						const replaceNodeIndex = glmJson.glm_json.objects.nodes.findIndex((item) => {
							return item.meta_props.name === updatedNode.meta_props.name;
						});

						if (replaceNodeIndex > -1) {

							// replace the node with the updated node
							glmJson.glm_json.objects.nodes[replaceNodeIndex] = updatedNode;
							setGlmJson(glmJson);
						
							// update the network graph canvas
							powerNetwork?.updateNode(updatedNode.getNetworkNode());

							// write back to the server files
							await writeGlmJson().then((result) => {
								if (result && !result.success) {
									handleWriteError(networkType, result.message);
								}
							});

							return true;
						}
					}
					break;

				case SelectableNetworkTypes.Communications:
					if (nndJson != null && updatedNode instanceof NndNode) {
						if (updatedNode.nodeName in nndJson.nnd_json.network.nodes) {
							
							// update node in nndJson
							nndJson.nnd_json.network.nodes[updatedNode.nodeName] = updatedNode;
							nndJson.nodes = nndJson.nodes.map(n => {
								return n.nodeName == updatedNode.nodeName ? updatedNode : n;
							})

							setNndJson(nndJson);

							// update the network graph canvas
							commsNetwork?.updateNode(updatedNode.getNetworkNode());

							// write back to the server files
							await writeNndJson().then((result) => {
								if (result && !result.success) {
									handleWriteError(networkType, result.message);
								}
							});

							return true;
						}
					}
					break;

				default:
					break;

			}
		}

		return false;
	}

	const removeSelection = async (networkType: SelectableNetworkTypes, deleteSelection: GlmSelection|NndSelection): Promise<boolean> => {

		switch (networkType) {
			case SelectableNetworkTypes.Power:
				if (glmJson != null && deleteSelection instanceof GlmSelection && deleteSelection.glmNodes) {

					const nodesSizeBefore = glmJson.glm_json.objects.nodes.length;
					const edgesSizeBefore = glmJson.glm_json.objects.edges.length;
					const nodeNames: string[] = []

					deleteSelection.glmNodes.forEach((node) => {
						if (node.meta_props.name) nodeNames.push(node.meta_props.name)
					});

					// Remove selected nodes and connecting edges from current glmJson
					if (deleteSelection.glmNodes.length > 0) {
						setGlmJson({ ...glmJson, glm_json: glmApi.removeNodesFromJson(glmJson.glm_json, deleteSelection.glmNodes)});
						if (linkagesJson && linkagesJson.linkages && deleteSelection.glmNodes[0].meta_props.name) {
							setLinkagesJson({ 
								...linkagesJson, 
								linkages: linkagesApi.removeNodesFromJson(linkagesJson.linkages, deleteSelection.glmNodes[0].meta_props.name, SelectableNetworkTypes.Power)
							})

							await writeLinkagesJson().then((result) => {
								if (result && !result.success) {
									handleWriteError(networkType, result.message);
								}
							});
						}
					}

					// Remove selected edges from current glmJson 
					if (deleteSelection.glmNodes.length == 0 && deleteSelection.glmEdges.length > 0) {
						setGlmJson({ ...glmJson, glm_json: glmApi.removeEdgesFromJson(glmJson.glm_json, deleteSelection.glmEdges)});
					}
					
					const nodesSizeAfter = glmJson.glm_json.objects.nodes.length;
					const edgesSizeAfter = glmJson.glm_json.objects.edges.length;

					// check if the size of the node or edge collection changed
					if (nodesSizeBefore > nodesSizeAfter || edgesSizeBefore > edgesSizeAfter) {
						// Remove selected nodes and edges from the power network class
						powerNetwork?.removeGlmSelection(deleteSelection);

						// write the glmJson changes back to the project file
						await writeGlmJson().then((result) => {
							if (result && !result.success) {
								handleWriteError(networkType, result.message);
							}
						});

						return true;
					}
				}
				break
			case SelectableNetworkTypes.Communications:
				if (nndJson != null && deleteSelection instanceof NndSelection && (deleteSelection.nndNodes || deleteSelection.nndEdges)) {
					// calcualte size before remove calls
					const nodeSizeBefore = nndJson.nodes.length;
					const edgeSizeBefore = nndJson.edges.length;

					if (deleteSelection.nndNodes?.length) {
						// remove node from current nndJson JSON
						nndJson.nnd_json = nndApi.removeNodeFromJson(nndJson.nnd_json, deleteSelection.nndNodes);

						// adjust the nodes array
						nndJson.nodes = nndJson.nodes.filter(glmNode => {
							return deleteSelection.nndNodes.every(remNode => remNode.id !== glmNode.id);
						});

						if (linkagesJson && linkagesJson.linkages && deleteSelection.nndNodes[0].nodeName) {
							setLinkagesJson({ 
								...linkagesJson, 
								linkages: linkagesApi.removeNodesFromJson(linkagesJson.linkages, deleteSelection.nndNodes[0].nodeName, SelectableNetworkTypes.Communications)
							})
							await writeLinkagesJson().then((result) => {
								if (result && !result.success) {
									handleWriteError(networkType, result.message);
								}
							});
						}
					}

					// Only remove edges if the node selection is empty and the edge selection is not
					if (deleteSelection.nndEdges?.length && !deleteSelection.nndNodes?.length) {
						// remove edge from current nndJson
						nndJson.nnd_json = nndApi.removeEdgeFromJson(nndJson.nnd_json, deleteSelection.nndEdges);

						// adjust the edges array
						nndJson.edges = nndJson.edges.filter(glmEdge => {
							return deleteSelection.nndEdges.every(remEdge => remEdge.id !== glmEdge.id);
						});
					}

					setNndJson(nndJson);

					// calcualte size after remove calls
					const nodeSizeAfter = nndJson.nodes.length;
					const edgeSizeAfter = nndJson.edges.length;

					// check if the size of the node collection changed
					if (nodeSizeBefore > nodeSizeAfter || edgeSizeBefore > edgeSizeAfter) {
						// remove from the power network class
						commsNetwork?.removeNndSelection(deleteSelection);

						// write the nndJson changes back to the project file
						await writeNndJson().then((result) => {
							if (result && !result.success) {
								handleWriteError(networkType, result.message);
							}
						});

						return true;
					}

				}
				break;
			default:
				break;
		}

		return false;
	}

	const getEdges = (
		networkType: SelectableNetworkTypes,
		edgeId: string|null = null, 
		fromNodeName: string|null = null,
		toNodeName: string|null = null,
	): Array<GLMEdge|NndEdge>|null => {

		if (project) {
			switch (networkType) {

				case SelectableNetworkTypes.Power:
					if (glmJson !== null) {
						
						// if the search strings are both null get all edges
						if (edgeId === null && fromNodeName === null && toNodeName === null) {
							return glmJson.glm_json.objects.edges.map(edge => new GLMEdge(edge));
						}

						// if given a source node and destination node, determine if an edge exists between them
						if (edgeId === null && fromNodeName != null && toNodeName != null) {
							return glmJson.glm_json.objects.edges.filter((edge: GLMEdge) => {
								const matchFrom: boolean = edge.meta_props.from === fromNodeName || edge.meta_props.from === toNodeName;
								const matchTo: boolean = edge.meta_props.to === toNodeName || edge.meta_props.to === fromNodeName;
								return matchFrom && matchTo;
							});
						}

						// get edges from glmJson when the from matches
						const edges = glmJson.glm_json.objects.edges.filter((edge) => {
							// Check if the name on the edges's meta props matches the regex, then check if the id on the node meta props matches the regex
							const matchId: boolean = edgeId ? edge.id === edgeId : false;
							const matchFrom: boolean = fromNodeName ? edge.meta_props.from === fromNodeName : false;
							const matchTo: boolean = toNodeName ? edge.meta_props.to === toNodeName : false;

							// Check if the name on the edges's meta props matches the regex, then check if the id on the node meta props matches the regex
							return matchId || matchFrom || matchTo;
						});

						return edges.map(edge => new GLMEdge(edge));
					}
					break;

				case SelectableNetworkTypes.Communications:
					if (nndJson !== null) {
						// if the search strings are both null get all edges
						if (edgeId === null && fromNodeName === null && toNodeName === null) {
							return nndJson.edges;
						}

						// if given a source node and destination node, determine if an edge exists between them
						if (edgeId === null && fromNodeName != null && toNodeName != null) {
							return nndJson.edges.filter((edge: NndEdge) => {
								const matchFrom: boolean = edge.fromNode === fromNodeName || edge.fromNode === toNodeName;
								const matchTo: boolean = edge.toNode === toNodeName || edge.toNode === fromNodeName;
								return matchFrom && matchTo;
							});
						}

						// get edges from nndGraph
						return nndJson.edges.filter((edge: NndEdge) => {
							// Check if the name on the edges's meta props matches the regex, then check if the id on the node meta props matches the regex
							const matchId: boolean = edgeId ? edge.id === edgeId : false;
							const matchFrom: boolean = fromNodeName ? edge.fromNode === fromNodeName : false;
							const matchTo: boolean = toNodeName ? edge.toNode === toNodeName : false;

							return matchId || matchFrom || matchTo;
						});
					}
					break;

				default:
					break;
			} /* end switch on network type */
		}

		return null;
	}

	const getEdgeById = (
		networkType: SelectableNetworkTypes,
		edgeId: string,
	): NndEdge|GLMEdge|null => {
		if (project) {
			// Use project context getEdges to find edgeID from existing GLM edges
			const edges = getEdges(networkType, edgeId);

			// get the fist edge found if it exists
			return edges && edges.length ? edges[0] : null;
		}
		return null;
	}

	const addEdge = async (
		networkType: SelectableNetworkTypes,
		addedEdge: NndEdge|GLMEdge,
		subnet?: string
	): Promise<boolean> => {

		switch (networkType) {
			case SelectableNetworkTypes.Power:
				// check if the glmJson is not NULL and the type of edge is a GLMEdge
				if (glmJson !== null && addedEdge instanceof GLMEdge) {
					// add GLM edge to glmJson
					const sizeBefore = glmJson.glm_json.objects.edges.length;
					setGlmJson({ ...glmJson, glm_json: glmApi.appendEdgeToJson(glmJson.glm_json, addedEdge)});

					// check if the size of the edge collection changed
					if (sizeBefore < glmJson.glm_json.objects.edges.length) {
						//Add new edge to the network graph canvas
						powerNetwork?.addEdge(addedEdge.getNetworkEdge());

						// write the glmJson changes back to the project file
						await writeGlmJson().then((result) => {
							if (result && !result.success) {
								handleWriteError(networkType, result.message);
							}
						});
					}

					return true;
				}
				break;

			case SelectableNetworkTypes.Communications:
				// check if the nndJson is not NULL and the type of edge is a NndEdge
				if (nndJson != null && addedEdge instanceof NndEdge && subnet !== undefined) {
					const { Edges: edgesBefore } = nndApi.generateGraph(nndJson.nnd_json);

					// add NND edge to nndJson
					const sizeBefore = edgesBefore.length;

                    let subnetIp = nndApi.generateIPAddr(nndJson.nnd_json, subnet)
					let new_nnd_json = nndApi.appendEdgeToJson(nndJson.nnd_json, addedEdge, subnet, subnetIp);
					
					const { Edges: edgesAfter } = nndApi.generateGraph(new_nnd_json);

					// check if the size of the edge collection changed
					if (sizeBefore < edgesAfter.length) {
						// add new edge to the network graph canvas
						commsNetwork?.addEdge(addedEdge.getNetworkEdge());
						setNndJson({...nndJson, edges: edgesAfter, nnd_json: new_nnd_json})

						// write the nndJson changes back to the project file
						await writeNndJson().then((result) => {
							if (result && !result.success) {
								handleWriteError(networkType, result.message);
							}
						});

						return true;
					}
				}
				break;
		}
		return false;
	}

	const updateEdge = async (
		networkType: SelectableNetworkTypes,
		oldEdge: NndEdge|GLMEdge,
		sourceNode: string,
		destinationNode: string
	): Promise<boolean> => {
		if (project) {
			switch (networkType) {
				case SelectableNetworkTypes.Power:
					if (glmJson != null && oldEdge instanceof GLMEdge) {
						// find the existing edge
						const replaceEdgeIndex = glmJson.glm_json.objects.edges.findIndex((item) => {
							return item.meta_props.name === oldEdge.meta_props.name;
						});

						if (replaceEdgeIndex > -1) {
							// replace the edge with the updated edge
							oldEdge.meta_props.to = destinationNode;
							oldEdge.meta_props.from = sourceNode;
							glmJson.glm_json.objects.edges[replaceEdgeIndex] = oldEdge;
							setGlmJson(glmJson);
						
							// update the network graph canvas
							let edgeId = oldEdge.getNetworkEdge().id;
							if (edgeId !== undefined) {
								powerNetwork?.updateEdge(edgeId);
							}

							setPowerNetwork(powerNetwork)

							// write back to the server files
							await writeGlmJson().then((result) => {
								if (result && !result.success) {
									handleWriteError(networkType, result.message);
								}
							});

							return true;
						}
					}
					break;

				case SelectableNetworkTypes.Communications:
					if (nndJson != null && oldEdge instanceof NndEdge) {
						let edgeIndex = nndJson.edges.indexOf(oldEdge);
						let updatedEdge = oldEdge;
						let subnets = nndJson.nnd_json.network.topology.subnets;
						let oldSubnet = oldEdge.subnet.subnetName;
						let oldSwitch = oldEdge.subnet.switchName;

						if (oldEdge !== null && oldEdge instanceof NndEdge) {
							let links = subnets[oldSubnet]["links"];
							let linkIndex = 0;

							// Get the index of the link within the subnet that the edge is contained in
							for (let i = 0; i < links.length - 1; i++) {
								let edges = Object.keys(links[i].interfaces);
								if (oldEdge.fromNode === edges[0] && oldEdge.toNode === edges[1]) {
									linkIndex = i;
									break;
								}
							}

							let newSubnetInfo = [oldSubnet, oldSwitch]
							if (sourceNode !== oldEdge.fromNode) {
								if (sourceNode.startsWith("switch") && sourceNode !== oldSwitch) {
									// Switch changed, sourceNode is switch, destinationNode is not
									try {
										newSubnetInfo = changeSubnet(destinationNode, sourceNode, linkIndex, oldSubnet, oldSwitch);
									}
									catch {
										throw Error;
									}
								}
							}
							else if (destinationNode !== oldEdge.toNode) {
								if (destinationNode.startsWith("switch") && destinationNode !== oldSwitch) {
									// Switch changed, sourceNode is not a switch, destinationNode is switch
									try {
										newSubnetInfo = changeSubnet(sourceNode, destinationNode, linkIndex, oldSubnet, oldSwitch);
									}
									catch {
										throw Error;
									}
								}
							}

							// Update the actual edge object
							updatedEdge.fromNode = sourceNode;
							updatedEdge.toNode = destinationNode;
							updatedEdge.subnet = {
								subnetName: newSubnetInfo[0],
								switchName: newSubnetInfo[1]
							} 
						}
						
						// Update the edges array with the updated edge
						if (edgeIndex !== -1) {
							nndJson.edges[edgeIndex] = updatedEdge;
						}

						commsNetwork?.updateEdge(updatedEdge.id);
						setCommsNetwork(commsNetwork);

						// Write the nndJson changes back to the project file
						await writeNndJson().then((result) => {
							if (result && !result.success) {
								handleWriteError(networkType, result.message);
							}
						});
						
						return true;
					}
					break;
				default:
					break;
			}
		}

		return false;
	}

	//#endregion NETWORK GRAPH INTERFACES


	//#region HELPER FUNCTIONS

	const handleWriteError = (networkType: SelectableNetworkTypes, errorMessage: String): boolean => {
		//TODO: handle write fail
		console.log(errorMessage);
		return false;
	};

	const changeSubnet = (
		sourceNode: string, newSwitch: string, oldLinkIndex: number, oldSubnet: string, oldSwitch: string
	): string[] => {
		if (nndJson !== null) {
			let subnets = nndJson.nnd_json.network.topology.subnets;
			let links = subnets[oldSubnet]["links"];

			// Remove interface from original switch
			let subnetInterface: number = 0;
			Object.keys(links[oldLinkIndex].interfaces).forEach((node, i) => {
				if (node.startsWith("switch")) {
					subnetInterface = links[oldLinkIndex].interfaces[node][0];
				}
			});
			nndJson.nnd_json.network.nodes[oldSwitch].interfaces.splice(subnetInterface, 1);

			// Update switch indeces within links in old subnet
			links.forEach((link, i) => {
				if (i > subnetInterface) {
					link.interfaces[oldSwitch][0] = link.interfaces[oldSwitch][0] - 1;
				}
			})

			// Remove link with old edge from old subnet
			links.splice(oldLinkIndex, 1);

			// Grab info for new subnet
			let newSubnet = nndApi.getSubnetFromSwitch(nndJson.nnd_json, newSwitch);
			let subnetNetmask = subnets[newSubnet].netmask;
			let subnetNetworkAddr = subnets[newSubnet].networkAddr;

			// Grab interfaces for node
			let sourceNodeObject = getNodes(SelectableNetworkTypes.Communications, sourceNode);
			let nodeInterfaces: INndInterface[] = [];
			if (sourceNodeObject !== null && sourceNodeObject[0] instanceof NndNode) {
				nodeInterfaces = sourceNodeObject[0].interfaces;
			}

			// Find the node interface to the new subnet
			let nodeInterfaceIndex = -1;
			for (let i = 0; i < nodeInterfaces.length; i++) {
				let ip = nodeInterfaces[i].ipAddr || "";

				let ipInt = nndApi.convertIPToInt(ip);
				let netmaskInt = nndApi.convertIPToInt(subnetNetmask);
				let networkAddrInt = nndApi.convertIPToInt(subnetNetworkAddr)
				if ((ipInt & netmaskInt) == networkAddrInt) {
					nodeInterfaceIndex = i;
					break;
				} 
			}

			// If no interface exists to the new subnet, create one
			if (nodeInterfaceIndex === -1) {
				let newIp;
				try {
					newIp = nndApi.generateIPAddr(nndJson.nnd_json, newSubnet, subnetNetmask)
				}
				catch {
					throw Error;
				}

				let newNodeInterface: INndInterface = {
					ipAddr: newIp,
					macAddr: nndApi.generateMacAddr(nndJson.nnd_json),
					pcap: {
						enabled: true,
						promiscuous: false
					}
				}
				nodeInterfaceIndex = nndJson.nnd_json.network.nodes[sourceNode].interfaces.push(newNodeInterface) - 1;
			}

			// Add new interface to new switch 
			let newMacAddr = nndApi.generateMacAddr(nndJson.nnd_json);
			let newSwitchInterface: INndInterface = {
				macAddr: newMacAddr,
				pcap: {
					enabled: true, // TODO: use these default values or ask the user in the modal 
					promiscuous: false
				}
			}
			let switchIndex = nndJson.nnd_json.network.nodes[newSwitch].interfaces.push(newSwitchInterface) - 1;

			// Add new link with correct interface index to new subnet
			let newLink = {
				interfaces: {
					[sourceNode]: [nodeInterfaceIndex],
					[newSwitch]: [switchIndex]
				}
			}
			subnets[newSubnet].links.push(newLink);

			return [newSubnet, newSwitch];
		}
		return [];
	}

	//#endregion

	return (
		<ProjectContext.Provider
			value={{
				project, setProject,
				glmJson, getGlmJson, writeGlmJson,
				nndJson, getNndJson, writeNndJson,
				linkagesJson, getLinkagesJson,
				powerNetwork, setPowerNetwork,
				commsNetwork, setCommsNetwork,
				commsCentricNetwork, setCommsCentricNetwork,
				powerCentricNetwork, setPowerCentricNetwork,
				selectedNetworkType, setSelectedNetworkType,
				getNodes, getNodeById, addNode, updateNode, removeSelection,
				getEdges, getEdgeById, addEdge, updateEdge
			}}>
			{children}
		</ProjectContext.Provider>
	);
};