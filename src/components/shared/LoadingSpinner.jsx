// src/components/shared/LoadingSpinner.jsx
export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={`animate-spin border-4 border-t-transparent border-gray-400 rounded-full ${sizes[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
