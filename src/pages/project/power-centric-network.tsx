import { FC, ReactElement, useEffect, useContext, useState } from 'react';
import styled from 'styled-components';
import { IProjectContextState, ProjectContext, SelectableNetworkTypes } from 'context';
import { PowerCentricCanvas } from "./components/power-centric-canvas";
import { GLMEdge, GLMNode, IFileJSONResp, linkagesApi, LinkagesFileResp } from 'api';
import { CombinedGraphKey, DrawerPosition, SideDrawer } from 'common';
import { ObjList } from './components';

export type PowerCentricNetworkProps = {
	glmFileExists: boolean,
	nndFileExists: boolean
}

export const PowerCentricNetwork : FC<PowerCentricNetworkProps> = (props: PowerCentricNetworkProps) : ReactElement => {
    const projectContext: IProjectContextState = useContext<IProjectContextState>(ProjectContext);
    const [noLinkagesFile, setNoLinkagesFile] = useState<boolean>(false);
	const [linkagesResp, setLinkagesResp] = useState<LinkagesFileResp|null>(null);
	const [glmJsonResp, setGlmJsonResp] = useState<IFileJSONResp|null>(null);
	const [combinedGlmJsonResp, setCombinedGlmJsonResp] = useState<IFileJSONResp|null>(null);

    useEffect(() => {
        (async ()=> {
			await getLinkagesFile();
			await getGlmJson();
		})();
    }, []);

	useEffect(() => {
		if (linkagesResp && glmJsonResp) {
			setCombinedGlmJsonResp(linkagesApi.generatePowerCentricGraph(linkagesResp.linkages, glmJsonResp));
		}
	}, [linkagesResp, glmJsonResp]);

    const getLinkagesFile = async () => {
		const linkages: LinkagesFileResp = await projectContext.getLinkagesJson();

		if (linkages) {
			setLinkagesResp(linkages);
		}
		else {
			console.log(`Error loading linkages file`);
			setNoLinkagesFile(true);
			return null;
		}
	}

	const getGlmJson = async () => {
		const glmJsonResp: IFileJSONResp|null = await projectContext.getGlmJson();

		if (glmJsonResp) {
			if (glmJsonResp.success) {
				setGlmJsonResp(glmJsonResp);
			}
			else {
				console.log(`Error loading NND JSON (${glmJsonResp.message})`);
				setGlmJsonResp(null);
			}
		}
		else {
			setGlmJsonResp(null);
		}
	}

	const getEdgesForSidePanel = ():GLMEdge[] => {
		let edges:any = []
		edges = projectContext.getEdges(SelectableNetworkTypes.Power, null, null, null)??[]

		return edges
	}

	const getNodesForSidePanel = ():GLMNode[] => {
		let nodes:any = []
		nodes = projectContext.getNodes(SelectableNetworkTypes.Power, null)??[]

		return nodes
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
			<CombinedGraphKey powerCentric={true} />

			{!noLinkagesFile && props.nndFileExists && props.glmFileExists &&
			<PowerCentricCanvas combinedGlmJsonResp={combinedGlmJsonResp} linkagesResp={linkagesResp} />}

			<SideDrawer isOpen={true} width={300} position={DrawerPosition.Right} >
				<ObjList 
					Title = "Nodes" 
					objList = {getNodesForSidePanel()}
					glmColumns = {["name", "obj_type", "bustype"]}
					nndColumns = {[]}
					dispColumns = {["Name", "Object Type", "Bus Type"]}
					netType = {SelectableNetworkTypes.Power}
				/>
				<ObjList 
					Title = "Edges" 
					objList = {getEdgesForSidePanel()}
					glmColumns = {["name", "obj_type", "from", "to"]}
					nndColumns = {[]}
					dispColumns = {["Name", "Object Type", "From", "To"]}
					netType = {SelectableNetworkTypes.Power}
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
