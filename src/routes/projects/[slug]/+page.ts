import { error } from '@sveltejs/kit';
import { loadProject } from '../../../data/projects';
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {

  const project = loadProject(params.slug);

  if (!project) throw error(404, 'Not found');

  return {
    props: {
      project: await project
    }
  };
}) satisfies PageLoad;
