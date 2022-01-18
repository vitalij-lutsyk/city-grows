import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";
import { urls } from "./constants/base-urls";
import Map from "./components/Map";
import { Feature, Geometry, Polygon } from "geojson";
import { OverpassApiRes } from "./interfaces/api-response";
import { Circles } from "react-loader-spinner";
import YearsFilter from "./components/Slider";
import { BrowserRouter } from "react-router-dom";

interface Buildings {
  [key: number]: Feature<Geometry>;
}

function App() {
  const [buildings, setBuildings] = useState<Buildings>({});
  const [filter, setFilter] = useState<[number, number]>([
    0,
    new Date().getFullYear(),
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const _buildings = Object.values(buildings);
    const years = _buildings.map((build) => build.properties.start_date);
    const min = Math.min(...years);
    const max = Math.max(...years);
    setFilter([min, max]);
  }, [buildings]);

  const getBuildings = async (mapBoundaries: string) => {
    setLoading(true);
    axios
      .get(urls.overpassApi(mapBoundaries))
      .then((res) => {
        setBuildings(prepareBuildings(res.data));
      })
      .finally(() => setLoading(false));
  };

  const prepareBuildings = (data: OverpassApiRes): Buildings => {
    const { elements: buildings } = data;
    const preparedBuildings = buildings
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
      .filter((build) => build);
    const buildingsToAdd: Buildings = {};
    preparedBuildings.forEach((build) => {
      if (build) {
        buildingsToAdd[build.properties?.id] = build;
      }
    });
    return buildingsToAdd;
  };

  const getYears = (buildings: Buildings): Array<number> => {
    const result: { [key: string]: any } = {};
    Object.values(buildings)
      .map((build) => build.properties.start_date)
      .forEach((curr) => {
        if (isNaN(curr) || result.hasOwnProperty(curr)) {
          return;
        }
        result[curr] = curr;
      });
    return Object.values(result);
  };
  const years = useMemo(() => getYears(buildings), [buildings]);
  return (
    <BrowserRouter>
      <div className="App">
        {loading && (
          <div
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.1)",
              zIndex: 1001,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Circles arialLabel="loading-indicator" />
          </div>
        )}
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
