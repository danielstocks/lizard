import { createComponent } from "react-fela";

export const Div = createComponent({}, "div");

export const AbsoluteCenter = createComponent(
  {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  "div"
);

const container = ({ size }) => ({
  position: "absolute",
  width: size + "px",
  height: size + "px",
  padding: "0",
  borderRadius: "50%",
  listStyle: "none",
  boxSizing: "content-box",
  zIndex: 1,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  border: "solid 5px green",
});
export const Container = createComponent(container, "div");

const opponent = ({ size, pos, players, active }) => {
  const spread = 180 / (players - 1);
  const rotate = 180 + pos * spread + "deg";
  const halfSize = size / 2 + "px";

  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: active ? "peachpuff" : "white",
    fontWeight: active ? "bold" : "normal",
    borderRadius: "50%",
    position: "absolute",
    top: "50%",
    left: "50%",
    width: size / 6 + "px",
    height: size / 6 + "px",
    margin: "-" + size / 6 / 2 + "px",
    transform: `rotate(${rotate}) translate(${halfSize}) rotate(-${rotate})`,
  };
};

export const Opponent = createComponent(opponent, "div");
