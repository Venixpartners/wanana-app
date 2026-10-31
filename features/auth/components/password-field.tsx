"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordField({ id = "password", label = "Password", autoComplete, hint }: { id?: string; label?: string; autoComplete: string; hint?: string }) {
  const [shown, setShown] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="relative">
        <input id={id} name="password" type={shown ? "text" : "password"} autoComplete={autoComplete} className="field pr-12" />
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-mist hover:text-paper"
        >
          {shown ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </div>
      {hint && <p className="mt-1.5 text-sm text-mist">{hint}</p>}
    </div>
  );
}
