import React from "react";
import { createComponentWithProxy } from 'react-fela'
import { suitSymbols } from "../core/deck";

const Div = createComponentWithProxy({}, 'div')

const transition = "200ms cubic-bezier(0.23, 1, 0.32, 1) 0s";

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

export const Card = ({ value, disabled, playable = false, suit, onClick }) => {
  return (
    <Div
      onClick={onClick}
      extend={{
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
        ...(!disabled &&
          playable && {
            transition: `transform ${transition}, box-shadow ${transition}`,
            ":hover": {
              cursor: "pointer",
              transform: "translateY(-8px) scale(1.02)",
              boxShadow: "1px 1px 16px #555",
            },
          }),
      }}
    >
      <div style={{ fontSize: "40px" }}>{displayValue(suit, value)}</div>
      <div>{suitSymbols[suit]}</div>
    </Div>
  );
};
