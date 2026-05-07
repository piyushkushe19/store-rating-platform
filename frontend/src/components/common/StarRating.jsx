export default function StarRating({ value, onChange, readonly = false, size = 'md' }) {
  const sizes = { sm: 'text-base', md: 'text-2xl', lg: 'text-3xl' };
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange && onChange(star)}
          className={`${sizes[size]} transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
          disabled={readonly}
        >
          <span className={star <= (value || 0) ? 'text-yellow-400' : 'text-gray-300'}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}
