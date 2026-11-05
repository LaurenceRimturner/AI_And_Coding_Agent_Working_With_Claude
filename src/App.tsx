import { useEffect, useState } from "react";
import {
  STORAGE_KEY,
  addBook,
  filterBooks,
  parseStoredBooks,
  removeBook,
  toggleRead,
  validateNewBook,
} from "./books";
import AddBookForm from "./components/AddBookForm";
import BookList from "./components/BookList";
import Stats from "./components/Stats";
import { initialBooks } from "./data";
import type { Book, GenreFilter, NewBook } from "./types";

function loadBooks(): Book[] {
  try {
    return parseStoredBooks(localStorage.getItem(STORAGE_KEY)) ?? initialBooks;
  } catch {
    return initialBooks;
  }
}

export default function App() {
  const [books, setBooks] = useState<Book[]>(loadBooks);
  const [genre, setGenre] = useState<GenreFilter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    } catch {
      // storage unavailable or full: the shelf still works in memory
    }
  }, [books]);

  const visibleBooks = filterBooks(books, { genre, query });

  function handleToggleRead(id: string) {
    setBooks(toggleRead(books, id));
  }

  function handleAdd(book: NewBook): string | null {
    const error = validateNewBook(books, book);
    if (error === null) {
      setBooks(addBook(books, book));
    }
    return error;
  }

  function handleRemove(id: string) {
    setBooks(removeBook(books, id));
  }

  return (
    <main>
      <h1>Bookshelf</h1>
      <div className="controls">
        <label>
          Search
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          Genre
          <select
            value={genre}
            onChange={(event) => setGenre(event.target.value as GenreFilter)}
          >
            <option value="all">All genres</option>
            <option value="fantasy">Fantasy</option>
            <option value="sci-fi">Sci-Fi</option>
            <option value="mystery">Mystery</option>
            <option value="non-fiction">Non-fiction</option>
          </select>
        </label>
      </div>
      <AddBookForm onAdd={handleAdd} />
      <Stats books={books} />
      <BookList
        books={visibleBooks}
        onToggleRead={handleToggleRead}
        onRemove={handleRemove}
      />
    </main>
  );
}
