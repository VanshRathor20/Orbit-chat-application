import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { LuX } from "react-icons/lu";
import { Avatar } from "@chakra-ui/react";

const ImagePreviewModal = ({ src, name, isOpen, onClose }) => {
  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation(); // Intercept Esc key and stop propagation
        onClose();
      }
    };

    // Use capture phase to intercept the Escape key before parent listeners (e.g. chat deselection) handle it
    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  const isCustomPic = src && src !== "backend/Models/userProfileIcon.png";

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose} // Clicking anywhere on backdrop closes the modal
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Modal Container */}
      <div
        style={{
          position: "relative",
          maxHeight: "85vh",
          maxWidth: "85vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()} // Click on the image container doesn't close the modal
      >
        {isCustomPic ? (
          <img
            src={src}
            alt="Preview"
            style={{
              maxHeight: "85vh",
              maxWidth: "85vw",
              objectFit: "contain",
              borderRadius: "var(--glass-radius-sm)",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.6)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          />
        ) : (
          <Avatar.Root
            style={{
              width: "min(60vh, 60vw)",
              height: "min(60vh, 60vw)",
              borderRadius: "50%",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.6)",
              border: "2px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <Avatar.Fallback 
              name={name}
              style={{
                fontSize: "min(18vh, 18vw)",
                fontWeight: "bold",
                color: "#ffffff",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                background: "var(--accent-gradient)",
              }}
            />
          </Avatar.Root>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "-48px",
            right: 0,
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            cursor: "pointer",
            transition: "all 0.2s ease",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.transform = "scale(1)";
          }}
          aria-label="Close image preview"
        >
          <LuX size={20} />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default ImagePreviewModal;
