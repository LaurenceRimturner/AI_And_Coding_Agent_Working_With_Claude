# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Bookshelf: a React 19 + TypeScript app built with Vite, tested with Vitest, jsdom and Testing Library. Node.js 22.22 or newer is required.

## Commands

- `npm i`: install dependencies
- `npm run dev`: start the dev server on port 3000
- `npm run test:run`: run all tests once. **Always use this.** `npm test` starts watch mode and never finishes.
- `npx vitest run src/books.test.ts`: run a single test file (add `-t "<name>"` for a single test)
- `npm run check`: type check (`tsc --noEmit`)
- `npm run build`: production build

There is no linter configured.

## Architecture

- `src/App.tsx` owns all state (`books`, `genre`, `query`) in `useState`, derives the visible list with `filterBooks`, and passes data and callbacks down as props to `BookList` and `Stats`.
- `src/books.ts` holds all non-UI logic as pure functions (`filterBooks`, `toggleRead`, `removeBook`, `countRead`, `averageRating`). Tests are in `src/books.test.ts`.
- `src/types.ts` defines `Book`, `Genre` and `GenreFilter`. A `rating` of 0 means "not rated".
- `src/data.ts` holds the sample books (`initialBooks`) that seed the app state.
- Components live in `src/components/<Name>/index.tsx` (`BookList`, `BookCard`, `Stats`).

## Conventions

- Each component is in `src/components/<Name>/index.tsx`, with a props type named `<Name>Props` and its test in `<Name>.test.tsx` next to it.
- State is never changed in place. Functions in `src/books.ts` return new arrays.
- Logic that is not UI goes in `src/books.ts` with tests in `src/books.test.ts`, not into components.
- create for every Component a folder, file with (`ComponentName`) and a (`ComponentName`).test.ts

## Off limits

- Do not add dependencies without asking.
- Do not edit `src/data.ts`.
- Never change a test to make it pass, unless the requirement changed.
