import React, { useState, useEffect } from "react";
import "./Navigation.css";
import Textlogo from "../assets/images/logo-blanco-letra.png";

const Header = ({ onPowerOff }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoClick = (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <header className={`nav-header ${isVisible ? "visible" : "hidden"}`}>
      <div className="nav-logo">
        <button className="nav-btn" onClick={handleLogoClick}>
          <img src={Textlogo} alt="logo" />
        </button>
      </div>

      <div className="nav-btn-terminal">
        <button
          className="nav-btn"
          onClick={onPowerOff}
          title="System Shutdown"
        >
          ⏻
        </button>
      </div>
    </header>
  );
};

export default Header;
