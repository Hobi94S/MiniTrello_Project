import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { FoundationPage, IntegrationPage, NotFoundPage } from './pages/Pages';
import { BoardPage } from './pages/BoardPage';
import { CardProvider } from './contexts/CardContext';

export function App() {
  return (
    <CardProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/inicio" replace />} />
          <Route path="inicio" element={<FoundationPage />} />
          <Route path="projetos" element={<IntegrationPage kind="projects" />} />
          <Route path="projetos/:projectId" element={<BoardPage />} />
          <Route path="usuarios" element={<IntegrationPage kind="users" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </CardProvider>
  );
}
