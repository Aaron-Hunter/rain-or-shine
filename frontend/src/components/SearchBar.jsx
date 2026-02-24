export default function SearchBar({ onSubmit, value, onChange }) {
  return (
    <form onSubmit={onSubmit} className="search-form">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Search address..."
        className="search-input"
      />
      <button type="submit" className="search-button">
        🔍
      </button>
    </form>
  );
}
