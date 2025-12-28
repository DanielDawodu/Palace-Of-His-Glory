interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
}

export function SectionHeader({ title, subtitle, centered = true, light = false }: SectionHeaderProps) {
  return (
    <div className={`mb-12 ${centered ? "text-center" : "text-left"}`}>
      {subtitle && (
        <span className={`text-sm font-bold uppercase tracking-widest mb-2 block ${light ? "text-secondary" : "text-primary"}`}>
          {subtitle}
        </span>
      )}
      <h2 className={`font-display text-4xl md:text-5xl font-bold ${light ? "text-white" : "text-gray-900"}`}>
        {title}
      </h2>
      <div className={`h-1 w-20 ${light ? "bg-white/30" : "bg-primary"} mt-4 ${centered ? "mx-auto" : ""}`} />
    </div>
  );
}
