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

import dateMath from '@elastic/datemath';
import classNames from 'classnames';
import React, { useState, useEffect } from 'react';
import { i18n } from '@kbn/i18n';
import moment from 'moment';

import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiSuperDatePicker,
  EuiFieldText,
  prettyDuration,
  EuiDatePicker,
  EuiDatePickerRange,
} from '@elastic/eui';
// @ts-ignore
import { EuiSuperUpdateButton, OnRefreshProps } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';
import { Toast } from 'src/core/public';
import { IDataPluginServices, IIndexPattern, TimeRange, TimeHistoryContract, Query } from '../..';
import { useKibana, toMountPoint, withKibana } from '../../../../kibana_react/public';
import QueryStringInputUI from './query_string_input';
import { doesKueryExpressionHaveLuceneSyntaxError, UI_SETTINGS } from '../../../common';
import { PersistedLog, getQueryLog } from '../../query';
import { NoDataPopover } from './no_data_popover';

const QueryStringInput = withKibana(QueryStringInputUI);

// @internal
export interface QueryBarTopRowProps {
  query?: Query;
  onSubmit: (payload: { dateRange: TimeRange; query?: Query }) => void;
  onChange: (payload: { dateRange: TimeRange; query?: Query }) => void;
  onRefresh?: (payload: { dateRange: TimeRange }) => void;
  dataTestSubj?: string;
  disableAutoFocus?: boolean;
  screenTitle?: string;
  indexPatterns?: Array<IIndexPattern | string>;
  isLoading?: boolean;
  prepend?: React.ComponentProps<typeof EuiFieldText>['prepend'];
  showQueryInput?: boolean;
  showDatePicker?: boolean;
  dateRangeFrom?: string;
  dateRangeTo?: string;
  isRefreshPaused?: boolean;
  refreshInterval?: number;
  showAutoRefreshOnly?: boolean;
  onRefreshChange?: (options: { isPaused: boolean; refreshInterval: number }) => void;
  customSubmitButton?: any;
  refreshTimeButton?: boolean;
  isDirty: boolean;
  timeHistory?: TimeHistoryContract;
  indicateNoData?: boolean;
}

