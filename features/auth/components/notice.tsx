export function SentNotice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div role="status" className="rounded-xl border border-emerald/60 bg-emerald/10 p-6">
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="mt-1 text-mist">{children}</p>
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-orange">
      {message}
    </p>
  );
}
