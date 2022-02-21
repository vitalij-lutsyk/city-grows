import React, { useState } from "react";
import { Circles } from "react-loader-spinner";

export const useSpinner = () => {
  const [visible, setVisible] = useState(false);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);
  const init = () => (
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
  return { show, hide, init };
}
