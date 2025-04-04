import { MagnetInfo } from '../types/magnet';

export const getMagnets = async (): Promise<MagnetInfo[]> => {
  const { magnets = [] } = await chrome.storage.local.get('magnets');
  return magnets;
};

export const saveMagnet = async (magnet: MagnetInfo): Promise<void> => {
  const magnets = await getMagnets();
  const existingIndex = magnets.findIndex((m: MagnetInfo) => m.magnet_hash === magnet.magnet_hash);
  
  if (existingIndex !== -1) {
    magnets[existingIndex] = magnet;
  } else {
    magnets.push(magnet);
  }

  await chrome.storage.local.set({ magnets });
};

export const deleteMagnet = async (hash: string): Promise<void> => {
  const magnets = await getMagnets();
  const updatedMagnets = magnets.filter((magnet: MagnetInfo) => magnet.magnet_hash !== hash);
  await chrome.storage.local.set({ magnets: updatedMagnets });
}; 