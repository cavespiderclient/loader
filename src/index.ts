import type { ModLoader as TomateModsModLoader } from '../mods';
import type { ILauncherOptions } from 'core';

export type LaunchConfig = {
  rootPath: string;
  gameVersion: string;
  loaderVersion?: string;
};

export type ModLoader = {
  /**
   * Downloads the latest version json and returns a partial MCLC config
   */
  getMCLCLaunchConfig(config: LaunchConfig): Promise<Partial<ILauncherOptions>>;
  /**
   * Returns all game versions a loader supports
   */
  listSupportedGameVersions(): Promise<{ version: string; stable: boolean }[]>;
  /**
   * Returns all loader versions. Note that these might not be available for all game versions
   */
  listAllLoaderVersions(): Promise<string[]>;
  /**
   * Returns all loader versions that are available for a given game version.
   */
  listLoaderVersions(gameVersion: string): Promise<string[]>;
  /**
   * The loader config for the 'tomate-mods' package
   */
  tomateModsModLoader: TomateModsModLoader;
};

export type VanillaLoader = Omit<
  ModLoader,
  'tomateModsModLoader' | 'listLoaderVersions' | 'listAllLoaderVersions'
>;

export type LoaderId = 'quilt' | 'fabric' | 'forge' | 'neoforge' | 'vanilla';
export type ModdedLoaderId = 'quilt' | 'fabric' | 'forge';

export * as fabric from './loaders/fabric';
export * as quilt from './loaders/quilt';
export * as forge from './loaders/forge';
export * as neoforge from './loaders/neoforge';
export * as vanilla from './loaders/vanilla';

export { loader } from './loader';
export { liner } from './liner';
