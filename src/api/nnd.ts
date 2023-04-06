import axios from 'axios';
import { Node, Edge, IdType } from "vis-network/peer/esm/vis-network";

import { IProject, IWriteJSONResp } from 'api';
import { BASE_PATH, UniqueId, IApiResp, IPdfResp } from './settings';
import { INndNodeType, NndNodeType } from "common";

export enum nndAppType {
	ICSServer = "ICSServer",
	OnOffApp = "onOffApp",
	PacketSink = "packetSink",
	FoxSensor = "foxSensor",
	BasicSensor = "basicSensor",
	Switch = "switch",
	Controller = "controller",
	Router = "router",
	WirelessAccessPoint = "wirelessAccessPoint"
}

export type INndFileJSONResp = IApiResp & {
	nnd_json: INndJson;
	nodes: NndNode[];
	edges: NndEdge[];
}

export type INndJson = {
	NNDVersion: number;

	HELICSFederateName: string;

	network: {
		nodes: {
			[name: string] : INndNode
		};
		topology: {
			channels?: {
				[name: string] : INndTopologyChannel;
			};
			subnets: {
				[name: string] : INndTopologySubnet;
			};
		};
		render: boolean;
		enablePcapAll?: boolean;
		description?: string;
	};
}

export type INndInterface = {
	macAddr: string;
	ipAddr?: string;
	netMask?: string;
	vlan?: number;
	pcap?: {
		enabled: boolean;
		promiscuous: boolean;
	}
}

export type INndCoupling = {
	framework: string;
	simulator: string;
	commModel: string;
	subscription?: [
		{
			name: string;
			type: string;
		}
	];
	publication?: [
		{
			name: string;
			type: string;
		}
	];
}

export type INndTrafficProfile = {
	startTime: number;
	endTime: number;
	packetCount: number;
	packetSize: number;
}

export type INndApplication = {
	appTemplate: string;
	port?: number;
	trafficProfile?: INndTrafficProfile;
	remotes?: [
		{
			ipAddr: string;
		}
	];
	agents?: [
		{
			agentTemplate: string;
			name: string;
		}
	];
	agent?: string;
	coupling?: INndCoupling;
	coSimCouplings?: any[];
	links?: any[],
	ioMap?: [
		{
			name: string;
			dataType: string;
			value: string;
			dirty: boolean;
		}
	]
}

export type INndNode = {
	id: string;
	nodeName?:string;
	interfaces: INndInterface[];
	applications: {
		[name: string] : INndApplication
	};
	position?: {
		x: number;
		y: number;
		z: number;
	};
	graphics?: {
		image: string;
	},
	group?: string;
}

export type INndEdge = {
	toNode: string;
	fromNode: string;
	label: string;
	id: string;
}

export type INndTopologyChannel = {
	type: string;
	delay: string;
	dataRate: string;
	packetLoss?: string;
}

export type INndTopologySubnet = {
	networkAddr: string;
	netmask: string;
	links: INndLink[];
}

export type INndLink = {
	channel?: string;
	interfaces: {
		[name: string] : number[];
	} 
}

export type INndSelection = {
	nndNodes: NndNode[];
	nndEdges: NndEdge[];
	netNodeIds: IdType[];
	netEdgeIds: IdType[];
}

export class NndNode implements INndNode {
	
	// set default values to implement INndNode
	id: string = UniqueId();
	interfaces: INndInterface[] = [];
	applications: {
		[name: string] : INndApplication
	} = {};
	position: {
		x: number;
		y: number;
		z: number;
	} = { x: 0, y: 0, z: 0};
	graphics: {
		image: string;
	} = { image: '' };
	group: string | undefined;

	// add specialized props
	nodeName: string;
	typeName: string|undefined = 'monitor';

