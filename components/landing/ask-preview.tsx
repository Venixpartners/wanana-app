export function AskPreview() {
  return (
    <div className="rounded-3xl border border-line bg-ink p-5 sm:p-6">
      <p className="font-display font-semibold">Ask Wanana</p>
      <div className="mt-5 space-y-4">
        <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-emerald px-4 py-3 text-[15px]">
          Which songs are fans in London rating higher than fans in Lagos?
        </p>
        <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-midnight px-4 py-3 text-[15px] leading-relaxed">
          <p>
            Three this week. Owambe Season has the widest gap: 8.9 from diaspora fans against 7.8 at home, mostly from listeners in London and
            Houston.
          </p>
          <p className="mt-3 text-sm text-mist">Based on 1,204 fan ratings and 86 reviews.</p>
        </div>
      </div>
      <p className="mt-5 text-xs text-mist/80">Sample conversation.</p>
    </div>
  );
}
