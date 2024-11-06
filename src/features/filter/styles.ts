export const styles = {
  wrapper: {
    sx: {
      height: 50,
    },
    left: 0,
    right: 0,
    top: undefined,
    bottom: 0,
    pr: 4,
    pl: 4,
    pt: 0,
    pb: 2,
  },
  slider: {
    marginRight: 0,
    "& .MuiSlider-thumb": {},
    "& .MuiSlider-valueLabel": {},
    "& .MuiSlider-track": {},
    "& .MuiSlider-rail": {},
    "& .MuiSlider-mark": {
      left: -10,
      width: 10,
    },
    "& .MuiSlider-markLabel": {
      right: 10,
      userSelect: 'none',
    },
  }
};
