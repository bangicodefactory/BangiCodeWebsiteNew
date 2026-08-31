"use client"

import { useState } from "react"

const WhatsAppWidget = ({
  phoneNumber = "+212664571370",
  message = "Hello! I'm interested in your services.",
  supportName = "Support Team",
  supportTitle = "Customer Support",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleWhatsAppClick = () => {
    const formattedNumber = phoneNumber.replace(/\D/g, "")
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`
    window.open(whatsappUrl, "_blank")
    setIsOpen(false)
  }

  const containerStyle = {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    zIndex: 1000,
  }

  const widgetStyle = {
    width: "320px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
    marginBottom: "16px",
    overflow: "hidden",
  }

  const headerStyle = {
    backgroundColor: "#25D366",
    color: "white",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }

  const buttonStyle = {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    backgroundColor: "#25D366",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }

  return (
    <div style={containerStyle} className={className}>
      {/* Chat Widget */}
      {isOpen && (
        <div style={widgetStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg viewBox="0 0 24 24" style={{ width: "24px", height: "24px", fill: "#25D366" }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: "600" }}>{supportName}</div>
                <div style={{ fontSize: "14px", opacity: 0.9 }}>{supportTitle}</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "20px",
                padding: "4px",
              }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: "16px" }}>
            <div
              style={{
                backgroundColor: "#f1f1f1",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "16px",
              }}
            >
              <p style={{ margin: 0, fontSize: "14px", color: "#333" }}>
                Hi there! 👋<br />
                How can we help you today?
              </p>
            </div>
            <button
              onClick={handleWhatsAppClick}
              style={{
                width: "100%",
                backgroundColor: "#25D366",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "12px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              Start Chat
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={buttonStyle}
        aria-label="Open WhatsApp chat"
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)"
          e.target.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.25)"
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)"
          e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)"
        }}
      >
        <svg viewBox="0 0 24 24" style={{ width: "32px", height: "32px", fill: "white" }}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
        </svg>
      </button>
    </div>
  )
}

export default WhatsAppWidget
