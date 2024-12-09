import React, {  useState } from "react";
import {EuiPanel, EuiFlexGroup, EuiFlexItem, EuiText, EuiLoadingSpinner, EuiIcon} from "@elastic/eui";
import mapValues from 'lodash';
import {useGenericRequest} from '../../../common/hooks/useGenericRequest';
import { formatUIDate } from '../../../../react-services/time-service';

export function InventoryMetrics({agent}) {
    const [params, setParams] = useState({});
    const offsetTimestamp = (text, time) => {
        try {
          return text + formatUIDate(time);
        } catch (error) {
          return time !== '-' ? `${text}${time} (UTC)` : time;
        }
      }
    const syscollector = useGenericRequest('GET', `/api/syscollector/${agent.id}`, params, (result) => {return (result || {}).data || {};});

  if (
    !syscollector.isLoading &&
    (mapValues.isEmpty(syscollector.data.hardware) || mapValues.isEmpty(syscollector.data.os))
  ) {
    return (
      <EuiPanel paddingSize="s" style={{ margin: 16, textAlign: 'center' }}>
        <EuiIcon type="iInCircle" /> 硬件或操作系统信息不足
      </EuiPanel>
    );
  }

    return (
        <EuiPanel paddingSize="s" style={{margin: 16}}>
            <EuiFlexGroup>
                <EuiFlexItem grow={false}>
                    <EuiText>核数: {syscollector.isLoading ? <EuiLoadingSpinner size="s" /> : <strong>{syscollector.data.hardware.cpu.cores}</strong>}</EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                    <EuiText>内存: {syscollector.isLoading ? <EuiLoadingSpinner size="s" /> : <strong>{ (syscollector.data.hardware.ram.total / 1024).toFixed(2)  } MB</strong>}</EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                    <EuiText>架构: {syscollector.isLoading ? <EuiLoadingSpinner size="s" /> : <strong>{syscollector.data.os.architecture}</strong>}</EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                    <EuiText>操作系统: {syscollector.isLoading ? <EuiLoadingSpinner size="s" /> : <strong>{syscollector.data.os.os.name} {syscollector.data.os.os.version}</strong>}</EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={true}>
                    <EuiText>CPU: {syscollector.isLoading ? <EuiLoadingSpinner size="s" /> : <strong>{syscollector.data.hardware.cpu.name}</strong>}</EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                    <EuiText>最近扫描时间: {syscollector.isLoading ? <EuiLoadingSpinner size="s" /> : <strong>{offsetTimestamp('',syscollector.data.os.scan.time)}</strong>}</EuiText>
                </EuiFlexItem>
            </EuiFlexGroup>
        </EuiPanel>
        );


}
