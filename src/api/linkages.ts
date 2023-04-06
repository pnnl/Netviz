import { BASE_PATH } from './settings';
import axios from 'axios';
import { INndFileJSONResp,  } from './nnd';
import { GLMNode, IFileJSONResp, IWriteJSONResp } from './glm';
import { IdType, Node } from 'vis-network';
import { IProject } from './projects';
import { SelectableNetworkTypes } from 'context';


export type LinkagesFileResp = {
	success: boolean;
	message: string;
	linkages: ILinkagesJson;
}

export type ILinkagesJson = {
	linkages: {
		[node: string] : string[];
	};
}

class _linkagesApi {
	apiBasePath = BASE_PATH;

    getLinkagesFile = async (serverFileName: string): Promise<any|null> => {
		return await axios.post(`${this.apiBasePath}/projects/get-linkages`, { "server-file-name": serverFileName })
			.then(({ data }) => {
				let resp: LinkagesFileResp = data;

				if (resp.success && resp.linkages != undefined) {
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

	getNndGroups = (nndJson: INndFileJSONResp) => {
		let groups: string[] = []
		if (nndJson) {
			nndJson.nodes.forEach((node) => {
				if (node.group && !groups.includes(node.group)) {
					groups.push(node.group);
				}
			});
		}
		return groups;
	}

	getGlmGroups = (linkagesResp: LinkagesFileResp, node: GLMNode): string[] => {
		let groups: string[] = [];
		Object.keys(linkagesResp.linkages.linkages).forEach((nodeName) => {
			if (nodeName === node.meta_props.name) {
				groups = linkagesResp.linkages.linkages[nodeName];
			}
		})
		return groups;
	}

	getGlmNodesInLinkages = (linkagesJson: ILinkagesJson) => {
		let nodes: string[] = [];
		Object.keys(linkagesJson.linkages).forEach((nodeName) => {
			nodes.push(nodeName);
		});
		return nodes;
	}

	getGlmNodesWithGroup = (glmJson: IFileJSONResp) => {
		let nodes: GLMNode[] = [];
		glmJson.glm_json.objects.nodes.forEach((node) => {
			if (node.group) {
				nodes.push(node);
			}
		})
		return nodes;
	}

	getNodesInGroup = (group: string, nodes: Node[]) => {
		let nodeIds: IdType[] = [];
		nodes.forEach((node) => {
			if (node.group === group && node.id) {
				nodeIds.push(node.id);
			}
		});
		return nodeIds;
	}

  generatePowerCentricGraph = (linkagesJson: ILinkagesJson, glmJson: IFileJSONResp): IFileJSONResp => {
		let combinedGlmJson: IFileJSONResp = glmJson;
		Object.keys(linkagesJson.linkages).forEach(powerNode => {
			let filteredNodes = combinedGlmJson.glm_json.objects.nodes.filter(glmNode => glmNode.meta_props.name === powerNode);
			filteredNodes[0].group = linkagesJson.linkages[powerNode][0];
		});
		return combinedGlmJson;
    }

	generateCommsCentricGraph = (linkagesJson: ILinkagesJson, nndJson: INndFileJSONResp): INndFileJSONResp => {
		Object.keys(linkagesJson.linkages).forEach(group => {
			linkagesJson.linkages[group].forEach(nodeName => {
				nndJson.nnd_json.network.nodes[nodeName].group = group;

				let filteredNodes = nndJson.nodes.filter(nndNode => nndNode.nodeName === nodeName);
				filteredNodes[0].group = group;
			});
		});

		return nndJson;
    }

	removeNodesFromJson(linkagesJson: ILinkagesJson, removeNode: string, networkType: SelectableNetworkTypes): ILinkagesJson {
		if (networkType === SelectableNetworkTypes.Power) {
			let allNodes = this.getGlmNodesInLinkages(linkagesJson);

			allNodes.forEach((node) => {
				if (node === removeNode) {
					delete linkagesJson.linkages[removeNode];
				}
			});
		}
		else if (networkType === SelectableNetworkTypes.Communications) {
			let nodeListWithDeletedNode: string[] = [];
			let glmNodeWithDeletedNode = "";
			Object.keys(linkagesJson.linkages).forEach((glmNode) => {
				linkagesJson.linkages[glmNode].forEach((node) => {
					if (node === removeNode) {
						nodeListWithDeletedNode = linkagesJson.linkages[glmNode];
						glmNodeWithDeletedNode = glmNode;
					}
				});
			});

			let newNodeList = nodeListWithDeletedNode.filter((node) => node !== removeNode);
			linkagesJson.linkages[glmNodeWithDeletedNode] = newNodeList;
		}

		return linkagesJson;
	}

	writeJson = async (linkagesJson: ILinkagesJson|undefined, project: IProject|undefined): Promise<IWriteJSONResp|null> => {
		if (project === undefined) {
			console.error('Undefined project in writeJson.');
			return null;
		}
		else if (linkagesJson === undefined) {
			console.error('Undefined linkagesJson in writeJson.');
			return null;
		}

		const writeJsonData = { project: project, linkagesJson: linkagesJson };

		return await axios.post(`${this.apiBasePath}/linkages/write-json`, writeJsonData)
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
				return null;
			});
	}
}

const linkagesApi = new _linkagesApi();
Object.freeze(linkagesApi);


export default linkagesApi;