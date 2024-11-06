import React, { useContext, useEffect, useMemo, useState } from "react";
import { Box, Slider, styled } from "@mui/material";
import getIsPortraitScreenMode from "../../utils/getOrientation";
import { FilterContext } from "./filter";
import { styles } from './styles';
import { debounce } from "../../utils/debounce";

function valuetext(value: number) {
  return `${value} year`;
}

const StyledSlider = styled(Slider)((props) => styles.slider);

const YearsFilter: React.FC = () => {
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

  const debounceFilterChange = (value: Array<number>) => {
    if (!debounceFn) {
      debounceFn = debounce(() => {
        setFilter(value)
      }, 60);
    }
    debounceFn && debounceFn();
  };

  const handleChange = (value: Array<number>) => {
    setOwnValue(value);
    debounceFilterChange(value);
  }

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

  useEffect(() => {
    handleChange([min, max]);
  }, [min, max]);

  return (
    <Box
      sx={styles.wrapper.sx}
      position={"fixed"}
      left={styles.wrapper.left}
      right={styles.wrapper.right}
      top={styles.wrapper.top}
      bottom={styles.wrapper.bottom}
      zIndex={1000}
      pr={styles.wrapper.pr}
      pl={styles.wrapper.pl}
      pt={styles.wrapper.pt}
      pb={styles.wrapper.pb}
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

export default YearsFilter;
