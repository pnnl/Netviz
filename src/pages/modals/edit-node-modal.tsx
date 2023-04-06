import { FC, useContext, useEffect, useState } from "react";
import styled from 'styled-components';
import { Node } from "vis-network/peer/esm/vis-network";
import Modal from "../../common/modal";
import { LabeledTextBox } from "../../common/labeled-textbox";
import { Dropdown, Option } from "../../common/drop-down";
import { MultipleChoice } from "../../common/mutliple-choice";
import { SelectableNetworkTypes, IProjectContextState, ProjectContext } from "../../context";
import { GLMNode, GlmSelection, NndNode, NndSelection, nndAppType } from "api";
import { Colors } from "theme";

export interface EditNodeInfo {
    node: Node|null;
    callback: (params?: any) => void;
    setEditObj: (editObj:string|null) => void;
    defaultGlmId?: string;
    defaultGlmLabel?: string;
    defaultGlmSize?: string;
    defaultNndName?: string;
    defaultNndDevType?: string;
    defualtNndApps?: {};
}

export type EditNodeModalProps = {
    isOpen: boolean;
    networkType: SelectableNetworkTypes;
    glmInfo?: EditNodeInfo;
    nndInfo?: EditNodeInfo;
    onCancel: any;
};

export interface NndAppTypes {
    [key: string]: boolean;
}

