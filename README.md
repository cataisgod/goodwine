# Goodwine — landing page

Site static construit cu [Astro](https://astro.build), CSS simplu și un singur script vanilla TypeScript pentru interacțiuni.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # generează ./dist (site static, se poate pune pe orice hosting)
```

## Unde se editează

| Ce | Fișier |
|---|---|
| Texte, vinuri, colecție, recenzii, FAQ, contact | `src/data/site.json` |
| Culori, tipografie, spacing, layout | `src/styles/global.css` (tokenurile sunt în `:root`) |
| Secțiuni (markup) | `src/components/*.astro` |
| Animații, carusel, FAQ, meniu, formular | `src/scripts/main.ts` |
| Logo și sticle | `public/logo`, `public/bottles` |

## De făcut înainte de lansare

- Formularul de rezervare simulează trimiterea (`TODO` în `src/scripts/main.ts`): conectați-l la un endpoint real (email / CRM / Google Sheets).
- Fotografiile de ambianță vin de pe Unsplash (`src/lib/unsplash.ts`); descărcați-le și serviți-le local, optimizate.
- Sticlele din `public/bottles` sunt de la alte branduri, doar ca exemplu.
- Confirmați telefonul și emailul reale în `site.json` (în prototip link-urile nu corespundeau textului afișat).
