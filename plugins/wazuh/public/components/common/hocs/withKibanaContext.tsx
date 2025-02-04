/*
 * Wazuh app - React HOC to create component with Kibana state
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import React, {useState} from 'react';
import { useIndexPattern, useFilterManager, useTimeFilter } from '../hooks';
import { IIndexPattern, FilterManager, Query, TimeRange } from '../../../../../../src/plugins/data/public';
import { useQueryManager } from "../hooks/use-query";

interface withKibanaContextProps {
  indexPattern?: IIndexPattern
  filterManager?: FilterManager
  query?: Query
}

export interface withKibanaContextExtendsProps {
  indexPattern: IIndexPattern
  filterManager: FilterManager
  timeFilter: TimeRange
  timeHistory: TimeRange[]
  setTimeFilter(timeRange:TimeRanges): void
  query: Query
  setQuery(query:Query): void
}


export const withKibanaContext = <T extends object>(Component:React.FunctionComponent<T>) => {
  function hoc(props:T & withKibanaContextProps ):React.FunctionComponentElement<T & withKibanaContextExtendsProps> {
    const indexPattern = useIndexPattern();
    const filterManager = useFilterManager();
    const [query, setQuery] = useState(props.query);
    const [query2, setQuery2] = useQueryManager();
    const { timeFilter, timeHistory, setTimeFilter } = useTimeFilter();
    return <Component {...props}
      indexPattern={props.indexPattern ? props.indexPattern : indexPattern}
      filterManager={props.filterManager ? props.filterManager : filterManager}
      timeFilter={timeFilter}
      timeHistory={timeHistory}
      setTimeFilter={setTimeFilter}
      query={props.query ? query : query2}
      setQuery={props.query ? setQuery : setQuery2} />;
  }

  hoc.displayName = `withKibanaContext-${Component.displayName}`;

  return hoc
}
