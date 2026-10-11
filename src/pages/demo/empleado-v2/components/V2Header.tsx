import { useState, useRef, useEffect } from "react";
import { FONT_SCALE_OPTIONS, type FontScaleLevel } from "../FontScaleContext";

interface V2HeaderProps {
  lang: "en" | "es";
  onToggleLang: () => void;
  onBack: () => void;
  onLogout: () => void;
  employeeName: string | null;
  fontScaleIndex: FontScaleLevel;
  onFontScaleChange: (index: FontScaleLevel) => void;
}

export default function V2Header({ lang, onToggleLang, onBack, onLogout, employeeName, fontScaleIndex, onFontScaleChange }: V2HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #d9d2cf",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "10px 28px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 15,
            color: "#867b77",
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontWeight: 600,
          }}
        >
          <i className="ri-arrow-left-line" style={{ fontSize: 16 }}></i>
          {lang === "es" ? "Demo" : "Demo"}
        </button>
        <span style={{ color: "#d9d2cf", fontSize: 16 }}>|</span>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#8f0f48", letterSpacing: "0.03em" }}>Cogniflow</span>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          {/* Font size dropdown */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                border: dropdownOpen ? "2px solid #8f0f48" : "2px solid #8f0f48",
                borderRadius: 6,
                padding: "5px 12px",
                background: dropdownOpen ? "#8f0f48" : "#f3e8ee",
                color: dropdownOpen ? "#fff" : "#8f0f48",
                whiteSpace: "nowrap",
                transition: "0.15s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <i className="ri-font-size"></i>
              {lang === "es" ? "Tamaño de letra" : "Font size"}
              <i className={dropdownOpen ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} style={{ fontSize: 11 }}></i>
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  background: "#fff",
                  border: "1px solid #d9d2cf",
                  borderRadius: 8,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  overflow: "hidden",
                  zIndex: 50,
                  minWidth: 180,
                }}
              >
                {FONT_SCALE_OPTIONS.map((opt, idx) => {
                  const isActive = fontScaleIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        onFontScaleChange(idx as FontScaleLevel);
                        setDropdownOpen(false);
                      }}
                      style={{
                        fontFamily: "inherit",
                        fontWeight: isActive ? 700 : 500,
                        fontSize:
                          idx === 2 ? 16 : idx === 1 ? 14 : 12,
                        cursor: "pointer",
                        border: "none",
                        borderBottom: idx < FONT_SCALE_OPTIONS.length - 1 ? "1px solid #f0ece9" : "none",
                        padding: "10px 14px",
                        background: isActive ? "#faf5f7" : "transparent",
                        color: isActive ? "#b1005d" : "#5c514d",
                        whiteSpace: "nowrap",
                        textAlign: "left",
                        transition: "0.12s",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 22,
                          height: 22,
                          borderRadius: 4,
                          background: "#f5eeeb",
                          fontWeight: 800,
                          fontSize:
                            idx === 2 ? 16 : idx === 1 ? 14 : 12,
                          color: "#5c514d",
                          flexShrink: 0,
                        }}
                      >
                        {opt.label}
                      </span>
                      <span>{opt.title[lang]}</span>
                      {isActive && (
                        <i
                          className="ri-check-line"
                          style={{ marginLeft: "auto", color: "#b1005d", fontSize: 14 }}
                        ></i>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {employeeName && (
            <span style={{ fontSize: 14, color: "#867b77", fontWeight: 600 }}>
              {employeeName.split(" ")[0]}
            </span>
          )}
          <div
            style={{
              display: "flex",
              border: "1px solid #d9d2cf",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => lang !== "en" && onToggleLang()}
              style={{
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                padding: "5px 13px",
                background: lang === "en" ? "#8f0f48" : "none",
                color: lang === "en" ? "#fff" : "#867b77",
                transition: "0.15s",
              }}
            >
              EN
            </button>
            <button
              onClick={() => lang !== "es" && onToggleLang()}
              style={{
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                padding: "5px 13px",
                background: lang === "es" ? "#8f0f48" : "none",
                color: lang === "es" ? "#fff" : "#867b77",
                transition: "0.15s",
              }}
            >
              ES
            </button>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: "none",
              border: "1px solid #d9d2cf",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
              color: "#867b77",
              padding: "5px 10px",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontWeight: 600,
            }}
          >
            <i className="ri-logout-box-r-line" style={{ fontSize: 15 }}></i>
          </button>
        </div>
      </div>
    </header>
  );
}