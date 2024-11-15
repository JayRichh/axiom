import { GunName } from '../../../config/guns'
import { Gun as GunType } from '../../../config/guns'
import { ModelGun } from './ModelGun'
import { SpriteGun } from './SpriteGun'

export function Gun(props: GunType) {
  // Render sprite-based gun for pistol, 3D model for SMG
  if (props.itemName === GunName.PISTOL) {
    return <SpriteGun {...props} />
  }
  
  return <ModelGun {...props} />
}
