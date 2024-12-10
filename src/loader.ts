import {
  fabric,
  forge,
  LoaderId,
  ModLoader,
  neoforge,
  optifine,
  vanilla,
  VanillaLoader,
} from './';

type Loader<Id extends LoaderId> = {
  vanilla: typeof vanilla;
  fabric: typeof fabric;
  forge: typeof forge;
  neoforge: typeof neoforge;
  optifine: typeof optifine;
}[Id];

export function loader<Id extends LoaderId>(id: Id): Loader<Id> {
  if (id === 'fabric') return fabric satisfies ModLoader as never;
  if (id === 'forge') return forge satisfies ModLoader as never;
  if (id === 'neoforge') return neoforge satisfies ModLoader as never;
  if (id === 'vanilla') return vanilla satisfies VanillaLoader as never;
  if (id === 'optifine') return optifine satisfies ModLoader as never;

  throw new Error(`Loader "${id}" could not be found`);
}
