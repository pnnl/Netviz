import { graphicalSettingsApi, IFileJSONResp, linkagesApi } from 'api';
import { LinkagesFileResp } from 'api/linkages';
import { DefaultPowerNetworkOptions, PowerNetwork } from 'common/networks';
import { IProjectContextState, ProjectContext } from 'context';
import { FC, ReactElement, useContext, useEffect } from 'react';
import styled from 'styled-components';


export type PowerCentricCanvasProps = {
    netId?: string;
    combinedGlmJsonResp: IFileJSONResp|null;
    linkagesResp: LinkagesFileResp|null;
}

export const PowerCentricCanvas: FC<PowerCentricCanvasProps> = ({netId="PowerCentricCanvas", combinedGlmJsonResp, linkagesResp}) : ReactElement => {
    const projectContext: IProjectContextState = useContext<IProjectContextState>(ProjectContext);

    useEffect(() => {
        const container = document.getElementById(netId);

        if (container && combinedGlmJsonResp) {
            const mappedNetNodes = combinedGlmJsonResp.glm_json.objects.nodes.map((item, i) => {
                return item.getNetworkNode();
            });

            const mappedNetEdges = combinedGlmJsonResp.glm_json.objects.edges.map((item, i) => {
                return item.getNetworkEdge();
            });

            const options = {
                ...DefaultPowerNetworkOptions,
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
                },
                manipulation: {
                    enabled: false
                }
            };

            let network = new PowerNetwork(container, mappedNetNodes, mappedNetEdges, options);

            // Get all GLM nodes that have a group
            let nodes = linkagesApi.getGlmNodesWithGroup(combinedGlmJsonResp);
            network.on("beforeDrawing", function (ctx) {
                nodes.forEach((node) => {
                    if (linkagesResp) {
                        var groups = linkagesApi.getGlmGroups(linkagesResp, node);
                        var nodeId = mappedNetNodes.filter((n) => n.id === node.meta_props.name || n.id === node.meta_props.id);
                        var nodePositions = network.getPositions(nodeId[0].id);
                        
                        // Get X and Y positions of node
                        var yPositions = Object.keys(nodePositions).map((nodeId) => {
                            return nodePositions[nodeId].y
                        }).sort(function(a,b){
                            return a - b
                        });
                        var xPositions = Object.keys(nodePositions).map((nodeId) => {
                            return nodePositions[nodeId].x
                        }).sort(function(a,b){
                            return a - b
                        });
                        
                        // Draw rectangle around node to represent group
                        var xPos = xPositions[0] - 30;
                        var yPos = yPositions[0] - 30;
                        var width = 70;
                        var height = 90;
                        ctx.strokeStyle = "red";
                        ctx.beginPath();
                        ctx.rect(xPos, yPos, width, height);
                        ctx.closePath();
                        ctx.stroke();

                        // Add labels around rectangle with all group names
                        ctx.font = "20px Raleway";
                        ctx.fillStyle = "red";
                        var labelYPos = yPos + 10;
                        groups.forEach((group) => {
                            ctx.fillText(group, xPos + 80, labelYPos);
                            labelYPos = labelYPos + 20;
                        })
                    }
                })
            });

            projectContext.setPowerCentricNetwork(network)
        }
    }, [combinedGlmJsonResp])

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
