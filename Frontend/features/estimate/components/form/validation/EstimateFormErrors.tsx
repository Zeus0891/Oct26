export function EstimateFormErrors({
  errors,
  className,
}: {
  errors: Record<string, string>;
  className?: string;
}) {
  if (Object.keys(errors).length === 0) return null;

  return (
    <div
      className={`neomorphic-card p-4 border-l-4 border-red-500 ${className}`}
    >
      <h3 className="text-red-700 font-medium mb-2">
        Please correct the following errors:
      </h3>
      <ul className="text-red-600 text-sm space-y-1">
        {Object.entries(errors).map(([field, message]) => (
          <li key={field}>• {message}</li>
        ))}
      </ul>
    </div>
  );
}

export default EstimateFormErrors;
