import { Project } from 'projen';

export const addDefaultGitIgnore = (project: Project): void => {
  project.addGitIgnore('*.egg-info');
  project.addGitIgnore('*.pyc');
  project.addGitIgnore('.pytest*');
  project.addGitIgnore('.venv');
  project.addGitIgnore('build');
  project.addGitIgnore('__pycache__');
  project.addGitIgnore('.coverage');
  project.addGitIgnore('.cache');
  project.addGitIgnore('.ipynb_checkpoints');
  project.addGitIgnore('.ruff_cache');
  project.addGitIgnore('.mypy_cache');
  project.addGitIgnore('.audit_cache');
};
