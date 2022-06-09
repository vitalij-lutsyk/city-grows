import React, { useContext, useEffect, useMemo, useState } from "react";
import { Box, Slider, styled } from "@mui/material";
import getIsPortraitScreenMode from "../utils/getOrientation";
import { FilterContext } from "../context/filter";
import { debounce } from "../utils/debounce";

function valuetext(value: number) {
  return `${value} year`;
}

const styles = {
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
};

const StyledSlider = styled(Slider)((props) => ({
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
  },
}));

export default function YearsFilter() {
  const { filter, setFilter, years } = useContext(FilterContext);

  const isPortraitScreenMode = useMemo(() => getIsPortraitScreenMode(), []);

  const [min, setMin] = useState(0);
  const [max, setMax] = useState(2022);
  const [rangeStep, setRangeStep] = useState(100);
  const [ownValue, setOwnValue] = useState(filter);
  let debounceFn: Function | null = null;

  useEffect(() => {
    if (years.length) {
      const _min = Math.min(...years);
      const _max = Math.max(...years);
      setMin(_min);
      setMax(_max);
      setRangeStep(Math.round((_max - _min) / (isPortraitScreenMode ? 8 : 30)));
    }
  }, [years, isPortraitScreenMode]);

  useEffect(() => {
    handleChange([min, max]);
  }, [min, max]);

  const handleChange = (value: Array<number>) => {
    setOwnValue(value);
    debounceFilterChange(value);
  }

  const debounceFilterChange = (value: Array<number>) => {
    if (!debounceFn) {
      debounceFn = debounce(() => {
        setFilter(value)
      }, 60);
    }
    debounceFn && debounceFn();
  };

  const getMarks = () => {
    const marks: Array<{ label: string; value: number }> = [];
    let _min = min;
    while (_min < max) {
      const mark = { label: _min.toString(), value: _min };
      marks.push(mark);
      _min += rangeStep;
    }
    return marks;
  };

  return (
    <Box
      sx={styles.sx}
      position={"fixed"}
      left={styles.left}
      right={styles.right}
      top={styles.top}
      bottom={styles.bottom}
      zIndex={1000}
      pr={styles.pr}
      pl={styles.pl}
      pt={styles.pt}
      pb={styles.pb}
      style={{
        backgroundColor: `rgba(255, 255, 255, 0.61)`,
      }}
    >
      <StyledSlider
        track={"normal"}
        valueLabelDisplay="auto"
        aria-labelledby="builds-years-slider"
        defaultValue={[min, max]}
        value={ownValue}
        orientation={"horizontal"}
        onChange={(_, value) => handleChange(value as [number, number])}
        min={min}
        step={1}
        max={max}
        getAriaValueText={valuetext}
        marks={getMarks()}
        disableSwap
      />
    </Box>
  );
}
