import { describe, expect, test } from "vitest";
import {
  addBook,
  averageRating,
  countRead,
  filterBooks,
  parseStoredBooks,
  removeBook,
  toggleRead,
  validateNewBook,
} from "./books";
import { initialBooks } from "./data";

describe("filterBooks", () => {
  test("filters by genre", () => {
    const result = filterBooks(initialBooks, { genre: "sci-fi", query: "" });
    expect(result.map((book) => book.title)).toEqual(["Dune", "Neuromancer"]);
  });

  test("returns all books for the genre 'all'", () => {
    expect(filterBooks(initialBooks, { genre: "all", query: "" })).toHaveLength(
      5
    );
  });

  test("finds a title regardless of upper and lower case", () => {
    const result = filterBooks(initialBooks, { genre: "all", query: "dune" });
    expect(result.map((book) => book.title)).toEqual(["Dune"]);
  });

  test("ignores spaces around the search text", () => {
    const result = filterBooks(initialBooks, { genre: "all", query: " Dune " });
    expect(result).toHaveLength(1);
  });
});

describe("toggleRead", () => {
  test("toggles the read status of one book", () => {
    const result = toggleRead(structuredClone(initialBooks), "b3");
    expect(result.find((book) => book.id === "b3")?.isRead).toBe(true);
    expect(result.find((book) => book.id === "b1")?.isRead).toBe(true);
  });

  test("does not change the original list", () => {
    const books = structuredClone(initialBooks);
    const result = toggleRead(books, "b3");
    expect(books.find((book) => book.id === "b3")?.isRead).toBe(false);
    expect(result).not.toBe(books);
  });
});

describe("removeBook", () => {
  test("removes the book with the given id", () => {
    const result = removeBook(initialBooks, "b2");
    expect(result.map((book) => book.id)).toEqual(["b1", "b3", "b4", "b5"]);
  });
});

describe("countRead", () => {
  test("counts the read books", () => {
    expect(countRead(initialBooks)).toBe(2);
  });
});

describe("averageRating", () => {
  test("averages only the rated books", () => {
    expect(averageRating(initialBooks)).toBe(4);
  });

  test("returns null when no book is rated", () => {
    expect(averageRating([initialBooks[2], initialBooks[4]])).toBeNull();
  });

  test("returns null for an empty list", () => {
    expect(averageRating([])).toBeNull();
  });
});

describe("validateNewBook", () => {
  test("rejects empty or whitespace-only title and author", () => {
    const message = "Title and author are required.";
    expect(validateNewBook(initialBooks, { title: "", author: "A" })).toBe(
      message
    );
    expect(validateNewBook(initialBooks, { title: "T", author: "   " })).toBe(
      message
    );
  });

  test("rejects a duplicate ignoring case and surrounding spaces", () => {
    expect(
      validateNewBook(initialBooks, {
        title: "  dUNE ",
        author: "frank HERBERT",
      })
    ).toBe("This book is already on your shelf.");
  });

  test("allows the same title by a different author", () => {
    expect(
      validateNewBook(initialBooks, { title: "Dune", author: "Someone Else" })
    ).toBeNull();
  });
});

describe("addBook", () => {
  const input = {
    title: "  Emma ",
    author: " Jane Austen  ",
    genre: "mystery" as const,
    rating: 3,
  };

  test("appends a trimmed, unread book without changing the input array", () => {
    const result = addBook(initialBooks, input);
    expect(result).toHaveLength(initialBooks.length + 1);
    expect(result[result.length - 1]).toMatchObject({
      title: "Emma",
      author: "Jane Austen",
      genre: "mystery",
      rating: 3,
      isRead: false,
    });
    expect(initialBooks.some((book) => book.title === "Emma")).toBe(false);
  });

  test("gives each new book a unique id", () => {
    const ids = addBook(addBook(initialBooks, input), input).map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("parseStoredBooks", () => {
  test("returns null for missing, malformed or wrongly shaped data", () => {
    expect(parseStoredBooks(null)).toBeNull();
    expect(parseStoredBooks("{not json")).toBeNull();
    expect(parseStoredBooks('{"a":1}')).toBeNull();
    expect(parseStoredBooks('[{"id":"x"}]')).toBeNull();
    expect(
      parseStoredBooks(
        JSON.stringify([{ ...initialBooks[0], genre: "horror" }])
      )
    ).toBeNull();
  });

  test("returns the books for valid data", () => {
    expect(parseStoredBooks(JSON.stringify(initialBooks))).toEqual(
      initialBooks
    );
  });
});
