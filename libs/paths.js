import dotenv from 'dotenv';

dotenv.config();

// Resolve environment variables into path constants.
export const srcFolder = process.env.SRC_FOLDER || 'src';
export const javaFolder = process.env.JAVA_FOLDER || 'java';
export const buildFolder = process.env.BUILD_FOLDER || 'build';
export const templatesFolder = process.env.TEMPLATES_FOLDER || 'templates';
export const projectsFile = process.env.PROJECTS_FILE || 'projects.json';