import { formatPrice, generateUniqueCode, cn } from "../utils";

describe("formatPrice", () => {
  it("returns em dash for null", () => {
    expect(formatPrice(null)).toBe("—");
  });

  it("formats INR price", () => {
    expect(formatPrice(100)).toMatch(/100|₹100/);
    expect(formatPrice(1500)).toMatch(/1,?500|₹1,?500/);
  });
});

describe("generateUniqueCode", () => {
  it("returns string of default length 8", () => {
    const code = generateUniqueCode();
    expect(code).toHaveLength(8);
    expect(code).toMatch(/^[A-Za-z0-9]+$/);
  });

  it("returns string of specified length", () => {
    expect(generateUniqueCode(6)).toHaveLength(6);
    expect(generateUniqueCode(12)).toHaveLength(12);
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", true && "visible")).toContain("visible");
  });
});
