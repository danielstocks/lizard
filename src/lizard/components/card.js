import React from "react";
import { createComponentWithProxy } from "react-fela";
import { Transition } from "react-transition-group";
import { suitSymbols } from "../core/deck";

const Div = createComponentWithProxy({}, "div");

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

export const CARD_WIDTH = 105;

export const Card = ({
  faceDown,
  value,
  disabled,
  playable = false,
  suit,
  onClick,
}) => {
  return (
    <Transition in={faceDown} timeout={1000}>
      {(state) => {
        let rotation = (function () {
          if (state == "entering") {
            return "180deg";
          }
          if (state == "entered") {
            return "180deg";
          }
          if (state == "exiting") {
            return "360deg";
          }
          if (state == "exited") {
            return "360deg";
          }
        })();

        return (
          <Div
            onClick={onClick}
            extend={{
              fontFamily: "serif",
            }}
          >
            <Div
              extend={{
                height: "150px",
                width: "105px",
                position: "relative",
                perspective: "30rem",
              }}
            >
              <Div
                extend={{
                  border: "1px solid #aaa",
                  borderRadius: "6px",
                  height: "150px",
                  width: CARD_WIDTH + "px",
                  lineHeight: "32px",
                  boxShadow: "0px 0px 1px rgba(100,100,100,0.3)",
                  zIndex: "2",
                  boxSizing: "border-box",
                  transition: "transform 1s",
                  transform: `rotateY(${rotation})`,
                  backfaceVisibility: "hidden",
                  fontSize: "28px",
                  position: "absolute",
                  color: getSuitColor(suit),
                  background: "#fff",
                  ...(disabled && {
                    background: "#eee",
                    filter: "saturate(75%)",
                  }),
                  top: "0",
                  left: "0",

                  ...(!disabled &&
                    playable && {
                      transition: `transform ${transition}, box-shadow ${transition}`,
                      ":hover": {
                        cursor: "pointer",
                        transform: "translateY(-4px) scale(1.02)",
                        boxShadow: "1px 1px 8px rgba(100,100,100,0.5)",
                      },
                    }),
                }}
              >
                <Div
                  extend={{
                    position: "absolute",
                    left: "12px",
                    top: "12px",
                    textAlign: "center",
                  }}
                >
                  <div>{displayValue(suit, value)}</div>
                  <div>{suitSymbols[suit]}</div>
                </Div>
              </Div>
              <Div
                extend={{
                  border: "2px solid #fff",
                  boxShadow: "0px 0px 1px rgba(100,100,100,0.1)",
                  boxSizing: "border-box",
                  borderRadius: "6px",
                  backfaceVisibility: "hidden",
                  position: "absolute",
                  transition: "transform 1s",
                  transform: `rotateY(${
                    rotation === "360deg" ? "180deg" : "360deg"
                  })`,
                  top: "0",
                  left: "0",
                  height: "150px",
                  width: "105px",
                  background: `linear-gradient(115deg, transparent 75%, rgba(255,255,255,.8) 75%) 0 0, 
              linear-gradient(245deg, transparent 75%, rgba(255,255,255,.8) 75%) 0 0,
              linear-gradient(115deg, transparent 75%, rgba(255,255,255,.8) 75%) 7px -15px,
              linear-gradient(245deg, transparent 75%, rgba(255,255,255,.8) 75%) 7px -15px, #36c`,
                  backgroundSize: "15px 30px",
                }}
              ></Div>
            </Div>
          </Div>
        );
      }}
    </Transition>
  );
};
