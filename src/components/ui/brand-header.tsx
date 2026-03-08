import Image from "next/image";

interface BrandHeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
  actions?: React.ReactNode;
}

export function BrandHeader({ title, subtitle, className = "", actions }: BrandHeaderProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary/20 bg-background">
        <Image
          src="/logo.png"
          alt="Shri Radha Vallabh Enterprises Logo"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="flex flex-col">
        <h1 className="text-lg md:text-xl font-bold text-primary leading-tight">
          {title || "Shri Radha Vallabh Enterprises"}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground leading-tight">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="ml-auto shrink-0">{actions}</div>}
    </div>
  );
}
