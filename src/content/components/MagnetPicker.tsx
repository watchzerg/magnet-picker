import React from 'react';
import { MagnetInfo } from '../../types/magnet';
import { createFloatingButton, isValidPage, showToast } from '../utils/dom';
import { useMagnetParser } from '../hooks/useMagnetParser';
import { usePanelState } from '../hooks/usePanelState';
import { useStorageListener } from '../hooks/useStorageListener';
import { MagnetService } from '../services/MagnetService';
import { selectMagnetsByScore } from '../../utils/magnet';

export class MagnetPicker {
  private button: HTMLButtonElement | null = null;
  private currentMagnets: MagnetInfo[] = [];
  private magnetParser = useMagnetParser();
  private panelState = usePanelState();
  private removeStorageListener: (() => void) | null = null;

  constructor() {
    console.log('MagnetPicker: 初始化');
    this.init();
  }

  private async init(): Promise<void> {
    if (isValidPage()) {
      console.log('MagnetPicker: 有效页面，创建按钮');
      await this.panelState.pageStateManager.init();
      this.createFloatingButton();
      this.initStorageListener();
    } else {
      console.log('MagnetPicker: 无效页面，URL:', window.location.href);
    }
  }

  private createFloatingButton(): void {
    this.button = createFloatingButton();
    this.button.addEventListener('click', () => {
      console.log('MagnetPicker: 按钮被点击');
      this.parseMagnets();
    });
    document.body.appendChild(this.button);
    console.log('MagnetPicker: 浮动按钮已创建');
  }

  private initStorageListener(): void {
    this.removeStorageListener = useStorageListener(
      this.currentMagnets,
      true,
      (savedStates) => {
        // 更新面板状态
        this.panelState.showPanel(this.currentMagnets);
      }
    );
  }

  private async parseMagnets(): Promise<void> {
    console.log('MagnetPicker: 开始解析磁力链接');

    try {
      const magnets = await this.magnetParser.findMagnets();
      console.log('MagnetPicker: 找到磁力链接:', magnets.length);

      if (magnets.length > 0) {
        this.currentMagnets = magnets;
        await this.panelState.showPanel(magnets);

        if (!this.panelState.pageStateManager.hasDefaultSaved()) {
          console.log('MagnetPicker: 本session首次打开，执行默认保存');
          const magnetsToSave = selectMagnetsByScore(magnets);
          
          const success = await MagnetService.saveMagnets(magnetsToSave);
          if (success) {
            await this.panelState.pageStateManager.setDefaultSaved();
            await this.panelState.showPanel(magnets);
          }
        } else {
          const allUnsaved = await this.panelState.pageStateManager.areAllMagnetsUnsaved(magnets);
          if (allUnsaved) {
            console.log('MagnetPicker: 所有磁力链接都未保存，执行默认保存');
            const magnetsToSave = selectMagnetsByScore(magnets);
            
            const success = await MagnetService.saveMagnets(magnetsToSave);
            if (success) {
              await this.panelState.showPanel(magnets);
            }
          } else {
            console.log('MagnetPicker: 已有磁力链接处于保存状态，无需执行默认保存');
          }
        }
      } else {
        console.log('MagnetPicker: 未找到磁力链接');
        showToast('未找到磁力链接，请确保页面已完全加载', 'error');
      }
    } catch (error) {
      console.error('MagnetPicker: 解析出错:', error);
      showToast('解析出错，请重试', 'error');
    }
  }

  public destroy() {
    console.log('MagnetPicker: 销毁实例');
    if (this.removeStorageListener) {
      this.removeStorageListener();
      this.removeStorageListener = null;
    }
    this.panelState.destroy();
    if (this.button) {
      this.button.remove();
      this.button = null;
    }
  }
} 