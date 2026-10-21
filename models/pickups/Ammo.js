import { Pickup } from './Pickup.js'
import { COLORS } from '../config.js'

export class Ammo extends Pickup { constructor(x, y) { super(x, y, COLORS.ammo); } }
