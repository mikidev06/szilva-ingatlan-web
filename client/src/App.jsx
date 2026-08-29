import { Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
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
        <Route path="/rolam" element={<About />} />
        <Route path="/kapcsolat" element={<Contact />} />
      </Route>
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
