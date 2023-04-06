import axios from 'axios';
import { Node, Edge, IdType } from "vis-network/peer/esm/vis-network";

import { BASE_PATH, UniqueId, IApiResp, IPdfResp } from './settings';
import { IProject } from 'api';
import { IGLMNodeType, GLMNodeType } from 'common';

type IUploadFileResp = IApiResp & {
	file_on_server: string;
	uploaded_file_name: string;
	errors: string[];
	sent: string;
}

export type IWriteJSONResp = IApiResp;
export type IUpdateJSONResp = IApiResp;

export type IFileJSONResp = IApiResp & {
	glm_json: IGLMJson;
}

export type IGLMJson = {
	header: {
		label: string;
		fontsize: number;
		node: {
			fontname: string;
			fontcolor: string;
			fontsize: string;
			colorscheme: string;
		};
		edge: {
			colorscheme: string;
		}
	};

	glm_lines: {
		[key: string] : {
			[key: string] : IGLMLine
		}
	};

	objects: {
		nodes: IGLMNode[];
		edges: IGLMEdge[];
		other: IGLMObject[];
		configs: IGLMObject[];
	}
};

//GlmLine stores info about non-object lines in glm files
//They are used to reconstruct a glm file when exporting glm
export type IGLMLine = {
	file_name: string;
	line_number: number;
	line: string;
}

export type IGLMObject = {
	id: string;
	dot_props: IGLMDotProp;
	glm_props: any;
	meta_props: IGLMMeta;
	comments: any;
}

export type IGLMNode = IGLMObject & {
	getType: () => IGLMNodeType;
	getNetworkNode: (groupId?: string) => Node;
	setPosition: (x: number, y: number) => void;
	group: string | undefined;
}

export type IGLMEdge = IGLMObject & {
	getNetworkEdge: () => Edge;
}

export type IGLMMeta = {
	line_number: number;
	id: string;
	obj_type: string;
	file_name: string;
	name?: string;
	from?: string;
	to?: string;
	X_pos?: string;
	Y_pos?: string;
	parent?: string;
	len?: string;
	length?: string;
	weight?: string;
	bustype?: string;
	phases?: string;
	nominal_voltage?: string;
}

export type IGLMDotProp = {
	X_pos?: string;
	Y_pos?: string;
	pos?: string;
	fillcolor?: string;
	height?: string;
	label?: string;
	shape?: string;
	width?: string;
	xlabel?: string;
	len?: string;
	penwidth?: string;
}

export type IGlmSelection = {
	glmNodes: GLMNode[];
	glmEdges: GLMEdge[];
	netNodeIds: IdType[];
	netEdgeIds: IdType[];
}

export class GLMObject implements IGLMObject {
	id: string = UniqueId();

	dot_props: IGLMDotProp = {}
	glm_props: any = {}
	meta_props: IGLMMeta = {
		line_number: -1,
		id: 'NODE_ADDED_MISSING_ID',
		obj_type: 'Node',
		file_name: 'added_nodes.glm'
	}
	comments: any = {}

	constructor(defaults?: IGLMObject) {
		if (defaults) {
			this.id = defaults.id ?? UniqueId();
			this.dot_props = defaults.dot_props ?? {};
			this.glm_props = defaults.glm_props ?? {};
			this.meta_props = defaults.meta_props ?? {};
			this.comments = defaults.comments ?? {};
		}
	}
}

export class GLMNode extends GLMObject implements IGLMNode {
	group: string | undefined;

	getType(): IGLMNodeType {
		return new GLMNodeType(this.meta_props.obj_type);
	}

	getNetworkNode(groupId?: string): Node {
		const nodeType = this.getType();

		// do not use the id prop of the GLMNode as the id here, edge linking is dependant on the name of the node from the GLM JSON
		let newNode: Node = {
			id: this.meta_props.name ? this.meta_props.name : this.meta_props.id,
			label: this.dot_props?.xlabel ?? 'no label',
			shape: 'image',
			image: nodeType.iconImage,
			size: this.dot_props?.width && parseFloat(this.dot_props.width) > 0
				? parseFloat(this.dot_props?.width)
				: 10,
			x: this.meta_props.X_pos && parseFloat(this.meta_props.X_pos) > 0
				? parseFloat(this.meta_props.X_pos) * 3
				: undefined,
			y: this.meta_props.Y_pos && parseFloat(this.meta_props.Y_pos) > 0
				? parseFloat(this.meta_props.Y_pos) * 3
				: undefined,
			title: `label: ${this.dot_props?.xlabel ?? 'no label'}`,
			group: this.group
		};

		// check bustype for the SWING type
		if (this.meta_props.bustype && this.meta_props.bustype.toUpperCase() === 'SWING') {
			newNode.image = '/node-images/node_swing.svg';
			newNode.size = 10;
		}

		// check for the size was set
		if (this.dot_props.width && this.dot_props.height && parseFloat(this.dot_props.width) > 0 && parseFloat(this.dot_props.height) > 0) {
			newNode.size = parseFloat(this.dot_props.width) * 100;

			// handle triplex node type adjustments
			if (nodeType.label.toLowerCase() === 'triplex node') {
				newNode.image = '/node-images/house.svg';
			}
			// handle house type adjustments
			if (nodeType.label.toLowerCase() === 'house' && groupId === 'Commercial') {
				newNode.image = '/node-images/house_commercial.svg';
			}
		}

		return newNode;
	}

