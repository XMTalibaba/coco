import React from 'react';
import { useFilterManager, useQuery, useRefreshAngularDiscover } from '../../../components/common/hooks';
import { VulnAlerts } from './vuln-alerts';

export const VulnAlertsWarp = (props) => {
  const [query] = useQuery();
  const filterManager = useFilterManager();
  const refreshAngularDiscover = useRefreshAngularDiscover();


  return (
    <VulnAlerts
      shareFilterManager={filterManager}
      query={query}
      refreshAngularDiscover={refreshAngularDiscover}
      {...{ ...props }}
    />
  )
}