const EditNodeModal: FC<EditNodeModalProps> = (props: EditNodeModalProps) => {
    const {
        isOpen,
        networkType,
        glmInfo,
        nndInfo,
        onCancel,
    } = props;
    const projectContext: IProjectContextState = useContext<IProjectContextState>(ProjectContext);
    const [glmId, setGlmId] = useState<string>("");
    const [glmLabel, setGlmLabel] = useState<string>("");
    //const [glmSize, setGlmSize] = useState<string>("");
    const [nndName, setNndName] = useState<string>("");
    const [nndAppOptions, setNndAppOptions] = useState<{}>(nndInfo?.defualtNndApps ?? {});
    const [nndDevice, setNndDevice] = useState<string>("");
    const [deviceChangeAlert, setDeviceChangeAlert] = useState<boolean>(false);

    const handleSave = () => {
        switch(networkType) {
            case (SelectableNetworkTypes.Communications):
                editNndNode();
                break;
            case (SelectableNetworkTypes.Power):
                editGlmNode();
                break;
            default:
                break;
        }
    }

    /* NND functions */
    const editNndNode = async () => {
        onCancel();

        if (nndInfo && nndInfo.node) {
            const editNodes = projectContext.getNodes(SelectableNetworkTypes.Communications, nndInfo.node.id?.toString() ?? 'n/a');
            let editNode = editNodes?.length ? editNodes[0] : null;
    
            if (editNode && projectContext.commsNetwork && editNode instanceof NndNode) {
                if (nndName !== "") {
                    editNode.nodeName = nndName;
                }         
                
                let appsList: Set<nndAppType> = new Set();
                Object.entries(nndAppOptions).forEach(([key, value]) => {
                    if (value) {
                        // Add the new applications selected
                        switch (key) {
                            case "ICS Server":
                                appsList.add(nndAppType.ICSServer);
                                break;
                            case "On/Off Application":
                                appsList.add(nndAppType.OnOffApp);
                                break;
                            case "Packet Sink":
                                appsList.add(nndAppType.PacketSink);
                                break;
                            case "Fox Sensor":
                                appsList.add(nndAppType.FoxSensor);
                                break;
                            case "Basic Sensor":
                                appsList.add(nndAppType.BasicSensor);
                                break;
                            case "Switch":
                                appsList.add(nndAppType.Switch);
                                break;
                            case "Controller":
                                appsList.add(nndAppType.Controller);
                                break; 
                            case "Router":
                                appsList.add(nndAppType.Router);
                                break;
                            case "Wireless Access Point":
                                appsList.add(nndAppType.WirelessAccessPoint);
                                break;
                            default:
                                break;
                        }
                    }
                    else {
                        // Remove the applications that were deselected
                        switch (key) {
                            case "ICS Server":
                                appsList.delete(nndAppType.ICSServer);
                                break;
                            case "On/Off Application":
                                appsList.delete(nndAppType.OnOffApp);
                                break;
                            case "Packet Sink":
                                appsList.delete(nndAppType.PacketSink);
                                break;
                            case "Fox Sensor":
                                appsList.delete(nndAppType.FoxSensor);
                                break;
                            case "Basic Sensor":
                                appsList.delete(nndAppType.BasicSensor);
                                break;
                            case "Switch":
                                appsList.delete(nndAppType.Switch);
                                break;
                            case "Controller":
                                appsList.delete(nndAppType.Controller);
                                break; 
                            case "Router":
                                appsList.delete(nndAppType.Router);
                                break;
                            case "Wireless Access Point":
                                appsList.delete(nndAppType.WirelessAccessPoint);
                                break;
                            default:
                                break;
                        }
                    }
                });
            
                // Edit node type and icon
                if (nndDevice !== "") {
                    switch (nndDevice) {
                        case "monitor":
                            editNode.typeName = "monitor";
                            editNode.graphics.image = "/node-images/monitor.svg";
                            break;
                        case "router":
                            editNode.typeName = "router";
                            editNode.graphics.image = "/node-images/router.png";
                            appsList.add(nndAppType.Router);
                            break;
                        case "sensor":
                            editNode.typeName = "sensor";
                            editNode.graphics.image = "/node-images/sensor.png";
                            appsList.add(nndAppType.BasicSensor);
                            break;
                        case "server":
                            editNode.typeName = "server";
                            editNode.graphics.image = "/node-images/server.png";
                            appsList.add(nndAppType.ICSServer);
                            break;
                        case "switch":
                            editNode.typeName = "switch";
                            editNode.graphics.image = "/node-images/switch.png";
                            appsList.add(nndAppType.Switch);
                            break;
                        case "node":
                            editNode.typeName = "node";
                            editNode.graphics.image = "/node-images/node.svg";
                            break;
                        default:
                            break;
                    };
                }

                // Reset applications list with new applications
                editNode.applications = {}
                if (appsList.size > 0) editNode.setApplications(appsList);

                await projectContext.updateNode(SelectableNetworkTypes.Communications, editNode);
                let editedNode = editNode.getNetworkNode();
                nndInfo.callback(editedNode);
                await nndInfo.setEditObj(null);
                projectContext.commsNetwork.disableEditMode();
                setDeviceChangeAlert(false);
            }
        }
    };

    const handleNndAppChange = (choice: string) => {
        var nndApps: NndAppTypes = nndAppOptions;
        nndApps[choice] = !nndApps[choice];
        setNndAppOptions(nndApps);
    };

    const handleNndDeviceChange = (newDevice: string) => {
        setNndDevice(newDevice);
        if (nndInfo && nndInfo.defaultNndDevType !== newDevice) {
            setDeviceChangeAlert(true);
        }
        else {
            setDeviceChangeAlert(false);
        }
    };

    /* GLM functions */
    const editGlmNode = async () => {
        onCancel();

        const editNodes = projectContext.getNodes(SelectableNetworkTypes.Power, glmId);
        let editNode = editNodes?.length ? editNodes[0] : null;

        if (glmInfo && editNode && projectContext.powerNetwork && editNode instanceof GLMNode) {
            if (glmId != "") {
                editNode.glm_props.name = glmId;
                editNode.meta_props.id = glmId;
            }
            if (glmLabel != "") {
                editNode.dot_props.xlabel = glmLabel;
                editNode.meta_props.name = glmLabel;
                if (glmInfo.node) glmInfo.node.label = glmLabel;
            }
            /*if (glmSize != "") {
                editNode.dot_props.width = glmSize;
                if (glmInfo.node) glmInfo.node.size = parseInt(glmSize);
            }*/

            const wasUpdated: boolean = await projectContext.updateNode(SelectableNetworkTypes.Power, editNode);

            if (wasUpdated) {
                glmInfo.callback(glmInfo.node);
            }
            await glmInfo.setEditObj(null);
            projectContext.powerNetwork.disableEditMode();
        }
    };

    return (
        <Modal
            title="Node Details"
            visible={isOpen}
            onSuccess={handleSave}
            onClose={onCancel}
            width="40%"
            height="auto"
        >
            {networkType === SelectableNetworkTypes.Power && glmInfo ?
                <>
                    <LabeledTextBox
                        label="ID"
                        defaultValue={glmInfo.defaultGlmId}
                        disabled
                        onTextChange={setGlmId}
                    />
                    <LabeledTextBox
                        label="Label"
                        defaultValue={glmInfo.defaultGlmLabel}
                        onTextChange={setGlmLabel}
                    />
                    {/*<Dropdown 
                        action={null}
                        onChange={(event: any) => setGlmSize(event.target.value)}
                        formLabel="Size"
                        value={glmInfo.defaultGlmSize}
                    >
                        <Option value="10" label="Small" />
                        <Option value="20" label="Medium" />
                        <Option value="50" label="Large" />
                        <Option value="100" label="X-Large" />
                    </Dropdown>*/}
                </>
            :
            null}
            {networkType === SelectableNetworkTypes.Communications && nndInfo ?
                <>
                    <LabeledTextBox
                        label="Name"
                        defaultValue={nndInfo.defaultNndName}
                        onTextChange={setNndName}
                        disabled
                    />
                    <MultipleChoice
                        formLabel="Applications (default ports/protocols assumed)"
                        choices={Object.keys(nndInfo.defualtNndApps ?? {})}
                        preSelected={nndInfo.defualtNndApps}
                        onChange={(choice: string) => handleNndAppChange(choice)}
                    />
                    {deviceChangeAlert ?
                    <StyledAlert>
                        When changing the device type of a node, if applicable, the corresponding application type will be added 
                        to the applications list.
                        <br/>
                        You may remove the old corresponding application type if you wish, however, it will not be automatically removed.
                    </StyledAlert>
                    : null}
                    <Dropdown
                        action={null}
                        onChange={(event: any) => handleNndDeviceChange(event.target.value)}
                        formLabel="Device Type"
                        value={nndInfo.defaultNndDevType}
                    >
                        <Option value="monitor" label="Monitor" />
                        <Option value="router" label="Router" />
                        <Option value="sensor" label="Sensor" />
                        <Option value="server" label="Server" />
                        <Option value="switch" label="Switch" />
                        <Option value="node" label="Other" />
                    </Dropdown>
                </>
            : null}
        </Modal>
    );
};

const StyledAlert = styled.h4`
    font-family: Raleway;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
`;

export default EditNodeModal;
