interface HeadingProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<any>;
}

export function Heading({
  title,
  description,
  icon: Icon
}: HeadingProps) {
  return (
    <div className="flex items-center gap-4">
      {Icon && <Icon className="h-8 w-8 text-primary" />}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
