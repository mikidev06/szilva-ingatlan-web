# Szilágyi Szilvia – Ingatlanos weboldal

Szilágyi Szilvia ingatlanközvetítő weboldala, MERN stack-re épülve (MongoDB Atlas, Express, React, Node.js).

## Projekt szerkezet

```
/                   -> Express szerver (server.js), MongoDB modellek és route-ok
/api                -> Vercel szerverless belépési pont (a server.js Express appot exportálja)
/client             -> React (Vite) frontend
vercel.json         -> Vercel build/routing konfiguráció
```

## Beállítás

1. Hozz létre egy MongoDB Atlas clustert, és másold ki a kapcsolati stringet.
2. Másold le a `.env.example` fájlt `.env` néven, és add meg benne a saját `MONGODB_URI`, `ADMIN_PASSWORD` és `JWT_SECRET` értékeket:

   ```
   cp .env.example .env
   ```

   `ADMIN_PASSWORD` a `/admin` oldal bejelentkezési jelszava, `JWT_SECRET` egy tetszőleges, hosszú, véletlenszerű karakterlánc legyen.

3. Telepítsd a backend függőségeket a gyökérben, majd a frontend függőségeket a `client` mappában:

   ```
   npm install
   npm install --prefix client
   ```

4. (Opcionális, csak helyi fejlesztéshez) Töltsd fel az adatbázist minta ingatlanokkal:

   ```
   npm run seed
   ```

   ⚠️ Ez törli az összes meglévő ingatlant az adatbázisban, amire a `MONGODB_URI` mutat. Éles adatbázison **soha** ne futtasd – a `/admin` felületen add hozzá a valódi ingatlanokat.

5. Indítsd el egyszerre a szervert és a klienst fejlesztői módban:

   ```
   npm run dev
   ```

   A frontend a `http://localhost:5173`, a backend a `http://localhost:5000` címen fut. A Vite dev szerver proxyzza az `/api` kéréseket a backend felé.

## Admin felület

A `/admin` oldalon (pl. `http://localhost:5173/admin`) a `.env` fájlban beállított `ADMIN_PASSWORD` jelszóval lehet bejelentkezni. Bejelentkezés után az ingatlanok listázhatók, létrehozhatók, szerkeszthetők és törölhetők. A bejelentkezés egy JWT tokent ad, amit a böngésző `localStorage`-ban tárol 8 óráig.

