const FormInput = ({
  label,
  name,
  type = "text",
  error,
  className = "",
  ...inputProps
}) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="label">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        className={`input-field ${error ? "input-error" : ""}`}
        {...inputProps}
      />
      {error && <p className="error-text">{error}</p>}
    </div>
  );
};

export default FormInput;
