import { FC, useContext, memo, useState, useEffect } from 'react';
import { SessionContext, ISessionContextState, IProjectContextState, ProjectContext, SelectableNetworkTypes } from 'context';
import { useHistory } from "react-router-dom";
import styled from 'styled-components';
import { IProject } from 'api';
import ActionButton from './buttons/action-button';
import { TypeOfIcon } from './icons';
import { Colors } from 'theme';
import { OpenExports } from '../pages/modals';
import { OpenCsvExports } from '../pages/modals';
import {nndApi, glmApi } from '../api';
import html2canvas from 'html2canvas';
import {jsPDF} from 'jspdf';
import { PowerNetwork, CommsNetwork } from "common";



const titleBarHeight = 64;

//#region DEFINE STYLED COMPONENTS

const StyledTitleBar = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	z-index: 9990;
	width: 100%;
	height: ${titleBarHeight}px;
	background: ${Colors.TitleBackGround};
	padding-left: ${titleBarHeight*0.5}px;
`;

const StyledAppIcon = styled.img`
	width: ${titleBarHeight*0.5}px;
	height: ${titleBarHeight*0.5}px;
	position: fixed;
	padding-top: ${titleBarHeight*0.25}px;
	vertical-align: middle;
`;

const StyledAppTitle = styled.span`
	font-family: Raleway;
	font-style: normal;
	font-weight: 600;
	font-size: ${titleBarHeight*0.6}px;
	line-height: ${titleBarHeight}px;
	color: ${Colors.TitleTextColor};
	position: relative;
	text-transform: uppercase;
	left: ${titleBarHeight*0.75}px;
`;

const StyledAppTitleLower = styled.span`
	font-size: ${titleBarHeight*0.5}px;
`;

const StyledControlButtonContainer = styled.span`
	float: right;
	right: 0;
	font-family: Raleway;
	font-style: normal;
	font-size: 14px;
	color: #FFFFFF;
  	line-height: ${titleBarHeight}px;
  	height: ${titleBarHeight}px;
	text-align: center;
	margin-right: 60px;