Egy ingatlanhoz több fénykép is feltölthető közvetlenül a gépről (max. 12 db, egyenként 5 MB-ig). A feltöltött képek [Vercel Blob](https://vercel.com/docs/vercel-blob)-ban tárolódnak (lásd [config/blob.js](config/blob.js)), ehhez a `.env` fájlban be kell állítani a `BLOB_READ_WRITE_TOKEN` értéket – lásd a "Telepítés Vercelre" szakaszt.

## Cache

A `GET /api/listings` és `GET /api/listings/:id` végpontok egy egyszerű, folyamaton belüli (in-memory) TTL cache-ben tárolják a válaszokat (60, illetve 300 másodpercig), létrehozáskor/módosításkor/törléskor pedig a szerver automatikusan érvényteleníti az érintett bejegyzéseket. Lásd [config/cache.js](config/cache.js).

Ehhez **nincs szükség külön szolgáltatásra** (pl. Redis-re) – a cache a Node folyamaton belül, memóriában fut, telepítés vagy beállítás nélkül működik. Hagyományos, folyamatosan futó szerver esetén ez jól működik. Vercel szerverless függvényként futtatva viszont minden hideg indítás (cold start) üres cache-sel kezd, és egyszerre több példány is futhat egymástól függetlenül – ilyenkor a cache inkább csak alkalmankénti bónusz, mint megbízható gyorsítótár, de hibát nem okoz, legrosszabb esetben egyszerűen minden kérés a MongoDB-t éri el.

## Telepítés Vercelre

A projekt Vercelre van konfigurálva ([vercel.json](vercel.json)): a React kliens statikus buildként, a backend pedig egyetlen szerverless függvényként fut ([api/index.js](api/index.js), ami az Express `app`-ot exportálja a [server.js](server.js)-ből).

1. Kösd össze a GitHub repót egy Vercel projekttel (`vercel link`, vagy a Vercel dashboardon "Import Project").
2. Hozz létre egy Blob store-ot a projekthez, és állítsd be a `BLOB_READ_WRITE_TOKEN` környezeti változót (ez a fényképfeltöltéshez kell):

   ```
   vercel blob create-store szilvia-ingatlan-images --access public
   ```

3. Állítsd be a projekt környezeti változóit a Vercel dashboardon (Settings → Environment Variables), vagy a CLI-vel: `MONGODB_URI`, `ADMIN_PASSWORD`, `JWT_SECRET` (a `BLOB_READ_WRITE_TOKEN`-t az előző lépés automatikusan beállítja). `NODE_ENV` és `VERCEL` Vercelen automatikusan be van állítva, ezeket nem kell megadni.
4. Húzd le a változókat helyi fejlesztéshez, ha szükséges: `vercel env pull .env`.
5. Minden Git push a fő branch-re automatikusan újra deployol.

## Egyéb (nem Vercel) hosting

A szerver hagyományos, folyamatosan futó Node processzként is üzemeltethető (pl. VPS, Render, Railway) – ekkor viszont a képfeltöltéshez akkor is a Vercel Blob-ot használja a kód, tehát a `BLOB_READ_WRITE_TOKEN`-t ott is be kell állítani.

```
npm run build
NODE_ENV=production npm start
```

A `build` telepíti és lebuildeli a React alkalmazást a `client/dist` mappába. Ha ez a mappa létezik, a szerver `NODE_ENV=production` esetén automatikusan ki is szolgálja azt (statikus fájlok + kliensoldali route-ok fallback-je), tehát a backend és a frontend egyetlen szolgáltatásként, egy porton fut – külön frontend hosting nem szükséges.

Production módban a szerver induláskor ellenőrzi, hogy a kötelező környezeti változók (`MONGODB_URI`, `ADMIN_PASSWORD`, `JWT_SECRET`) be vannak-e állítva, és leáll, ha valamelyik hiányzik.

További production beállítások a `.env`-ben:

- `NODE_ENV=production` – bekapcsolja a fenti ellenőrzéseket, a statikus kiszolgálást, és a proxy mögötti (pl. terheléselosztó) IP-cím helyes kezelését.
- `CLIENT_ORIGIN` – ha a frontend külön domain-en/hostingon fut a backendtől, itt add meg a pontos URL-t (pl. `https://szilagyiszilvia.hu`), hogy a CORS csak onnan engedjen kéréseket. Ha a fenti egybeépített módot használod, nem szükséges beállítani.

A szerver ezen kívül tartalmaz:

- biztonsági HTTP fejléceket ([helmet](https://www.npmjs.com/package/helmet)),
- tömörítést (gzip),
- rate limitinget a bejelentkezésre (`/api/auth`) és a kapcsolatfelvételi űrlapra (`/api/messages`) a visszaélések ellen,
- egységes hibakezelő middleware-t, ami production módban nem szivárogtat ki technikai részleteket a válaszokban.

## API végpontok

- `GET /api/listings` – összes ingatlan
- `GET /api/listings/:id` – egy ingatlan
- `POST /api/listings` – új ingatlan létrehozása (admin, `Authorization: Bearer <token>`)
- `PUT /api/listings/:id` – ingatlan módosítása (admin)
- `DELETE /api/listings/:id` – ingatlan törlése (admin)
- `POST /api/messages` – kapcsolatfelvételi üzenet mentése
- `POST /api/auth/login` – admin bejelentkezés jelszóval, JWT tokent ad vissza
- `GET /api/auth/verify` – token érvényességének ellenőrzése
- `GET /api/health` – állapotellenőrzés
