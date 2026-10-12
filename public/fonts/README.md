# Self-hosted fonts

The active BuildBudget interface uses Manrope normal Latin weights 400, 500, 600, 700, and 800. Each WOFF2 file is registered in `src/app/fonts.css` with `font-display: swap`; the SIL Open Font License is in `Manrope-LICENSE.txt`.

`public/brand-logo.svg` uses outlined DejaVu Sans Bold lettering, so the logo has no browser font dependency.

The older Lato and Libre Caslon Text assets and licenses remain in this directory for historical compatibility; they are not registered by the active stylesheet. Those assets came from @fontsource/lato 5.2.7 and @fontsource/libre-caslon-text 5.3.0 using npm pack with normal integrity and TLS verification.
