import Link from "next/link";

export default function Navbar() {
  return (
    <header className="agri-node-navbar">
      <div className="agri-node-navbar-inner">
        <Link href="/" className="agri-brand">
          <span className="agri-brand-mark" aria-hidden="true">
            ✦
          </span>
          <span className="agri-brand-copy">
            <span className="agri-brand-title">AgriNode</span>
            <span className="agri-brand-subtitle">Agri Waste Marketplace</span>
          </span>
        </Link>

        <nav className="agri-navbar-links">
          <Link href="/farmer" className="agri-navbar-link active">Dashboard</Link>
          <Link href="/farmer" className="agri-navbar-link">My Listings</Link>
          <Link href="/buyer" className="agri-navbar-link">Messages</Link>
          <Link href="/buyer" className="agri-navbar-link">Impact</Link>
        </nav>

        <div className="agri-user-toggle">
          <Link href="/farmer" className="agri-toggle-link active">Farmer</Link>
          <Link href="/buyer" className="agri-toggle-link">Buyer</Link>
        </div>
      </div>
    </header>
  );
}
