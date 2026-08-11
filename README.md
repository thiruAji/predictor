# Sequence Analyzer

## Run locally

```powershell
npm install
npm run dev
```

Open the localhost URL shown by Vite, normally http://localhost:5173.

## DATA
Four independent columns. Each column has unlimited rows. Every entry is 3 digits, each digit 1–6. Completing the third digit automatically creates the next blank row in that same column.

## ANALYZE
Each ANALYZE column is searched independently. If you enter 15 rows in ANALYZE Column 1, the app searches those 15 entries as one exact sequence against every DATA Column 1–4.

For every match it shows:
- ANALYZE column
- DATA column
- DATA starting and ending rows
- the historical following entry
- the following entry's total
- frequency of all historical following values
