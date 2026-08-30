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
2. Másold le a `.env.example` fájlt `.env` néven, és add meg benne a saját `MONGODB_URI`, `ADMIN_PASSWORD_HASH` és `JWT_SECRET` értékeket:

   ```
   cp .env.example .env
   ```

   `ADMIN_PASSWORD_HASH` a `/admin` oldal bejelentkezési jelszavának bcrypt hash-e (nem a sima jelszó!) - generáld a `npm run hash-password -- <a-jelszavad>` paranccsal, és az eredményt másold az `ADMIN_PASSWORD_HASH` értékeként. `JWT_SECRET` egy tetszőleges, hosszú, véletlenszerű karakterlánc legyen.

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

A `/admin` oldalon (pl. `http://localhost:5173/admin`) a `.env` fájlban beállított `ADMIN_PASSWORD_HASH`-nek megfelelő jelszóval lehet bejelentkezni. Bejelentkezés után az ingatlanok listázhatók, létrehozhatók, szerkeszthetők és törölhetők. A bejelentkezés egy JWT tokent ad, amit a böngésző `localStorage`-ban tárol 8 óráig.

Egy ingatlanhoz több fénykép is feltölthető közvetlenül a gépről. A képek [Vercel Blob](https://vercel.com/docs/vercel-blob)-ban tárolódnak, **közvetlenül a böngészőből** – nem a szerveren keresztül. Ennek oka, hogy a Vercel szerverless függvényeknek 4,5 MB-os kemény kérés-méret korlátjuk van (minden csomagon, ez nem konfigurálható), amit már 1-2 telefonos fénykép is simán túllépne. A böngésző a [`@vercel/blob/client`](https://vercel.com/docs/vercel-blob/client-upload) `upload()` függvényével tölti fel a fájlokat, a `POST /api/listings/blob-upload` végpont ([routes/listings.js](routes/listings.js)) csak egy rövid életű feltöltési tokent ad ki hozzá (az admin JWT-t ellenőrzi előtte). Ehhez a `.env` fájlban be kell állítani a `BLOB_READ_WRITE_TOKEN` értéket – lásd a "Telepítés Vercelre" szakaszt.

Feltöltés előtt a böngésző minden képet automatikusan átméretez (max. 1920 px a hosszabb oldalon, az arányok megtartásával) és JPEG-ként újratömörít ([client/src/imageCompression.js](client/src/imageCompression.js)). Ez egységesen kicsi, gyorsan betöltődő fényképeket eredményez a telefonról készült, gyakran több MB-os eredeti fotókból is, torzítás vagy vágás nélkül.

## Push értesítések (ntfy.sh)

Amikor valaki elküld egy kapcsolatfelvételi üzenetet vagy lefoglal egy időpontot, a szerver egy push értesítést küld az [ntfy.sh](https://ntfy.sh)-nak ([config/ntfy.js](config/ntfy.js)), hogy Szilvia azonnal értesüljön a telefonján – admin bejelentkezés vagy e-mail nélkül.

Beállítás:

1. Válassz egy egyedi, nehezen kitalálható témanevet (a `.env`-ben már van egy generált érték: `NTFY_TOPIC`). Az ntfy.sh témák alapból nyilvánosak – bárki, aki ismeri a nevet, fel tud rá iratkozni –, ezért fontos, hogy ne legyen könnyen kitalálható.
2. Töltsd le az [ntfy alkalmazást](https://ntfy.sh/#apps) (iOS/Android), vagy nyisd meg böngészőben a `https://ntfy.sh/<a te temaneved>` címet.
3. Iratkozz fel ugyanarra a témanévre, ami a `.env`/Vercel `NTFY_TOPIC` értékében szerepel.

Ha a `NTFY_TOPIC` nincs beállítva, az értesítés egyszerűen kimarad – az üzenet/foglalás mentése ettől függetlenül működik.

## Google Naptár szinkronizáció

Az időpontfoglalás rendszer opcionálisan kétirányban szinkronizálhat Szilvia Google Naptárával ([config/googleCalendar.js](config/googleCalendar.js)):

- **Kifelé:** minden weboldalon leadott foglalás automatikusan bekerül az ő Google Naptárába eseményként.
- **Befelé:** a foglalási oldal (naptár nézet + időpont-választó) figyelembe veszi az ő Google Naptárában szereplő, bármilyen okból foglalt időpontokat is – nemcsak a weboldalon keresztül érkezett foglalásokat –, és azokat is betelt/foglalt időpontként jeleníti meg.

Ha nincs beállítva vagy nincs összekapcsolva, a rendszer változatlanul, kizárólag a saját adatbázisával működik tovább – ez sosem akadályozza a foglalást.

### Beállítás (Google Cloud Console)

1. Hozz létre egy projektet a [Google Cloud Console](https://console.cloud.google.com/)-on (vagy használj egy meglévőt).
2. **APIs & Services → Library**: keresd meg és engedélyezd a **Google Calendar API**-t.
3. **APIs & Services → OAuth consent screen**: válaszd az **External** típust. Mivel csak Szilvia saját fiókja fog csatlakozni, nem szükséges Google-ellenőrzés – add hozzá az ő Google fiókjának e-mail címét a **Test users** listához, és így "Testing" állapotban is működni fog.
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - Authorized redirect URIs: add hozzá pontosan ezt: `https://szilva-ingatlan-web.vercel.app/api/google/callback`
   - A létrehozás után másold ki a **Client ID**-t és a **Client secret**-et.
5. Állítsd be a Vercel projekten (Settings → Environment Variables, vagy `vercel env add`) a következő változókat:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` = `https://szilva-ingatlan-web.vercel.app/api/google/callback`
6. Deploy után jelentkezz be a `/admin` felületre, nyisd meg az **Időpontfoglalások** fület, és kattints az **Összekapcsolás** gombra a "Google Naptár" dobozban – ez átirányít a Google beleegyezési képernyőjére. Elfogadás után a rendszer automatikusan visszairányít, és onnantól aktív a szinkronizáció.

A kapcsolat bármikor bontható a **Leválasztás** gombbal ugyanitt.

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

3. Állítsd be a projekt környezeti változóit a Vercel dashboardon (Settings → Environment Variables), vagy a CLI-vel: `MONGODB_URI`, `ADMIN_PASSWORD_HASH` (a `npm run hash-password -- <jelszo>` paranccsal generált hash, nem a sima jelszó), `JWT_SECRET`, `NTFY_TOPIC`, opcionálisan `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` (lásd a "Google Naptár szinkronizáció" szakaszt) (a `BLOB_READ_WRITE_TOKEN`-t az előző lépés automatikusan beállítja). `NODE_ENV` és `VERCEL` Vercelen automatikusan be van állítva, ezeket nem kell megadni.
4. Húzd le a változókat helyi fejlesztéshez, ha szükséges: `vercel env pull .env`.
5. Minden Git push a fő branch-re automatikusan újra deployol.

## Egyéb (nem Vercel) hosting

A szerver hagyományos, folyamatosan futó Node processzként is üzemeltethető (pl. VPS, Render, Railway) – ekkor viszont a képfeltöltéshez akkor is a Vercel Blob-ot használja a kód, tehát a `BLOB_READ_WRITE_TOKEN`-t ott is be kell állítani.

```
npm run build
NODE_ENV=production npm start
```

A `build` telepíti és lebuildeli a React alkalmazást a `client/dist` mappába. Ha ez a mappa létezik, a szerver `NODE_ENV=production` esetén automatikusan ki is szolgálja azt (statikus fájlok + kliensoldali route-ok fallback-je), tehát a backend és a frontend egyetlen szolgáltatásként, egy porton fut – külön frontend hosting nem szükséges.

Production módban a szerver induláskor ellenőrzi, hogy a kötelező környezeti változók (`MONGODB_URI`, `ADMIN_PASSWORD_HASH`, `JWT_SECRET`) be vannak-e állítva, és leáll, ha valamelyik hiányzik.

További production beállítások a `.env`-ben:

- `NODE_ENV=production` – bekapcsolja a fenti ellenőrzéseket, a statikus kiszolgálást, és a proxy mögötti (pl. terheléselosztó) IP-cím helyes kezelését.
- `CLIENT_ORIGIN` – ha a frontend külön domain-en/hostingon fut a backendtől, itt add meg a pontos URL-t (pl. `https://szilagyiszilvia.hu`), hogy a CORS csak onnan engedjen kéréseket. Ha a fenti egybeépített módot használod, nem szükséges beállítani.

A szerver ezen kívül tartalmaz:

- biztonsági HTTP fejléceket ([helmet](https://www.npmjs.com/package/helmet)),
- tömörítést (gzip),
- rate limitinget a bejelentkezésre (`/api/auth`) és a kapcsolatfelvételi űrlapra (`/api/messages`) a visszaélések ellen,
- egységes hibakezelő middleware-t, ami production módban nem szivárogtat ki technikai részleteket a válaszokban.

## API végpontok

- `GET /api/listings` – összes ingatlan és projekt; `?kind=ingatlan` vagy `?kind=projekt` a szűkítéshez
- `GET /api/listings/:id` – egy ingatlan vagy projekt
- `POST /api/listings` – új ingatlan/projekt létrehozása (admin, `Authorization: Bearer <token>`, a `kind` mezővel dől el melyik)
- `PUT /api/listings/:id` – ingatlan/projekt módosítása (admin)
- `DELETE /api/listings/:id` – ingatlan/projekt törlése (admin)
- `POST /api/messages` – kapcsolatfelvételi üzenet mentése
- `GET /api/messages` – összes üzenet listázása (admin)
- `DELETE /api/messages/:id` – üzenet törlése (admin)
- `GET /api/appointments/availability?date=YYYY-MM-DD` – foglalt/szabad időpontok egy napra (a saját adatbázis + összekapcsolt Google Naptár alapján)
- `GET /api/appointments/full-days?year=YYYY&month=MM` – adott hónapban teljesen betelt napok
- `POST /api/appointments` – időpontfoglalás létrehozása
- `GET /api/appointments` – összes foglalás listázása (admin)
- `DELETE /api/appointments/:id` – foglalás lemondása (admin)
- `GET /api/google/auth-url` – Google OAuth beleegyezési link (admin)
- `GET /api/google/callback` – Google OAuth callback (a Google hívja meg, nem közvetlen használatra)
- `GET /api/google/status` – Google Naptár kapcsolat állapota (admin)
- `DELETE /api/google/disconnect` – Google Naptár kapcsolat törlése (admin)
- `POST /api/auth/login` – admin bejelentkezés jelszóval, JWT tokent ad vissza
- `GET /api/auth/verify` – token érvényességének ellenőrzése
- `GET /api/health` – állapotellenőrzés