	constructor(name: string, defaults?: INndNode) {
		this.nodeName = name;

		if (defaults) {
			this.id = defaults.id ?? UniqueId();
			this.interfaces = defaults.interfaces ?? {};
			this.applications = defaults.applications ?? {};
			this.position = defaults.position ?? this.position;
			this.graphics = defaults.graphics ?? this.graphics;

			if (defaults.graphics?.image) {
				if (defaults.graphics?.image.indexOf('monitor') > -1) { this.typeName = 'monitor'; }
				else if (defaults.graphics?.image.indexOf('router') > -1) { this.typeName = 'router'; }
				else if (defaults.graphics?.image.indexOf('sensor') > -1) { this.typeName = 'sensor'; }
				else if (defaults.graphics?.image.indexOf('server') > -1) { this.typeName = 'server'; }
				else if (defaults.graphics?.image.indexOf('switch') > -1) { this.typeName = 'switch'; }
				else if (defaults.graphics?.image.indexOf('node') > -1) { this.typeName = 'node'; }
			}
		}
	}

	getType(): INndNodeType {
		// TO DO: determine how the tyoe of a comms node is set in the JSON file
		return new NndNodeType(this.typeName ?? 'monitor');
	}

	getNetworkNode(): Node {
		const nodeType = this.getType();

		// do not use the id prop of the NndNode as the id here, edge linking is dependant on the name of the node from the NND File
		let newNode: Node = {
			id: this.nodeName,
			label: this.nodeName,
			title: this.generateNodeTag(),
			x: 0,
			y: 0,
			shape: 'image',
			image: nodeType.iconImage,
			size: 20,
			group: this.group
		}

		if (this.position !== undefined) {
			newNode.x = this.position.x;
			newNode.y = this.position.y;
		}

		if (this.graphics !== undefined && this.graphics.image !== "") {
			newNode.image = this.graphics.image;
		}

		return newNode;
	};

	generateNodeTag() {
		//generate hover text for a node
		let ip = this.interfaces.length ? this.interfaces[0].ipAddr : 'not set';
		let mac = this.interfaces.length ? this.interfaces[0].macAddr : 'not set';

		//let netmask = this.interfaces[0].netmask
		let appNames = Object.keys(this.applications)
		let agentsString = ""

		for (var i = 0; i < appNames.length; i++){
				let appName = appNames[i]
				let application = this.applications[appName];
				if (application && application['agents']) {
						let thisApp = ""
						for (var j = 0; j < application['agents'].length; j++){
								thisApp = thisApp + application['agents'][j]['agentTemplate']
						}
						agentsString = agentsString + appName + ":  " + thisApp
				}
		}

		let tag = "Node Name: " + this.nodeName +
			"\n" + "IP Address: " + ip +
			"\n" + "Mac Address: " + mac +
			"\n" + "Application(s): " + appNames;
			//"</br>" + "Netmask: " + netmask +
		
		if (agentsString) {
				tag += "</br>" + "Agents(s): " + "</br>" + agentsString
		}

		return tag
	}

	setPosition(x: number, y: number) {
		this.position.x = x;
		this.position.y = y;
	}

