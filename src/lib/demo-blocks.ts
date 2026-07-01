/** Demo entries shown when the database has no rows yet */

type DemoWork = {
  id: string;
  label: string;
  externalUrl: string;
  spawnOrder: number;
};

type DemoProject = {
  id: string;
  label: string;
  githubUrl: string | null;
  huggingfaceUrl: string | null;
  spawnOrder: number;
};

export const DEMO_WORKS_RAW: DemoWork[] = [
  {
    id: 'demo-website-1',
    label: 'Kunchit Pujari',
    externalUrl: 'https://kunchitpujari.com',
    spawnOrder: 1,
  },
  {
    id: 'demo-website-2',
    label: 'Interactive Lab',
    externalUrl: 'https://example.com',
    spawnOrder: 2,
  },
];

export const DEMO_PROJECTS_RAW: DemoProject[] = [
  {
    id: 'demo-project-1',
    label: 'Vision Classifier',
    githubUrl: 'https://github.com',
    huggingfaceUrl: 'https://huggingface.co',
    spawnOrder: 1,
  },
  {
    id: 'demo-project-2',
    label: 'WebOS Dashboard',
    githubUrl: 'https://github.com',
    huggingfaceUrl: null,
    spawnOrder: 2,
  },
];
