import React, { createContext, useState } from "react";

export const SpinnerContext: React.Context<any> = createContext(null);

const SpinnerProvider = (props: any) => {
  const [visible, setVisible] = useState(false);
  const show = () => setVisible(true);
  const hide = () => setVisible(false);
  return (
    <SpinnerContext.Provider
      value={{
        visible,
        show,
        hide,
      }}
    >
      {props.children}
    </SpinnerContext.Provider>
  );
};

export default SpinnerProvider;
