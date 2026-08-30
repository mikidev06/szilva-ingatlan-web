import szilviaPhoto from "../assets/szilva-2.jpg";
import MapEmbed from "../components/MapEmbed";

const badges = [
  "Okleveles ingatlanközvetítő",
  "11+ év tapasztalat",
  "Helyi piacismeret",
  "Újépítésű projektek teljeskörű kezelése",
  "Hitelügyintézés"
];

const timeline = [
 {
    year: "2013",
    text: "Budapesti Gazdasági Egyetemen (BGE) diplomáztam közgazdászként.",
  },
  {
    year: "2014",
    text: "Elindítottam ingatlanközvetítői pályafutásomat.",
  },
  {
    year: "2024",
    text: "Már 300+ sikeres transzakciót bonyolítottam le és 1000+ megbízást kezeltem.",
  },
];

export default function About() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Bemutatkozás</span>
          <h1>Szilágyi Szilvia vagyok</h1>
          <p>Otthonteremtési szakértő, aki szívügyének tekinti, hogy ügyfelei a lehető legjobb döntést hozzák.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="agent-panel">
            <div className="agent-photo">
              <img src={szilviaPhoto} alt="Szilágyi Szilvia" />
            </div>
            <div>
              <span className="eyebrow">Rólam</span>
              <h2>Több mint egy ingatlanközvetítő</h2>
              <p>
                Hiszek abban, hogy egy ingatlan eladása nem csupán üzlet,
                hanem fontos életesemény. Célom, hogy
                ügyfeleim ezt a folyamatot nyugodtan, átláthatóan és
                bizalommal élhessék meg.
              </p>
              <p className="agent-quote">
                „Az ügyfeleim elégedettsége a sikerem titka.”
              </p>
              <p>
                11 éves tapasztalattal rendelkezem újépítésű projektek és ingatlanok közvetítésében,
                elsősorban Budapesten és környékén.
              </p>

              <div className="badge-row">
                {badges.map((badge) => (
                  <span className="badge-pill" key={badge}>
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Pályafutásom</span>
            <h2>Néhány mérföldkő</h2>
            <p>Néhány állomás a szakmai pályafutásomból.</p>
          </div>

          <div className="services-grid">
            {timeline.map((item) => (
              <div className="service-card" key={item.year}>
                <div className="service-icon">📌</div>
                <h3>{item.year}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Hol talál?</span>
            <h2>Irodám helyszíne</h2>
            <p>1013 Budapest, Krisztina körút 32.</p>
          </div>

          <MapEmbed
            title="Iroda helyszíne térképen"
            src="https://www.openstreetmap.org/export/embed.html?bbox=19.026869%2C47.4955247%2C19.034869%2C47.4995247&layer=mapnik&marker=47.4975247%2C19.0308690"
          />
          <div className="map-embed-link">
            <a
              href="https://www.openstreetmap.org/?mlat=47.4975247&mlon=19.0308690#map=17/47.4975247/19.0308690"
              target="_blank"
              rel="noopener noreferrer"
            >
              Nagyobb térkép megnyitása
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
