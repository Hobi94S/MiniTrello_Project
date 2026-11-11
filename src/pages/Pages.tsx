import { Link } from 'react-router-dom';

export function FoundationPage() {
  return <div className="overview">
    <header className="page-heading"><h1>Visão geral</h1></header>
    <section className="workspace-overview" aria-label="Workspace">
      <div className="workspace-links">
        <Link className="workspace-link" to="/projetos"><span className="link-index">01</span><h2>Projetos</h2><span className="link-arrow" aria-hidden="true">↗</span></Link>
        <Link className="workspace-link" to="/usuarios"><span className="link-index">02</span><h2>Usuários</h2><span className="link-arrow" aria-hidden="true">↗</span></Link>
      </div>
    </section>
  </div>;
}

const integrations = {
  projects: { title: 'Projetos' },
  users: { title: 'Usuários' },
  board: { title: 'Quadro do projeto' },
};

export function IntegrationPage({ kind }: { kind: keyof typeof integrations }) {
  return <div className="integration-page">
    <header className="page-heading"><h1>{integrations[kind].title}</h1></header>
    <div className="integration-content">
      <p>Em desenvolvimento.</p>
      <Link className="text-link" to="/inicio">Voltar à visão geral <span aria-hidden="true">←</span></Link>
    </div>
  </div>;
}

export function NotFoundPage() {
  return <section className="integration-content not-found"><p className="eyebrow">404</p><h1>Página não encontrada.</h1><Link className="text-link" to="/inicio">Voltar ao início <span aria-hidden="true">←</span></Link></section>;
}
