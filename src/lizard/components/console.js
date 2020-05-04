import React from "react";

export const Console = ({ log }) => {
  return (
    <>
      {log.map((entry) => {
        return (
          <div key={entry.message + entry.date} style={{ fontSize: "10px" }}>
            <small style={{ color: "lime" }}>
              {entry.date.toLocaleDateString()}{" "}
              {entry.date.toLocaleTimeString()}
            </small>
            &nbsp; {entry.message}
          </div>
        );
      })}
    </>
  );
};
