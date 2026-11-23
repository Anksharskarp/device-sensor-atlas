import { navigation, project } from './config.mjs';

export function page({ title, description = project.description, root = './', current, body, scripts = [], styles = [] }) {
  const link = ([label, path]) => {
    const url = path.startsWith('https://') ? path : root + path;
    const selected = current === label ? ' aria-current="page"' : '';
    return `<a href="${url}"${selected}>${label}</a>`;
  };
  const brand = `<a class="brand" href="${root}"><img src="${root}assets/mark.svg" alt="" width="31" height="31">${project.name}</a>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title === project.name ? title : title + ' | ' + project.name}</title>
<meta name="description" content="${description}">
<link rel="icon" href="${root}assets/mark.svg" type="image/svg+xml">
<link rel="stylesheet" href="${root}assets/palette.css"><link rel="stylesheet" href="${root}assets/tokens.css"><link rel="stylesheet" href="${root}assets/site.css">
${styles.map(file => `<link rel="stylesheet" href="${root}assets/${file}">`).join('')}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="top"><div class="bar">${brand}<nav aria-label="Main">${navigation.map(link).join('')}</nav><a class="repository" href="${project.repository}">GitHub</a></div></header>
<main id="main" class="frame">${body}</main>
<footer><div class="bar">${brand}<span>© ${project.author}</span></div></footer>
${scripts.map(script => `<script type="module" src="${root}assets/${script}"></script>`).join('')}
</body></html>\n`;
}
