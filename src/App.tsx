import React from "react";
import { BrowserRouter } from "react-router-dom";

import "./styles/App.css";
import Map from "./components/Map";
import YearsFilter from "./components/Slider";
import Spinner from "./components/Spinner";
import SpinnerProvider from "./context/spinner";
import FilterProvider from "./context/filter";

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
