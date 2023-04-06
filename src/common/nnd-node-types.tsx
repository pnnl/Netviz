import React from "react";

export type INndNodeType = {
    label: string;
    iconImage: string;
    getIcon(): React.ReactFragment;
}

export class NndNodeType implements INndNodeType {
    label: string = "";
    iconImage: string = ""; // = 'Default node type icon"

    constructor(typeLabel: string = 'Other') {
		this.label = typeLabel;

		switch(typeLabel.toLowerCase()) {
			case 'monitor':
				this.iconImage = '/node-images/monitor.svg';
				break;
			case 'router':
				this.iconImage = '/node-images/router.png';
				break;
			case 'sensor':
				this.iconImage = '/node-images/sensor.png';
				break;
			case 'server':
				this.iconImage = '/node-images/server.png';
				break;
			case 'switch':
				this.iconImage = '/node-images/switch.png';
				break;
			default:
				this.iconImage = '/node-images/node.svg';
				break;
		}
	}

	getIcon(sizePx: number = 25): React.ReactFragment {
		return <img src={this.iconImage} alt={this.label} width={sizePx} />
	}
}

export const NndNodeTypes = [
    new NndNodeType('Other'),
	new NndNodeType('Monitor'),
	new NndNodeType('Router'),
	new NndNodeType('Sensor'),
	new NndNodeType('Server'),
	new NndNodeType('Switch'),
]
