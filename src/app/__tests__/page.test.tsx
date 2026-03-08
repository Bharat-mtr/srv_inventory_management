import { render, screen } from "@testing-library/react";
import HomePage from "../page";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

jest.mock("@/components/ui/brand-header", () => ({
  BrandHeader: ({ title }: { title?: string }) => (
    <h1>{title || "Shri Radha Vallabh Enterprises"}</h1>
  ),
}));

describe("HomePage", () => {
  it("renders brand title", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", { name: /Shri Radha Vallabh Enterprises/i })
    ).toBeInTheDocument();
  });

  it("renders admin portal link", () => {
    render(<HomePage />);
    const link = screen.getByRole("link", { name: /Go to Admin Portal/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/admin");
  });
});
