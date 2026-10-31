import { SubmitButton } from "./submit-button";

/** Small delete form for the author's own content. */
export function DeleteButton({ action, id, back, label = "Delete" }: { action: (form: FormData) => Promise<void>; id: string; back?: string; label?: string }) {
  return (
    <form action={action} className="inline">
      <input type="hidden" name="id" value={id} />
      {back && <input type="hidden" name="back" value={back} />}
      <SubmitButton className="text-sm text-mist hover:text-orange" pendingLabel="Deleting…">
        {label}
      </SubmitButton>
    </form>
  );
}
