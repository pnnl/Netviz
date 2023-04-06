import { FC, ReactElement, useState, useContext, useEffect } from 'react';
import { IProjectContextState, ProjectContext, SelectableNetworkTypes } from 'context';
import { INndFileJSONResp, LinkagesFileResp, NndEdge, NndNode} from "api";
import styled from "styled-components";
import { 
	SideDrawer, 
	DrawerPosition, 
	NndNodeType, 
	ActionButton, 
	TypeOfIcon, 
	MoveNodesCard
} from "common";
import { CommsCanvas, AddNodeCard, ObjList } from './components';
import { AddEdgeModal, AddEdgeModalProps } from 'pages/modals';
import { Edge } from "vis-network/peer/esm/vis-network";
import Loader from "react-loader-spinner";
import { Colors } from "theme";

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

const StyledAddNode = styled.div`
	float: left; 
`;

const StyledAddEdge = styled.div`
	float: right;
	position: relative;
	top: 4.25rem;
`;

const StyledAddToGraph = styled.div`
	position: absolute;
	bottom: 1rem;
`;

const DrawerContents = () => (
    <div>DRAWER CONTENTS</div>
);

export type CommsNetworkProps = {
	nndFile: boolean
}

export const CommsNetwork : FC<CommsNetworkProps> = (props: CommsNetworkProps) : ReactElement => {
	const projectContext: IProjectContextState = useContext<IProjectContextState>(ProjectContext);
	const [nndJson, setNndJson] = useState<INndFileJSONResp|null>(null);
	const [selectedNodeType, setSelectedNodeType]= useState<NndNodeType|null>(null);
	const [loadingNnd, setLoadingNnd] = useState<boolean>(true);
	const [isOpen, setIsOpen] = useState(false);
	const [noNndJson, setNoNndJson] = useState<boolean>(false);
	const [editObjOpen, setEditObjOpen] = useState(false);
	const [editObj, setEditObj] = useState<string|null>(null);
	const [showAddEdgeModal, setShowAddEdgeModal] = useState<boolean>(false);
	const [inAddEdgeMode, setInAddEdgeMode] = useState<boolean>(false);
	const [addEdgeModal, setAddEdgeModal] = useState<AddEdgeModalProps>({
		showModal: showAddEdgeModal,
		setShowModal: setShowAddEdgeModal, 
		fromNode: null, 
		networkType: SelectableNetworkTypes.Communications, 
		toNode: null, 
		nodeData: {},
		callback: () => {},
		setInAddEdgeModeCallback: () => {}
	});
	const [edgeAdded, setEdgeAdded] = useState<boolean>(false);

	const toggleDrawer = () => setIsOpen(!isOpen);
	const [objListOpen, setObjListOpen] = useState(false);
	const toggleObjListDrawer = () => setObjListOpen(!objListOpen);

	const changeNodeType = (newNodeType:NndNodeType|null) => {
		setSelectedNodeType(newNodeType)
	}

	const changeEditObj = async (newEditObj:string|null) => {
		if(newEditObj !== null){
			setEditObj(newEditObj);
			setEditObjOpen(true)
		} else {
			setEditObjOpen(false);
			await setSelectedNodeType(null);
		}
	}

	const startAddEdge = () => {
		if (projectContext.commsNetwork) {
			projectContext.commsNetwork.setOptions({
				manipulation: {
						enabled: false,
						addEdge: addEdgeHandler,
				}
			});
			projectContext.commsNetwork.addEdgeMode();
			setInAddEdgeMode(true);
		}
	}

	const cancelAddEdge = () => {
		if (projectContext.commsNetwork) {
			projectContext.commsNetwork.disableEditMode();
			setInAddEdgeMode(false);
		}
	}

	const getEdgesForSidePanel = ():NndEdge[] => {
		let edges:any = []
		if(nndJson){
			edges = projectContext.getEdges(SelectableNetworkTypes.Communications, null, null, null)??[]
		}
		return edges
	}

	const getNodesForSidePanel = ():NndNode[] => {
		let nodes:any = []
		if(nndJson){
			nodes = projectContext.getNodes(SelectableNetworkTypes.Communications, null)??[]
		}

		return nodes
	}

	const addEdgeHandler = async (data: Edge, callback: (params?: any) => void) => {
		if (
			projectContext.commsNetwork
			&& data.to !== data.from
			&& data.from?.toString()
			&& data.to?.toString()
		) {			
			setShowAddEdgeModal(true);

			const fromNodes = projectContext.getNodes(SelectableNetworkTypes.Communications, data.from?.toString());
			const toNodes = projectContext.getNodes(SelectableNetworkTypes.Communications, data.to?.toString());

			setAddEdgeModal({
				...addEdgeModal, 
				fromNode: fromNodes?.length ? fromNodes[0] : null,
				toNode: toNodes?.length ? toNodes[0] : null,
				callback: callback,
				nodeData: data
			});
		}
	}

	const fetchNndJson = async () => {
		return await getNndJson();
	}

	const fetchLinkagesFile = async () => {
		return await getLinkagesFile();
	}

 	useEffect(() => {
		let mounted = true;
		fetchNndJson().then((nndJson) => {
			if (mounted) {
				setNndJson(nndJson);
				setLoadingNnd(false);
			}
		})
		fetchLinkagesFile();

		return () => {
            mounted = false;
        }
	}, [projectContext.project, edgeAdded]); 

	const getNndJson = async () => {
		const nndJsonResp: INndFileJSONResp|null = await projectContext.getNndJson();

		if (nndJsonResp) {
			if (nndJsonResp.success) {
				return nndJsonResp;
			}
			else {
				console.log(`Error loading NND JSON (${nndJsonResp.message})`);
				return null;
			}
		}
		else {
			if (!props.nndFile) {
				setNoNndJson(true);
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

	return ( loadingNnd ? 
		<StyledDiv>
			<Loader
				type="Oval"
				color={Colors.ButtonBlue}
				height={35}
				width={35}
			/>
		</StyledDiv>
		: <div> 
			{noNndJson? 
				(<StyledDiv border={true}>
					<div>
						No NND file found for this project.
						<br/>Click 'View Details' to upload one.
					</div>
				</StyledDiv>)
				: 
				<CommsCanvas 
					netId='commsSystemCanvas-1'
					addNodeType={selectedNodeType}
					nndJson={nndJson}
					setEditObj={changeEditObj}
				/>
			}
			<StyledAddToGraph>
				<StyledAddNode>
					<AddNodeCard
						changeNndNodeType={changeNodeType}
						selectedNndNodeType={selectedNodeType}
						onClick={()=>{}}
						key={''}
						widthInRems={16.5}
					/>
				</StyledAddNode>

				<StyledAddEdge>
					{ inAddEdgeMode
						? <ActionButton 
							label="Cancel Add" 
							iconType={TypeOfIcon.Close}
							backgroundColor='#ff4b4b'
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
				setInAddEdgeModeCallback={setInAddEdgeMode}
				setEdgeAdded={setEdgeAdded}
			/>
			<MoveNodesCard />

			<SideDrawer isOpen={true} width={300} position={DrawerPosition.Right} >
				<ObjList 
					Title = "Nodes" 
					objList = {getNodesForSidePanel()}
					glmColumns = {[]}
					nndColumns = {["nodeName", "typeName"]}
					dispColumns = {["Name", "Type"]}
					rowClick = {changeEditObj}
					netType = {SelectableNetworkTypes.Communications}
				/>
				<ObjList 
					Title = "Edges" 
					objList = {getEdgesForSidePanel()}
					glmColumns = {[]}
					nndColumns = {["toNode" , "fromNode"]}
					dispColumns = {["To", "From"]}
					rowClick = {changeEditObj}
					netType = {SelectableNetworkTypes.Communications}
				/>			
			</SideDrawer>
		</div>
	);
}

