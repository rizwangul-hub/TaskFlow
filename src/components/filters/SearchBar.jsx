import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const SearchBar = ({ placeholder = "Search tasks...", className = "" }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get("search") || "");
  const debounceRef = useRef(null);

  // Sync with URL on mount
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    setInputValue(urlSearch);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateURL = (value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set("search", value);
      } else {
        next.delete("search");
      }
      next.delete("page"); // Reset pagination on search
      return next;
    });
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // 500ms debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateURL(value);
    }, 500);
  };

  const handleClear = () => {
    setInputValue("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    updateURL("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") handleClear();
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      updateURL(inputValue);
    }
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Search Icon */}
      <div className="pointer-events-none absolute left-3.5 flex items-center">
        <svg
          className="h-4 w-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <input
        id="task-search-input"
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />

      {/* Clear Button */}
      <AnimatePresence>
        {inputValue && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={handleClear}
            type="button"
            className="absolute right-3 flex items-center justify-center rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Live search indicator */}
      <AnimatePresence>
        {debounceRef.current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-10 h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
