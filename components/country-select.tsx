import { otherCountries, priorityCountries } from "@/lib/countries";

export function CountrySelect({ name, id, defaultValue, required }: { name: string; id: string; defaultValue?: string; required?: boolean }) {
  return (
    <select name={name} id={id} defaultValue={defaultValue ?? ""} required={required} className="field appearance-none">
      <option value="" disabled>
        Choose your country
      </option>
      <optgroup label="Most of our fans">
        {priorityCountries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </optgroup>
      <optgroup label="Everywhere else">
        {otherCountries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </optgroup>
    </select>
  );
}
