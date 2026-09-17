export function UsersHeader({ total }: { total: number }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-medium">Users</h1>
      <p className="text-sm text-muted-foreground">
        {total} {total === 1 ? "person" : "people"} on Brigada.
      </p>
    </div>
  );
}
