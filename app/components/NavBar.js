"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconButton } from "./Icons";

const USER_KEY = "mc_user_v1";

function readUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function NavBar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUser(readUser());
    const onChange = () => setUser(readUser());
    window.addEventListener("mc-auth-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("mc-auth-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  function logOut() {
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event("mc-auth-changed"));
    setMenuOpen(false);
    router.push("/");
  }

  // Oct 15 Figma review: no text links or "+ Create" button in the header
  // (the section tiles and Next Step box cover them), no Log in button
  // (redundant with the log-in icon), and the icon set is grouped 3 · 2 · 1:
  //   Info, Dashboards, Settings | Download PDF, Print | Log in / user
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Oct 19 Figma: new logo — calendar mark, "calendarGold.com",
            "and much more ..." underneath; icons on the same line, the whole
            header aligned with the page body. */}
        <a href="/" className="brand brand-v2" aria-label="calendarGold.com and much more — Home">
          <svg className="brand-cal" width="38" height="38" viewBox="0 0 40 40" aria-hidden="true">
            <rect x="3" y="7" width="34" height="30" rx="5" fill="#fff" stroke="#c9922f" strokeWidth="2.4" />
            <rect x="3" y="7" width="34" height="8" rx="4" fill="#e8a93a" />
            <path d="M12 3.5v7M28 3.5v7" stroke="#8a5a12" strokeWidth="2.6" strokeLinecap="round" />
            {[0, 1, 2, 3].map((c) => [0, 1, 2].map((r) => (
              <rect key={`${c}-${r}`} x={7.5 + c * 7} y={18.5 + r * 5.6} width="4.6" height="3.6" rx="0.8"
                fill={c === 2 && r === 1 ? "#e8a93a" : "#d8d8d8"} />
            )))}
          </svg>
          <span className="brand-text">
            <span className="brand-word">calendar<b>Gold</b><small>.com</small></span>
            <span className="brand-more">and much more ...</span>
          </span>
        </a>

        <div className="nav-links nav-icon-groups">
          <span className="nav-icon-group">
            <IconButton name="info" href="/info" />
            <IconButton name="dashboards" href={user ? "/dashboards" : "/login"} />
            <IconButton name="settings" href={user ? "/profile" : "/login"} />
          </span>
          <span className="nav-icon-group">
            <IconButton name="pdf" onClick={() => window.print()} />
            <IconButton name="print" onClick={() => window.print()} />
          </span>
          <span className="nav-icon-group">
            {user ? (
              <span className="nav-user-menu">
                <button
                  type="button"
                  className="nav-avatar"
                  data-tip={`Logged in — ${user.name}`}
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  {initials(user.name)}
                </button>
                {menuOpen && (
                  <div className="nav-user-dropdown">
                    <div className="nav-user-name">{user.name}</div>
                    <div className="nav-user-id">{user.identifier}</div>
                    <a href="/dashboards" onClick={() => setMenuOpen(false)}>Dashboards</a>
                    <a href="/profile" onClick={() => setMenuOpen(false)}>Profile</a>
                    <button type="button" onClick={logOut}>Log out</button>
                  </div>
                )}
              </span>
            ) : (
              <IconButton name="login" href="/login" />
            )}
          </span>
        </div>
      </div>
    </nav>
  );
}
