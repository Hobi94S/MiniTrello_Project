import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return <section className="integration-content not-found"><p className="eyebrow">404</p><h1>Página não encontrada.</h1><Link className="text-link" to="/inicio">Voltar ao início <span aria-hidden="true">←</span></Link></section>;
}
