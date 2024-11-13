import { GunOptic } from './config/gunAttachments'

export type GunData = typeof WEAPONS_DATA.SMG;

export const WEAPONS_DATA = {
  'NONE': {
    equipTime: 0,
    unequipTime: 0
  },
  'SMG':  {
    damage: 10,
    rateOfFire: 95,
    magCapacity: 2500,
    weight: 1,

    equipTime: 500,
    unequipTime: 500,

    // Adjusted recoil values for 3D models
    recoilXMin: -0.00045,
    recoilXMax: 0.00045,
    recoilYMin: 0.00085,
    recoilYMax: 0.00105,

    // Adjusted kick values for 3D models
    kickXMin: 0.0012,
    kickXMax: 0.0022,
    kickYMin: 0.0018,
    kickYMax: 0.0035,

    // Adjusted knockback for 3D models
    knockbackMin: 0.018,
    knockbackMax: 0.028,
    spread: 0.045, // Reduced spread for better accuracy with 3D models

    renderParams: {
      body: 'guns/smg/blasterA.glb',
      zoom: 3,
      
      ironsight: {
        stock: {
          model: 'guns/smg/blasterA.glb',
          offsetY: -0.015 // Adjusted for 3D model
        },
        optic: {
          model: 'guns/smg/scopeA.glb',
          offsetY: -0.045 // Adjusted for 3D model
        }
      },
      optics: {
        reflex: {
          model: 'guns/smg/scopeA.glb',
          glass: 'guns/crosshairs_tilesheet_black.png',
          zoom: 4,
          reticleScale: 0.055 // Adjusted for better visibility
        },
        acog: {
          model: 'guns/smg/scopeB.glb',
          glass: 'guns/crosshairs_tilesheet_black.png',
          zoom: 4,
          reticleScale: 0.055 // Adjusted for better visibility
        }
      }
    },
  },
}

export const SMG_PARAMS = WEAPONS_DATA.SMG.renderParams;

type OpticParams = {
  model: string
  glass: string
  zoom: number
  reticleScale: number
};

export const SMG_OPTIC_PARAMS: { [key in GunOptic]: OpticParams } = {
  [GunOptic.REFLEX]: SMG_PARAMS.optics.reflex,
  [GunOptic.ACOG]: SMG_PARAMS.optics.acog
}
