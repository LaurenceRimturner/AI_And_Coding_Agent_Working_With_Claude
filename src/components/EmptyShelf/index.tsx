type EmptyShelfProps = {
  query: string;
};

export default function EmptyShelf({ query }: EmptyShelfProps) {
  return (
    <p className="empty-shelf">
      {query ? `No book matches "${query}".` : "No book matches."}
    </p>
  );
}
