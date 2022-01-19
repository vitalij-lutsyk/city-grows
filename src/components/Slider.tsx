import React, { useEffect, useState } from "react";
import { Box, Slider, styled } from "@mui/material";

interface SliderProps {
  value: number | Array<number>;
  setValue: (
    event: Event,
    value: number | number[],
    activeThumb: number
  ) => void;
  options: Array<any>;
}

function valuetext(value: number) {
  return `${value} year`;
}

const StyledSlider = styled(Slider)(({ theme }) => ({
  marginRight: 0,
  '& .MuiSlider-thumb': {},
  '& .MuiSlider-valueLabel': {},
  '& .MuiSlider-track': {},
  '& .MuiSlider-rail': {},
  '& .MuiSlider-mark': {
    left: -10,
    width: 10,
  },
  '& .MuiSlider-markLabel': {
    right: 10,
  },
}));

export default function YearsFilter(props: SliderProps) {
  const { value, setValue, options } = props;

  const [min, setMin] = useState(0);
  const [max, setMax] = useState(2021);
  const [rangeStep, setRangeStep] = useState(100);

  useEffect(() => {
    if (options.length) {
      const _min = Math.min(...options);
      const _max = Math.max(...options);
      setMin(_min);
      setMax(_max);
      setRangeStep(Math.round((_max - _min) / 20));
    }
  }, [options]);

  const getMarks = () => {
    const marks: Array<{ label: string, value: number }> = [];
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
      sx={{ width: 50, height: 300 }}
      position={"fixed"}
      right={30}
      top={50}
      zIndex={1000}
      pr={5}
      pl={2}
      pt={3}
      pb={3}
      style={{
        backgroundColor: `rgba(255, 255, 255, 0.61)`,
      }}
    >
      <StyledSlider
        track={"normal"}
        valueLabelDisplay="on"
        aria-labelledby="builds-years-slider"
        defaultValue={[min, max]}
        value={value}
        orientation="vertical"
        onChange={setValue}
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
