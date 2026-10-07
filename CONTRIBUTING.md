# Contributing to Commitchi

Thank you for helping improve Commitchi. Keep changes small, explain the user-facing effect, and preserve the pet's state guarantees.

## Before opening a change

Run the complete test suite:

```sh
npm test
```

For changes to the renderer or update flow, also inspect the result with:

```sh
npm run preview
```

The project intentionally keeps runtime dependencies at zero. Do not add a package for a task that can use the Node.js standard library or an existing project utility.

## State and data rules

- Keep the UTC date basis and the public-only contribution default.
- Preserve existing ledger, state, and rendered assets when GitHub returns an error or incomplete data.
- Keep the seven-day overlap on incremental updates unless the change includes a documented correction strategy.
- Treat the profile repository exclusion as part of the contribution source definition.
- Do not place tokens or deploy keys in source files, SVG URLs, commits, or issue reports.

If a rule must change, update the engine tests and both README guides in the same change.

## Issues and pull requests

Use the bug report template for reproducible failures. Include the command, expected result, actual result, and the smallest safe reproduction. Remove credentials and private repository names from logs before posting them.

Describe the behavior change and its validation in a pull request. Run `npm test` before requesting review. Generated SVG changes should include the state or rendering input that produced them; never include a GitHub token.

## Asset contributions

Keep the pixel sprite original and preserve its transparent background. Do not add copied characters, logos, watermarks, or trademarked layouts. If an asset was generated with assistance, state that in the change description and keep the source prompt or provenance note where appropriate.
