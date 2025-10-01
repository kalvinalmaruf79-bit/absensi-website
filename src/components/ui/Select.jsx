// src/components/ui/Select.jsx
export default function Select({
  label,
  error,
  options = [],
  className = "",
  ...props
}) {
  return (
    <>
      {label && (
        <label>
          {label}
          {props.required && "*"}
        </label>
      )}
      <select className={className} {...props}>
        <option value="">Pilih...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div className="error">{error}</div>}
    </>
  );
}
