import axios from 'axios';
import { BASE_PATH } from './settings';

export enum EdgeColorOptions {
	BLUE = '#21A2FF',
	RED = '#FB4747',
	GREEN = '#47D645',
	ORANGE = '#FAB25F',
}

export type IGraphicalSettings = {
	EdgeWidth: {
		VaryingEdgeWidth: boolean;
		MaximumEdgeWidth: number;
	};
	EdgeColors: {
		HTTP: EdgeColorOptions;
		TCP: EdgeColorOptions;
		UDP: EdgeColorOptions;
		PhysicalEdge: EdgeColorOptions;
		DefaultEdge: EdgeColorOptions;
	};
	Layout: {
		CondenseMultipleEdgesBetweenNodes: boolean;
		HierarchicalLayout: boolean;
	};
	Labels: {
		ShowNodeLabels: boolean;
		ShowEdgeLabels: boolean;
		NodeFontSize: number;
		EdgeFontSize: number;
	};
}

export type IUpdateGraphicalSettingsResp = {
	message: string;
	success: boolean;
}

class _graphicalSettingsApi {
	apiBasePath = BASE_PATH;
	setup: IGraphicalSettings|null = null;

	constructor() {
		// load the initial settings
		this._get().then(result => {
			this.setup = result;
		});
	}

	update = async (newSetup: IGraphicalSettings|null) => {
		this.setup = newSetup;
		if(newSetup) this._set(newSetup);
	}

	_get = async (): Promise<IGraphicalSettings|null> => {
		
		return await axios.get(`${this.apiBasePath}/graphicalSettings/`)
			.then(({ status, data }) => {
				const resp: IGraphicalSettings = data;

				if (resp) {
					return resp;
				}
				else return null;
			})
			.catch(error => {
				console.log(error);
				return null;
			});
	}

	_set = async (settingsJson: IGraphicalSettings): Promise<IUpdateGraphicalSettingsResp|null> => {
		return await axios.post(`${this.apiBasePath}/graphicalSettings/`, settingsJson)
			.then(({ status, data }) => {
				if (status !== 200) {
					console.error('Invalid response status code: ' + status);
					return null;
				}

				const resp: IUpdateGraphicalSettingsResp = data;
				if (resp.success) {
					return resp;
				}
				else return null;
			}).catch(error => {
				console.log(error.response)
				return null;
			});
	}
}

const graphicalSettingsApi = new _graphicalSettingsApi();

export default graphicalSettingsApi;