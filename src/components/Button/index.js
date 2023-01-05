import React from "react";

export default function Button({ onClick, name }) {
  return (
    <div className="dhx_sample-controls">
      <button className="dhx_sample-btn dhx_sample-btn--flat" onClick={onClick}>
        {name}
      </button>
    </div>
  );
}
