import { FC, ReactElement, useState, useContext, useEffect } from 'react';
import { IProjectContextState, ProjectContext, SelectableNetworkTypes } from 'context';
import { IFileJSONResp, GLMEdge, GLMNode, LinkagesFileResp } from "api";
import styled from "styled-components";
import { AddNodeCard, PowerCanvas, ObjList, ObjEdit } from "./components";
import { AddEdgeModal, AddEdgeModalProps } from "pages/modals";
import { 
	SideDrawer, 
	DrawerPosition, 
	GLMNodeType, 
	ActionButton,
	TypeOfIcon
} from "common";
import { Colors } from "theme";
import { Edge } from "vis-network/peer/esm/vis-network";
import Loader from "react-loader-spinner";

const DrawerContents = () => (
    <div>DRAWER CONTENTS</div>
);

export type PowerNetworkProps = {
	glmFile: boolean
}

export const PowerNetwork : FC<PowerNetworkProps> = (props: PowerNetworkProps) : ReactElement => {
	const projectContext: IProjectContextState = useContext<IProjectContextState>(ProjectContext);
	const [glmJson, setGlmJson] = useState<IFileJSONResp|null>(null);
	const [selectedNodeType, setNodeType]= useState<GLMNodeType|null>(null);
	const [loadingGlm, setLoadingGlm] = useState<boolean>(true);
	const [objListOpen, setObjListOpen] = useState(false);
	const toggleObjListDrawer = () => setObjListOpen(!objListOpen);

	const [editObjOpen, setEditObjOpen] = useState(false);
	const [editObj, setEditObj] = useState<string|null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [noGlmJson, setNoGlmJson] = useState<boolean>(false);
	const [showAddEdgeModal, setShowAddEdgeModal] = useState<boolean>(false);
	const [inAddEdgeMode, setInAddEdgeMode] = useState<boolean>(false);
	const [addEdgeModal, setAddEdgeModal] = useState<AddEdgeModalProps>({
		showModal: showAddEdgeModal,
		setShowModal: setShowAddEdgeModal,
		fromNode: null,
		networkType: SelectableNetworkTypes.Power,
		toNode: null,
		nodeData: {},
		callback: () => {},
		setInAddEdgeModeCallback: () => {}
	});
	const [edgeEdited, setEdgeEdited] = useState<boolean>(false);
	const toggleDrawer = () => setIsOpen(!isOpen);

	const changeNodeType = (newNodeType:GLMNodeType|null) => {
		setNodeType(newNodeType)
	}

	const setGLMJsonWrapper = (newGLMJson:IFileJSONResp|null) => {
		//update glmJson so rerender occurs
		const glmJson = Object.assign({}, newGLMJson);
		setGlmJson(glmJson)
	}

	const changeEditObj = async (newEditObj:string|null) => {
		if(newEditObj !== null){
			setEditObj(newEditObj);
			setEditObjOpen(true)
		} else {
			setEditObjOpen(false);
			await setNodeType(null);
		}
	}

	const fetchGlmJson = async () => {
		return await getGlmJson();
	}

	const fetchLinkagesFile = async () => {
		return await getLinkagesFile();
	}

  	useEffect(() => {
		let mounted = true;
		fetchGlmJson().then((glmJson) => {
			if (mounted) {
				setGlmJson(glmJson);
				setLoadingGlm(false);
			}
		});
		fetchLinkagesFile();

		return () => {
            mounted = false;
        }
	}, [projectContext.project, edgeEdited]);

	const getGlmJson = async () => {
		const glmJsonResp: IFileJSONResp|null = await projectContext.getGlmJson();
        await projectContext.getNndJson()
		if (glmJsonResp) {
			if (glmJsonResp.success) {
				return glmJsonResp;
			}
			else {
				console.log(`Error loading GLM JSON (${glmJsonResp.message})`);
				return null;
			}
		}
		else {
			if (!props.glmFile) {
				setNoGlmJson(true);
			}
			return null;
		}
	}

	const getLinkagesFile = async () => {
		const linkages: LinkagesFileResp = await projectContext.getLinkagesJson();

		if (linkages) {
			return linkages;
		}
		else {
			console.log(`Error loading linkages file`);
			return null;
		}
	}

	const startAddEdge = () => {
		if (projectContext.powerNetwork) {
			projectContext.powerNetwork.setOptions({
				manipulation: {
                    enabled: false,
                    addEdge: addEdgeHandler,
                }
			});
			projectContext.powerNetwork.addEdgeMode();
			setInAddEdgeMode(true);
		}
	}

	const cancelAddEdge = () => {
		if (projectContext.powerNetwork) {
			projectContext.powerNetwork.disableEditMode();
			setInAddEdgeMode(false);
		}
	}

	const addEdgeHandler = async (data: Edge, callback: (params?: any) => void, edgeType: string = "line") => {
		if (projectContext.powerNetwork 
			&& data.to !== undefined 
			&& data.from !== undefined 
			&& data.to !== data.from
		) {
			setShowAddEdgeModal(true);

			const fromNodes = projectContext.getNodes(SelectableNetworkTypes.Power, data.from?.toString());
			const toNodes = projectContext.getNodes(SelectableNetworkTypes.Power, data.to?.toString());

			setAddEdgeModal({
				...addEdgeModal,
				fromNode: fromNodes?.length ? fromNodes[0] : null,
				toNode: toNodes?.length ? toNodes[0] : null,
				callback: callback,
				nodeData: data,
				edgeType: edgeType
			});
		}
	}

	const getEdgesForSidePanel = ():GLMEdge[] => {
		let edges:any = []
		if(glmJson){
			edges = projectContext.getEdges(SelectableNetworkTypes.Power, null, null, null)??[]
		}
		return edges
	}

	const getNodesForSidePanel = ():GLMNode[] => {
		let nodes:any = []
		if(glmJson){
			nodes = projectContext.getNodes(SelectableNetworkTypes.Power, null)??[]
		}

		return nodes
	}

	return ( loadingGlm ? 
		<StyledDiv>
			<Loader
				type="Oval"
				color={Colors.ButtonBlue}
				height={35}
				width={35}
			/>
		</StyledDiv>
		: <div> { noGlmJson
			? (
				<StyledDiv border={true}>
					<div>
						No GLM file found for this project.
						<br/>Click 'View Details' to upload one.
					</div>
				</StyledDiv>
				)
				: <PowerCanvas
					netId='powerSystemCanvas-1'
					addNodeType={selectedNodeType}
					glmJson={glmJson}
					setEditObj={changeEditObj}
					setEdgeEdited={setEdgeEdited}
				/>
			}
			<StyledAddToGraph>
				<StyledAddNode>
					<AddNodeCard
						changeGlmNodeType={changeNodeType}
						selectedGlmNodeType={selectedNodeType}
						onClick={()=>{}}
						key={''}
						widthInRems={22}
					/>
				</StyledAddNode>

				<StyledAddEdge>
					{ inAddEdgeMode
						? <ActionButton 
							label="Cancel Add"
							backgroundColor='#ff4b4b'
							iconType={TypeOfIcon.Close} 
							onClick={cancelAddEdge} 
						/>
						: 
							<ActionButton 
								label="Add edge" 
								iconType={TypeOfIcon.Add} 
								onClick={startAddEdge} 
							/>
					}
				</StyledAddEdge>
			</StyledAddToGraph>

			<AddEdgeModal 
				showModal={showAddEdgeModal} 
				setShowModal={setShowAddEdgeModal} 
				fromNode={addEdgeModal.fromNode}
				networkType={addEdgeModal.networkType}
				toNode={addEdgeModal.toNode}
				callback={addEdgeModal.callback}
				nodeData={addEdgeModal.nodeData}
				edgeType={addEdgeModal.edgeType}
				setInAddEdgeModeCallback={setInAddEdgeMode}
			/>

			<SideDrawer isOpen={true} width={300} position={DrawerPosition.Right} >
				<ObjList 
					Title = "Nodes" 
					objList = {getNodesForSidePanel()}
					glmColumns = {["name", "obj_type", "bustype", "phases", "nominal_voltage"]}
					nndColumns = {[]}
					dispColumns = {["Name", "Object Type", "Bus Type", "Phases", "Voltage"]}
					rowClick = {changeEditObj}
					netType = {SelectableNetworkTypes.Power}
				/>
				<ObjList 
					Title = "Edges" 
					objList = {getEdgesForSidePanel()}
					glmColumns = {["name", "obj_type", "from", "to"]}
					nndColumns = {[]}
					dispColumns = {["Name", "Object Type", "From", "To"]}
					rowClick = {changeEditObj}
					netType = {SelectableNetworkTypes.Power}
				/>			
			</SideDrawer>
	  </div>
	);
}

type StyledDivProps = {
	border?: boolean;
}

const StyledDiv = styled.div<StyledDivProps>`
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background: rgba(255, 255, 255, 0.9);
	border: ${props => props.border ? "0.0625rem solid #eeeeee" : "none"};
	box-sizing: border-box;
	box-shadow: ${props => props.border ? "0 0.25rem 0.25rem rgba(0, 0, 0, 0.04)" : "none"};
	border-radius: 0.5rem;
	font-family: "Raleway";
	font-size: 20px;
	padding: 0.5rem 1.25rem 1rem 1.25rem;
`;

const StyledCollapse = styled.div`
	font-family: Raleway;
	position: fixed;
	top: 14px;
	right: 5%;
	z-index: 99;
	color: ${Colors.ButtonBlue};
	cursor: pointer;
`;

const StyledAddToGraph = styled.div`
	position: absolute;
	bottom: 1rem;
`;

const StyledAddNode = styled.div`
	float: left; 
`;

const StyledAddEdge = styled.div`
	float: right;
	position: relative;
	top: 4.25rem;
`
