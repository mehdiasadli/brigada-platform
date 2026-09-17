export default function ForbiddenPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 p-6">
      <h1 className="text-lg font-medium">Forbidden</h1>
      <p className="text-sm text-muted-foreground">
        Only admins can open this dashboard.
      </p>
    </main>
  );
}