	setApplications(applications: Set<nndAppType>) {
		applications.forEach(application => {
			if (application === nndAppType.ICSServer) {
				this.applications["ICSServer"] = {
					appTemplate: "ICSServer",
					port: 1911,
					links: [],
					coSimCouplings: [],
					trafficProfile: {
						endTime: 100,
						packetCount: 1000,
						packetSize: 500,
						startTime: 0
					}
				};
			}

			if (application === nndAppType.OnOffApp) {
				this.applications["onOffApplication"] = {
					appTemplate: "onOffApplication",
					port: 80,
					links: [],
					coSimCouplings: [],
					trafficProfile: {
						startTime: 0.0,
						endTime: 0.0,
						packetCount: 0,
						packetSize: 0
					}
				};
			}

			if (application === nndAppType.PacketSink) {
				this.applications["packetSink"] = {
					appTemplate: "packetSink",
					port: 68,
					links: [],
					coSimCouplings: [],
					trafficProfile: {
						startTime: 0.0,
						endTime: 0.0,
						packetCount: 0,
						packetSize: 0
					}
				};
			}

			if (application === nndAppType.FoxSensor) {
				this.applications["foxSensor"] = {
					appTemplate: "basicSensor",
					port: 1911,
					links: [],
					coSimCouplings: [],
					trafficProfile: {
						startTime: 100,
						endTime: 1000,
						packetCount: 500,
						packetSize: 0
					}
				};
			}

			if (application === nndAppType.BasicSensor) {
				this.applications["basicSensor"] = {
					appTemplate: "basicSensor",
					port: 1911,
					links: [],
					coSimCouplings: [],
					trafficProfile: {
						startTime: 100,
						endTime: 1000,
						packetCount: 500,
						packetSize: 0
					}
				};
			}

			if (application === nndAppType.Switch) {
				this.applications["switch"] = {
					appTemplate: "switch"
				};
			}

			if (application === nndAppType.Controller) {
				this.applications["controller"] = {
					appTemplate: "controller",
					port: 0,
					links: [],
					coSimCouplings: [],
					trafficProfile: {
						startTime: 0,
						endTime: 0,
						packetCount: 0,
						packetSize: 0
					}
				};
			}

			if (application === nndAppType.Router) {
				this.applications["router"] = {
					appTemplate: "router",
					port: 0,
					links: [],
					coSimCouplings: [],
					trafficProfile: {
						startTime: 0,
						endTime: 0,
						packetCount: 0,
						packetSize: 0
					}
				};
			}

			if (application === nndAppType.WirelessAccessPoint) {
				this.applications["wap"] = {
					appTemplate: "wap",
					port: 0,
					links: [],
					coSimCouplings: [],
					trafficProfile: {
						startTime: 0,
						endTime: 0,
						packetCount: 0,
						packetSize: 0
					}
				};
			}
		});
	}
}

export class NndEdge implements INndEdge {
	toNode: string = '';
	fromNode: string = '';
	label: string = '';
	fromIpAddr: string|undefined = '';
	toIpAddr: string|undefined = '';
	id: string = UniqueId();
	subnet: {
		subnetName: string;
		switchName: string;
	} = {
		subnetName: "",
		switchName: ""
	}

	constructor(id: string, fromNodeId: string, toNodeId: string, subnet: any, fromIp?: string, toIp?: string) {
		this.fromNode = fromNodeId;
		this.fromIpAddr = fromIp;
		this.toNode = toNodeId;
		this.toIpAddr = toIp;
		this.id = id;
		this.subnet = subnet;
	}

	getNetworkEdge(): Edge {
		var title = this.generateEdgeTag();

		var edge: Edge = {
				to: this.toNode,
				from: this.fromNode,
				title: title,
				id: this.id,
		};

		return edge;
	}

	generateEdgeTag = () => {
		return "Source Node: " + this.fromNode + 
			"\n" + "Source IP: " + this.fromIpAddr + 
			"\n" + "Destination Node: " + this.toNode + 
			"\n" + "Destination IP: " + this.toIpAddr + 
			"\n" + "Application Name: Physical";
	}

}

export class NndSelection implements INndSelection {
	nndNodes: NndNode[];
	nndEdges: NndEdge[];
	netNodeIds: IdType[];
	netEdgeIds: IdType[];

	constructor(obj: INndSelection) {
		this.nndNodes = obj.nndNodes;
		this.nndEdges = obj.nndEdges;
		this.netNodeIds = obj.netNodeIds;
		this.netEdgeIds = obj.netEdgeIds;
	}
}

class _nndApi {
	apiBasePath = BASE_PATH;

