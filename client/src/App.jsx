import { Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Booking from "./pages/Booking";
import Privacy from "./pages/Privacy";
import Admin from "./pages/Admin";

function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
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
      </Route>
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
