const TIME_REGEX = /^(?<hours>\d{1,2}):(?<minutes>\d{1,2})$/;

const parseHours = createRangeParser(24);
const parseMinutes = createRangeParser(60);

export function parseTime(str: string) {
	const match = str.match(TIME_REGEX);
	if (!match?.groups) return;
	const { hours, minutes } = match.groups;
	const parsedHours = parseHours(hours);
	const parsedMinutes = parseMinutes(minutes);
	if (Number.isNaN(parsedHours) || Number.isNaN(parsedMinutes)) {
		return;
	}
	return [parsedHours, parsedMinutes];
}

function createRangeParser(upperBound: number) {
	return (str: string) => {
		if (!str) {
			return NaN;
		}
		const n = parseInt(str, 10);
		if (n < 0 || n >= upperBound) {
			return NaN;
		}
		return n;
	};
}

const ONE_SECOND_MS = 1000;
const ONE_MINUTE_MS = 60 * ONE_SECOND_MS;
const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

export function getMsUntil(hours: number, minutes: number) {
	const now = new Date();
	const nowMs = timeToMs(
		now.getHours(),
		now.getMinutes(),
		now.getSeconds(),
		now.getMilliseconds(),
	);
	const timeDiff = timeToMs(hours, minutes) - nowMs;
	return timeDiff >= 0 ? timeDiff : timeDiff + ONE_DAY_MS;
}

function timeToMs(
	hours: number,
	minutes: number,
	seconds: number = 0,
	ms: number = 0,
) {
	return (
		hours * ONE_HOUR_MS + minutes * ONE_MINUTE_MS + seconds * ONE_SECOND_MS + ms
	);
}

export function resolveAfter(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
