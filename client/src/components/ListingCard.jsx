import { Link } from "react-router-dom";
import { formatPrice, formatPriceRange, formatSizeRange } from "../api";

export default function ListingCard({ listing, basePath = "/ingatlanok" }) {
  const coverImage = listing.images?.[0];
  const isProject = listing.kind === "projekt";

  return (
    <Link to={`${basePath}/${listing._id}`} className="listing-card">
      <div className="listing-media">
        {coverImage ? (
          <img src={coverImage} alt={listing.title} loading="lazy" />
        ) : (
          <div className="listing-media-empty">📷</div>
        )}
      </div>
      <div className="listing-body">
        <div className="listing-price">
          {isProject
            ? formatPriceRange(listing.priceMin, listing.priceMax)
            : formatPrice(listing.price)}
        </div>
        <h3 className="listing-title">{listing.title}</h3>
        <div className="listing-location">
          {listing.city}
          {listing.address ? `, ${listing.address}` : ""}
        </div>
        <div className="listing-meta">
          <span>📐 {isProject ? formatSizeRange(listing.sizeMin, listing.sizeMax) : `${listing.size} m²`}</span>
          <span>🛏 {listing.rooms} szoba</span>
          <span>🏷 {listing.category}</span>
        </div>
      </div>
    </Link>
  );
}
