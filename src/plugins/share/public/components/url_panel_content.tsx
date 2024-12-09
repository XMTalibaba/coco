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

import React, { Component, ReactElement } from 'react';

import {
  EuiButton,
  EuiCopy,
  EuiFlexGroup,
  EuiSpacer,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiIconTip,
  EuiLoadingSpinner,
  EuiRadioGroup,
  EuiSwitch,
  EuiSwitchEvent,
} from '@elastic/eui';

import { format as formatUrl, parse as parseUrl } from 'url';

import { FormattedMessage, I18nProvider } from '@kbn/i18n/react';
import { HttpStart } from 'kibana/public';
import { i18n } from '@kbn/i18n';

import { shortenUrl } from '../lib/url_shortener';
import { UrlParamExtension } from '../types';

interface Props {
  allowShortUrl: boolean;
  isEmbedded?: boolean;
  objectId?: string;
  objectType: string;
  shareableUrl?: string;
  basePath: string;
  post: HttpStart['post'];
  urlParamExtensions?: UrlParamExtension[];
}

export enum ExportUrlAsType {
  EXPORT_URL_AS_SAVED_OBJECT = 'savedObject',
  EXPORT_URL_AS_SNAPSHOT = 'snapshot',
}

interface UrlParams {
  [extensionName: string]: {
    [queryParam: string]: boolean;
  };
}

interface State {
  exportUrlAs: ExportUrlAsType;
  useShortUrl: boolean;
  isCreatingShortUrl: boolean;
  url?: string;
  shortUrlErrorMsg?: string;
  urlParams?: UrlParams;
}

export class UrlPanelContent extends Component<Props, State> {
  private mounted?: boolean;
  private shortUrlCache?: string;

  constructor(props: Props) {
    super(props);

    this.shortUrlCache = undefined;

    this.state = {
      exportUrlAs: ExportUrlAsType.EXPORT_URL_AS_SNAPSHOT,
      useShortUrl: false,
      isCreatingShortUrl: false,
      url: '',
    };
  }

  public componentWillUnmount() {
    window.removeEventListener('hashchange', this.resetUrl);

    this.mounted = false;
  }

  public componentDidMount() {
    this.mounted = true;
    this.setUrl();

    window.addEventListener('hashchange', this.resetUrl, false);
  }

  public render() {
    return (
      <I18nProvider>
        <EuiForm className="kbnShareContextMenu__finalPanel" data-test-subj="shareUrlForm">
          {this.renderExportAsRadioGroup()}
          {this.renderUrlParamExtensions()}
          {this.renderShortUrlSwitch()}

          <EuiSpacer size="m" />

          <EuiCopy textToCopy={this.state.url || ''} anchorClassName="eui-displayBlock">
            {(copy: () => void) => (
              <EuiButton
                fill
                fullWidth
                onClick={copy}
                disabled={this.state.isCreatingShortUrl || this.state.url === ''}
                data-share-url={this.state.url}
                data-test-subj="copyShareUrlButton"
                size="s"
              >
                {this.props.isEmbedded ? (
                  <FormattedMessage
                    id="share.urlPanel.copyIframeCodeButtonLabel"
                    defaultMessage="复制 iFrame 代码"
                  />
                ) : (
                  <FormattedMessage
                    id="share.urlPanel.copyLinkButtonLabel"
                    defaultMessage="复制链接"
                  />
                )}
              </EuiButton>
            )}
          </EuiCopy>
        </EuiForm>
      </I18nProvider>
    );
  }

  private isNotSaved = () => {
    return this.props.objectId === undefined || this.props.objectId === '';
  };

  private resetUrl = () => {
    if (this.mounted) {
      this.shortUrlCache = undefined;
      this.setState(
        {
          useShortUrl: false,
        },
        this.setUrl
      );
    }
  };

  private updateUrlParams = (url: string) => {
    const embedUrl = this.props.isEmbedded ? this.makeUrlEmbeddable(url) : url;
    const extendUrl = this.state.urlParams ? this.getUrlParamExtensions(embedUrl) : embedUrl;

    return extendUrl;
  };

