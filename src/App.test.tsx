import { describe, expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App", () => {
  test("renders all books", () => {
    render(<App />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(5);
  });

  test("shows only the books of the selected genre", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText("Genre"), "sci-fi");
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
  });

  test("marks a book as read", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Mark Gone Girl as read" })
    );
    expect(
      screen.getByRole("button", { name: "Mark Gone Girl as unread" })
    ).toBeInTheDocument();
    expect(screen.getByText(/3 of 5 read/)).toBeInTheDocument();
  });

  test("removes the right book while a genre filter is active", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText("Genre"), "sci-fi");
    await user.click(
      screen.getByRole("button", { name: "Remove Neuromancer" })
    );
    await user.selectOptions(screen.getByLabelText("Genre"), "all");
    const titles = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(titles).toEqual(["Dune", "The Hobbit", "Gone Girl", "Sapiens"]);
  });

  test("shows 'Average rating: 4' for the sample books", () => {
    render(<App />);
    const stats = screen.getByText(/Average rating/);
    expect(within(stats).queryByText("NaN")).toBeNull();
    expect(stats).toHaveTextContent("Average rating: 4");
  });

  describe("adding a book", () => {
    async function addBook(
      user: ReturnType<typeof userEvent.setup>,
      title: string,
      author: string
    ) {
      await user.type(screen.getByLabelText("Title"), title);
      await user.type(screen.getByLabelText("Author"), author);
      await user.click(screen.getByRole("button", { name: "Add book" }));
    }

    test("adds an unread book, updates the count and clears the form", async () => {
      const user = userEvent.setup();
      render(<App />);
      await addBook(user, "Emma", "Jane Austen");
      expect(screen.getByRole("heading", { name: "Emma" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Mark Emma as read" })
      ).toBeInTheDocument();
      expect(screen.getByText(/2 of 6 read/)).toBeInTheDocument();
      expect(screen.getByLabelText("Title")).toHaveValue("");
      expect(screen.getByLabelText("Author")).toHaveValue("");
      expect(screen.queryByRole("alert")).toBeNull();
    });

    test("rejects a missing title or author with an alert", async () => {
      const user = userEvent.setup();
      render(<App />);
      await addBook(user, "   ", "Jane Austen");
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Title and author are required."
      );
      await user.click(screen.getByRole("button", { name: "Add book" }));
      expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(5);
    });

    test("trims title and author", async () => {
      const user = userEvent.setup();
      render(<App />);
      await addBook(user, "  Emma  ", "  Jane Austen ");
      expect(screen.getByRole("heading", { name: "Emma" })).toBeInTheDocument();
      expect(screen.getByText(/^Jane Austen ·/)).toBeInTheDocument();
    });

    test("rejects a case-insensitive duplicate", async () => {
      const user = userEvent.setup();
      render(<App />);
      await addBook(user, "dune", "FRANK HERBERT");
      expect(screen.getByRole("alert")).toHaveTextContent(
        "This book is already on your shelf."
      );
      expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(5);
    });

    test("allows the same title by a different author", async () => {
      const user = userEvent.setup();
      render(<App />);
      await addBook(user, "Dune", "Someone Else");
      expect(screen.getAllByRole("heading", { name: "Dune" })).toHaveLength(2);
      expect(screen.queryByRole("alert")).toBeNull();
    });

    test("uses the chosen genre and rating", async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.selectOptions(screen.getByLabelText("Book genre"), "mystery");
      await user.selectOptions(screen.getByLabelText("Rating"), "5");
      await addBook(user, "Emma", "Jane Austen");
      expect(screen.getByText("Jane Austen · mystery")).toBeInTheDocument();
      const card = screen.getByRole("heading", { name: "Emma" }).closest("li")!;
      expect(within(card).getByLabelText("Rating: 5 of 5")).toBeInTheDocument();
    });
  });

  describe("persistence", () => {
    test("saves the books under bookshelf:books", async () => {
      const user = userEvent.setup();
      render(<App />);
      await user.type(screen.getByLabelText("Title"), "Emma");
      await user.type(screen.getByLabelText("Author"), "Jane Austen");
      await user.click(screen.getByRole("button", { name: "Add book" }));
      const stored = JSON.parse(localStorage.getItem("bookshelf:books")!);
      expect(stored).toHaveLength(6);
      expect(stored[stored.length - 1]).toMatchObject({ title: "Emma", isRead: false });
    });

    test("restores the books after a reload", async () => {
      const user = userEvent.setup();
      const { unmount } = render(<App />);
      await user.type(screen.getByLabelText("Title"), "Emma");
      await user.type(screen.getByLabelText("Author"), "Jane Austen");
      await user.click(screen.getByRole("button", { name: "Add book" }));
      unmount();
      render(<App />);
      expect(screen.getByRole("heading", { name: "Emma" })).toBeInTheDocument();
      expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(6);
    });

    test.each([
      ["empty storage", null],
      ["invalid JSON", "{broken"],
      ["wrong shape", '{"books":[]}'],
    ])("falls back to the sample books on %s", (_name, value) => {
      if (value !== null) {
        localStorage.setItem("bookshelf:books", value);
      }
      render(<App />);
      expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(5);
    });
  });
});
