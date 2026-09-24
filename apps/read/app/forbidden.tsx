export default function Forbidden() {
  return (
    <main>
      <h1 className="max-w-[12ch] text-balance text-[2.75rem] font-semibold leading-[0.92] tracking-tight md:text-6xl">
        You don’t have a seat yet
      </h1>
      <p className="text-muted-foreground">
        Ask an admin to add you to the club.
      </p>
    </main>
  );
}
