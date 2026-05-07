import React from "react";
import "./Navigation.css";

const NavOverlay = ({ isOpen, onClose }) => {
  const menuItems = [
    { id: "01", label: "EXPERIENCE", link: "top" },
    { id: "02", label: "MUSIC", link: "main-content" },
    { id: "03", label: "ARCHIVE", link: "logo-section" },
    { id: "04", label: "CONTACT", link: "parallax-footer" },
  ];

  const handleNavClick = (link) => {
    onClose();
    if (link === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.getElementById(link) || document.querySelector(`.${link}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className={`nav-overlay ${isOpen ? "open" : ""}`}>
      <button className="nav-close" onClick={onClose}>
        [ CLOSE_SYSTEM ]
      </button>
      
      <nav className="nav-menu">
        {menuItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.link}`}
            className="nav-item"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(item.link);
            }}
          >
            <span className="nav-number">[{item.id}]</span>
            <span className="nav-label">{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
};

export default NavOverlay;
