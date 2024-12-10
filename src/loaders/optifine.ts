import axios from 'axios';
import fs from 'fs';
import path from 'path';

import type { ModLoader } from '../../mods';
import type { LaunchConfig } from '..';
import { InvalidVersionError } from '../errors';

export const id = 'optifine';

export const url = 'https://optifine.net/';

export async function downloadOptifine(
  optifineFilePath: string,
  loaderVersion: string
) {
  fs.mkdirSync(path.dirname(optifineFilePath), { recursive: true });

  const downloadLink = `https://optifine.net/download?f=${loaderVersion}`;

  const optifineResponse = await axios.get(downloadLink, {
    responseType: 'stream',
  });

  const writer = fs.createWriteStream(optifineFilePath);
  optifineResponse.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

/**
 * Returns all loader versions. Note that these might not be available for all game versions
 */
export async function listAllLoaderVersions(): Promise<string[]> {
  const response = await axios.get('https://optifine.net/downloads');
  const versions = response.data.match(/OptiFine_(\d+\.\d+\.\d+)_HD_U_\w+/g);
  return versions || [];
}

/**
 * Returns all loader versions that are available for a given game version.
 */
export async function listLoaderVersions(gameVersion: string) {
  const versions = await listAllLoaderVersions();
  return versions.filter((version) => version.includes(gameVersion));
}

/**
 * Downloads the latest version json and returns a partial MCLC config
 */
export async function getMCLCLaunchConfig(config: LaunchConfig) {
  if (!config.loaderVersion) {
    const [loaderVersion] = await listLoaderVersions(config.gameVersion);
    config.loaderVersion = loaderVersion;
  }

  if (!config.loaderVersion) {
    throw new InvalidVersionError(config.gameVersion);
  }

  const versionPath = path.join(
    config.rootPath,
    'versions',
    `optifine-${config.gameVersion}-${config.loaderVersion}`,
    'optifine.jar'
  );

  await downloadOptifine(versionPath, config.loaderVersion);

  return {
    root: config.rootPath,
    clientPackage: null as never,
    version: {
      number: config.gameVersion,
      type: 'release',
      custom: `optifine-${config.gameVersion}-${config.loaderVersion}`,
    },
    optifine: versionPath,
  };
}

/**
 * Returns all game versions a loader supports
 */
export async function listSupportedGameVersions() {
  const versions = await listAllLoaderVersions();
  const supportedVersions = new Set<string>();

  for (let i = 0; i < versions.length; i++) {
    const version = versions[i].split('_')[1];
    supportedVersions.add(version);
  }

  return Array.from(supportedVersions).map((v) => ({
    version: v,
    stable: true,
  }));
}

/**
 * The loader config for the 'tomate-mods' package
 */
export const tomateModsModLoader: ModLoader = {
  overrideMods: {},
  modrinthCategories: ['optifine'],
  curseforgeCategory: '7',
};
