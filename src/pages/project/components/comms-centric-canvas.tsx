import { graphicalSettingsApi, INndFileJSONResp, linkagesApi } from 'api';
import { CommsNetwork, DefaultCommsNetworkOptions } from 'common/networks';
import { IProjectContextState, ProjectContext } from 'context';
import { FC, ReactElement, useContext, useEffect } from 'react';
import styled from 'styled-components';


export type CommsCentricCanvasProps = {
    netId?: string;
    combinedNndJsonResp: INndFileJSONResp|null;
}

export const CommsCentricCanvas: FC<CommsCentricCanvasProps> = ({netId="CommsCentricCanvas", combinedNndJsonResp}) : ReactElement => {
    const projectContext: IProjectContextState = useContext<IProjectContextState>(ProjectContext);

    useEffect(() => {
        const container = document.getElementById(netId);

        if (container && combinedNndJsonResp) {
            const mappedNetNodes = combinedNndJsonResp.nodes.map((item, i) => {
                return item.getNetworkNode();
            });

            const mappedNetEdges = combinedNndJsonResp.edges.map((item, i) => {
                return item.getNetworkEdge();
            });

            const options = {
                ...DefaultCommsNetworkOptions,
                physics: {
                    enabled: false
                },
                nodes: {
                    font: {
                        size: graphicalSettingsApi.setup?.Labels.NodeFontSize,
                    }
                },
                edges: {
                    font: {
                        size: graphicalSettingsApi.setup?.Labels.EdgeFontSize,
                    },
                    color: {
                        color: graphicalSettingsApi.setup?.EdgeColors.DefaultEdge,
                    },
                    smooth: true
                },
                
                manipulation: {
                    enabled: false
                }
            };

            let network = new CommsNetwork(container, mappedNetNodes, mappedNetEdges, options);
        
            // Draw rectangles around nodes within groups
            let groups = linkagesApi.getNndGroups(combinedNndJsonResp);
            network.on("beforeDrawing", function (ctx) {
                groups.forEach((group) => {
                    var nodes = linkagesApi.getNodesInGroup(group, mappedNetNodes);

                    nodes.forEach((node) => {
                        var nodePosition = network.getPosition(node);
                        
                        ctx.strokeStyle = "red";
                        ctx.beginPath();

                        var xPos = nodePosition.x - 30;
                        var yPos = nodePosition.y - 30;
                        var width = 70;
                        var height = 90;
                        
                        ctx.rect(xPos, yPos, width, height);
                        ctx.closePath();
                        ctx.stroke();

                        ctx.fillStyle = "red"
                        ctx.font = "20px Raleway"
                        ctx.fillText(group, xPos + 80, yPos + 20)
                    })
                })
            });

            projectContext.setCommsCentricNetwork(network)
        }
    }, [combinedNndJsonResp])

    return (
        <StyledCanvas id={netId}/>
    )
}


const StyledCanvas = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: -1;
`;
