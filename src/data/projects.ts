
      /*#######.
     ########",#:
   #########',##".
  ##'##'## .##',##.
   ## ## ## # ##",#.
    ## ## ## ## ##'
     ## ## ## :##
      ## ## ##*/

export type Project = {
  default: any;
  metadata: {
    id: string;
    index: number;
    title: string;
    description?: string;
    subtitle?: string;
    text?: string;
    picture?: string;
    youtube?: string;
    github?: string;
    npm?: string;
  };
};

const PROJECTS = import.meta.glob<true, string, Project>(`./projects/*.md`, {
  eager: true
});

function idFromPath(path: string) {
  return path.replace(/^\.\/projects\//, '').replace(/\.md$/, '');
}

const PROJECTS_LIST = Object.entries(PROJECTS)
  .map(([path, project]) => ({
    ...project,
    metadata: { ...project.metadata, id: idFromPath(path) }
  }))
  .sort((a, b) => (a.metadata.index < b.metadata.index ? 1 : -1));

export function loadProjects(): Project[] {
  return PROJECTS_LIST;
}

export function loadProject(id: string): Project | undefined {
  return PROJECTS_LIST.find(project => project.metadata.id === id);
}