// Needed for React.lazy
// eslint-disable-next-line import/no-default-export
export default function QueryBarTopRow(props: QueryBarTopRowProps) {
  const [isDateRangeInvalid, setIsDateRangeInvalid] = useState(false);
  const [isQueryInputFocused, setIsQueryInputFocused] = useState(false);

  const kibana = useKibana<IDataPluginServices>();
  const { uiSettings, notifications, storage, appName, docLinks } = kibana.services;

  const kueryQuerySyntaxLink: string = docLinks!.links.query.kueryQuerySyntax;

  const queryLanguage = props.query && props.query.language;
  const persistedLog: PersistedLog | undefined = React.useMemo(
    () =>
      queryLanguage && uiSettings && storage && appName
        ? getQueryLog(uiSettings!, storage, appName, queryLanguage)
        : undefined,
    [appName, queryLanguage, uiSettings, storage]
  );

  // const [timeRangeStart, setTimeRangeStart] = useState(props.dateRangeFrom === 'now-24h' ? moment().add(-1, 'd') : moment(props.dateRangeFrom));
  // const [timeRangeEnd, setTimeRangeEnd] = useState(props.dateRangeTo === 'now' ? moment() : moment(props.dateRangeTo));
  const [timeRangeStart, setTimeRangeStart] = useState(moment().add(-1, 'd'));
  const [timeRangeEnd, setTimeRangeEnd] = useState(moment());
  useEffect(() => {
    onClickRefreshButton();
  }, []);

  function onClickSubmitButton(event: React.MouseEvent<HTMLButtonElement>) {
    if (persistedLog && props.query) {
      persistedLog.add(props.query.query);
    }
    event.preventDefault();
    onSubmit({ query: props.query, dateRange: getDateRange() });
  }

  function getDateRange() {
    const defaultTimeSetting = uiSettings!.get(UI_SETTINGS.TIMEPICKER_TIME_DEFAULTS);
    return {
      from: props.dateRangeFrom || defaultTimeSetting.from,
      to: props.dateRangeTo || defaultTimeSetting.to,
    };
  }

  function onQueryChange(query: Query) {
    props.onChange({
      query,
      dateRange: getDateRange(),
    });
  }

  function onChangeQueryInputFocus(isFocused: boolean) {
    setIsQueryInputFocused(isFocused);
  }

  function onTimeChange({
    start,
    end,
    isInvalid,
    isQuickSelection,
  }: {
    start: string;
    end: string;
    isInvalid: boolean;
    isQuickSelection: boolean;
  }) {
    setIsDateRangeInvalid(isInvalid);
    const retVal = {
      query: props.query,
      dateRange: {
        from: start,
        to: end,
      },
    };

    if (isQuickSelection) {
      props.onSubmit(retVal);
    } else {
      props.onChange(retVal);
    }
  }

  function setStartDate(date: any) {
    if (date > timeRangeEnd) {
      setIsDateRangeInvalid(true);
    } else {
      setIsDateRangeInvalid(false);
    }
    setTimeRangeStart(date);
    const retVal = {
      query: props.query,
      dateRange: {
        from: date.toDate(),
        to: timeRangeEnd.toDate(),
        // from: date.format(),
        // to: timeRangeEnd.format()
      },
    };
    props.onChange(retVal);
  }

  function setEndDate(date: any) {
    if (timeRangeStart > date) {
      setIsDateRangeInvalid(true);
    } else {
      setIsDateRangeInvalid(false);
    }
    setTimeRangeEnd(date);
    const retVal = {
      query: props.query,
      dateRange: {
        from: timeRangeStart.toDate(),
        to: date.toDate(),
        // from: timeRangeStart.format(),
        // to: date.format()
      },
    };
    props.onChange(retVal);
  }

  function onClickRefreshButton() {
    // 点击重置时间选择按钮
    setTimeRangeStart(moment().add(-1, 'd'));
    setTimeRangeEnd(moment());
    const retVal = {
      query: props.query,
      dateRange: {
        from: 'now-24h',
        to: 'now',
      },
    };
    props.onChange(retVal);

    // 查询
    if (persistedLog && props.query) {
      persistedLog.add(props.query.query);
    }
    onSubmit(retVal);
  }

  function onRefresh({ start, end }: OnRefreshProps) {
    const retVal = {
      dateRange: {
        from: start,
        to: end,
      },
    };
    if (props.onRefresh) {
      props.onRefresh(retVal);
    }
  }

  function onSubmit({ query, dateRange }: { query?: Query; dateRange: TimeRange }) {
    handleLuceneSyntaxWarning();

    if (props.timeHistory) {
      props.timeHistory.add(dateRange);
    }

    props.onSubmit({ query, dateRange });
  }

  function onInputSubmit(query: Query) {
    onSubmit({
      query,
      dateRange: getDateRange(),
    });
  }

  function toAbsoluteString(value: string, roundUp = false) {
    const valueAsMoment = dateMath.parse(value, { roundUp });
    if (!valueAsMoment) {
      return value;
    }
    return valueAsMoment.toISOString();
  }

  function renderQueryInput() {
    if (!shouldRenderQueryInput()) return;
    return (
      <EuiFlexItem>
        <QueryStringInput
          disableAutoFocus={props.disableAutoFocus}
          indexPatterns={props.indexPatterns!}
          prepend={props.prepend}
          query={props.query!}
          screenTitle={props.screenTitle}
          onChange={onQueryChange}
          onChangeQueryInputFocus={onChangeQueryInputFocus}
          onSubmit={onInputSubmit}
          persistedLog={persistedLog}
          dataTestSubj={props.dataTestSubj}
        />
      </EuiFlexItem>
    );
  }

  function renderSharingMetaFields() {
    const { from, to } = getDateRange();
    const dateRangePretty = prettyDuration(
      toAbsoluteString(from),
      toAbsoluteString(to),
      [],
      uiSettings.get('dateFormat')
    );
    return (
      <div
        data-shared-timefilter-duration={dateRangePretty}
        data-test-subj="dataSharedTimefilterDuration"
      />
    );
  }

  function shouldRenderDatePicker(): boolean {
    return Boolean(props.showDatePicker || props.showAutoRefreshOnly);
  }

  function shouldRenderQueryInput(): boolean {
    return Boolean(
      props.showQueryInput &&
        props.indexPatterns &&
        props.query &&
        storage 
        &&
        !window.location.pathname.includes('wazuh')
    );
  }

  function renderUpdateButton() {
    // const button = props.customSubmitButton ? (
    //   React.cloneElement(props.customSubmitButton, { onClick: onClickSubmitButton })
    // ) : (
    //   <EuiSuperUpdateButton
    //     needsUpdate={props.isDirty}
    //     isDisabled={isDateRangeInvalid}
    //     isLoading={props.isLoading}
    //     onClick={onClickSubmitButton}
    //     data-test-subj="querySubmitButton"
    //   />
    // );
    const button = props.customSubmitButton ? (
      React.cloneElement(props.customSubmitButton, { onClick: onClickSubmitButton })
    ) : (
      <EuiButton
        fill
        isDisabled={isDateRangeInvalid}
        isLoading={props.isLoading}
        iconType="search"
        onClick={onClickSubmitButton}
      >
        提交
      </EuiButton>
    );

    // const refreshTimeButton = props.refreshTimeButton ? (
    //   <EuiFlexItem grow={false}>
    //     <EuiButton isLoading={props.isLoading} iconType="refresh" onClick={onClickRefreshButton}>
    //     重置
    //     </EuiButton>
    //   </EuiFlexItem>
    // )
    //  : (
    //   ''
    // );

    if (!shouldRenderDatePicker()) {
      return button;
    }

    return (
      <NoDataPopover storage={storage} showNoDataPopover={props.indicateNoData}>
        <EuiFlexGroup responsive={false} gutterSize="m">
          {/* {renderDatePicker()} */}
          {renderDatePickerRange()}
          {/* {refreshTimeButton} */}
          <EuiFlexItem grow={false}>{button}</EuiFlexItem>
        </EuiFlexGroup>
      </NoDataPopover>
    );
  }

  function renderDatePickerRange() {
    // 时间间隔选择器
    if (!shouldRenderDatePicker()) {
      return null;
    }

    const wrapperClasses = classNames('kbnQueryBar__datePickerWrapper', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'kbnQueryBar__datePickerWrapper-isHidden': isQueryInputFocused,
    });

    return (
      <EuiFlexItem className={wrapperClasses} style={{ width: '497px' }}>
        <div style={{ width: '485px' }}>
          <EuiDatePickerRange
            fullWidth={true}
            startDateControl={
              <EuiDatePicker
                selected={timeRangeStart}
                onChange={setStartDate}
                startDate={timeRangeStart}
                endDate={timeRangeEnd}
                isInvalid={timeRangeStart > timeRangeEnd}
                aria-label="Start date"
                showTimeSelect
                // dateFormat={uiSettings!.get('dateFormat')}
                dateFormat="YYYY-MM-DD A hh:mm"
                locale="zh-cn"
              />
            }
            endDateControl={
              <EuiDatePicker
                selected={timeRangeEnd}
                onChange={setEndDate}
                startDate={timeRangeStart}
                endDate={timeRangeEnd}
                isInvalid={timeRangeStart > timeRangeEnd}
                aria-label="End date"
                showTimeSelect
                // dateFormat={uiSettings!.get('dateFormat')}
                dateFormat="YYYY-MM-DD A hh:mm"
                locale="zh-cn"
              />
            }
          />
        </div>
      </EuiFlexItem>
    );
  }

  function renderDatePicker() {
    // 原时间选择器
    if (!shouldRenderDatePicker()) {
      return null;
    }

    let recentlyUsedRanges;
    if (props.timeHistory) {
      recentlyUsedRanges = props.timeHistory
        .get()
        .map(({ from, to }: { from: string; to: string }) => {
          return {
            start: from,
            end: to,
          };
        });
    }

    const commonlyUsedRanges = uiSettings!
      .get(UI_SETTINGS.TIMEPICKER_QUICK_RANGES)
      .map(({ from, to, display }: { from: string; to: string; display: string }) => {
        return {
          start: from,
          end: to,
          label: display,
        };
      });

    const wrapperClasses = classNames('kbnQueryBar__datePickerWrapper', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'kbnQueryBar__datePickerWrapper-isHidden': isQueryInputFocused,
    });

    return (
      <EuiFlexItem className={wrapperClasses}>
        <EuiSuperDatePicker
          start={props.dateRangeFrom}
          end={props.dateRangeTo}
          isPaused={props.isRefreshPaused}
          refreshInterval={props.refreshInterval}
          onTimeChange={onTimeChange}
          onRefresh={onRefresh}
          onRefreshChange={props.onRefreshChange}
          showUpdateButton={false}
          recentlyUsedRanges={recentlyUsedRanges}
          commonlyUsedRanges={commonlyUsedRanges}
          dateFormat={uiSettings!.get('dateFormat')}
          isAutoRefreshOnly={props.showAutoRefreshOnly}
          className="kbnQueryBar__datePicker"
          locale="zh-cn"
        />
      </EuiFlexItem>
    );
  }

  function handleLuceneSyntaxWarning() {
    if (!props.query) return;
    const { query, language } = props.query;
    if (
      language === 'kuery' &&
      typeof query === 'string' &&
      (!storage || !storage.get('kibana.luceneSyntaxWarningOptOut')) &&
      doesKueryExpressionHaveLuceneSyntaxError(query)
    ) {
      const toast = notifications!.toasts.addWarning({
        title: i18n.translate('data.query.queryBar.luceneSyntaxWarningTitle', {
          defaultMessage: 'Lucene 语法警告',
        }),
        text: toMountPoint(
          <div>
            <p>
              <FormattedMessage
                id="data.query.queryBar.luceneSyntaxWarningMessage"
                defaultMessage="尽管您选择了 Kibana 查询语言 (KQL)，但似乎您正在尝试使用 Lucene 查询语法。请查看 KQL 文档 {link}."
                values={{
                  // link: (
                  //   <EuiLink href={kueryQuerySyntaxLink} target="_blank">
                  //     <FormattedMessage
                  //       id="data.query.queryBar.syntaxOptionsDescription.docsLinkText"
                  //       defaultMessage="此处"
                  //     />
                  //   </EuiLink>
                  // ),
                }}
              />
            </p>
            <EuiFlexGroup justifyContent="flexEnd" gutterSize="s">
              <EuiFlexItem grow={false}>
                <EuiButton size="s" onClick={() => onLuceneSyntaxWarningOptOut(toast)}>
                  <FormattedMessage
                    id="data.query.queryBar.luceneSyntaxWarningOptOutText"
                    defaultMessage="不再显示"
                  />
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </div>
        ),
      });
    }
  }

  function onLuceneSyntaxWarningOptOut(toast: Toast) {
    if (!storage) return;
    storage.set('kibana.luceneSyntaxWarningOptOut', true);
    notifications!.toasts.remove(toast);
  }

  const classes = classNames('kbnQueryBar', {
    'kbnQueryBar--withDatePicker': props.showDatePicker,
  });

  return (
    <EuiFlexGroup
      className={classes}
      responsive={!!props.showDatePicker}
      gutterSize="s"
      justifyContent="flexEnd"
    >
      {renderQueryInput()}
      {renderSharingMetaFields()}
      <EuiFlexItem grow={false}>{renderUpdateButton()}</EuiFlexItem>
    </EuiFlexGroup>
  );
}

QueryBarTopRow.defaultProps = {
  showQueryInput: true,
  showDatePicker: true,
  showAutoRefreshOnly: false,
  refreshTimeButton: false,
};
