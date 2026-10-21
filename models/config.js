export const canvas = document.getElementById("game");
export const ctx = canvas.getContext("2d");

export const topLimit = 200, bottomLimit = 400;
export const RELOAD_TIME = 300, HEAL_TIME = 120;
export const COLORS = { player: "cyan", enemy: "orange", ammo: "blue", heal: "green", bullet: "yellow" };
