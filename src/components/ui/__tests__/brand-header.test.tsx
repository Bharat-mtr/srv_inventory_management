import { render, screen } from "@testing-library/react";
import { BrandHeader } from "../brand-header";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...rest }: React.ComponentProps<"img">) => {
    const { fill, priority, ...imgProps } = rest as Record<string, unknown>;
    return <img src={src} alt={alt} {...imgProps} />;
  },
}));

describe("BrandHeader", () => {
  it("renders default title", () => {
    render(<BrandHeader />);
    expect(
      screen.getByRole("heading", { name: /Shri Radha Vallabh Enterprises/i })
    ).toBeInTheDocument();
  });

  it("renders custom title", () => {
    render(<BrandHeader title="Custom Title" />);
    expect(screen.getByRole("heading", { name: /Custom Title/i })).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(<BrandHeader subtitle="Admin Portal" />);
    expect(screen.getByText("Admin Portal")).toBeInTheDocument();
  });
});
