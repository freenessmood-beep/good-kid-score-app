/** @type {import('next').NextConfig} */

// Served by GitHub Pages at https://<user>.github.io/<repo>/, so every asset and
// link needs the repo name prefixed. Override REPO_NAME if the repo is renamed.
const repoName = process.env.REPO_NAME || 'good-kid-score-app'
const isPages = process.env.GITHUB_PAGES === 'true'

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // Pages has no image optimiser.
  images: { unoptimized: true },
  ...(isPages ? { basePath: '/' + repoName, assetPrefix: '/' + repoName + '/' } : {}),
  env: {
    // Not a secret: it only names the repo. The token is never built in.
    NEXT_PUBLIC_GITHUB_DATA_REPO:
      process.env.NEXT_PUBLIC_GITHUB_DATA_REPO || 'freenessmood-beep/good-kid-score-data',
  },
}

module.exports = nextConfig
