import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddBookForm from ".";

describe("AddBookForm", () => {
  test("renders the labelled fields with their options", () => {
    render(<AddBookForm onAdd={() => null} />);
    expect(
      screen.getByRole("form", { name: "Add a book" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Author")).toBeInTheDocument();
    expect(screen.getByLabelText("Book genre")).toHaveLength(4);
    const ratings = screen.getByLabelText("Rating") as HTMLSelectElement;
    expect([...ratings.options].map((o) => o.text)).toEqual([
      "Not rated",
      "1",
      "2",
      "3",
      "4",
      "5",
    ]);
  });

  test("passes the entered values to onAdd and clears the fields", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn(() => null);
    render(<AddBookForm onAdd={onAdd} />);
    await user.type(screen.getByLabelText("Title"), "Emma");
    await user.type(screen.getByLabelText("Author"), "Jane Austen");
    await user.selectOptions(screen.getByLabelText("Book genre"), "mystery");
    await user.selectOptions(screen.getByLabelText("Rating"), "4");
    await user.click(screen.getByRole("button", { name: "Add book" }));
    expect(onAdd).toHaveBeenCalledWith({
      title: "Emma",
      author: "Jane Austen",
      genre: "mystery",
      rating: 4,
    });
    expect(screen.getByLabelText("Title")).toHaveValue("");
    expect(screen.getByLabelText("Author")).toHaveValue("");
    expect(screen.getByLabelText("Book genre")).toHaveValue("fantasy");
    expect(screen.getByLabelText("Rating")).toHaveValue("0");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("shows the error in an alert and keeps the input", async () => {
    const user = userEvent.setup();
    render(<AddBookForm onAdd={() => "Nope."} />);
    await user.type(screen.getByLabelText("Title"), "Emma");
    await user.click(screen.getByRole("button", { name: "Add book" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Nope.");
    expect(screen.getByLabelText("Title")).toHaveValue("Emma");
  });
});
