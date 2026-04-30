export function PageTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <header className="mb-4">
      <h1 className="text-xl font-bold">{title}</h1>
      {desc ? <p className="mt-1 text-sm text-muted">{desc}</p> : null}
    </header>
  );
}
