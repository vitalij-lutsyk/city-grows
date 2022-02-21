import React, { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";

import "./styles/App.css";
import Map from "./components/Map";
import YearsFilter from "./components/Slider";
import { useSpinner } from "./components/hooks";

function App() {
  const Spinner = useSpinner();
  const thisYear = new Date().getFullYear();
  const [filter, setFilter] = useState<[number, number]>([0, thisYear]);
  const [years, setYears] = useState<[number, number]>([0, thisYear]);

  useEffect(() => {
    const min = Math.min(...years);
    const max = Math.max(...years);
    setFilter([min, max]);
  }, [years]);

  return (
    <BrowserRouter>
      <div className="App">
        {Spinner.init()}
        <YearsFilter
          value={filter}
          setValue={(_, value) => setFilter(value as [number, number])}
          options={years}
        />
        <Map filter={filter} setYears={setYears} />
      </div>
    </BrowserRouter>
  );
}

export default App;
