interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  className?: string;
}

export default function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className = "",
}: Props<T>) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`h-9 px-4 rounded-control text-small font-medium transition-colors ${
              active ? "bg-black text-white" : "bg-surface text-foreground hover:bg-border"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}