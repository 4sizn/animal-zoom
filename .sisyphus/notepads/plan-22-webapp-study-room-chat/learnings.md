# Learnings

- Message model (demo): `{ id, authorId, authorName, authorAvatarUrl?, text, createdAt }`.
- Input rules: Enter=send, Shift+Enter=newline, ignore whitespace-only.
- Scroll rules: auto-scroll only when user is at bottom; show "new messages" chip otherwise.
- Responsive: chat sidebar closable; on small screens provide an open/close affordance and focus input on open.

- Playwright in container cannot open `file://`; serve with `python3 -m http.server` and use `http://host.docker.internal:<port>/code.html`.
