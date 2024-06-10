import React, { useContext } from "react";
import { Circles } from "react-loader-spinner";
import { Box } from "@mui/material";
import { SpinnerContext } from "./spinner.context";

const Spinner: React.FC = () => {
  const { visible } = useContext(SpinnerContext)
  return (
    <Box>
      {visible && (
        <Box
          position={'fixed'}
          left={0}
          top={0}
          right={0}
          bottom={0}
          bgcolor={'rgba(0,0,0,0.1)'}
          zIndex={1001}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Circles ariaLabel="loading-indicator" />
        </Box>
      )}
    </Box>
  );
}

export default Spinner;