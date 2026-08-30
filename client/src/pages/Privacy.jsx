export default function Privacy() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Jogi tájékoztató</span>
          <h1>Adatvédelmi tájékoztató</h1>
          <p>Utolsó frissítés: 2026. augusztus</p>
        </div>
      </div>

      <section className="section">
        <div className="container legal-content">
          <h2>1. Az adatkezelő</h2>
          <p>
            Az adatkezelő: Szilágyi Szilvia (Szilva Ingatlan Kft.), 1013
            Budapest, Krisztina körút 32. E-mail:{" "}
            <a href="mailto:szilagyi.szilva@otpip.hu">szilagyi.szilva@otpip.hu</a>,
            telefon: <a href="tel:+36305059660">+36 30 505 9660</a>.
          </p>

          <h2>2. Milyen adatokat kezelünk</h2>
          <p>A weboldal az alábbi esetekben kér Öntől személyes adatot:</p>
          <ul>
            <li>
              <strong>Kapcsolatfelvételi űrlap:</strong> név, e-mail cím,
              telefonszám (opcionális), az üzenet szövege.
            </li>
            <li>
              <strong>Időpontfoglalás:</strong> név, e-mail cím, telefonszám
              (opcionális), a választott szolgáltatás típusa, a foglalás
              dátuma és időpontja, valamint az esetleges megjegyzés.
            </li>
          </ul>
          <p>
            A weboldal nem használ nyomkövető (analitikai, hirdetési)
            sütiket. A böngésző helyi tárolójában (localStorage) kizárólag a
            világos/sötét téma beállítása kerül eltárolásra, ami sosem kerül
            elküldésre a szerver felé.
          </p>

          <h2>3. Az adatkezelés célja és jogalapja</h2>
          <p>
            Adatait kizárólag a megkeresés megválaszolása, illetve az
            időpontfoglalás lebonyolítása és az azzal kapcsolatos
            kapcsolattartás céljából kezeljük. Az adatkezelés jogalapja az Ön
            önkéntes hozzájárulása, amelyet az űrlap kitöltésével és
            elküldésével ad meg.
          </p>

          <h2>4. Kik férnek hozzá az adatokhoz</h2>
          <p>Az Ön adatait az alábbi szolgáltatók kezelik technikai közreműködőként:</p>
          <ul>
            <li>
              <strong>MongoDB Atlas</strong> – az adatok tárolására szolgáló
              adatbázis-szolgáltató.
            </li>
            <li>
              <strong>Vercel Inc.</strong> – a weboldal és a háttérrendszer
              üzemeltetője (hosting).
            </li>
            <li>
              <strong>ntfy.sh</strong> – új üzenetről/foglalásról szóló push
              értesítés továbbítására, hogy Szilvia mielőbb értesüljön róla.
            </li>
            <li>
              <strong>Google Naptár</strong> – amennyiben aktív az
              összekapcsolás, az időpontfoglalás adatai (név, elérhetőség,
              szolgáltatás típusa, időpont) bekerülnek Szilvia Google
              Naptárába, kizárólag az időpont-egyeztetés megkönnyítése
              céljából.
            </li>
          </ul>
          <p>
            Adatait harmadik félnek reklám vagy egyéb, a fentiektől eltérő
            célból nem adjuk át, és nem értékesítjük.
          </p>

          <h2>5. Az adatkezelés időtartama</h2>
          <p>
            Adatait a megkeresés, illetve az időpontfoglalás lezárásáig, az
            azzal kapcsolatos kapcsolattartás időtartamáig kezeljük, ezt
            követően – ha jogszabály eltérően nem rendelkezik – töröljük,
            vagy az Ön kérésére korábban is töröljük.
          </p>

          <h2>6. Az Ön jogai</h2>
          <p>
            Bármikor kérheti a kezelt adatai másolatát, azok helyesbítését
            vagy törlését, illetve tiltakozhat az adatkezelés ellen. Kérését
            a fenti e-mail címen vagy telefonszámon jelezheti, amit
            legkésőbb 30 napon belül megválaszolunk. Amennyiben úgy érzi,
            hogy adatkezelési jogait megsértettük, panasszal élhet a Nemzeti
            Adatvédelmi és Információszabadság Hatóságnál (NAIH,{" "}
            <a href="https://www.naih.hu" target="_blank" rel="noopener noreferrer">
              www.naih.hu
            </a>
            ).
          </p>
        </div>
      </section>
    </>
  );
}
