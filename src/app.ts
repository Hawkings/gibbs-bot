import { Telegraf } from "telegraf";
import { parseShip } from "./ship";
import { parseTime } from "./time";
import { createGame, handleChange } from "./games";
import { CallbackQuery } from "telegraf/types";

const bot = new Telegraf(process.env.TOKEN!);

bot.command(/partida/i, async (ctx) => {
	const args = ctx.message.text.split(" ");
	if (args.length !== 3) {
		await ctx.reply(
			"Dime el barco y la hora, por ejemplo: `/partida balandro 15:30`",
			{ parse_mode: "MarkdownV2" },
		);
		return;
	}
	const errors = [];
	const ship = parseShip(args[1]);
	if (!ship) {
		errors.push(
			`No conozco el barco ${args[1]}. Solo conozco los barcos balandro, bergantín y galeón.`,
		);
	}
	const time = parseTime(args[2]);
	if (!time) {
		errors.push(
			`No sé qué hora es ${args[2]}. Escribe la hora en formato 24h, por ejemplo 17:45.`,
		);
	}
	if (errors.length) {
		await ctx.reply(errors.join("\n\n"));
		return;
	}
	const [hours, minutes] = time!;
	const { message, promise } = createGame(hours, minutes, ship!, ctx.chat.id);
	promise.then((message) => {
		if (message) {
			ctx.sendMessage(message, { parse_mode: "MarkdownV2" });
		}
	});
	await ctx.reply(...message);
});

bot.on("callback_query", async (ctx) => {
	const data = (ctx.callbackQuery as CallbackQuery.DataQuery).data;
	const { notification, updatedMessage } = handleChange(
		data,
		ctx.callbackQuery.from,
	);
	if (updatedMessage) {
		try {
			await ctx.editMessageText(...updatedMessage);
		} catch (e) {
			console.error(e);
		}
	}
	try {
		await ctx.answerCbQuery(notification);
	} catch (e) {
		console.error(e);
	}
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
