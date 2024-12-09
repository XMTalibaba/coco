import React, { Fragment } from 'react';
import {
  EuiPage
} from '@elastic/eui';
import { useFilterManager, useQuery, useRefreshAngularDiscover } from '../../../components/common/hooks';
import { ThreatBackTable } from './threat-back-table';
import { ThreatBackChart } from './threat-back-chart';

export const ThreatBackWarp = (props) => {
  const [query] = useQuery();
  const filterManager = useFilterManager();
  const refreshAngularDiscover = useRefreshAngularDiscover();

  const { threatBackSelectAlert } = props;

  return (
    <EuiPage style={{'display': 'block'}}>
      { !threatBackSelectAlert && (
        <ThreatBackTable
          shareFilterManager={filterManager}
          query={query}
          refreshAngularDiscover={refreshAngularDiscover}
          {...{ ...props }}
        />
      )}
      { threatBackSelectAlert && (
        <ThreatBackChart {...{ ...props }} />
      )}
    </EuiPage>
  )
}