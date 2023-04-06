import { FC, ReactElement, useContext } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { SessionContext, ISessionContextState } from './context';
import {
	DashboardPage,
	CreateNewProjectPage,
	ImportProjectPage,
	ProjectPage,
	AppSettingsModal } from './pages';

const routeModalPopUp = (popUpName: string) => {
	switch (popUpName) {
		case 'create-new-project':
			return <CreateNewProjectPage />;
		case 'import-project':
			return <ImportProjectPage />;
		case 'app-settings':
			return <AppSettingsModal />
		default:
			return <></>;
	}
}

const Routes : FC = () : ReactElement => {
	const session : ISessionContextState = useContext<ISessionContextState>(SessionContext);

	return session.loading
		? (<span>Loading Application...</span>)
		: (
			<Router>
				<Switch>
					<Route path='/project'><ProjectPage /></Route>
					<Route path='/'><DashboardPage /></Route>
				</Switch>
				{session && session.showPopUpByName && routeModalPopUp(session.showPopUpByName)}
			</Router>
			);
};

export default Routes;