---
name: new-component
description: Create a new React component with its folder, props type and test, following the project conventions. Use this when the user asks to add or scaffold a component. Takes the component name and its purpose as arguments, e.g. `/new-component EmptyShelf shows a message when no book matches`.
argument-hint: <ComponentName> <what it should do>
disable-model-invocation: true
---

Create a new component from these arguments: $ARGUMENTS

The first word (`$0`) is the component name (PascalCase). The rest is the purpose. If the name is missing or not PascalCase, ask the user before creating anything. If `src/components/<Name>/` already exists, stop and tell the user.

1. Create `src/components/<Name>/index.tsx`:
   - a props type named `<Name>Props` (props only for what the purpose needs; use `Book` etc. from `../../types`)
   - a default-exported function component `<Name>`, in the style of `src/components/Stats/index.tsx`
   - no state or non-UI logic in the component. Logic goes in `src/books.ts` with tests in `src/books.test.ts`, as pure functions that return new arrays.
2. Create `src/components/<Name>/<Name>.test.tsx` in the style of `src/components/AddBookForm/AddBookForm.test.tsx` (Vitest and Testing Library, `import <Name> from "."`). Cover the purpose with at least one test that renders the component and checks the visible result.
3. Do not wire the component into `src/App.tsx` unless the user asked for it. Do not add dependencies. Do not edit `src/data.ts`.
4. Run `npm run check` and `npx vitest run src/components/<Name>`. Fix problems in the new files. Never change an existing test to make it pass.
5. Report the files created and whether the type check and the tests passed.
