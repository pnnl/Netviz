import React, { FC, ReactElement, useContext, useState, useEffect } from 'react';
import { SessionContext, ISessionContextState } from 'context';
import { IGraphicalSettings, EdgeColorOptions, graphicalSettingsApi } from 'api';
import { Modal } from 'common';
import styled from 'styled-components';

//#region DEFINE STYLED COMPONENTS
type StyledColorChoiceProp = {
	color: EdgeColorOptions;
	selected: boolean;
}

const StyledColorChoice = styled.span<StyledColorChoiceProp>`
	display: inline-block;
	background: ${props => props.color ? props.color.toString() : EdgeColorOptions.RED.toString()};
	opacity: ${props => props.selected ? '1.0' : '0.2'};
	border-radius: 5px;
	width: 50px;
	height: 25px;
	margin-right: 10px;
	:hover, :focus & {
		cursor: pointer;
  }
`;

//#endregion

const AppSettingsModal : FC = () : ReactElement => {
	const session : ISessionContextState = useContext<ISessionContextState>(SessionContext);
	const [graphicalSettings, setGraphicalSettings] = useState<IGraphicalSettings|null>(null);

	useEffect(() => {
		setGraphicalSettings(graphicalSettingsApi.setup);
	}, []);

	const closeNewProject = (evt: React.MouseEvent<HTMLButtonElement> | undefined) => {
		session.setShowPopUpByName('');
	}

	const saveChanges = () => {
		// Set the session graphical settings, will trigger the save to file in the session context
		if(graphicalSettings) graphicalSettingsApi.update(graphicalSettings);
		// Close the modal
		session.setShowPopUpByName('');
	}

	//#region INPUT CHANGE EVENTS
	const handleFieldChange = async (evt: React.FormEvent<HTMLInputElement|HTMLSelectElement>) => {
		const target = evt.currentTarget;
		
		if (target != null && graphicalSettings) {

			const targetValue = target.type === 'checkbox' ? target instanceof HTMLInputElement ? target.checked : target.value : target.value;
			const targetValueAsBool: boolean = targetValue.toString().toUpperCase() === 'TRUE' ? true : false;

			switch(target.name) {
				case 'VaryingEdgeWidth':
					setGraphicalSettings({ ...graphicalSettings,
						EdgeWidth: {...graphicalSettings.EdgeWidth, VaryingEdgeWidth: targetValueAsBool, }
					});
					break;
				case 'MaximumEdgeWidth':
					setGraphicalSettings({ ...graphicalSettings,
						EdgeWidth: {...graphicalSettings.EdgeWidth, MaximumEdgeWidth: parseInt(targetValue.toString() ?? 10), }
					});
					break;
				case 'CondenseMultipleEdgesBetweenNodes':
					setGraphicalSettings({ ...graphicalSettings,
						Layout: {...graphicalSettings.Layout, CondenseMultipleEdgesBetweenNodes: targetValueAsBool, }
					});
					break;
				case 'HierarchicalLayout':
					setGraphicalSettings({ ...graphicalSettings,
						Layout: {...graphicalSettings.Layout, HierarchicalLayout: targetValueAsBool, }
					});
					break;
				case 'ShowNodeLabels':
					setGraphicalSettings({ ...graphicalSettings,
						Labels: {...graphicalSettings.Labels, ShowNodeLabels: targetValueAsBool, }
					});
					break;
				case 'ShowEdgeLabels':
					setGraphicalSettings({ ...graphicalSettings,
						Labels: {...graphicalSettings.Labels, ShowEdgeLabels: targetValueAsBool, }
					});
					break;
				case 'NodeFontSize':
					setGraphicalSettings({ ...graphicalSettings,
						Labels: {...graphicalSettings.Labels, NodeFontSize: parseInt(targetValue.toString() ?? 10), }
					});
					break;
				case 'EdgeFontSize':
					setGraphicalSettings({ ...graphicalSettings,
						Labels: {...graphicalSettings.Labels, EdgeFontSize: parseInt(targetValue.toString() ?? 10), }
					});
					break;
			}
		}
	}

	const handleColorChange = async (propName: string, color: EdgeColorOptions) => {
		if (graphicalSettings?.EdgeColors) {
			switch(propName) {
				case 'HTTP':
					setGraphicalSettings({ ...graphicalSettings,
						EdgeColors: {
							...graphicalSettings?.EdgeColors,
							HTTP: color,
						}
					});
					break;
				case 'TCP':
					setGraphicalSettings({ ...graphicalSettings,
						EdgeColors: {
							...graphicalSettings?.EdgeColors,
							TCP: color,
						}
					});
					break;
				case 'UDP':
					setGraphicalSettings({ ...graphicalSettings,
						EdgeColors: {
							...graphicalSettings?.EdgeColors,
							UDP: color,
						}
					});
					break;
				case 'PhysicalEdge':
					setGraphicalSettings({ ...graphicalSettings,
						EdgeColors: {
							...graphicalSettings?.EdgeColors,
							PhysicalEdge: color,
						}
					});
					break;
				case 'DefaultEdge':
					setGraphicalSettings({ ...graphicalSettings,
						EdgeColors: {
							...graphicalSettings?.EdgeColors,
							DefaultEdge: color,
						}
					});
					break;
			}
		}
	}

	//#endregion

	return (
		<Modal
			title="Graphical Settings"
			visible={true}
			closeOnBlur={false}
			width="50%"
			height="75%"
			onClose={closeNewProject}
			onSuccess={saveChanges}
			disableSuccess={false}
			cancelButton={true}
		>
			<form>
				<hr />
				<h4>Edge Width</h4>
				<p>
					<input
						type="checkbox"
						name='VaryingEdgeWidth'
						className="checkbox-input"
						defaultChecked={graphicalSettingsApi.setup?.EdgeWidth.VaryingEdgeWidth ?? true}
						onChange={handleFieldChange}
					/> Varying Edge Width
				</p>
				<p>
					Maximium Edge Width: &nbsp;
					<select
						name="MaximumEdgeWidth"
						className="field-input"
						defaultValue={graphicalSettingsApi.setup?.EdgeWidth.MaximumEdgeWidth}
						onChange={handleFieldChange}
					>
						<option value={10}>10</option>
						<option value={12}>12</option>
						<option value={14}>14</option>
						<option value={16}>16</option>
						<option value={18}>18</option>
						<option value={20}>20</option>
					</select>
				</p>
				<hr />
				<h4>Layout</h4>
				<p>
					<input
						type="checkbox"
						name='CondenseMultipleEdgesBetweenNodes'
						className="checkbox-input"
						defaultChecked={graphicalSettingsApi.setup?.Layout.CondenseMultipleEdgesBetweenNodes ?? true}
						onChange={handleFieldChange}
					/> Condense Multiple Edges Between Nodes
				</p>
				<p>
					<input
						type="checkbox"
						name='HierarchicalLayout'
						className="checkbox-input"
						defaultChecked={graphicalSettingsApi.setup?.Layout.HierarchicalLayout ?? true}
						onChange={handleFieldChange}
					/> Hierarchical Layout
				</p>
				<hr />
				<h4>Edge Colors</h4>
				<p>
					HTTP
					<br />
					<ColorOptions settingName='HTTP' handleColorChange={handleColorChange} selectedColor={graphicalSettings?.EdgeColors.HTTP} />
				</p>
				<p>
					TCP
					<br />
					<ColorOptions settingName='TCP' handleColorChange={handleColorChange} selectedColor={graphicalSettings?.EdgeColors.TCP} />
				</p>
				<p>
					UDP
					<br />
					<ColorOptions settingName='UDP' handleColorChange={handleColorChange} selectedColor={graphicalSettings?.EdgeColors.UDP} />
				</p>
				<p>
					Physical Edge
					<br />
					<ColorOptions settingName='PhysicalEdge' handleColorChange={handleColorChange} selectedColor={graphicalSettings?.EdgeColors.PhysicalEdge} />
				</p>
				<p>
					Default Edge
					<br />
					<ColorOptions settingName='DefaultEdge' handleColorChange={handleColorChange} selectedColor={graphicalSettings?.EdgeColors.DefaultEdge} />
				</p>
				<hr />
				<h4>Labels</h4>
				<p>
					<input
						type="checkbox"
						name='ShowNodeLabels'
						className="checkbox-input"
						defaultChecked={graphicalSettingsApi.setup?.Labels.ShowNodeLabels ?? true}
						onChange={handleFieldChange}
					/> Show Node Labels
				</p>
				<p>
					<input
						type="checkbox"
						name='ShowEdgeLabels'
						className="checkbox-input"
						defaultChecked={graphicalSettingsApi.setup?.Labels.ShowEdgeLabels ?? true}
						onChange={handleFieldChange}
					/> Show Edge Labels
				</p>
				<p>
					Node Font Size: &nbsp;
					<select
						name="NodeFontSize"
						className="field-input"
						defaultValue={graphicalSettingsApi.setup?.Labels.NodeFontSize}
						onChange={handleFieldChange}
					>
						{[7,8,9,10,12,14,16,18,20,22,24].map((optionValue, index) => {
							return <option key={`option-NodeFontSize-${index}`} value={optionValue}>{optionValue}</option>;
						})}
					</select>
				</p>
				<p>
					Edge Font Size: &nbsp;
					<select
						name="EdgeFontSize"
						className="field-input"
						defaultValue={graphicalSettingsApi.setup?.Labels.EdgeFontSize}
						onChange={handleFieldChange}
					>
						{[7,8,9,10,12,14,16,18,20,22,24].map((optionValue, index) => {
							return <option key={`option-NodeFontSize-${index}`} value={optionValue}>{optionValue}</option>;
						})}
					</select>
				</p>
			</form>
		</Modal>
	);
};

