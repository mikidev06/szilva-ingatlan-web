import { Link } from "react-router-dom";
import { formatPrice } from "../api";

export default function ListingCard({ listing }) {
  const coverImage = listing.images?.[0];

  return (
    <Link to={`/ingatlanok/${listing._id}`} className="listing-card">
      <div className="listing-media">
        {coverImage ? (
          <img src={coverImage} alt={listing.title} loading="lazy" />
        ) : (
          <div className="listing-media-empty">📷</div>
        )}
        <span className="listing-tag">{listing.type}</span>
      </div>
      <div className="listing-body">
        <div className="listing-price">
          {formatPrice(listing.price, listing.type)}
        </div>
        <h3 className="listing-title">{listing.title}</h3>
        <div className="listing-location">
          {listing.city}
          {listing.address ? `, ${listing.address}` : ""}
        </div>
        <div className="listing-meta">
          <span>📐 {listing.size} m²</span>
          <span>🛏 {listing.rooms} szoba</span>
          <span>🏷 {listing.category}</span>
        </div>
      </div>
    </Link>
  );
}
