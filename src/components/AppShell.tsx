import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { readCurrentUser } from '../types/details';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const { theme, toggleTheme, themeError } = useTheme();
  const { storageError, state } = useApp();
  const currentUser = readCurrentUser(state.data);
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
      <header className="navbar">
        <Link className="brand" to="/inicio" aria-label="Mini Trello — página inicial" draggable={false}><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>mini<span className="brand-light">trello</span><span className="brand-dot">.</span></Link>
        <div className="navbar-context"><span className="separator">/</span> Workspace <span className="badge">PESSOAL</span></div>
        <div className="navbar-actions">
          <Link className="session-link" to="/usuarios">{currentUser.id === 'anonimo' ? 'Entrar' : currentUser.name}</Link>
          <button className="theme-button" onClick={toggleTheme} aria-label={`Ativar tema ${theme === 'dark' ? 'claro' : 'escuro'}`}><span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span><span className="theme-label">Tema {theme === 'dark' ? 'claro' : 'escuro'}</span></button>
          <button ref={menuButton} className="menu-button" aria-controls="sidebar" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>Menu <span aria-hidden="true">☰</span></button>
        </div>
      </header>
      <aside id="sidebar" className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="workspace-label"><span className="workspace-icon">M</span><div>Meu workspace<small>Mini Trello</small></div></div>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Navegação principal">
          <NavLink to="/inicio"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 10 9-7 9 7v10H3Z" /><path d="M9 20v-7h6v7" /></svg></span>Visão geral</NavLink>
          <NavLink to="/projetos"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16M15 4v16" /></svg></span>Projetos</NavLink>
          <NavLink to="/usuarios"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6M21 20v-2a6 6 0 0 0-3-5" /></svg></span>Usuários</NavLink>
        </nav>
      </aside>
      <main id="main-content" tabIndex={-1}>
        {storageError && <p className="notice" role="alert">{storageError}</p>}
        {themeError && <p className="notice" role="status">O tema foi alterado, mas não pôde ser salvo neste navegador.</p>}
        <Outlet />
      </main>
    </div>
  );
}
