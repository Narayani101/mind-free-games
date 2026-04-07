import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RecentGamesProvider } from './context/RecentGamesContext';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';
import './index.css';

const base = import.meta.env.BASE_URL;
const routerBasename = base === '/' ? undefined : base.replace(/\/$/, '');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <ThemeProvider>
        <AuthProvider>
          <RecentGamesProvider>
            <App />
          </RecentGamesProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
