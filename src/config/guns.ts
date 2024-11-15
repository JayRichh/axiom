import { EquipmentType } from '../constants'
import { defaultAcog, defaultReflex, GunOptic, GunOptics } from './gunAttachments'

export enum GunName {
  NONE = 'NONE',
  PISTOL = 'PISTOL',
  SMG = 'SMG'
}

export type Gun = {
  type: EquipmentType.GUN,
  itemName: GunName,
  roundsLeft: number,
  roundsPerMag: number,
  ammo: number,
  ammoMax: number,
  
  optic: GunOptic | null
  attachments: {
    optics: GunOptics
  }
} 

export type None = { 
  type: EquipmentType.NONE,
  itemName: GunName.NONE 
};

export type EquipmentItem = None | Gun;

export const defaultPistol: Gun = {
  type: EquipmentType.GUN,
  itemName: GunName.PISTOL,
  
  roundsPerMag: 12,
  roundsLeft: 12,
  ammo: 12 * 4,
  ammoMax: 12 * 4,

  optic: null,
  attachments: {
    optics: {
      [GunOptic.REFLEX]: defaultReflex,
      [GunOptic.ACOG]: defaultAcog
    }
  }
}

export const defaultSmg: Gun = {
  type: EquipmentType.GUN,
  itemName: GunName.SMG,
  
  roundsPerMag: 25,
  roundsLeft: 25,
  ammo: 25 * 4,
  ammoMax: 25 * 4,

  optic: null,
  attachments: {
    optics: {
      [GunOptic.REFLEX]: defaultReflex,
      [GunOptic.ACOG]: defaultAcog
    }
  }
}
