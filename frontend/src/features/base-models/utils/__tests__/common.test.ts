import { describe, it, expect } from "vitest";
import { DATE_SORT_OPTIONS } from "@/features/base-models/utils/common";

describe("DATE_SORT_OPTIONS", () => {
  it("has exactly two options", () => {
    expect(DATE_SORT_OPTIONS).toHaveLength(2);
  });

  it("first option represents 'newest'", () => {
    expect(DATE_SORT_OPTIONS[0]).toEqual({ label: "Newest", value: "newest" });
  });

  it("second option represents 'oldest'", () => {
    expect(DATE_SORT_OPTIONS[1]).toEqual({ label: "Oldest", value: "oldest" });
  });
});
