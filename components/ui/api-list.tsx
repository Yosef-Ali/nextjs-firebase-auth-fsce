interface ApiListProps {
  entityName: string;
  entityIdName: string;
}

export function ApiList({
  entityName,
  entityIdName,
}: ApiListProps) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;

  const apiList = [
    {
      label: "GET",
      subLabel: "Get all",
      variant: "public" as const,
      url: `${baseUrl}/api/${entityName}`,
    },
    {
      label: "GET",
      subLabel: "Get by ID",
      variant: "public" as const,
      url: `${baseUrl}/api/${entityName}/{${entityIdName}}`,
    },
    {
      label: "POST",
      subLabel: "Create",
      variant: "admin" as const,
      url: `${baseUrl}/api/${entityName}`,
    },
    {
      label: "PATCH",
      subLabel: "Update",
      variant: "admin" as const,
      url: `${baseUrl}/api/${entityName}/{${entityIdName}}`,
    },
    {
      label: "DELETE",
      subLabel: "Delete",
      variant: "admin" as const,
      url: `${baseUrl}/api/${entityName}/{${entityIdName}}`,
    },
  ];

  return (
    <div className="rounded-md border w-full">
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">API Reference</h2>
        <div className="space-y-4">
          {apiList.map((item) => (
            <div
              key={`${item.label}-${item.url}`}
              className="flex items-start justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-x-2">
                  <span className={`px-2 py-1 rounded-md bg-slate-100 text-xs ${
                    item.variant === "public" ? "text-sky-700" : "text-amber-700"
                  }`}>
                    {item.label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {item.subLabel}
                  </span>
                </div>
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                  {item.url}
                </code>
              </div>
              <span className={`text-xs ${
                item.variant === "public" ? "text-sky-700" : "text-amber-700"
              }`}>
                {item.variant}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}