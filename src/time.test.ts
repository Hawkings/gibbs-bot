import { getMsUntil, parseTime } from "./time";

describe("getMsUntil", () => {
	beforeEach(() => {
		jest.useFakeTimers().setSystemTime(new Date(2024, 4, 3, 13, 20, 12, 345));
	});

	it("greater hours, greater minutes", () => {
		expect(getMsUntil(14, 21)).toBe(3647655);
	});

	it("less hours, less minutes", () => {
		expect(getMsUntil(12, 19)).toBe(82727655);
	});

	it("greater hours, less minutes", () => {
		expect(getMsUntil(14, 10)).toBe(2987655);
	});

	it("less hours, greater minutes", () => {
		expect(getMsUntil(5, 44)).toBe(59027655);
	});
});

describe("validateTime", () => {
	it("valid time", () => {
		expect(parseTime("23:59")).toEqual([23, 59]);
	});

	it("valid hours, invalid minutes", () => {
		expect(parseTime("23:60")).toBeUndefined();
	});

	it("invalid hours, valid minutes", () => {
		expect(parseTime("24:00")).toBeUndefined();
	});

	it("invalid format", () => {
		expect(parseTime("asdf")).toBeUndefined();
	});
});
