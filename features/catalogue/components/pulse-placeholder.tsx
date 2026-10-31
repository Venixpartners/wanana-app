/** Where Fan Pulse will appear once ratings open (step 4). */
export function PulsePlaceholder({ what }: { what: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line p-5">
      <p className="font-display font-semibold">Fan Pulse</p>
      <p className="mt-1 text-sm text-mist">Ratings for this {what} open soon. Fans at home and in the diaspora will score it out of 10.</p>
    </div>
  );
}
