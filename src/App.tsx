import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { urls } from "./constants/base-urls";
import Map from "./components/Map";
import { Feature, Geometry, Polygon } from "geojson";
import { OverpassApiRes } from "./interfaces/api-response";
import { Circles } from "react-loader-spinner";

interface Buildings {
  [key: number]: Feature<Geometry>;
}

function App() {
  const [buildings, setBuildings] = useState<Buildings>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Object.keys(buildings).length) {
      setLoading(false);
    }
  }, [buildings])

  const getBuildings = async (mapBoundaries: string) => {
    setLoading(true);
    axios.get(urls.overpassApi(mapBoundaries)).then((res) => {
      setBuildings(prepareBuildings(res.data));
    });
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
        // if (build.type === "relation") {
        //   if (build && build.members && build.members.length) {
        //     const mappedCoords = build.members
        //       .find((member) => ["outer", "outline"].includes(member.role))
        //       .geometry.reverse();
        //     geometry.coordinates = [mappedCoords];
        //   }
        // }
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

  return (
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
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Circles arialLabel="loading-indicator" />
        </div>
      )}
      <Map
        buildings={buildings}
        getBuildings={getBuildings}
        filter={[0, 2021]}
      />
    </div>
  );
}

export default App;