	parseJson = async (serverFileName: string): Promise<any|null> => {
		return await axios.post(`${this.apiBasePath}/nnd/get-json`, { "server-file-name": serverFileName })
			.then(({ status, data }) => {
				if (status !== 200) {
					console.error('Invalid response status code: ' + status);
					return null;
				}
				let resp: INndFileJSONResp = data;

				if (resp.success && resp.nnd_json != undefined) {
					const graph = this.generateGraph(resp.nnd_json);
					resp.nodes = graph.Nodes;
					resp.edges = graph.Edges;

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

	
	exportPdf = async(serverFileName:string): Promise<IPdfResp|null> => {
		
		return await axios.post(`${this.apiBasePath}/nnd/export-pdf`, {"server-file-name": serverFileName})
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
		return await axios.post(`${this.apiBasePath}/nnd/export-csv`, {"server-file-name": serverFileName, "time-string": timeString, "csv-json":csvJson, "obj-type":objType})
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

	downloadFile = async(serverFileName:string, timeString:string): Promise<IPdfResp|null> => {
		
		return await axios.post(`${this.apiBasePath}/nnd/download-file`, {"server-file-name": serverFileName, "time-string": timeString})
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
			alert(`Unable to open Communications PDF File [${pdfResp.message}].`);
		}
	}

	//generate nodes and edges
	generateGraph = (nndJson: INndJson) => {
		var Nodes:any[] = [];
		var Edges:any[] = [];

		var nodes = Object.keys(nndJson["network"]["nodes"]);

		Nodes = nodes.map((nodeName, index) => {
			const nodeJson = nndJson['network']['nodes'][nodeName];
			const newNode = new NndNode(nodeName, nodeJson);
			return newNode;
		});
        
		var subnets = nndJson['network']['topology']['subnets']
		var subnetNames = Object.keys(subnets);

		for (var j = 0; j < subnetNames.length; j++) {
				var subnetName = subnetNames[j]
				var links = subnets[subnetName]['links'] 
				for (var k = 0; k < links.length; k++) {
						var interfacesKeys = Object.keys(links[k]['interfaces'])      
						for (var l = 0; l < interfacesKeys.length; l++) {
								var origin = interfacesKeys[l]
								for (var m = l + 1; m < interfacesKeys.length; m++) {

									try
									{
										const fromNodeJson = nndJson['network']['nodes'][origin];
										const toNodeJson = nndJson['network']['nodes'][interfacesKeys[m]];
										const fromIpAddr = fromNodeJson["interfaces"][0]["ipAddr"];
										const toIpAddr = toNodeJson["interfaces"][0]["ipAddr"];

										const newEdgeId = UniqueId();

										const subnet = {
											subnetName: subnetName,
											switchName: origin.startsWith("switch") ? origin : interfacesKeys[m]
										};
										
										let edge = new NndEdge(newEdgeId, origin, interfacesKeys[m], subnet, fromIpAddr, toIpAddr);
										Edges.push(edge);
									}
									catch (e) {
										console.error(e, { origin, interfacesKeys, m });
									}
								}
						}
				}
		}

		var graphForm = {
				Nodes,
				Edges,
				render: true, // even if the input JSON file doesn't have a "render" field, it defaults to true
		}
		graphForm['render'] = nndJson['network']['render']

		return graphForm   
	}

	createNndNode(newNode: Node, newNodeType: NndNodeType|null ) {
		const newName: string = newNode.id?.toString() ?? '';
		const newNodeDefaultConfig: INndNode = {
			id: newNode.id?.toString() ?? UniqueId(),
			interfaces: [],
			applications: {},
			position: {
				x: newNode.x ?? 0,
				y: newNode.y ?? 0,
				z: 0,
			},
			graphics: { image: newNodeType?.iconImage ?? '' },
		};

		let nndNode = new NndNode(newName, newNodeDefaultConfig);
		nndNode.typeName = newNodeType?.label;

		return nndNode;
	}

	createNndEdge(newEdge: Edge, fromNode: NndNode, toNode: NndNode, subnet: any) {
		if (newEdge.to && newEdge.from) {
			const edge: INndEdge = {
				id: newEdge.id?.toString() ?? UniqueId(),
				toNode: newEdge.to?.toString(),
				fromNode: newEdge.from?.toString(),
				label: '',
			}

			const subnetInfo = {
				subnetName: subnet
			}

			const fromIp = fromNode.interfaces.length ? fromNode.interfaces[0].ipAddr : 'not set';
			const toIp = toNode.interfaces.length ? toNode.interfaces[0].ipAddr : 'not set';

			let nndEdge = new NndEdge(edge.id, edge.fromNode, edge.toNode, subnetInfo, fromIp, toIp);
			return nndEdge;
		}
		return null;
	}

	appendNodeToJson(nndJson: INndJson, newNode: NndNode, netmask?: string): INndJson {
		// Add the new node with the node name attr to the JSON object in network.nodes

		// find existing node with matching name
		const existingIndex = Object.keys(nndJson.network.nodes).indexOf(newNode.nodeName);
		if (existingIndex < 0) {
			nndJson.network.nodes[newNode.nodeName] = newNode;
		}

		// If we are adding a new switch, we need to create a new subnet
		if (Object.keys(newNode.applications).includes("switch")) {
			const newSubnet: INndTopologySubnet = {
				links: [],
				netmask: netmask ? netmask : "255.255.255.0",
				networkAddr: this.generateNetworkAddr(nndJson)
			}
			nndJson.network.topology.subnets[newNode.nodeName] = newSubnet;
		}

		return nndJson;
	}

	removeNodeFromJson(nndJson: INndJson, removeNodes: NndNode[]): INndJson {
		const graph = this.generateGraph(nndJson);

		removeNodes.forEach(removeNode => {
			delete nndJson.network.nodes[removeNode.nodeName];
			// Remove edges connected to the node removed
			const edgesToRemove: NndEdge[] = graph.Edges.filter((edge: NndEdge) => {
				return edge.fromNode === removeNode.nodeName || edge.toNode === removeNode.nodeName;
			});

			if (edgesToRemove && edgesToRemove.length > 0) {
				nndJson = this.removeEdgeFromJson(nndJson, edgesToRemove);
			}
		});

		return nndJson;
	}

	appendEdgeToJson(
		nndJson: INndJson,
		newEdge: NndEdge,
		subnet: string,
		subnetIP: string|null=null,
		subnetMask: string="255.255.255.0"
	): INndJson {
		// verify fromNode and toNode exist
		const fromNodeExists = Object.keys(nndJson.network.nodes).indexOf(newEdge.fromNode) >= 0;
		const toNodeExists = Object.keys(nndJson.network.nodes).indexOf(newEdge.toNode) >= 0;
		if (!fromNodeExists || !toNodeExists) {
			console.error(
				`Attempt to append edge to NND JSON; fromNode or toNode in newEdge could not be found!` +
				`\n\tnewEdge:    <fromNode=${newEdge.fromNode}, toNode=${newEdge.toNode}>,` +
				`\n\tsubnet:     ${subnet},` +
				`\n\tsubnetIP:   ${subnetIP},` +
				`\n\tsubnetMask: ${subnetMask}`
			);
			return nndJson;
		}

		// add new link to existing subnet
		nndJson.network.topology.subnets[subnet].links.push({interfaces:{}});

		let fromInterfaceIndex = nndJson.network.nodes[newEdge.fromNode].interfaces?.findIndex((i) => {
			return (i.ipAddr)? i.ipAddr === newEdge.fromIpAddr: false;
		});

		//add new interface if interface correct does not exist 
		if (fromInterfaceIndex < 0){
			let isSwitch = newEdge.fromNode.startsWith("switch")
			nndJson = this.addNewNodeInterface(nndJson, newEdge.fromNode, isSwitch, subnet)
			//set index to last (newly added) interface
			fromInterfaceIndex = nndJson.network.nodes[newEdge.fromNode].interfaces.length - 1
		}

		let toInterfaceIndex = nndJson.network.nodes[newEdge.toNode].interfaces?.findIndex((i) => {
			return (i.ipAddr)? i.ipAddr === newEdge.toIpAddr: false;
		});

		//add new interface if interface correct does not exist 
		if (toInterfaceIndex < 0){
			let isSwitch = newEdge.fromNode.startsWith("switch")
			nndJson = this.addNewNodeInterface(nndJson, newEdge.toNode, isSwitch, subnet)
			//set index to last (newly added) interface
			toInterfaceIndex = nndJson.network.nodes[newEdge.toNode].interfaces.length - 1
		}

		if (fromInterfaceIndex < 0 || toInterfaceIndex < 0) {
			console.error(
				`Attempt to append edge to NND JSON; Could not find newEdge's fromIpAddr or toIpAddr in respective node interfaces!` +
				`\n\tnewEdge:    <fromNode=${newEdge.fromNode}, fromIpAddr=${newEdge.fromIpAddr?newEdge.fromIpAddr:'undefined'}, toNode=${newEdge.toNode}, toIpAddr=${newEdge.toIpAddr?newEdge.toIpAddr:'undefined'}>,` +
				`\n\tsubnet:     ${subnet},` +
				`\n\tsubnetIP:   ${subnetIP},` +
				`\n\tsubnetMask: ${subnetMask}`
			);
			return nndJson;
		}

		const linkCount = nndJson.network.topology.subnets[subnet]["links"].length;

		nndJson.network.topology.subnets[subnet]["links"][linkCount-1]["interfaces"][newEdge.fromNode] = [fromInterfaceIndex];
		nndJson.network.topology.subnets[subnet]["links"][linkCount-1]["interfaces"][newEdge.toNode] = [toInterfaceIndex];

		return nndJson;
	}

	removeEdgeFromJson(nndJson: INndJson, removeEdges: NndEdge[]): INndJson {
		removeEdges.forEach(removeEdge => {

			var subnets = nndJson.network.topology.subnets;
			var subnetNames = Object.keys(subnets);
	
			subnetNames.forEach(subnetName => {
				subnets[subnetName].links.forEach((link, linkIndex) => {
					const interfacesKeys = Object.keys(link.interfaces)
					
					interfacesKeys.forEach(origin => {
						interfacesKeys.forEach(destination => {
							if (removeEdge.fromNode === origin && removeEdge.toNode === destination) {
								// Need to remove item at linkIndex from nndJson.network.topology.subnets[subnetName].links

								nndJson.network.topology.subnets[subnetName].links.splice(linkIndex, 1);
							}
						});
					});
				});
			});
		});

		return nndJson;
	}

	generateIPAddr(nndJson: INndJson, subnet: string, netmask: string="255.255.255.0"): string {
		// Generates a new IP address that falls into the range of IP addresses for the subnet
		let ips: string[] = this.getSubnetIPs(nndJson, subnet);
		let ipInts: number[] = [];

		// Convert IP addresses to ints
		ips.forEach((ip) => {
			ipInts.push(this.convertIPToInt(ip))
		});

		// Sort the list in descending order
		ipInts.sort((a, b) => {return b-a});
		
		// Add one to the highest int and convert back to IP to get new IP address
		let newIp = this.convertIntToIP(ipInts[0] + 1);

		// Use the netmask to find the maximum number of IP addresses available
		let maxIp = (~(this.convertIPToInt(netmask))) - 1;
		
		// If the new IP address goes over this max value, we have reached the max number of nodes for the subnet
		if (parseInt(newIp.split(".")[3]) >= maxIp) {
			throw Error;
		}

		return newIp;
	}

	generateNetworkAddr(nndJson: INndJson): string {
		// Get all network addresses from existing subnets
		let networkAddrs: string[] = Object.values(nndJson.network.topology.subnets).map((subnet) => {
			return subnet.networkAddr;
		});
		let networkAddrInts: number[] = [];

		// Convert network addresses to ints
		networkAddrs.forEach((ip) => {
			networkAddrInts.push(this.convertIPToInt(ip))
		})

		// Sort the list in descending order and get the highest network address
		networkAddrInts.sort((a, b) => {return b-a});
		let highestNetworkAddr = networkAddrInts[0];

		// Find netmask for the subnet with the highest network address
		let subnet = Object.values(nndJson.network.topology.subnets).filter((subnet) => {
			if (subnet.networkAddr === this.convertIntToIP(highestNetworkAddr)) {
				return subnet.netmask;
			}
		});

		// Convert netmask to integer
		let netmaskInt = (~(this.convertIPToInt(subnet[0].netmask)))

		// Add netmask to the highest existing network address to get the new network address
		let newNetworkAddrInt = highestNetworkAddr + netmaskInt;

		// Convert new network address back to IP format
		let newNetworkAddr = this.convertIntToIP(newNetworkAddrInt);

		return newNetworkAddr;
	}

	getSubnetIPs(nndJson: INndJson, subnet: string): string[] {
		let ips: string[] = [];
		if (nndJson !== null) {
			let subnets = nndJson.network.topology.subnets;
			let nodes = nndJson.network.nodes;
			let links = subnets[subnet]["links"];

			links.forEach((link) => {
				let linkNodes = Object.keys(link.interfaces);
				linkNodes.forEach((node: string) => {
					if (!node.startsWith("switch")) {
						let ipIndex = link.interfaces[node][0];
						let nodeInterface = nodes[node].interfaces[ipIndex];
						if (nodeInterface !== undefined && nodeInterface.ipAddr !== undefined) {
							ips.push(nodeInterface.ipAddr);
						}
					}
				})
			})
		}
		return ips;
	}

	generateMacAddr(nndJson: INndJson): string {
		const macAddrs = new Set<string>();

		let nodes = nndJson.network.nodes;
		Object.values(nodes).forEach((node) => {
			let interfaces = node.interfaces;
			interfaces.forEach((intf) => {
				macAddrs.add(intf.macAddr)
			});
		});

		let newMacAddr = this.generateRandomMacAddr();
		while (macAddrs.has(newMacAddr)) {
			newMacAddr = this.generateRandomMacAddr();
		}

		return newMacAddr;
	}

	generateRandomMacAddr(): string {
		return "XX:XX:XX:XX:XX:XX".replace(/X/g, function() {
			return "0123456789ABCDEF".charAt(Math.floor(Math.random() * 16))
		});
	}

	convertIPToInt(ip: string): number {
		let ipParts = ip.split(".").map(part => {
			return parseInt(part);
		})
		let ipInt = (ipParts[0] * (256 ** 3)) + (ipParts[1] * (256 ** 2)) + (ipParts[2] * 256) + ipParts[3];
		return ipInt;
	}

	convertIntToIP(num: number): string {
		var part1 = num & 255;
		var part2 = ((num >> 8) & 255);
		var part3 = ((num >> 16) & 255);
		var part4 = ((num >> 24) & 255);
	
		return part4 + "." + part3 + "." + part2 + "." + part1;
	}

	getSubnetFromSwitch(nndJson: INndJson, switchName: string): string {
		let subnet = "";
		if (nndJson !== null) {
			let subnets = nndJson.network.topology.subnets;

			Object.keys(subnets).forEach((subnetName) => {
				let links = subnets[subnetName]["links"];

				links.forEach((link) => {
					let linkNodes = Object.keys(link.interfaces);
					linkNodes.forEach((node: string) => {
						if (node == switchName) {
							subnet = subnetName;
						}
					})
				})
			})

			if (subnet === "") {
				Object.keys(subnets).forEach((subnetName) => {
					if (subnetName === switchName) {
						subnet = subnetName;
					}
				})
			}
		}
		return subnet;
	}

    addNewNodeInterface(nndJson: INndJson, nndNode:string, isSwitch:boolean, subnet:string): INndJson{
		let macAddr = this.generateMacAddr(nndJson)
		let newInterface:INndInterface = {"macAddr": macAddr}
		if(isSwitch){
			newInterface = {
				"macAddr" : macAddr,
				"pcap": {
					"enabled": true,
					"promiscuous": false
				}
			}
		}else{
			let ipAddr = this.generateIPAddr(nndJson, subnet)
			newInterface = {
				"ipAddr" : ipAddr,
				"macAddr" : macAddr,
				"pcap": {
					"enabled": true,
					"promiscuous": false
				}
			}
		}
		nndJson.network.nodes[nndNode].interfaces.push(newInterface)
		return nndJson
	}

	writeJson = async (
		nndJson: INndFileJSONResp|null,
		project: IProject|undefined
	): Promise<IWriteJSONResp|null> => {
		if (project === undefined) {
			console.error('Undefined project in writeJson.');
			return null;
		}
		else if (nndJson === null) {
			console.error('Undefined nndJson in writeJson.');
			return null;
		}

		const writeJsonData = { project: project, nndJson: nndJson.nnd_json };

		return await axios.post(`${this.apiBasePath}/nnd/write-json`, writeJsonData)
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


	
}

const nndApi = new _nndApi();
Object.freeze(nndApi);

export default nndApi;