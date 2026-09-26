import type { FormEvent } from 'react';
import { isNumberInput } from './difference';

export const isTextGridInput = (value: string) => value.split(/\s+/).every(isNumberInput);

export const preventInvalidInsertion = (
  event: FormEvent<HTMLInputElement | HTMLTextAreaElement>,
  isAllowed: (value: string) => boolean,
) => {
  const inputEvent = event.nativeEvent as InputEvent;
  if (typeof inputEvent.inputType !== 'string' || !inputEvent.inputType.startsWith('insert')) return;
  if (typeof inputEvent.data !== 'string') return;

  const input = event.currentTarget;
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? start;
  const nextValue = `${input.value.slice(0, start)}${inputEvent.data}${input.value.slice(end)}`;
  if (!isAllowed(nextValue)) event.preventDefault();
};

export const restoreRejectedInput = (
  input: HTMLInputElement | HTMLTextAreaElement,
  previousValue: string,
) => {
  const nextValue = input.value;
  let unchangedPrefix = 0;
  while (
    unchangedPrefix < previousValue.length
    && unchangedPrefix < nextValue.length
    && previousValue[unchangedPrefix] === nextValue[unchangedPrefix]
  ) {
    unchangedPrefix += 1;
  }
  input.value = previousValue;
  input.setSelectionRange(unchangedPrefix, unchangedPrefix);
};
