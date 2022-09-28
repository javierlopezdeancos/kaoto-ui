// @ts-ignore
import svg from '../assets/images/kaoto.svg';
import { ISettings } from '@kaoto/types';
import create from 'zustand';

interface ISettingsStore {
  settings: ISettings;
  setName: (val: string) => void;
  setSettings: (vals?: Partial<ISettings>) => void;
}

const initialSettings: ISettings = {
  description: '',
  dsl: 'KameletBinding',
  icon: svg,
  name: 'integration',
  namespace: 'default',
};

export const useSettingsStore = create<ISettingsStore>((set) => ({
  settings: initialSettings,
  setName: (val?: string) => set((state) => ({ ...state, name: val })),
  setSettings: (vals?: Partial<ISettings>) =>
    set((state) => ({
      settings: { ...state.settings, ...vals },
    })),
}));

export default useSettingsStore;
