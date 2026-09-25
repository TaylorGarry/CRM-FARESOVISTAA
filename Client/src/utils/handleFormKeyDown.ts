 export const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
  const target = e.target as HTMLElement;
  const tag = target.tagName;

  // Only intercept on inputs/selects/textareas
  const isFormField =
    tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
  if (!isFormField) return;

  // Don't hijack Space inside textareas or inside the RichTextEditor
  if (e.key === ' ' && tag === 'TEXTAREA') return;

  const isEnter = e.key === 'Enter';
  const isSpace = e.key === ' ';

  // Handle Enter (skip Space for text inputs where typing spaces is normal?)
  // If you want Space to also advance, keep the condition below.
  if (!isEnter && !isSpace) return;

  // Prevent form submit on Enter
  if (isEnter) e.preventDefault();

  // Collect all focusable form fields in DOM order
  const form = e.currentTarget;
  const fields = Array.from(
    form.querySelectorAll<HTMLElement>(
      'input:not([type="hidden"]):not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled])'
    )
  ).filter((el) => el.tabIndex !== -1);

  const idx = fields.indexOf(target);
  if (idx === -1) return;

  // For space on a text input we only advance if the field is empty
  // (so users can still type "New York" with a space).
  if (isSpace) {
    const input = target as HTMLInputElement | HTMLTextAreaElement;
    if (typeof input.value === 'string' && input.value.length > 0) return;
    e.preventDefault();
  }

  const next = fields[idx + 1];
  if (next) {
    (next as HTMLElement).focus();
    // Select-all for text inputs so the user can overwrite immediately
    if (
      next.tagName === 'INPUT' &&
      ['text', 'number', 'email', 'tel', 'date'].includes(
        (next as HTMLInputElement).type
      )
    ) {
      (next as HTMLInputElement).select?.();
    }
  }
};