	// The x/y position here is expected to be for the position on the vis.js graph and needs to be converted to GLM positioning
	setPosition(x: number, y: number) {
		const newX = (x / 3).toString();
		const newY = (y / 3).toString();
		const newPosition = `${newX},${newY}!`;

		this.meta_props.X_pos = newX;
		this.meta_props.Y_pos = newY;
		this.dot_props.X_pos = newX;
		this.dot_props.Y_pos = newY;
		this.dot_props.pos = newPosition;
	}
}

export class GLMEdge extends GLMObject implements IGLMEdge {

	constructor(defaults?: IGLMObject) {
		super(defaults);
		this.id = `${this.meta_props.from}_${this.meta_props.to}`;
	}

	getNetworkEdge(): Edge {
		const newEdge: Edge = {
			id: `${this.meta_props.from}_${this.meta_props.to}`,
			from: this.meta_props.from,
			to: this.meta_props.to,
			label: this.dot_props?.xlabel ?? undefined,
		};

		return newEdge;
	}
}

export class GlmSelection implements IGlmSelection {
	glmNodes: GLMNode[];
	glmEdges: GLMEdge[];
	netNodeIds: IdType[];
	netEdgeIds: IdType[];

	constructor(obj: IGlmSelection) {
		this.glmNodes = obj.glmNodes;
		this.glmEdges = obj.glmEdges;
		this.netNodeIds = obj.netNodeIds;
		this.netEdgeIds = obj.netEdgeIds;
	}
}

class _glmApi {
	apiBasePath = BASE_PATH;

	// constructor() {}
	uploadFile = async (formDataWithFile: string): Promise<string|null> => {
		return await axios.post(`${this.apiBasePath}/glm/upload-file`, formDataWithFile)
			.then(({ status, data }) => {
				if (status !== 200) {
					console.error('Invalid response status code: ' + status);
					return null;
				}

				const resp: IUploadFileResp = data;

				if (resp.success && resp.file_on_server != undefined) {
					return resp.file_on_server;
				}
				else {
					console.error(resp.success, resp.errors);
					return null;
				}
			});
	}

	parseJson = async (serverFileName: string): Promise<any|null> => {
		return await axios.post(`${this.apiBasePath}/glm/get-json`, { "server-file-name": serverFileName })
			.then(({ status, data }) => {
				if (status !== 200) {
					console.error('Invalid response status code: ' + status);
					return null;
				}

				let resp: IFileJSONResp = data;

				if (resp.success && resp.glm_json != undefined) {
					// create objects from response, to create id's
					resp.glm_json.objects.nodes = resp.glm_json.objects.nodes.map(n => new GLMNode(n));
					resp.glm_json.objects.edges = resp.glm_json.objects.edges.map(e => new GLMEdge(e));

					return resp;
				}
				else {
					console.error(resp.success, resp.message);
					return null;
				}
			}).catch(error => {
				console.error(error.response);
				return null;
			});
	}

	writeJson = async (glmJson: IFileJSONResp|null, project: IProject|undefined): Promise<IWriteJSONResp|null> => {
		if (project === undefined) {
			console.error('Undefined project in writeJson.');
			return null;
		}
		else if (glmJson === null) {
			console.error('Undefined glmJson in writeJson.');
			return null;
		}

		const writeJsonData = { project: project, glmJson: glmJson['glm_json'] };

		return await axios.post(`${this.apiBasePath}/glm/write-json`, writeJsonData)
			.then(({ status, data }) => {
				if (status !== 200) {
					console.error('Invalid response status code: ' + status);
					return null;
				}

				const resp: IWriteJSONResp = data;
				if (resp.success) {
					return resp;
				}
				else return null;
			}).catch(error => {
				console.log(error.response);
				return null;
			});
	}

	exportPdf = async (serverFileName:string): Promise<IPdfResp|null> => {
		
		return await axios.post(`${this.apiBasePath}/glm/export-pdf`, {"server-file-name": serverFileName})
			.then(({ status, data }) => {
				if (status !== 200) {
					console.error('Invalid response status code: ' + status);
					return null;
				}

				const resp: IPdfResp = data;
				if (resp.success) {
					return resp;
				}
				else return null;
			}).catch(error => {
				console.log(error.response);
				return null;
			});
	}

	exportCsv = async (serverFileName:string, timeString:string, csvJson: any, objType:string): Promise<IPdfResp|null> => {
		
		return await axios.post(`${this.apiBasePath}/glm/export-csv`, {"server-file-name": serverFileName, "time-string": timeString, "csv-json":csvJson, "obj-type":objType})
			.then(({ status, data }) => {
				if (status !== 200) {
					console.error('Invalid response status code: ' + status);
					return null;
				}

				const resp: IPdfResp = data;
				if (resp.success) {
					return resp;
				}
				else return null;
			}).catch(error => {
				console.log(error.response);
				return null;
			});
	}

