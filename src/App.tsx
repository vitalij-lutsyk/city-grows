import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Feature, Geometry, Polygon } from "geojson";
import { BrowserRouter } from "react-router-dom";

import "./styles/App.css";
import { urls } from "./constants/base-urls";
import Map from "./components/Map";
import { OverpassApiRes } from "./interfaces/api-response";
import YearsFilter from "./components/Slider";
import { useSpinner } from './components/hooks';

interface Buildings {
  [key: number]: Feature<Geometry>;
}

function App() {
  const [buildings, setBuildings] = useState<Buildings>({});
  const [filter, setFilter] = useState<[number, number]>([
    0,
    new Date().getFullYear(),
  ]);
  const Spinner = useSpinner();

  useEffect(() => {
    const _buildings = Object.values(buildings);
    const years = _buildings.map((build) => build.properties.start_date);
    const min = Math.min(...years);
    const max = Math.max(...years);
    setFilter([min, max]);
  }, [buildings]);

  const getBuildings = async (mapBoundaries: string) => {
    Spinner.show();
    axios
      .get(urls.overpassApi(mapBoundaries))
      .then((res) => {
        setBuildings(buildings => Object.assign({}, buildings, prepareBuildings(res.data)));
      })
      .finally(Spinner.hide);
  };

  const prepareBuildings = (data: OverpassApiRes): Buildings => {
    const { elements: _buildings } = data;
    const preparedBuildings = _buildings
      .map((build) => {
        const geometry: Polygon = {
          type: "Polygon",
          coordinates: [],
        };
        const preparedBuild: Feature<Geometry> = {
          type: "Feature",
          properties: { id: build.id, ...build.tags },
          geometry,
        };
        if (build.type === "way") {
          geometry.coordinates = [
            build.geometry.map((node) => Object.values(node).reverse()),
          ];
        }
        if (build.type === "relation" && build.members?.length) {
          const outerLine = build.members.find((member) =>
            ["outer", "outline"].includes(member.role)
          );
          const mappedCoords =
            outerLine?.geometry.map((node) => Object.values(node).reverse()) ||
            [];
          geometry.coordinates = [mappedCoords];
        }
        return preparedBuild;
      })
      .filter((build) => {
        const startDate = build?.properties?.start_date + '';
        if (!startDate) {
          return false;
        }
        if (startDate.length !== 4 || isNaN(parseInt(startDate))) {
          return false;
        }
        return true;
      });
    const buildingsToAdd: Buildings = {};
    preparedBuildings.forEach((build) => {
      buildingsToAdd[build.properties?.id] = build;
    });
    return buildingsToAdd;
  };

  const getYears = (_buildings: Buildings): Array<number> => {
    const result: { [key: string]: any } = {};
    Object.values(_buildings)
      .map((build) => build.properties.start_date)
      .forEach((curr) => {
        if (isNaN(curr) || result.hasOwnProperty(curr)) {
          return;
        }
        result[curr] = curr;
      });
    return Object.values(result).filter(year => year <= new Date().getFullYear());
  };
  const years = useMemo(() => getYears(buildings), [buildings]);
  return (
    <BrowserRouter>
      <div className="App">
        {Spinner.init()}
        <YearsFilter
          value={filter}
          setValue={(_, value) => setFilter((value as [number, number]))}
          options={years}
        />
        <Map
          buildings={buildings}
          getBuildings={getBuildings}
          filter={filter}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
