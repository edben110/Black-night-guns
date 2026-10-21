import { Pickup } from './Pickup.js'
import { COLORS } from '../config.js'

export class Heal extends Pickup { constructor(x, y) { super(x, y, COLORS.heal); } }
