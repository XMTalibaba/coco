/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import { FormattedMessage } from '@kbn/i18n/react';
import { EuiSpacer, EuiButtonEmpty } from '@elastic/eui';
import { toMountPoint } from '../../../kibana_react/public';

export const createZoomWarningMsg = (function () {
  let disableZoomMsg = false;
  const setZoomMsg = (boolDisableMsg) => (disableZoomMsg = boolDisableMsg);

  class ZoomWarning extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        disabled: false,
      };
    }

    render() {
      return (
        <div>
          <p>
            <FormattedMessage
              id="maps_legacy.kibanaMap.zoomWarning"
              defaultMessage="You've reached the maximum number of zoom
              levels. To zoom all the way in, upgrade to the
              {defaultDistribution} of Elasticsearch and Kibana. You'll get
              access to additional zoom levels for free through the {ems}.
              Or, you can configure your own map server. Please go to
              { wms } or { configSettings} for more information."
              values={{
                defaultDistribution: (
                  <a target="_blank" href="https://www.elastic">
                    {`default distribution `}
                  </a>
                ),
                ems: (
                  <a target="_blank" href="https://www.elastic">
                    {`Elastic Maps Service`}
                  </a>
                ),
                wms: (
                  <a
                    target="_blank"
                    href="https://www.elastic"
                  >
                    {`Custom WMS Configuration`}
                  </a>
                ),
                configSettings: (
                  <a
                    target="_blank"
                    href="https://www.elastic"
                  >
                    {`Custom TMS Using Config Settings`}
                  </a>
                ),
              }}
            />
          </p>
          <EuiSpacer size="xs" />
          <EuiButtonEmpty
            size="s"
            flush="left"
            isDisabled={this.state.disabled}
            onClick={() => {
              this.setState(
                {
                  disabled: true,
                },
                () => this.props.onChange(this.state.disabled)
              );
            }}
            data-test-subj="suppressZoomWarnings"
          >
            {`Don't show again`}
          </EuiButtonEmpty>
        </div>
      );
    }
  }

  const zoomToast = {
    title: 'No additional zoom levels',
    text: toMountPoint(<ZoomWarning onChange={setZoomMsg} />),
    'data-test-subj': 'maxZoomWarning',
  };

  return (toastService, getZoomLevel, getMaxZoomLevel) => {
    return () => {
      const zoomLevel = getZoomLevel();
      const maxMapZoom = getMaxZoomLevel();
      if (!disableZoomMsg && zoomLevel === maxMapZoom) {
        toastService.addDanger(zoomToast);
      }
    };
  };
})();
