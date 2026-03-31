import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./navigation-bar.css"


// NavigationBar.jsx
export default function NavigationBar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar app-nav px-2">
      <ul className="navbar-nav">

        <li className="nav-item">
          <button className="nav-btn" onClick={() => navigate("/")}>
            Home
          </button>
        </li>

        <li className="nav-item">
          <button className="nav-btn" onClick={() => navigate("/chords")}>
            Chords
          </button>
        </li>

        <li className="nav-item">
          <button className="nav-btn" onClick={() => navigate("/scales")}>
            Scales
          </button>
        </li>

        <li className="nav-item">
          <button className="nav-btn" onClick={() => navigate("/lead-sheet")}>
            Lead Sheet
          </button>
        </li>

        <li className="nav-item">
          <button className="nav-btn" onClick={() => navigate("/settings")}>
            Settings
          </button>
        </li>

      </ul>
    </nav>
  );
}

