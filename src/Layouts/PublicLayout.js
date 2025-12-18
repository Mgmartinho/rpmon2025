import Header2 from "../components/Header/header2.js";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <>
      <Header2 />
      <main className="flex-fill">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default PublicLayout;