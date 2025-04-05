import { MagnetInfo } from '../../types/magnet';

export async function saveMagnets(magnets: MagnetInfo[]): Promise<void> {
  try {
    const { magnets: existingMagnets = {} } = await chrome.storage.local.get('magnets');
    
    // 创建Map并初始化现有数据
    const existingMap = new Map<string, MagnetInfo>();
    
    // 处理现有数据，确保是Map格式
    if (Array.isArray(existingMagnets)) {
      existingMagnets.forEach(magnet => {
        if (magnet && magnet.magnet_hash) {
          existingMap.set(magnet.magnet_hash, magnet);
        }
      });
    } else {
      Object.entries(existingMagnets).forEach(([hash, magnet]) => {
        if (magnet && hash) {
          existingMap.set(hash, magnet as MagnetInfo);
        }
      });
    }
    
    // 过滤出不存在的磁力链接
    const newMagnets = magnets.filter(magnet => !existingMap.has(magnet.magnet_hash));
    
    if (newMagnets.length === 0) {
      console.log('Background: 所有磁力链接已存在，无需保存');
      return;
    }

    // 将新的磁力链接添加到Map中
    newMagnets.forEach(magnet => {
      existingMap.set(magnet.magnet_hash, magnet);
    });
    
    // 将Map转换回对象格式
    const updatedMagnets = Object.fromEntries(existingMap);
    
    await chrome.storage.local.set({ magnets: updatedMagnets });
    console.log(`Background: 保存完成，新增${newMagnets.length}个，总数:`, Object.keys(updatedMagnets).length);
  } catch (error) {
    console.error('Background: 保存出错:', error);
    throw error;
  }
}

export async function getMagnets(): Promise<MagnetInfo[]> {
  try {
    const { magnets = {} } = await chrome.storage.local.get('magnets');
    
    // 确保返回的是数组
    if (Array.isArray(magnets)) {
      return magnets;
    } else {
      return Object.values(magnets);
    }
  } catch (error) {
    console.error('Background: 获取出错:', error);
    return [];
  }
}

export async function removeMagnet(hash: string): Promise<void> {
  try {
    const { magnets: existingMagnets = {} } = await chrome.storage.local.get('magnets');
    
    // 如果磁力链接不存在
    if (!existingMagnets[hash]) {
      console.log('Background: 未找到要删除的磁力链接');
      return;
    }
    
    // 删除指定的磁力链接
    const { [hash]: removed, ...updatedMagnets } = existingMagnets;
    
    await chrome.storage.local.set({ magnets: updatedMagnets });
    console.log('Background: 删除完成，剩余:', Object.keys(updatedMagnets).length);
  } catch (error) {
    console.error('Background: 删除出错:', error);
    throw error;
  }
} 