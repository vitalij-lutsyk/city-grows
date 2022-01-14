import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import { urls } from "./constants/base-urls";
import Map from "./components/Map";
import { Feature, Geometry, Polygon } from "geojson";
import { OverpassApiRes } from "./interfaces/api-response";

interface Buildings {
  [key: number]: Feature<Geometry>
}

function App() {
  const [buildings, setBuildings] = useState<Buildings>({});
  const [loading, setLoading] = useState(false);

  const getBuildings = async (mapBoundaries: string) => {
    console.log(`mapBoundaries`, mapBoundaries)
    if (!mapBoundaries) return;
    setLoading(true);
    const res = await axios.get(urls.overpassApi(mapBoundaries));
    console.log(`buildings`, buildings)
    setBuildings(prepareBuildings(res.data));
    setTimeout(() => setLoading(false), 100);
  };

  const prepareBuildings = (data: OverpassApiRes): Buildings => {
    console.log(`data`, data)
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
      <Map buildings={(buildings as Feature[])} getBuildings={getBuildings} filter={[0, 2021]} />
    </div>
  );
}

export default App;
