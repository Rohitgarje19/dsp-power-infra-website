import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PublicLayout } from "../../AppRoutes";

function setup() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<h1>Page content</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("PublicLayout", () => {
  it("TC-A11Y-01: provides a skip link that targets the main landmark", () => {
    setup();
    const skip = screen.getByRole("link", { name: /skip to content/i });
    expect(skip).toHaveAttribute("href", "#main");
    expect(screen.getByRole("main")).toHaveAttribute("id", "main");
    expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1");
  });
});
