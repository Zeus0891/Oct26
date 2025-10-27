# Projects Module Utils

Pure utility helpers for the Projects feature.

Rules:
- Keep utilities side-effect free (no DB calls or network I/O).
- Do not duplicate logic from `src/shared/utils`; import and compose instead.
- Use for data mapping, formatting, or small calculations only.