  private getSavedObjectUrl = () => {
    if (this.isNotSaved()) {
      return;
    }

    const url = this.getSnapshotUrl();

    const parsedUrl = parseUrl(url);
    if (!parsedUrl || !parsedUrl.hash) {
      return;
    }

    // Get the application route, after the hash, and remove the #.
    const parsedAppUrl = parseUrl(parsedUrl.hash.slice(1), true);

    const formattedUrl = formatUrl({
      protocol: parsedUrl.protocol,
      auth: parsedUrl.auth,
      host: parsedUrl.host,
      pathname: parsedUrl.pathname,
      hash: formatUrl({
        pathname: parsedAppUrl.pathname,
        query: {
          // Add global state to the URL so that the iframe doesn't just show the time range
          // default.
          _g: parsedAppUrl.query._g,
        },
      }),
    });

    return this.updateUrlParams(formattedUrl);
  };

  private getSnapshotUrl = () => {
    const url = this.props.shareableUrl || window.location.href;

    return this.updateUrlParams(url);
  };

  private makeUrlEmbeddable = (url: string): string => {
    const embedParam = '?embed=true';
    const urlHasQueryString = url.indexOf('?') !== -1;

    if (urlHasQueryString) {
      return url.replace('?', `${embedParam}&`);
    }

    return `${url}${embedParam}`;
  };

  private getUrlParamExtensions = (url: string): string => {
    const { urlParams } = this.state;
    return urlParams
      ? Object.keys(urlParams).reduce((urlAccumulator, key) => {
          const urlParam = urlParams[key];
          return urlParam
            ? Object.keys(urlParam).reduce((queryAccumulator, queryParam) => {
                const isQueryParamEnabled = urlParam[queryParam];
                return isQueryParamEnabled
                  ? queryAccumulator + `&${queryParam}=true`
                  : queryAccumulator;
              }, urlAccumulator)
            : urlAccumulator;
        }, url)
      : url;
  };

  private makeIframeTag = (url?: string) => {
    if (!url) {
      return;
    }

    return `<iframe src="${url}" height="600" width="800"></iframe>`;
  };

  private setUrl = () => {
    let url;
    if (this.state.exportUrlAs === ExportUrlAsType.EXPORT_URL_AS_SAVED_OBJECT) {
      url = this.getSavedObjectUrl();
    } else if (this.state.useShortUrl) {
      url = this.shortUrlCache;
    } else {
      url = this.getSnapshotUrl();
    }

    if (this.props.isEmbedded) {
      url = this.makeIframeTag(url);
    }

    this.setState({ url });
  };

  private handleExportUrlAs = (optionId: string) => {
    this.setState(
      {
        exportUrlAs: optionId as ExportUrlAsType,
      },
      this.setUrl
    );
  };

  private handleShortUrlChange = async (evt: EuiSwitchEvent) => {
    const isChecked = evt.target.checked;

    if (!isChecked || this.shortUrlCache !== undefined) {
      this.setState({ useShortUrl: isChecked }, this.setUrl);
      return;
    }

    // "Use short URL" is checked but shortUrl has not been generated yet so one needs to be created.
    this.createShortUrl();
  };

  private createShortUrl = async () => {
    this.setState({
      isCreatingShortUrl: true,
      shortUrlErrorMsg: undefined,
    });

    try {
      const shortUrl = await shortenUrl(this.getSnapshotUrl(), {
        basePath: this.props.basePath,
        post: this.props.post,
      });
      if (this.mounted) {
        this.shortUrlCache = shortUrl;
        this.setState(
          {
            isCreatingShortUrl: false,
            useShortUrl: true,
          },
          this.setUrl
        );
      }
    } catch (fetchError) {
      if (this.mounted) {
        this.shortUrlCache = undefined;
        this.setState(
          {
            useShortUrl: false,
            isCreatingShortUrl: false,
            shortUrlErrorMsg: i18n.translate('share.urlPanel.unableCreateShortUrlErrorMessage', {
              defaultMessage: '无法创建短 URL。错误：{errorMessage}',
              values: {
                errorMessage: fetchError.message,
              },
            }),
          },
          this.setUrl
        );
      }
    }
  };

