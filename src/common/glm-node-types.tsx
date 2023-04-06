import React from "react";

export type IGLMNodeType = {
	label: string;
	iconImage: string;
	getIcon(): React.ReactFragment;
}

export class GLMNodeType implements IGLMNodeType {
	label: string = 'Basic';
	iconImage: string = '/node-images/node.svg';
	
	constructor(typeLabel: string = 'Basic') {
		this.label = typeLabel;

		switch(typeLabel.toLowerCase()) {
			case 'capacitor':
				this.iconImage = '/node-images/capacitor.svg';
				break;
			case 'substation':
				this.iconImage = '/node-images/substation.svg';
				break;
			case 'load':
				this.iconImage = '/node-images/load.svg';
				break;
			case 'meter':
				this.iconImage = '/node-images/meter.svg';
				break;
			case 'triplex meter':
				this.iconImage = '/node-images/triplex_meter.svg';
				break;
			case 'triplex node':
				this.iconImage = '/node-images/triplex_node.svg';
				break;
			case 'house':
				this.iconImage = '/node-images/house.svg';
				break;
			default:
				this.iconImage = '/node-images/node.svg';
				break;
		}
	}

	getIcon(color: string = 'darkgrey', sizePx: number = 25): React.ReactFragment {
		return <img src={this.iconImage} alt={this.label} color={color} width={sizePx} />
	}
}

export const GLMNodeTypes = [
	new GLMNodeType('Basic'),
	new GLMNodeType('Capacitor'),
	new GLMNodeType('Substation'),
	new GLMNodeType('Load'),
	new GLMNodeType('Meter'),
	new GLMNodeType('Triplex Meter'),
	new GLMNodeType('Triplex Node'),
	new GLMNodeType('House'),
];