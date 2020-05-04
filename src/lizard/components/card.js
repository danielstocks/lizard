import React from "react";
import { suitSymbols } from "../deck";

export const Card = ({ value, disabled, suit, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        color: suit === "hearts" || suit === "diamonds" ? "red" : "black",
        padding: "10px",
        margin: "2px",
        background: "#fff",
        height: "75px",
        borderRadius: "3px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "1px 1px 12px #555",
        width: "50px",
        textAlign: "center",
        border: "1px solid #eee",
        fontFamily: "serif",
        ...(disabled && { opacity: 0.5  }),
      }}
    >
      <div>
        {suitSymbols[suit]}&nbsp;{value}
      </div>
    </div>
  );
};
