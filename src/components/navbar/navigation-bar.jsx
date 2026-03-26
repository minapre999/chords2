import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./navigation-bar.css"

// NavigationBar.jsx
export default function NavigationBar({ currentPage, setPage }) {
  return (
   <nav className="navbar app-nav px-2">
  <ul className="navbar-nav">
    <li className="nav-item">
      <button className="nav-btn" onClick={() => setPage("chords")}>
        Chords
      </button>
    </li>
    <li className="nav-item">
      <button className="nav-btn" onClick={() => setPage("scales")}>
        Scales
      </button>
    </li>
    <li className="nav-item">
      <button className="nav-btn" onClick={() => setPage("settings")}>
        Settings
      </button>
    </li>
  </ul>
</nav>



  );
}