	downloadFile = async (serverFileName:string, timeString:string): Promise<IPdfResp|null> => {
		
		return await axios.post(`${this.apiBasePath}/glm/download-file`, {"server-file-name": serverFileName, "time-string": timeString})
			.then(({ status, data }) => {
				if (status !== 200) {
					console.error('Invalid response status code: ' + status);
					return null;
				}

				const resp: IPdfResp = data;
				if (resp.success) {
					return resp;
				}
				else return null;
			}).catch(error => {
				console.log(error.response);
				return null;
			});
	}

	openPdfWindow = async (pdfResp: IPdfResp): Promise<void> => {
		
		if (pdfResp.success && pdfResp.pdf && pdfResp.pdf.length > 0) {
			window.open(`${this.apiBasePath}/pdf/${pdfResp.pdf}`);
		}
		else {
			alert(`Unable to open Power PDF File [${pdfResp.message}].`);
		}
	}

	createGlmNode(newNode: Node, newNodeType: GLMNodeType|null ) {
		const newX = newNode.x ? (newNode.x / 3).toString() : '0';
		const newY = newNode.y ? (newNode.y / 3).toString() : '0';
		const newPosition = `${newX},${newY}!`;

		return new GLMNode({
			id: newNode.id?.toString() ?? UniqueId(),
			meta_props: {
					name: newNode.id?.toString(),
					id: newNode.id?.toString() ?? '',
					obj_type: newNodeType?.label.toLowerCase() ?? 'basic',
					X_pos: newX,
					Y_pos: newY,
					line_number: -1,
					file_name: '',
			},
			dot_props: {
					xlabel: `New ${newNodeType?.label}`,
					width: newNodeType?.label.toLowerCase() === 'load' ? '20' : '10' ?? '10',
					X_pos: newX,
					Y_pos: newY,
					pos: newPosition,
			},
			glm_props: {
				name: newNode.id?.toString(),
			},
			comments: {},
		});
	}

	createGlmEdge(newEdge: Edge, newEdgeType: string|null ) {
		if (newEdge.to && newEdge.from) {
			const newTo = newEdge.to.toString();
			const newFrom = newEdge.from.toString();
	
			return new GLMEdge({
				id: newEdge.id?.toString() ?? UniqueId(),
				meta_props: {
						id: `${newFrom}_${newTo}`,
						name: `${newFrom}_${newTo}`,
						obj_type: newEdgeType?.toLowerCase() ?? 'line',
						to: newTo,
						from: newFrom,
						line_number: -1,
						file_name: '',
				},
				dot_props: {
						xlabel: `New ${newEdgeType}`,
						len: "0.25",
						penwidth: "5"
				},
				glm_props: {
					name: newEdge.id?.toString(),
				},
				comments: {},
			});

		}
		return null;
	}

	appendNodeToJson(glmJson: IGLMJson, newNode: GLMNode): IGLMJson {
		// find existing node with matching name
		const existingNode = glmJson.objects.nodes.find((item) => {
			return item.meta_props.name === newNode.meta_props.name;
		});

		if (existingNode === undefined) {
			glmJson.objects.nodes.push(newNode);
		}

		return glmJson;
	}

	removeNodesFromJson(glmJson: IGLMJson, removeNodes: GLMNode[]): IGLMJson {
		glmJson.objects.nodes = glmJson.objects.nodes.filter(node => {
			return removeNodes.every(rNode => rNode.meta_props.name !== node.meta_props.name);
		});

		removeNodes.forEach(removeNode => {
			const removeEdges: GLMEdge[] = glmJson.objects.edges.filter((edge) => {
				return edge.meta_props.from == removeNode.meta_props.name || edge.meta_props.to == removeNode.meta_props.name
			})

			if (removeEdges.length > 0) {
				this.removeEdgesFromJson(glmJson, removeEdges)
			}
		})

		return glmJson;
	}

	appendEdgeToJson(glmJson: IGLMJson, newEdge: GLMEdge): IGLMJson {
		// find existing edge with matching name
		const existingEdge = glmJson.objects.edges.find((item) => {
			return item.meta_props.from === newEdge.meta_props.from
				&& item.meta_props.to === newEdge.meta_props.to;
		});

		if (existingEdge === undefined) {
			glmJson.objects.edges.push(newEdge);
		}

		return glmJson;
	}

	removeEdgesFromJson(glmJson: IGLMJson, removeEdges: GLMEdge[]): IGLMJson {
		glmJson.objects.edges = glmJson.objects.edges.filter(glmEdge => {
			return removeEdges.every(edge => edge.id !== glmEdge.id)
		});

		return glmJson
	}

	
}

const glmApi = new _glmApi();
Object.freeze(glmApi);

export default glmApi;