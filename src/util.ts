// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function assumeExhaustive(_: never) {}

const RANDOM_ID_LENGTH = 6;

export function generateRandomId() {
	let result = "";
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < RANDOM_ID_LENGTH; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
}
