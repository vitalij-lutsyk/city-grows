import React from "react";
import { BrowserRouter } from "react-router-dom";

import "./styles/App.css";
import Map from "./core/map/Map.component";
import Spinner from "./features/spinner/Spinner.component";
import SpinnerProvider from "./features/spinner/spinner.context";
import YearsFilter from "./features/filter/Slider";
import FilterProvider from "./features/filter/filter";

function App() {
  return (
    <SpinnerProvider>
      <FilterProvider>
        <BrowserRouter>
          <div className="App">
            <Spinner/>
            <YearsFilter />
            <Map />
          </div>
        </BrowserRouter>
      </FilterProvider>
    </SpinnerProvider>
  );
}

export default App;
