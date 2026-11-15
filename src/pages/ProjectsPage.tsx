
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import {
  PROJECTS_KEY,
  addProject,
  readProjects,
  updateProject,
} from '../types/projects';

export function ProjectsPage() {
  const { state, dispatch } = useApp();
  const projects = readProjects(state.data[PROJECTS_KEY]);

  const [name, setName] = useState(''); //controla os campos do formul[ário]
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  function saveProjects(next: typeof projects) {
    dispatch({
      type: 'SET_SLICE',
      key: PROJECTS_KEY,
      value: next,
    });
  }

  function handleSubmit(e: FormEvent) { //cria ou atualiza projetos
    e.preventDefault();

    if (!name.trim()) return;

    if (editingId) {
      saveProjects(updateProject(projects, editingId, name, description));
      setEditingId(null);
    } else {
      saveProjects(addProject(projects, name, description));
    }

    setName('');
    setDescription('');
  }

  function handleEdit(project: typeof projects[number]) { //carrega os dados para edição
    setName(project.name);
    setDescription(project.description);
    setEditingId(project.id);
  }

  function handleDelete(id: string) { //exlcui projetos
    if (window.confirm('Excluir este projeto e todos os seus quadros, cartões e comentários?')) {
      dispatch({ type: 'DELETE_PROJECT', projectId: id });
      if (editingId === id) { setEditingId(null); setName(''); setDescription(''); }
    }
  }

  return (
    <div className="integration-page">
      <header className="page-heading">
        <h1>Meus projetos</h1>
        <p>Organize e acompanhe seus projetos.</p>
      </header>

      <form onSubmit={handleSubmit} className="project-form">
        <h2>{editingId ? 'Editar projeto' : 'Novo projeto'}</h2>

        <label>Nome do projeto
        <input
          aria-label="Nome do projeto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do projeto"
          maxLength={60}
          required
        /></label>

        <label>Descrição do projeto
        <textarea
          aria-label="Descrição do projeto"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição do projeto"
          maxLength={300}
        /></label>

        <button type="submit">
          {editingId ? 'Salvar alterações' : 'Criar projeto'}
        </button>

        {editingId && (
          <button type="button" onClick={() => {
            setEditingId(null);
            setName('');
            setDescription('');
          }}>
            Cancelar edição
          </button>
        )}
      </form>

      <section className="project-list">
        <h2>Projetos cadastrados ({projects.length})</h2>

        {projects.length === 0 && <p>Nenhum projeto cadastrado.</p>}

        {projects.map((project) => (
          <article key={project.id} className="project-card">
            <h3>{project.name}</h3>
            <p>{project.description || 'Sem descrição.'}</p>

            <Link to={`/projetos/${project.id}`}> 
              Abrir quadro →
            </Link> 

            <button onClick={() => handleEdit(project)}>
              Editar
            </button>

            <button onClick={() => handleDelete(project.id)}>
              Excluir
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
