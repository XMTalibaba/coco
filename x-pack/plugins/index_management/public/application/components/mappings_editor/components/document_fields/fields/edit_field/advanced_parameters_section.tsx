/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { useState } from 'react';
import { i18n } from '@kbn/i18n';

import { EuiButtonEmpty, EuiSpacer, EuiHorizontalRule } from '@elastic/eui';

interface Props {
  children: React.ReactNode;
}

export const AdvancedParametersSection = ({ children }: Props) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const toggleIsVisible = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="mappingsEditor__editField__advancedSettings">
      <EuiHorizontalRule />

      <EuiButtonEmpty onClick={toggleIsVisible} flush="left" data-test-subj="toggleAdvancedSetting">
        {isVisible
          ? i18n.translate('xpack.idxMgmt.mappingsEditor.advancedSettings.hideButtonLabel', {
              defaultMessage: '隐藏高级设置',
            })
          : i18n.translate('xpack.idxMgmt.mappingsEditor.advancedSettings.showButtonLabel', {
              defaultMessage: '显示高级设置',
            })}
      </EuiButtonEmpty>

      <div style={{ display: isVisible ? 'block' : 'none' }} data-test-subj="advancedSettings">
        <EuiSpacer size="m" />
        {/* We ned to wrap the children inside a "div" to have our css :first-child rule */}
        <div>{children}</div>
      </div>
    </div>
  );
};
