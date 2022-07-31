/* eslint-disable import/no-extraneous-dependencies */
const jsonfile = require('jsonfile');
const { determineModuleTypes } = require('webpack-node-module-types/sync');

// Recursively get all dependencies (not dev, peer) for the current project
function getDependencies(packageJsonLock, packages, knownDependencies = new Set()) {
  if (!packages?.length) return [];

  packages.forEach((packageName) => {
    const dependencies = Object.keys(packageJsonLock.packages[`node_modules/${packageName}`].dependencies || {});

    knownDependencies.add(packageName);
    if (dependencies.length) {
      dependencies.forEach((dependency) => knownDependencies.add(dependency));

      getDependencies(packageJsonLock, dependencies, knownDependencies);
    }
  });

  return [...knownDependencies];
}

// Get a list of packages that are pure ESM and in the 'dependencies' list in package.json
module.exports = function getPureESMDependencies() {
  const packageJsonLock = jsonfile.readFileSync('./package-lock.json');
  const packageJson = jsonfile.readFileSync('./package.json');

  const esmModules = determineModuleTypes()?.esm;
  if (!esmModules?.length) return [];

  const allDependencies = getDependencies(packageJsonLock, Object.keys(packageJson.dependencies));

  return esmModules.filter((packageName) => allDependencies.includes(packageName));
};
