import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {LehrerUebersicht} from './components/LehrerUebersicht.tsx';
import './index.css';

// /lehrer zeigt die Lehrerübersicht, alles andere die Schüler-App
const isTeacherPage = window.location.pathname.replace(/\/+$/, '') === '/lehrer';

createRoot(document.getElementById('root')!).render(isTeacherPage ? <LehrerUebersicht /> : <App />);
