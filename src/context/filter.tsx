import React, { createContext, useEffect, useState } from "react";

export const FilterContext: React.Context<any> = createContext(null);

const FilterProvider = (props: any) => {
  const thisYear = new Date().getFullYear();
  const [filter, setFilter] = useState<[number, number]>([0, thisYear]);
  const [years, setYears] = useState<Array<number>>([0, thisYear]);

  const handleYearsChange = (years: Array<number>) => {
    const min = Math.min(...years);
    const max = Math.max(...years);
    setFilter([min, max]);
  }

  useEffect(() => {
    handleYearsChange(years);
  }, [years]);

  return (
    <FilterContext.Provider
      value={{
        filter,
        setFilter,
        years,
        setYears,
      }}
    >
      {props.children}
    </FilterContext.Provider>
  );
};

export default FilterProvider;
