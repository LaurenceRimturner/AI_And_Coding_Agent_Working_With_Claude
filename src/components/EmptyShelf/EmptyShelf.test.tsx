import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyShelf from ".";

describe("EmptyShelf", () => {
  test("shows the query in the no-match message", () => {
    render(<EmptyShelf query="Emma" />);
    expect(screen.getByText('No book matches "Emma".')).toBeInTheDocument();
  });

  test("shows a generic message without a query", () => {
    render(<EmptyShelf query="" />);
    expect(screen.getByText("No book matches.")).toBeInTheDocument();
  });
});
