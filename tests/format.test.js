import { describe, expect, it } from "vitest";
import { splitPathQuery } from "@/lib/format";

const LONG_TRACKED =
  "/tr?utm_source=instagram&utm_medium=social&utm_campaign=spring_launch_2026&utm_content=very_long_carousel_caption_identifier&fbclid=IwAR2xK9vQ7mNpL3sT8uV0wX1yZ4aB5cD6eF7gH8iJ9kL0mN1oP2qR3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR";

describe("splitPathQuery", () => {
  it("separates pathname from a long tracked query string", () => {
    const { pathname, query } = splitPathQuery(LONG_TRACKED);
    expect(pathname).toBe("/tr");
    expect(query.startsWith("?utm_source=instagram")).toBe(true);
    expect(query).toContain("fbclid=IwAR2xK9");
  });

  it("keeps the full original value available to the caller", () => {
    expect(LONG_TRACKED).toBe(LONG_TRACKED);
    const { pathname, query } = splitPathQuery(LONG_TRACKED);
    expect(pathname + query).toBe(LONG_TRACKED);
  });

  it("handles paths without a query", () => {
    expect(splitPathQuery("/tr/packages")).toEqual({
      pathname: "/tr/packages",
      query: "",
    });
  });

  it("keeps hash fragments with the pathname", () => {
    const { pathname, query } = splitPathQuery("/tr?utm_source=x#section");
    expect(pathname).toBe("/tr#section");
    expect(query).toBe("?utm_source=x");
  });

  it("falls back to a plain split when URL parsing fails", () => {
    const { pathname, query } = splitPathQuery("http://[?fbclid=abc");
    expect(pathname).toBe("http://[");
    expect(query).toBe("?fbclid=abc");
  });

  it("defaults empty input to root", () => {
    expect(splitPathQuery("")).toEqual({ pathname: "/", query: "" });
    expect(splitPathQuery(undefined)).toEqual({ pathname: "/", query: "" });
  });
});
