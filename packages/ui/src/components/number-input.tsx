"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@brigada/ui/components/input-group";
import { MinusIcon, PlusIcon } from "lucide-react";

export function NumberInput({
  id,
  value,
  onValueChange,
  min,
  max,
  step = 1,
  disabled,
  placeholder,
  allowEmpty = false,
}: {
  id?: string;
  value: number | null;
  onValueChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  placeholder?: string;
  allowEmpty?: boolean;
}) {
  function clamp(next: number) {
    let result = next;
    if (min !== undefined) {
      result = Math.max(min, result);
    }
    if (max !== undefined) {
      result = Math.min(max, result);
    }
    return result;
  }

  function setNumber(next: number | null) {
    if (next === null) {
      onValueChange(allowEmpty ? null : clamp(min ?? 0));
      return;
    }

    onValueChange(clamp(Math.trunc(next)));
  }

  return (
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <InputGroupButton
          aria-label="Decrease"
          disabled={
            disabled || (min !== undefined && value !== null && value <= min)
          }
          onClick={() => setNumber((value ?? min ?? 0) - step)}
          size="icon-xs"
          type="button"
        >
          <MinusIcon />
        </InputGroupButton>
      </InputGroupAddon>
      <InputGroupInput
        className="text-center"
        disabled={disabled}
        id={id}
        inputMode="numeric"
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === "") {
            setNumber(null);
            return;
          }

          const parsed = Number(raw);
          if (Number.isFinite(parsed)) {
            setNumber(parsed);
          }
        }}
        placeholder={placeholder}
        value={value === null ? "" : String(value)}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label="Increase"
          disabled={
            disabled || (max !== undefined && value !== null && value >= max)
          }
          onClick={() => setNumber((value ?? min ?? 0) + step)}
          size="icon-xs"
          type="button"
        >
          <PlusIcon />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
