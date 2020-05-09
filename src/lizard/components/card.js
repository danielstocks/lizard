import React from "react";
import { suitSymbols } from "../deck";

function displayValue(suit, value) {
  if (suit === "lizard") {
    return "L";
  }
  if (suit === "snake") {
    return "S";
  }
  return value;
}

function getSuitColor(suit) {
  if (suit === "hearts" || suit == "diamonds") {
    return "red";
  }
  if (suit === "lizard") {
    return "darkgoldenrod";
  }
  if (suit === "snake") {
    return "darkolivegreen";
  }
  return "black";
}

export const Card = ({ value, disabled, suit, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        color: getSuitColor(suit),
        padding: "12px",
        margin: "2px",
        background: "#fff",
        height: "90px",
        borderRadius: "3px",
        display: "flex",
        textAlign: "center",
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center",
        lineHeight: "40px",
        boxShadow: "1px 1px 12px #555",
        width: "60px",
        fontSize: "40px",
        border: "1px solid #eee",
        fontFamily: "serif",
        ...(disabled && { opacity: 0.5 }),
      }}
    >
      <div style={{ fontSize: "40px" }}>{displayValue(suit, value)}</div>
      <div>{suitSymbols[suit]}</div>
    </div>
  );
};
