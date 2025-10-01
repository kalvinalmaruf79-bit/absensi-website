// src/components/ui/Input.jsx
export default function Input({
  label,
  error,
  helperText,
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
      {error && <div>{error}</div>}
      {helperText && !error && <div>{helperText}</div>}
    </>
  );
}
