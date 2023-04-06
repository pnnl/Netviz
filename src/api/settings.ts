export const BASE_PATH = 'http://127.0.0.1:40401/api';

export const UniqueId = (): string => {
	return (Date.now() * Math.random()).toString();
}

export type IApiResp = {
	message: string;
	success: boolean;
}

export type IPdfResp = IApiResp & {
	pdf: string;
}