// in ".releaserc.js" or "release.config.js"

// const { promisify } = require('util')
// const dateFormat = require('dateformat')
// const readFileAsync = promisify(require('fs').readFile)

// Given a `const` variable `TEMPLATE_DIR` which points to "<semantic-release-gitmoji>/lib/assets/templates"

// the *.hbs template and partials should be passed as strings of contents
// const template = readFileAsync(path.join(TEMPLATE_DIR, 'default-template.hbs'))
// const commitTemplate = readFileAsync(path.join(TEMPLATE_DIR, 'commit-template.hbs'))

module.exports = {
    plugins: [
      'semantic-release-gitmoji',
      '@semantic-release/github',
      '@semantic-release/npm',
      ["@semantic-release/changelog", {
        "changelogFile": "CHANGELOG.md",
      }],
      ["@semantic-release/git", {
        "assets": ["CHANGELOG.md", "package.json"],
        "message": ":bookmark: ${nextRelease.version}\n\n${nextRelease.notes}"
      }]
    ]
  }