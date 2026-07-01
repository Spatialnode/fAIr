import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BaseModelKeywords } from "@/features/base-models/components/base-model-keywords";

describe("BaseModelKeywords", () => {
  it("renders nothing when keywords array is empty", () => {
    const { container } = render(<BaseModelKeywords keywords={[]} />);
    expect(container.querySelectorAll("span")).toHaveLength(0);
  });

  it("renders up to the default visible limit of 3", () => {
    render(
      <BaseModelKeywords
        keywords={["alpha", "beta", "gamma", "delta", "epsilon"]}
      />,
    );
    expect(screen.getAllByText(/alpha|beta|gamma/i)).toHaveLength(3);
    expect(screen.queryByText("delta")).not.toBeInTheDocument();
    expect(screen.queryByText("epsilon")).not.toBeInTheDocument();
  });

  it("respects a custom visibleLimit prop", () => {
    render(
      <BaseModelKeywords
        keywords={["a", "b", "c", "d", "e"]}
        visibleLimit={5}
      />,
    );
    expect(screen.getAllByRole("generic").length).toBeGreaterThanOrEqual(5);
    ["a", "b", "c", "d", "e"].forEach((kw) => {
      expect(screen.getByText(new RegExp(`^${kw}$`, "i"))).toBeInTheDocument();
    });
  });

  it("does not render keywords beyond the visible limit", () => {
    render(
      <BaseModelKeywords
        keywords={["first", "second", "third", "hidden"]}
        visibleLimit={3}
      />,
    );
    expect(screen.queryByText("hidden")).not.toBeInTheDocument();
  });

  it("renders each keyword in its own badge span", () => {
    render(<BaseModelKeywords keywords={["roof", "road"]} visibleLimit={2} />);
    const badges = screen.getAllByText(/roof|road/i);
    expect(badges).toHaveLength(2);
    badges.forEach((badge) => {
      expect(badge.tagName.toLowerCase()).toBe("span");
    });
  });
});
