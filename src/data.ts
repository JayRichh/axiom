import { GunOptic } from './config/gunAttachments'

export type GunData = typeof WEAPONS_DATA.SMG;

export const WEAPONS_DATA = {
  'NONE': {
    equipTime: 0,
    unequipTime: 0
  },
  'PISTOL': {
    damage: 15,
    rateOfFire: 60,
    magCapacity: 12,
    weight: 0.8,

    equipTime: 300,
    unequipTime: 300,

    // Increased recoil values for better sprite animation
    recoilXMin: -0.0015,
    recoilXMax: 0.0015,
    recoilYMin: 0.002,
    recoilYMax: 0.003,

    // Increased kick values for better sprite animation
    kickXMin: 0.003,
    kickXMax: 0.005,
    kickYMin: 0.004,
    kickYMax: 0.006,

    // Increased knockback for better frame cycling
    knockbackMin: 0.15,
    knockbackMax: 0.25,
    spread: 0.035,

    renderParams: {
      spriteSheet: 'guns/pistol/RightAndLeftSpriteShoot.png',
      zoom: 2,
      frames: 4, // Using only top 4 frames for recoil
      frameWidth: 109,  // Width of each frame in the sprite sheet
      frameHeight: 110, // Height of each frame in the sprite sheet
      
      ironsight: {
        zoom: 2.5
      }
    },
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
export const PISTOL_PARAMS = WEAPONS_DATA.PISTOL.renderParams;

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
