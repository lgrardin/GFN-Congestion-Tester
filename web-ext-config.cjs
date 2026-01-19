module.exports = {
  ignoreFiles: [
    'package.json',
    'package-lock.json',
    'web-ext-config.cjs',
    'web-ext-config.js',
    'node_modules',
    'web-ext-artifacts',
    '.git',
    '.gitignore',
    '.DS_Store'
  ],
  build: {
    overwriteDest: true
  }
};
