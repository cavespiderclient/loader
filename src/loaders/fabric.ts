import axios, { AxiosError } from 'axios';
import fs from 'fs';
import path from 'path';

import type { ModLoader } from 'mods';
import type { LaunchConfig } from '..';
import { InvalidVersionError } from '../errors';

export const id = 'fabric';

const api = axios.create({
  baseURL: 'https://meta.fabricmc.net/v2',
});

export const url = 'https://fabricmc.net/';

export type LoaderVersion = {
  separator: string;
  build: number;
  maven: string;
  version: string;
  stable: boolean;
};

export async function listLoaders() {
  const loaders = await api.get<LoaderVersion[]>('/versions/loader');

  if (loaders.data.length <= 0)
    throw new Error(
      'Error while fetching fabric metadata; Loader length is zero'
    );

  return loaders.data;
}

/**
 * Returns all loader versions.
 */
export async function listAllLoaderVersions() {
  const loaders = await listLoaders();
  return loaders.map((loader) => loader.version);
}

/**
 * Returns all loader versions that are available for a given game version.
 * This returns the same as listAllLoaderVersions on fabric
 */
export async function listLoaderVersions(_gameVersion: string) {
  return listAllLoaderVersions();
}

export async function getProfile(gameVersion: string, loaderVersion: string) {
  try {
    const profile = await api.get(
      `/versions/loader/${gameVersion}/${loaderVersion}/profile/json`
    );
    return profile.data;
  } catch (e) {
    if (e instanceof AxiosError) {
      if (e.response?.status === 400) {
        throw new Error(`Version "${gameVersion}" could not be found`);
      }
    }
    throw e;
  }
}

/**
 * Downloads the latest version json and returns a partial MCLC config
 */
export async function getMCLCLaunchConfig(config: LaunchConfig) {
  if (!config.loaderVersion) {
    const [loader] = await listLoaders();
    config.loaderVersion = loader.version;
  }

  if (!config.loaderVersion) {
    throw new InvalidVersionError(config.gameVersion);
  }

  const profile = await getProfile(config.gameVersion, config.loaderVersion);

  const versionPath = path.join(
    config.rootPath,
    'versions',
    `fabric-${config.gameVersion}-${config.loaderVersion}`,
    `fabric-${config.gameVersion}-${config.loaderVersion}.json`
  );

  fs.mkdirSync(path.dirname(versionPath), { recursive: true });
  fs.writeFileSync(versionPath, JSON.stringify(profile));

  return {
    root: config.rootPath,
    version: {
      number: config.gameVersion,
      type: 'release',
      custom: `fabric-${config.gameVersion}-${config.loaderVersion}`,
    },
  };
}

/**
 * Returns all game versions a loader supports
 */
export async function listSupportedGameVersions() {
  return (
    await api.get<{ version: string; stable: boolean }[]>('/versions/game')
  ).data;
}

/**
 * The loader config for the 'tomate-mods' package
 */
export const tomateModsModLoader: ModLoader = {
  overrideMods: {},
  modrinthCategories: ['fabric'],
  curseforgeCategory: '4',
};
