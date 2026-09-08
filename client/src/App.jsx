import { lazy, Suspense } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";

// A kezdolap a fo csomagban marad (ide erkezik a latogatok tobbsege), a tobbi
// oldal viszont csak akkor toltodik le, amikor tenylegesen odanavigalnak.
// Az admin feluletet (urlap + kepfeltolto + Vercel Blob kliens) igy a
// nyilvanos latogatok soha nem toltik le.
const Listings = lazy(() => import("./pages/Listings"));
const ListingDetail = lazy(() => import("./pages/ListingDetail"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Booking = lazy(() => import("./pages/Booking"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageFallback() {
  return <div className="loading-state">Betöltés…</div>;
}

function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/ingatlanok" element={<Listings />} />
        <Route path="/ingatlanok/:id" element={<ListingDetail />} />
        <Route path="/projektek" element={<Projects />} />
        <Route path="/projektek/:id" element={<ProjectDetail />} />
        <Route path="/rolam" element={<About />} />
        <Route path="/idopontfoglalas" element={<Booking />} />
        <Route path="/kapcsolat" element={<Contact />} />
        <Route path="/adatvedelem" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route
        path="/admin"
        element={
          <Suspense fallback={<PageFallback />}>
            <Admin />
          </Suspense>
        }
      />
    </Routes>
  );
}
