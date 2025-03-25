import React from "react";
import PropTypes from "prop-types";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children, showFooter = true, showNavbar = true, className }) => {
  return (
    <div className={` ${className}`}>
      {showNavbar && <Navbar />}
      <main className="flex-grow pt-16">{children}</main>
      {showFooter && <Footer />}
     </div>
  );
};


export default Layout;
