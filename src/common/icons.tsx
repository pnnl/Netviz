import { FC } from 'react';

export enum TypeOfIcon {
	Add = 'add',
	Apps = 'apps',
	Check = 'check',
	Close = 'close',
	Delete = 'delete',
	FileDownload = 'file-download',
	Save = 'save',
	Settings = 'settings',
	Upload = 'upload',
	Stream = 'stream',
}

export type IconAsSvgProps = {
	iconType?: TypeOfIcon;
	color: string;
	sizePx: number;
}

export const IconAsSvgStr = (props: IconAsSvgProps) => {
	const { iconType, color, sizePx } = props;

	// create an SVG based on the name provided
	switch(iconType) {
		case TypeOfIcon.Add:
			return `<svg style='vertical-align: bottom;' enableBackground='new 0 0 ${sizePx} ${sizePx}' height=${sizePx} viewBox='0 0 ${sizePx} ${sizePx}' width=${sizePx} fill='${color}'>
					<g>
						<rect fill="none" height=${sizePx} width=${sizePx} />
					</g>
					<g>
						<g>
							<path d="M19,13h-6v6h-2v-6H5v-2h6V5h2v6h6V13z"/>
						</g>
					</g>
				</svg>`;
		case TypeOfIcon.Apps:
			return `<svg style='vertical-align: bottom;' enableBackground='new 0 0 ${sizePx} ${sizePx}' height=${sizePx} viewBox='0 0 ${sizePx} ${sizePx}' width=${sizePx} fill='${color}'>
					<path d="M0 0h24v24H0V0z" fill="none"/>
					<path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
				</svg>`;
		case TypeOfIcon.Check:
			return `<svg style='vertical-align: bottom;' enableBackground='new 0 0 ${sizePx} ${sizePx}' height=${sizePx} viewBox='0 0 ${sizePx} ${sizePx}' width=${sizePx} fill='${color}'>
					<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
				</svg>`;
		case TypeOfIcon.Close:
			return `<svg style='vertical-align: bottom;' enableBackground='new 0 0 ${sizePx} ${sizePx}' height=${sizePx} viewBox='0 0 ${sizePx} ${sizePx}' width=${sizePx} fill='${color}'>
					<path d="M0 0h24v24H0z" fill="none"/>
					<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
				</svg>`;
		case TypeOfIcon.Delete:
			return `<svg style='vertical-align: bottom;' enableBackground='new 0 0 ${sizePx} ${sizePx}' height=${sizePx} viewBox='0 0 ${sizePx} ${sizePx}' width=${sizePx} fill='${color}'>
					<path d="M0 0h24v24H0V0z" fill="none"/>
					<path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/>
				</svg>`;
		case TypeOfIcon.FileDownload:
			return `<svg style='vertical-align: bottom;' enableBackground='new 0 0 ${sizePx} ${sizePx}' height=${sizePx} viewBox='0 0 ${sizePx} ${sizePx}' width=${sizePx} fill='${color}'>
					<path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
				</svg>`;
		case TypeOfIcon.Save:
			return `<svg style='vertical-align: bottom;' enableBackground='new 0 0 ${sizePx} ${sizePx}' height=${sizePx} viewBox='0 0 ${sizePx} ${sizePx}' width=${sizePx} fill='${color}'>
					<path d="M0 0h24v24H0z" fill="none"/>
					<path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
				</svg>`;
		case TypeOfIcon.Settings:
			return `<svg style='vertical-align: bottom;' enableBackground='new 0 0 ${sizePx} ${sizePx}' height=${sizePx} viewBox='0 0 ${sizePx} ${sizePx}' width=${sizePx} fill='${color}'>
					<g>
						<path d="M0,0h24v24H0V0z" fill="none"/>
						<path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
					</g>
				</svg>`;
		case TypeOfIcon.Upload:
			return `<svg style='vertical-align: bottom;' enableBackground='new 0 0 ${sizePx} ${sizePx}' height=${sizePx} viewBox='0 0 ${sizePx} ${sizePx}' width=${sizePx} fill='${color}'>
					<g>
						<rect fill="none" height="24" width="24"/>
					</g>
					<g>
						<path d="M5,20h14v-2H5V20z M5,10h4v6h6v-6h4l-7-7L5,10z"/>
					</g>
				</svg>`;
		case TypeOfIcon.Stream:
			return `<svg style='vertical-align: bottom;' enableBackground='new 0 0 ${sizePx} ${sizePx}' height=${sizePx} viewBox='0 0 ${sizePx} ${sizePx}' width=${sizePx} fill='${color}'>
					<path d="M0 0h24v24H0z" fill="none"/>
					<circle cx="20" cy="12" r="2"/>
					<circle cx="4" cy="12" r="2"/>
					<circle cx="12" cy="20" r="2"/>
					<path d="M10.05 8.59L6.03 4.55h-.01l-.31-.32-1.42 1.41 4.02 4.05.01-.01.31.32zm3.893.027l4.405-4.392L19.76 5.64l-4.405 4.393zM10.01 15.36l-1.42-1.41-4.03 4.01-.32.33 1.41 1.41 4.03-4.02zm9.75 2.94l-3.99-4.01-.36-.35L14 15.35l3.99 4.01.35.35z"/>
					<circle cx="12" cy="4" r="2"/>
				</svg>`;
	}

	return `<svg style='vertical-align: bottom;' enableBackground='new 0 0 ${sizePx} ${sizePx}' height=${sizePx} viewBox='0 0 ${sizePx} ${sizePx}' width=${sizePx} fill='${color}'>
			<rect width=${sizePx} height=${sizePx} style='fill: ${color}; stroke-width: 1; stroke: rgb(200,200,200);' />
		</svg>`;
}

export const IconAsSvg: FC<IconAsSvgProps> = (props: IconAsSvgProps) => {
	const svgStr = IconAsSvgStr(props);
	
	return <span dangerouslySetInnerHTML={{ __html: svgStr }} />
}
