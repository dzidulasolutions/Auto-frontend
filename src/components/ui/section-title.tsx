interface Props {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  children: React.ReactNode;
  as?: "h1" | "h2";
}

export default function SectionTitle({ icon: Icon, color, children, as = "h2" }: Props) {
  const Tag = as;
  const textClass = as === "h1" ? "text-h1" : "text-h2";

  return (
    <div className="flex items-center gap-2.5">
      <span
        className="size-7 flex items-center justify-center rounded-control shrink-0"
        style={{ backgroundColor: `${color}1a` }}
      >
        <Icon size={16} color={color} />
      </span>
      <Tag className={textClass}>{children}</Tag>
    </div>
  );
}