type ColorChoiceProps = {
	settingName: string;
	color: EdgeColorOptions;
	selected: boolean;
	handleColorChange: (propName: string, color: EdgeColorOptions) => Promise<void>;
}

const ColorChoice : FC<ColorChoiceProps> = (props: ColorChoiceProps) => {
	const { settingName, color, selected, handleColorChange } = props;

	return <StyledColorChoice
		color={color}
		selected={selected}
		onClick={() => { handleColorChange(settingName, color) }}
	/>;
}

type ColorOptionsProps = {
	settingName: string;
	selectedColor: EdgeColorOptions|undefined;
	handleColorChange: (propName: string, color: EdgeColorOptions) => Promise<void>;
}

const ColorOptions : FC<ColorOptionsProps> = (props: ColorOptionsProps) => {
	const { settingName, selectedColor, handleColorChange } = props;

	const colorOptions = [EdgeColorOptions.BLUE, EdgeColorOptions.RED, EdgeColorOptions.GREEN, EdgeColorOptions.ORANGE];

	return <>
		{colorOptions.map((colorOption, index) => {
			return (
				<ColorChoice key={`key-color-option-${settingName}-${index}`}
					color={colorOption}
					settingName={settingName}
					handleColorChange={handleColorChange}
					selected={selectedColor === colorOption}
				/>
			);
	})}
	</>;
}

export default AppSettingsModal;