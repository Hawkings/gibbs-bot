export enum Ship {
	BALANDRO = "balandro",
	BERGANTIN = "bergantín",
	GALEON = "galeón",
}

const matchers = new Map<Ship, RegExp>([
	[Ship.BALANDRO, /balandro/i],
	[Ship.BERGANTIN, /bergant[ií]n/i],
	[Ship.GALEON, /gale[oó]n/i],
]);

const MAX_PLAYERS_PER_SHIP = {
	[Ship.BALANDRO]: 2,
	[Ship.BERGANTIN]: 3,
	[Ship.GALEON]: 4,
};

export function parseShip(str: string): Ship | undefined {
	for (const [ship, regex] of matchers.entries()) {
		if (str.match(regex)) {
			return ship;
		}
	}
}

export function getMaxPlayers(ship: Ship) {
	return MAX_PLAYERS_PER_SHIP[ship];
}
