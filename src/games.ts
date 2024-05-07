import { User } from "telegraf/types";
import { Ship, getMaxPlayers } from "./ship";
import { getMsUntil, resolveAfter } from "./time";
import { assumeExhaustive, generateRandomId } from "./util";

interface Player {
	id: number;
	displayName: string;
}

interface Game {
	id: string;
	time: string;
	ship: Ship;
	players: Player[];
	chatId: number;
}

export enum PlayerChange {
	JOIN = "join",
	LEAVE = "leave",
}

function isPlayerChange(str: string): str is PlayerChange {
	return str === PlayerChange.JOIN || str === PlayerChange.LEAVE;
}

const CACHE = new Map<string, Game>();

export function createGame(
	hours: number,
	minutes: number,
	ship: Ship,
	chatId: number,
) {
	const msUntilGame = getMsUntil(hours, minutes);
	const time = `${hours}:${minutes}`;
	let id: string;
	do {
		id = `${generateRandomId()}:${chatId}`;
	} while (CACHE.has(id));
	const game = { id, time, ship, players: [], chatId };
	CACHE.set(id, game);
	return {
		message: formatGameMessage(game),
		promise: resolveAfter(msUntilGame).then(() => {
			const players = CACHE.get(id)?.players;
			if (players) {
				return `¡Izad las velas, grumetes\\!\n\n${players
					.slice(0, getMaxPlayers(ship))
					.map((p) => `[${p.displayName}](tg://user?id=${p.id})`)
					.join("\n")}`;
			}
		}),
	};
}

export function handleChange(
	data: string,
	user: User,
): {
	notification?: string;
	updatedMessage?: FormattedGameMessage;
} {
	const splittedData = data.split(";");
	const [change, id] = splittedData;
	if (!CACHE.has(id) || !isPlayerChange(change)) {
		return {
			notification:
				"Hay un problema con esta partida, tendrás que crear una nueva",
		};
	}
	const game = CACHE.get(id)!;
	const i = game.players.findIndex((player) => player.id == user.id);
	switch (change) {
		case PlayerChange.JOIN:
			if (i >= 0) {
				return { notification: "Ya estás en la partida" };
			} else {
				game.players.push({
					id: user.id,
					displayName: getUserDisplayName(user),
				});
				break;
			}
		case PlayerChange.LEAVE:
			if (i >= 0) {
				game.players.splice(i, 1);
				break;
			} else {
				return { notification: "No estabas en la partida" };
			}
		default:
			assumeExhaustive(change);
	}
	return { updatedMessage: formatGameMessage(game) };
}

type FormattedGameMessage = [
	string,
	{
		reply_markup: {
			inline_keyboard: Array<
				Array<{
					text: string;
					callback_data: string;
				}>
			>;
		};
	},
];

function formatGameMessage({
	id,
	time,
	ship,
	players,
}: Pick<Game, "time" | "ship" | "players" | "id">): FormattedGameMessage {
	const maxPlayers = getMaxPlayers(ship);
	let playersString = "";
	if (players.length) {
		playersString = "\n\nParticipan:\n";
		playersString += players
			.slice(0, maxPlayers)
			.map((p) => p.displayName)
			.join("\n");
		if (players.length > maxPlayers) {
			playersString += "\n\nEn lista de espera:\n";
			playersString += players
				.slice(maxPlayers)
				.map((p) => p.displayName)
				.join("\n");
		}
	}
	return [
		`Partida a las ${time} en un ${ship} (${maxPlayers} jugadores).${playersString}`,
		{
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: "Unirme",
							callback_data: `${PlayerChange.JOIN};${id}`,
						},
						{
							text: "Salir",
							callback_data: `${PlayerChange.LEAVE};${id}`,
						},
					],
				],
			},
		},
	];
}

function getUserDisplayName(user: User): string {
	if (user.first_name) {
		if (user.last_name) {
			return `${user.first_name} ${user.last_name}`;
		} else {
			return user.first_name;
		}
	} else {
		return user.username!;
	}
}
