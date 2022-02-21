import React, { useContext } from "react";
import { Circles } from "react-loader-spinner";
import { SpinnerContext } from "../context/spinner";

const Spinner = () => {
  const { visible } = useContext(SpinnerContext)
  return (
    <div>
      {visible && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.1)",
            zIndex: 1001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Circles arialLabel="loading-indicator" />
        </div>
      )}
    </div>
  );
}

export default Spinner;