  private renderExportUrlAsOptions = () => {
    return [
      {
        id: ExportUrlAsType.EXPORT_URL_AS_SNAPSHOT,
        label: this.renderWithIconTip(
          <FormattedMessage id="share.urlPanel.snapshotLabel" defaultMessage="快照" />,
          <FormattedMessage
            id="share.urlPanel.snapshotDescription"
            defaultMessage="快照 URL 将 {objectType} 的当前状态编入 URL 自身之中。通过此 URL 无法看到对已保存 {objectType} 的编辑."
            values={{ objectType: this.props.objectType }}
          />
        ),
        ['data-test-subj']: 'exportAsSnapshot',
      },
      {
        id: ExportUrlAsType.EXPORT_URL_AS_SAVED_OBJECT,
        disabled: this.isNotSaved(),
        label: this.renderWithIconTip(
          <FormattedMessage id="share.urlPanel.savedObjectLabel" defaultMessage="已保存的索引" />,
          <FormattedMessage
            id="share.urlPanel.savedObjectDescription"
            defaultMessage="您可以将此 URL 共享给相关人员，以便他们可以加载此 {objectType} 最新的已保存版本."
            values={{ objectType: this.props.objectType }}
          />
        ),
        ['data-test-subj']: 'exportAsSavedObject',
      },
    ];
  };

  private renderWithIconTip = (child: React.ReactNode, tipContent: React.ReactNode) => {
    return (
      <EuiFlexGroup gutterSize="none" responsive={false}>
        <EuiFlexItem grow={false}>{child}</EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiIconTip content={tipContent} position="bottom" />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  };

  private renderExportAsRadioGroup = () => {
    const generateLinkAsHelp = this.isNotSaved() ? (
      <FormattedMessage
        id="share.urlPanel.canNotShareAsSavedObjectHelpText"
        defaultMessage="只有保存{objectType}后，才能共享为已保存的对象."
        values={{ objectType: this.props.objectType }}
      />
    ) : undefined;
    return (
      <EuiFormRow
        label={
          <FormattedMessage
            id="share.urlPanel.generateLinkAsLabel"
            defaultMessage="将连接生成为"
          />
        }
        helpText={generateLinkAsHelp}
      >
        <EuiRadioGroup
          options={this.renderExportUrlAsOptions()}
          idSelected={this.state.exportUrlAs}
          onChange={this.handleExportUrlAs}
        />
      </EuiFormRow>
    );
  };

  private renderShortUrlSwitch = () => {
    if (
      this.state.exportUrlAs === ExportUrlAsType.EXPORT_URL_AS_SAVED_OBJECT ||
      !this.props.allowShortUrl
    ) {
      return;
    }
    const shortUrlLabel = (
      <FormattedMessage id="share.urlPanel.shortUrlLabel" defaultMessage="短 URL" />
    );
    const switchLabel = this.state.isCreatingShortUrl ? (
      <span>
        <EuiLoadingSpinner size="s" /> {shortUrlLabel}
      </span>
    ) : (
      shortUrlLabel
    );
    const switchComponent = (
      <EuiSwitch
        label={switchLabel}
        checked={this.state.useShortUrl}
        onChange={this.handleShortUrlChange}
        data-test-subj="useShortUrl"
      />
    );
    const tipContent = (
      <FormattedMessage
        id="share.urlPanel.shortUrlHelpText"
        defaultMessage="建议共享缩短的快照 URL，以实现最大的兼容性。Internet Explorer 有 URL 长度限制，某些 wiki 和标记分析器无法很好地处理全长版本的快照 URL，但应能很好地处理短 URL."
      />
    );

    return (
      <EuiFormRow helpText={this.state.shortUrlErrorMsg} data-test-subj="createShortUrl">
        {this.renderWithIconTip(switchComponent, tipContent)}
      </EuiFormRow>
    );
  };

  private renderUrlParamExtensions = (): ReactElement | void => {
    if (!this.props.urlParamExtensions) {
      return;
    }

    const setParamValue = (paramName: string) => (
      values: { [queryParam: string]: boolean } = {}
    ): void => {
      const stateUpdate = {
        urlParams: {
          ...this.state.urlParams,
          [paramName]: {
            ...values,
          },
        },
      };
      this.setState(stateUpdate, this.state.useShortUrl ? this.createShortUrl : this.setUrl);
    };

    return (
      <React.Fragment>
        {this.props.urlParamExtensions.map(({ paramName, component: UrlParamComponent }) => (
          <EuiFormRow key={paramName}>
            <UrlParamComponent setParamValue={setParamValue(paramName)} />
          </EuiFormRow>
        ))}
      </React.Fragment>
    );
  };
}
