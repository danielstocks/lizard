import React from "react";

export const Console = ({ log }) => {
  return (
    <>
      {log.map((entry) => {
        const date = new Date(entry.date);
        return (
          <div key={entry.message + entry.date} style={{ fontSize: "10px" }}>
            <small style={{ color: "lime" }}>
              {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </small>
            &nbsp; {entry.message}
          </div>
        );
      })}
    </>
  );
};
