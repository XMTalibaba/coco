/*
 * Wazuh app - React component for Visualize.
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import React from 'react';
import { useFilterManager, useQuery, useRefreshAngularDiscover } from '../../common/hooks';
import { Discover } from '../../common/modules/discover';

export const SecurityAlerts = (props) => {
  const [query] = useQuery();
  const filterManager = useFilterManager();
  const refreshAngularDiscover = useRefreshAngularDiscover();

  return (
    <Discover
      shareFilterManager={filterManager}
      query={query}
      // initialColumns={["icon", "timestamp", 'rule.mitre.id', 'rule.mitre.tactic', 'rule.description', 'rule.level', 'rule.id']}
      initialColumns={["icon", "timestamp", 'rule.description', 'rule.level']}
      implicitFilters={[]}
      initialFilters={[]}
      tab={props.tab}
      updateTotalHits={(total) => { }}
      refreshAngularDiscover={refreshAngularDiscover}
      />
  )
}