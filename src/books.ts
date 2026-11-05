import type { Book, Genre, GenreFilter, NewBook } from "./types";

type Filter = {
  genre: GenreFilter;
  query: string;
};

export function filterBooks(books: Book[], { genre, query }: Filter): Book[] {
  const normalizedQuery = query.trim().toLowerCase();
  return books.filter(
    (book) =>
      (genre === "all" || book.genre === genre) &&
      book.title.toLowerCase().includes(normalizedQuery)
  );
}

export function toggleRead(books: Book[], id: string): Book[] {
  return books.map((book) =>
    book.id === id ? { ...book, isRead: !book.isRead } : book
  );
}

export function removeBook(books: Book[], id: string): Book[] {
  return books.filter((book) => book.id !== id);
}

export function countRead(books: Book[]): number {
  return books.filter((book) => book.isRead).length;
}

/** Average of all rated books, rounded to one decimal. `null` if no book is rated. */
export function averageRating(books: Book[]): number | null {
  const rated = books.filter((book) => book.rating > 0);
  if (rated.length === 0) {
    return null;
  }
  const sum = rated.reduce((total, book) => total + book.rating, 0);
  return Math.round((sum / rated.length) * 10) / 10;
}

export const STORAGE_KEY = "bookshelf:books";

const genres: Genre[] = ["fantasy", "sci-fi", "mystery", "non-fiction"];

function sameBook(
  book: Book,
  { title, author }: Pick<NewBook, "title" | "author">
): boolean {
  return (
    book.title.trim().toLowerCase() === title.trim().toLowerCase() &&
    book.author.trim().toLowerCase() === author.trim().toLowerCase()
  );
}

/** Error message for an invalid new book, `null` if it can be added. */
export function validateNewBook(
  books: Book[],
  { title, author }: Pick<NewBook, "title" | "author">
): string | null {
  if (title.trim() === "" || author.trim() === "") {
    return "Title and author are required.";
  }
  if (books.some((book) => sameBook(book, { title, author }))) {
    return "This book is already on your shelf.";
  }
  return null;
}

/** Appends the book as unread, with trimmed title and author. */
export function addBook(books: Book[], input: NewBook): Book[] {
  const book: Book = {
    id: `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    title: input.title.trim(),
    author: input.author.trim(),
    genre: input.genre,
    rating: input.rating,
    isRead: false,
  };
  return [...books, book];
}

function isBook(value: unknown): value is Book {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const book = value as Record<string, unknown>;
  return (
    typeof book.id === "string" &&
    typeof book.title === "string" &&
    typeof book.author === "string" &&
    genres.includes(book.genre as Genre) &&
    typeof book.rating === "number" &&
    Number.isInteger(book.rating) &&
    book.rating >= 0 &&
    book.rating <= 5 &&
    typeof book.isRead === "boolean"
  );
}

/** Parses stored JSON into books, `null` if missing or invalid. */
export function parseStoredBooks(raw: string | null): Book[] | null {
  if (raw === null) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every(isBook) ? parsed : null;
  } catch {
    return null;
  }
}
