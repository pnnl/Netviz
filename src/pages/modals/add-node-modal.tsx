import { FC, useEffect, useState, useContext } from "react";
import { Node } from "vis-network/peer/esm/vis-network";
import styled from 'styled-components';
import Modal from "../../common/modal";
import { LabeledTextBox } from "../../common/labeled-textbox";
import { Dropdown, Option } from "../../common/drop-down";
import { MultipleChoice } from "../../common/mutliple-choice";
import { SelectableNetworkTypes, IProjectContextState, ProjectContext } from "../../context";
import { GLMNodeType, NndNodeType } from "common";
import { nndApi, nndAppType, glmApi, NndNode } from "api";

export interface AddNodeInfo {
    node: Node|null;
    callback: (params?: any) => void;
    nodeType: NndNodeType|GLMNodeType|null;
    setEditObj: (editObj:string|null) => void;
}

export type AddNodeModalProps = {
    isOpen: boolean;
    networkType: SelectableNetworkTypes;
    nndInfo?: AddNodeInfo;
    glmInfo?: AddNodeInfo;
    onCancel: any;
};

export interface NndAppTypes {
    [key: string]: boolean;
}

const AddNodeModal: FC<AddNodeModalProps> = (props: AddNodeModalProps) => {
    const projectContext: IProjectContextState = useContext<IProjectContextState>(ProjectContext);
    const {
        isOpen,
        networkType,
        nndInfo,
        glmInfo,
        onCancel,
    } = props;
    const [nndNodeName, setNndNodeName] = useState<string>("");
    const [nndAppOptions, setNndAppOptions] = useState<NndAppTypes>({
        "ICS Server": false,
        "On/Off Application": false,
        "Packet Sink": false,
        "Fox Sensor": false,
        "Basic Sensor": false,
        "Switch": false,
        "Controller": false,
        "Router": false,
        "Wireless Access Point": false
    });
    const [nndNetmask, setNndNetmask] = useState<string>("");
    const [nndNameError, setNndNameError] = useState<boolean>(false);
    const [nndBlankNameError, setNndBlankNameError] = useState<boolean>(true);

    const [glmNodeId, setGlmNodeId] = useState<string>("");
    const [glmNodeLabel, setGlmNodeLabel] = useState<string>("");
    const [glmNodeSize, setGlmNodeSize] = useState<string>("");
    const [glmNameError, setGlmNameError] = useState<boolean>(false);
    const [glmBlankNameError, setGlmBlankNameError] = useState<boolean>(true);


    useEffect(() => {
        if (nndInfo?.nodeType) {
            switch(nndInfo.nodeType.label) {
                case("Sensor"):
                    nndAppOptions["Basic Sensor"] = true;
                    break;
                case("Router"):
                    nndAppOptions["Router"] = true;
                    break;
                case("Server"):
                    nndAppOptions["ICS Server"] = true;
                    break;
                case("Switch"):
                    nndAppOptions["Switch"] = true;
                    break;
                default:
                    break;
            }
        }
        else {
            nndAppOptions["Basic Sensor"] = false;
            nndAppOptions["Router"] = false;
            nndAppOptions["ICS Server"] = false;
            nndAppOptions["Switch"] = false;
        }
    }, [nndInfo?.nodeType]);

    const handleSave = () => {
        switch(networkType) {
            case (SelectableNetworkTypes.Communications):
                addNndNode();
                break;
            case (SelectableNetworkTypes.Power):
                addGlmNode();
                break;
            default:
                break;
        }
    }

    const handleCancel = () => {
        setNndNodeName("");
        setNndAppOptions({
            "ICS Server": false,
            "On/Off Application": false,
            "Packet Sink": false,
            "Fox Sensor": false,
            "Basic Sensor": false,
            "Switch": false,
            "Controller": false,
            "Router": false,
            "Wireless Access Point": false
        });
        setNndNetmask("");
        setGlmNodeId("");
        setGlmNodeLabel("");
        setGlmNodeSize("");
   
        onCancel();
    }

    /* NND functions */
    const addNndNode = async () => {
        onCancel();

        // the scope of this is the mutation of the base Network object
        if (nndInfo && nndInfo.node !== null && nndInfo.nodeType instanceof NndNodeType && projectContext.commsNetwork) {
            const newNode = nndApi.createNndNode(nndInfo.node, nndInfo.nodeType);
             
            if (nndInfo.nodeType) { 
                let appsList: Set<nndAppType> = new Set();

                Object.entries(nndAppOptions).forEach(([key, value]) => {
                    if (value) {
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
                });

                if (appsList.size > 0) newNode.setApplications(appsList);
            }
            // If the new node is a switch, append 'switch' to the beginning of the name as convention
            if (Object.keys(newNode.applications).includes("switch")) {
                newNode.nodeName = "switch_" + nndNodeName;
            }
            else {
                newNode.nodeName = nndNodeName;
            }

            const addedNode = await projectContext.addNode(SelectableNetworkTypes.Communications, newNode, nndNetmask);
            await nndInfo.setEditObj(null);

            // check if the add node was successful, then finish the canvas add
            if (addedNode && nndInfo.callback) {
                nndInfo.callback(newNode.getNetworkNode()); // add the modified node to the canvas
                projectContext.commsNetwork.disableEditMode();
            }
        }
    }

    const handleNndAppChange = (choice: string) => {
        var nndApps: NndAppTypes = nndAppOptions;
        nndApps[choice] = !nndApps[choice];
        setNndAppOptions(nndApps)
    }

    const handleNndNameChange = (name: string) => {
        if (projectContext.nndJson) {
            let usedNames = Object.keys(projectContext.nndJson.nnd_json.network.nodes);

            if (usedNames.includes(name)) {
                setNndNameError(true);
            }
            else if (name.trim() === ""){
                setNndBlankNameError(true);
            }
            else {
                setNndNodeName(name);
                setNndNameError(false);
                setNndBlankNameError(false);
            }
        }
    }

    const handleNndNetmaskChange = (choice: string) => {
        setNndNetmask(choice);
    }

    /* GLM functions */
    const addGlmNode = async () => {
        onCancel();

        // the scope of this is the mutation of the base Network object
        if (glmInfo && glmInfo.node !== null && glmInfo.nodeType instanceof GLMNodeType && projectContext.powerNetwork) {
            const newNode = glmApi.createGlmNode(glmInfo.node, glmInfo.nodeType);
            newNode.glm_props.name = glmNodeId;
            newNode.meta_props.id = glmNodeId;
            newNode.dot_props.xlabel = glmNodeLabel;
            newNode.meta_props.name = glmNodeLabel;
            newNode.dot_props.width = glmNodeSize;

            const addedNode = await projectContext.addNode(SelectableNetworkTypes.Power, newNode);
            await glmInfo.setEditObj(null);

            // check if the add node was successful, then finish the canvas add
            if (addedNode) {
                glmInfo.callback(newNode.getNetworkNode()); // add the modified node to the canvas
                projectContext.powerNetwork.disableEditMode();
            }
        }        
    }

    const handleGlmNameChange = (name: string) => {
        if (projectContext.glmJson) {
            let usedNames = projectContext.glmJson.glm_json.objects.nodes.map((node) => {
                return node.meta_props.name;
            });

            if (usedNames.includes(name)) {
                setGlmNameError(true);
            }
            else if (name.trim() === ""){
                setGlmBlankNameError(true);
            }
            else {
                setGlmNodeId(name);
                setGlmBlankNameError(false);
                setGlmNameError(false);
            }
        }
    }

    return (
        <Modal
            title="Add Node"
            visible={isOpen}
            onSuccess={handleSave}
            onClose={handleCancel}
            closeOnBlur={false}
            disableSuccess={nndNameError || glmNameError || 
                (glmBlankNameError && networkType === SelectableNetworkTypes.Power) || 
                (nndBlankNameError &&  networkType === SelectableNetworkTypes.Communications)}
            width="40%"
            height="auto"
        >
            {networkType === SelectableNetworkTypes.Power ?
                <div>
                    {glmBlankNameError &&
                    <StyledError>
                        Node ID must not be blank.
                    </StyledError>}

                    {glmNameError &&
                    <StyledError>
                        Error: This ID is already in use.
                    </StyledError>}


                    <LabeledTextBox
                        label="ID"
                        defaultValue=""
                        onTextChange={handleGlmNameChange}
                    />
                    <LabeledTextBox
                        label="Label"
                        defaultValue=""
                        onTextChange={setGlmNodeLabel}
                    />
                    <Dropdown 
                        action={null}
                        onChange={(event: any) => setGlmNodeSize(event.target.value)}
                        formLabel="Size"
                    >
                        <Option value="10" label="Small"/>
                        <Option value="20" label="Medium" />
                        <Option value="50" label="Large" />
                        <Option value="100" label="X-Large" />
                    </Dropdown>
                </div>
            :
                <div>
                    {nndBlankNameError &&
                    <StyledError>
                        Node name must not be blank.
                    </StyledError>}

                    {nndNameError &&
                    <StyledError>
                        Error: This name is already in use.
                    </StyledError>}

                    {nndInfo?.nodeType?.label === "Switch" &&
                    <StyledHeading>
                        As a convention 'switch' will be automatically appended to the beginning of the switch node name.
                    </StyledHeading>
                    }

                    <LabeledTextBox
                        label="Name"
                        defaultValue=""
                        onTextChange={handleNndNameChange}
                    />
                    {nndAppOptions["Switch"] === true &&
                    <LabeledTextBox
                        label="Netmask for Subnet"
                        defaultValue="255.255.255.0"
                        onTextChange={handleNndNetmaskChange}
                    />
                    }
                    <MultipleChoice
                        formLabel="Applications (default ports/protocols assumed)"
                        choices={Object.keys(nndAppOptions)}
                        onChange={(choice: string) => handleNndAppChange(choice)}
                        preSelected={nndAppOptions}
                    />
                </div>
            }
        </Modal>
    );
};

const StyledError = styled.h4`
    font-family: Raleway;
    color: red;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
`;

const StyledHeading = styled.h4`
    font-family: Raleway;
    color: blue;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
`;

export default AddNodeModal;