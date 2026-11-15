
export interface Project {  //define os dados de um projeto
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export const PROJECTS_KEY = 'projects'; //define onde os projetos ficam no estado global

function newId() {  //gera um identificador unico 
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function readProjects(value: unknown): Project[] {  //valida os projetos armazenados
  if (!Array.isArray(value)) return [];

  return value.filter(
    (p): p is Project =>
      typeof p === 'object' &&
      p !== null &&
      typeof p.id === 'string' &&
      typeof p.name === 'string' &&
      typeof p.description === 'string' &&
      typeof p.createdAt === 'string',
  );
}

export function addProject( //cadastra um projeto
  all: Project[],
  name: string,
  description: string,
): Project[] {
  const cleanName = name.trim();
  const cleanDescription = description.trim();

  if (!cleanName) return all;

  return [
    ...all,
    {
      id: newId(),
      name: cleanName,
      description: cleanDescription,
      createdAt: new Date().toISOString(),
    },
  ];
}

export function updateProject( //edita um projeto
  all: Project[],
  id: string,
  name: string,
  description: string,
): Project[] {
  const cleanName = name.trim();

  if (!cleanName) return all;

  return all.map((project) =>
    project.id === id
      ? {
          ...project,
          name: cleanName,
          description: description.trim(),
        }
      : project
  );
}

export function removeProject( //exclui um projeto 
  all: Project[],
  id: string,
): Project[] {
  return all.filter((project) => project.id !== id);
}
