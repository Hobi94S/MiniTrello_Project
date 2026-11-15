import { useApp } from '../contexts/AppContext';
import { readCurrentUser } from '../types/details';

const MOCK_USERS = [
  { id: 'usuario-1', name: 'Usuário 1' },
  { id: 'usuario-2', name: 'Usuário 2' },
  { id: 'usuario-3', name: 'Usuário 3' },
];

export function UsersPage() {
  const { state, dispatch } = useApp();
  const current = readCurrentUser(state.data);
  function selectUser(userId: string) {
    const saved = Array.isArray(state.data.users) ? state.data.users : [];
    const users = [...saved];
    for (const user of MOCK_USERS) {
      if (!users.some((item) => item && typeof item === 'object' && item.id === user.id)) users.push(user);
    }
    dispatch({ type: 'SET_SLICE', key: 'users', value: users });
    dispatch({ type: 'SET_SLICE', key: 'session', value: { userId } });
  }
  return <section className="integration-page">
    <header className="page-heading"><h1>Usuários</h1><p>Selecione um usuário para entrar ou alternar a sessão simulada.</p></header>
    <p role="status">Sessão atual: {current.name}</p>
    <div className="user-list">{MOCK_USERS.map((user) => <article className="project-card" key={user.id}>
      <h2>{user.name}</h2>
      <button className="form-save-button" onClick={() => selectUser(user.id)} disabled={current.id === user.id}>
        {current.id === user.id ? 'Selecionado' : 'Entrar como este usuário'}
      </button>
    </article>)}</div>
    {current.id !== 'anonimo' && <button className="form-cancel-button session-exit" onClick={() => dispatch({ type: 'REMOVE_SLICE', key: 'session' })}>Sair da sessão</button>}
  </section>;
}
