
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { CardProvider } from './contexts/CardContext';
import { CardDetailsProvider } from './contexts/CardDetailsContext';
import { FoundationPage, IntegrationPage, NotFoundPage } from './pages/Pages';
import { BoardPage } from './pages/BoardPage';
import { ProjectsPage } from './pages/ProjectsPage';

export function App() {
  return (
    <CardDetailsProvider>
      <CardProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/inicio" replace />} />
            <Route path="inicio" element={<FoundationPage />} />
            <Route path="projetos" element={<ProjectsPage />} />
            <Route path="projetos/:projectId" element={<BoardPage />} />
            <Route path="usuarios" element={<IntegrationPage kind="users" />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </CardProvider>
    </CardDetailsProvider>
  );
}
