import { FC, ReactElement, useEffect, useContext, useState } from 'react';
import { CommsCentricCanvas } from './components/comms-centric-canvas';
import styled from 'styled-components';
import { DrawerPosition, ImportButton, MoveNodesCard, SideDrawer } from 'common';
import { IProjectContextState, ProjectContext, SelectableNetworkTypes } from 'context';
import { INndFileJSONResp, INndJson, linkagesApi, LinkagesFileResp, NndEdge, NndNode } from 'api';
import { CombinedGraphKey } from 'common';
import { ObjList } from './components';


export type CommsCentricNetworkProps = {
	glmFileExists: boolean,
	nndFileExists: boolean
}

export const CommsCentricNetwork : FC<CommsCentricNetworkProps> = (props: CommsCentricNetworkProps) : ReactElement => {
  const projectContext: IProjectContextState = useContext<IProjectContextState>(ProjectContext);
  const [noLinkagesFile, setNoLinkagesFile] = useState<boolean>(false);
	const [linkagesResp, setLinkagesResp] = useState<LinkagesFileResp|null>(null);
	const [nndJsonResp, setNndJsonResp] = useState<INndFileJSONResp|null>(null);
	const [combinedNndJsonResp, setCombinedNndJsonResp] = useState<INndFileJSONResp|null>(null);

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
				setNndJsonResp(nndJson);
			}
		});
		fetchLinkagesFile().then((linkages) => {
			if (mounted) {
				setLinkagesResp(linkages);
			}
		});

		return () => {
            mounted = false;
        }
	}, [projectContext.project]); 

	useEffect(() => {
		if (linkagesResp && nndJsonResp) {
			setCombinedNndJsonResp(linkagesApi.generateCommsCentricGraph(linkagesResp.linkages, nndJsonResp));
		}
	}, [linkagesResp, nndJsonResp]);

	const getLinkagesFile = async () => {
		const linkages: LinkagesFileResp = await projectContext.getLinkagesJson();

		if (linkages) {
			return linkages;
		}
		else {
			console.log(`Error loading linkages file`);
			setNoLinkagesFile(true);
			return null;
		}
	}

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
			return null;
		}
	}

	const getNodesForSidePanel = ():NndNode[] => {
		let nodes:any = []
		nodes = projectContext.getNodes(SelectableNetworkTypes.Communications, null)??[]
		
		return nodes
	}

	const getEdgesForSidePanel = ():NndEdge[] => {
		let edges:any = []
		edges = projectContext.getEdges(SelectableNetworkTypes.Communications, null, null, null)??[]
		
		return edges
	}

    return (
        <div>
			{(noLinkagesFile || !props.nndFileExists || !props.glmFileExists) &&
			<StyledDiv border={true}>
				{noLinkagesFile &&
				<div>
					<div style={{textAlign: 'center'}}>
						No linkages file found for this project.
						<br/>Click 'View Details' to upload one.
					</div>
				</div>}

				{!props.glmFileExists &&
				<div>
					<div style={{textAlign: 'center'}}>
						No GLM file found for this project.
						<br/>Click 'View Details' to upload one.
					</div>
				</div>}

				{!props.nndFileExists &&
				<div>
					<div style={{textAlign: 'center'}}>
						No NND file found for this project.
						<br/>Click 'View Details' to upload one.
					</div>
				</div>
				}
			</StyledDiv>}
			<CombinedGraphKey commsCentric={true} />

			{!noLinkagesFile && props.nndFileExists && props.glmFileExists &&
			<CommsCentricCanvas combinedNndJsonResp={combinedNndJsonResp} />}

			<MoveNodesCard />	

			<SideDrawer isOpen={true} width={300} position={DrawerPosition.Right} >
				<ObjList 
					Title = "Nodes" 
					objList = {getNodesForSidePanel()}
					glmColumns = {[]}
					nndColumns = {["nodeName", "typeName"]}
					dispColumns = {["Name", "Type"]}
					netType = {SelectableNetworkTypes.Communications}
				/>
				<ObjList 
					Title = "Edges" 
					objList = {getEdgesForSidePanel()}
					glmColumns = {[]}
					nndColumns = {["toNode" , "fromNode"]}
					dispColumns = {["To", "From"]}
					netType = {SelectableNetworkTypes.Communications}
				/>			
			</SideDrawer>	    
        </div>
    )
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
