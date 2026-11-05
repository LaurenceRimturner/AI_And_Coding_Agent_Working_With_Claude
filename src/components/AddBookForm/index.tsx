import { useState } from "react";
import type { FormEvent } from "react";
import type { Genre, NewBook } from "../../types";

type AddBookFormProps = {
  /** Returns an error message, or `null` if the book was added. */
  onAdd: (book: NewBook) => string | null;
};

export default function AddBookForm({ onAdd }: AddBookFormProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState<Genre>("fantasy");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = onAdd({ title, author, genre, rating });
    setError(result);
    if (result === null) {
      setTitle("");
      setAuthor("");
      setGenre("fantasy");
      setRating(0);
    }
  }

  return (
    <form aria-label="Add a book" noValidate onSubmit={handleSubmit}>
      <h2>Add a book</h2>
      <label>
        Title
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <label>
        Author
        <input
          type="text"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
        />
      </label>
      <label>
        Book genre
        <select
          value={genre}
          onChange={(event) => setGenre(event.target.value as Genre)}
        >
          <option value="fantasy">Fantasy</option>
          <option value="sci-fi">Sci-Fi</option>
          <option value="mystery">Mystery</option>
          <option value="non-fiction">Non-fiction</option>
        </select>
      </label>
      <label>
        Rating
        <select
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
        >
          <option value={0}>Not rated</option>
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <button type="submit">Add book</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
