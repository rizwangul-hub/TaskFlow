const Spinner = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-5 w-5 border-2",
    lg: "h-8 w-8 border-[3px]",
  };

  return (
    <span
      className={`inline-block animate-spin rounded-full border-white/30 border-t-white ${sizes[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Spinner;
