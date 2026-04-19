export function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="app-header-brand">
          <div className="app-logo" aria-hidden="true">
            <svg
              viewBox="0 0 40 40"
              width="36"
              height="36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="4"
                y="8"
                width="32"
                height="26"
                rx="4"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M14 8V6a2 2 0 012-2h8a2 2 0 012 2v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M12 18h16M12 24h10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        <nav className="app-header-nav" aria-label="Main">
          <button
            type="button"
            className="nav-tab nav-tab-active"
            aria-current="page"
          >
            Home
          </button>
        </nav>
      </div>
    </header>
  );
}