`;

//#endregion

const TitleBar: FC = () => {
	const session : ISessionContextState = useContext<ISessionContextState>(SessionContext);
	const projectContext: IProjectContextState = useContext<IProjectContextState>(ProjectContext);
	const [showExportModal, setShowExportModal] = useState<boolean>(false);
	const [showExportCsvModal, setShowExportCsvModal] = useState<boolean>(false);
	let history = useHistory();

	const selectedProject: IProject|undefined = session.selectedProject;
	const hasSelectedProject: boolean = selectedProject !== undefined;

	let selectedProjectFile: string = ""
	if (selectedProject) {
		if (projectContext.selectedNetworkType === SelectableNetworkTypes.Communications && selectedProject.commsFile) {
			selectedProjectFile = selectedProject.commsFile;
		}
		else if (projectContext.selectedNetworkType === SelectableNetworkTypes.Power && selectedProject.powerFile) {
			selectedProjectFile = selectedProject.powerFile;
		}
	}

	const importProjectClick = () => {
		session.setShowPopUpByName("import-project");
	}

	//#region Event Handler for Selected Project
	const projectsClick = () => {
		session.setProject(undefined);
		history.push("/projects");
	}

	const settingsClick = () => {
		session.setShowPopUpByName("app-settings");
	}


	const takeShot = async () =>{
		//const projectContext: IProjectContextState = useContext<IProjectContextState>(ProjectContext);
		//.toDataURL("image/jpeg", 1);

		// var img = ctx.canvas.toDataURL("image/jpeg", 1);
		// var doc = new jsPDF('l', 'px', [1200, 1200]);
		// doc.addImage(img, 'jpeg', 0, 0, 1200, 1200);
		// doc.output('dataurlnewwindow');
		// doc.save("sample.pdf");


		


		
		let p_canvas = document.getElementById("powerSystemCanvas-1")
		if(p_canvas){
			let w = p_canvas.offsetWidth;
			let h = p_canvas.offsetHeight;

			let canvas_options = {
				dpi: 1200.0, // Set to 300 DPI
				scale: 4, // Adjusts your resolution
				windowWidth: p_canvas.scrollWidth,
				windowHeight: p_canvas.offsetHeight
			}
			html2canvas(p_canvas, canvas_options).then(function(canvas) {
				var img = canvas.toDataURL("image/jpeg", 2);
				var doc = new jsPDF('l', 'px', [w, h]);
				doc.addImage(img, 'jpeg', 0, 0, w, h);
				doc.output('dataurlnewwindow');
				//doc.save('sample-file.pdf');
			});
		}



		// let div = document.getElementById('power_canvas');
		// if(div){
		// 	let canvas = html2canvas(div);       
		// 	let imgData = await canvas.toDataURL('image/png');              
		// 	var doc = new jsPDF('p', 'mm');
		// 	doc.addImage(imgData, 'PNG', 10, 10);
		// 	doc.save('sample-file.pdf');
		// }

	};

	const exportToPDFClick = async () => {

		//takeShot();


		setShowExportModal(true);
	}

	
	const exportToCSVClick = async () => {

		//takeShot();

		setShowExportCsvModal(true);
	}

	const saveAsClick = async () => {
		let filePath = selectedProjectFile;
		let time = new Date();
		let timeString = "_"+ time.toLocaleString().replace(/ /g, "_").replace(/:/g, "").replace(/\//g, "").replace(/,/g, "");
		const glmJsonFile = session.selectedProject?.powerFile;
			if (glmJsonFile) {
				const glmFileResp = await glmApi.downloadFile(glmJsonFile, timeString)
			}

		const nndJsonFile = session.selectedProject?.commsFile;
			if (nndJsonFile) {
				const nndFileResp = await nndApi.downloadFile(nndJsonFile, timeString)
			}
		alert("The updated glm and nnd files have been downloaded to your computer's 'Downloads' folder.");

	}

	//#endregion

	// Without any JSON data created the user cannot export to PDF
	const HasAnyJsonData = (
		(selectedProject?.commsFile && selectedProject?.commsFile.length > 0)
		|| (selectedProject?.powerFile && selectedProject?.powerFile.length > 0)
	) ? true : false;

	return session.loading ? (
		<span>Loading...</span>
	)
	: (
		<StyledTitleBar>
			<StyledAppIcon src='app_icon.svg' />
			<StyledAppTitle>N<StyledAppTitleLower>et</StyledAppTitleLower> V<StyledAppTitleLower>is</StyledAppTitleLower></StyledAppTitle>
			<StyledControlButtonContainer>
				{hasSelectedProject ? (
						<>
							<ActionButton label="Projects" iconType={TypeOfIcon.Apps} color="white" height={24} asLink={true} onClick={projectsClick} />
							<ActionButton label="Export to PDF" disabled={!HasAnyJsonData} iconType={TypeOfIcon.FileDownload} color="white" height={24} asLink={true} onClick={exportToPDFClick} />
							<ActionButton label="Export to CSV" disabled={!HasAnyJsonData} iconType={TypeOfIcon.FileDownload} color="white" height={24} asLink={true} onClick={exportToCSVClick} />
							<ActionButton label="Download GLM/NND Files" iconType={TypeOfIcon.Save} color={Colors.TitleBackGround} backgroundColor="white" height={24} onClick={saveAsClick} />
						</>
				) : (
					<>
						<ActionButton label="Import Project" iconType={TypeOfIcon.FileDownload} color={Colors.TitleBackGround} backgroundColor="white" height={24} onClick={importProjectClick} />
						<ActionButton label="Settings" iconType={TypeOfIcon.Settings} color="white" height={24} asLink={true} onClick={settingsClick} />
					</>
				)}
			</StyledControlButtonContainer>
			<OpenExports showModal={showExportModal} setShowModal={setShowExportModal} />
			<OpenCsvExports showCsvModal={showExportCsvModal} setShowCsvModal={setShowExportCsvModal} />
		</StyledTitleBar>
	);
}

export default TitleBar;