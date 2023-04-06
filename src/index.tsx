import ReactDOM from 'react-dom';
import './index.css';
import Routes from './routes';
import { SessionProvider } from './context';

// block the right-click on the page when this component is active
document.addEventListener('contextmenu', event => event.preventDefault());

ReactDOM.render(
  <SessionProvider>
    <Routes />
  </SessionProvider>,
  document.getElementById('root')
);