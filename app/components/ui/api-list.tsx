interface ApiListProps {
  entityName: string;
  entityIdName: string;
}

export const ApiList: React.FC<ApiListProps> = ({
  entityName,
  entityIdName
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">API Routes</h2>
      <div>
        <p className="text-sm font-mono p-2 bg-slate-100 rounded">
          GET /api/{entityName}
        </p>
        <p className="text-sm font-mono p-2 bg-slate-100 rounded mt-2">
          GET /api/{entityName}/{`{${entityIdName}}`}
        </p>
        <p className="text-sm font-mono p-2 bg-slate-100 rounded mt-2">
          POST /api/{entityName}
        </p>
        <p className="text-sm font-mono p-2 bg-slate-100 rounded mt-2">
          PATCH /api/{entityName}/{`{${entityIdName}}`}
        </p>
        <p className="text-sm font-mono p-2 bg-slate-100 rounded mt-2">
          DELETE /api/{entityName}/{`{${entityIdName}}`}
        </p>
      </div>
    </div>
  );
};
