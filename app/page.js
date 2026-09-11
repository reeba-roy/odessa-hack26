import Link from "next/link";

export default function Home() {
  return (
    <main className="agri-node-home">
      <section className="agri-home-card">
        <div className="agri-home-content">
          <div className="agri-kicker">AgriNode</div>
          <h1 className="agri-home-title">Welcome to AgriNode</h1>
          <h2 className="agri-home-subtitle">Turn your agri-waste into opportunity.</h2>
          <p className="agri-home-copy">
            List your surplus, connect with nearby buyers, and give agricultural waste a second life.
          </p>

          <div className="agri-home-cta">
            <Link href="/farmer" className="agri-primary-button">
              Continue as Farmer
            </Link>
            <Link href="/buyer" className="agri-secondary-button">
              Continue as Buyer
            </Link>
          </div>
        </div>

        <div className="agri-home-image">
          <div className="agri-image-card">
            <span className="agri-image-card-tag">Regenerative marketplace</span>
            <span className="agri-image-card-text">Field networks · Circular sourcing</span>
          </div>
        </div>
      </section>
    </main>
  );
}
