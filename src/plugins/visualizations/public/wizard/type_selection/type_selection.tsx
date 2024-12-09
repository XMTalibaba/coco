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

import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';
import { orderBy } from 'lodash';
import React, { ChangeEvent } from 'react';

import {
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiKeyPadMenu,
  EuiKeyPadMenuItem,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiScreenReaderOnly,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';

import { memoizeLast } from '../../legacy/memoize';
import { VisTypeAlias } from '../../vis_types/vis_type_alias_registry';
import { NewVisHelp } from './new_vis_help';
import { VisHelpText } from './vis_help_text';
import { VisTypeIcon } from './vis_type_icon';
import { VisType, TypesStart } from '../../vis_types';

interface VisTypeListEntry {
  type: VisType | VisTypeAlias;
  highlighted: boolean;
}

interface TypeSelectionProps {
  addBasePath: (path: string) => string;
  onVisTypeSelected: (visType: VisType | VisTypeAlias) => void;
  visTypesRegistry: TypesStart;
  showExperimental: boolean;
}

interface HighlightedType {
  name: string;
  title: string;
  description?: string;
  highlightMsg?: string;
}

interface TypeSelectionState {
  highlightedType: HighlightedType | null;
  query: string;
}

function isVisTypeAlias(type: VisType | VisTypeAlias): type is VisTypeAlias {
  return 'aliasPath' in type;
}

class TypeSelection extends React.Component<TypeSelectionProps, TypeSelectionState> {
  public state: TypeSelectionState = {
    highlightedType: null,
    query: '',
  };

  private readonly getFilteredVisTypes = memoizeLast(this.filteredVisTypes);

  public render() {
    const { query, highlightedType } = this.state;
    const visTypes = this.getFilteredVisTypes(this.props.visTypesRegistry, query);
    return (
      <React.Fragment>
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            <FormattedMessage
              id="visualizations.newVisWizard.title"
              defaultMessage="新建可视化"
            />
          </EuiModalHeaderTitle>
        </EuiModalHeader>
        <div className="visNewVisDialog__body">
          <EuiFlexGroup gutterSize="xl">
            <EuiFlexItem>
              <EuiFlexGroup
                className="visNewVisDialog__list"
                direction="column"
                gutterSize="none"
                responsive={false}
              >
                <EuiFlexItem grow={false} className="visNewVisDialog__searchWrapper">
                  <EuiFieldSearch
                    placeholder="Filter"
                    value={query}
                    onChange={this.onQueryChange}
                    fullWidth
                    data-test-subj="filterVisType"
                    aria-label={i18n.translate(
                      'visualizations.newVisWizard.filterVisTypeAriaLabel',
                      {
                        defaultMessage: '筛留可视化类型',
                      }
                    )}
                  />
                </EuiFlexItem>
                <EuiFlexItem grow={1} className="visNewVisDialog__typesWrapper">
                  <EuiScreenReaderOnly>
                    <span aria-live="polite">
                      {query && (
                        <FormattedMessage
                          id="visualizations.newVisWizard.resultsFound"
                          defaultMessage="找到了 {resultCount} 个{resultCount, plural, one {类型} other {类型} }"
                          values={{
                            resultCount: visTypes.filter((type) => type.highlighted).length,
                          }}
                        />
                      )}
                    </span>
                  </EuiScreenReaderOnly>
                  <EuiKeyPadMenu
                    className="visNewVisDialog__types"
                    data-test-subj="visNewDialogTypes"
                  >
                    {visTypes.map(this.renderVisType)}
                  </EuiKeyPadMenu>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem className="visNewVisDialog__description" grow={false}>
              {highlightedType ? (
                <VisHelpText {...highlightedType} />
              ) : (
                <React.Fragment>
                  <EuiTitle size="s">
                    <h2>
                      <FormattedMessage
                        id="visualizations.newVisWizard.selectVisType"
                        defaultMessage="选择可视化类型"
                      />
                    </h2>
                  </EuiTitle>
                  <EuiSpacer size="m" />
                  <NewVisHelp
                    promotedTypes={visTypes
                      .map((t) => t.type)
                      .filter((t): t is VisTypeAlias => isVisTypeAlias(t) && Boolean(t.promotion))}
                    onPromotionClicked={this.props.onVisTypeSelected}
                  />
                </React.Fragment>
              )}
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>
      </React.Fragment>
    );
  }

  private filteredVisTypes(visTypes: TypesStart, query: string): VisTypeListEntry[] {
    const types = visTypes.all().filter((type) => {
      // Filter out all lab visualizations if lab mode is not enabled
      if (!this.props.showExperimental && type.stage === 'experimental') {
        return false;
      }

      // Filter out hidden visualizations
      if (type.hidden) {
        return false;
      }

      return true;
    });

    const allTypes = [...types, ...visTypes.getAliases()];

    let entries: VisTypeListEntry[];
    if (!query) {
      entries = allTypes.map((type) => ({ type, highlighted: false }));
    } else {
      const q = query.toLowerCase();
      entries = allTypes.map((type) => {
        const matchesQuery =
          type.name.toLowerCase().includes(q) ||
          type.title.toLowerCase().includes(q) ||
          (typeof type.description === 'string' && type.description.toLowerCase().includes(q));
        return { type, highlighted: matchesQuery };
      });
    }

    return orderBy(
      entries,
      ['highlighted', 'type.promotion', 'type.title'],
      ['desc', 'asc', 'asc']
    );
  }

  private renderVisType = (visType: VisTypeListEntry) => {
  if(visType.type.name=='region_map'||visType.type.name=='input_control_vis'){
                   return 
  }
    let stage = {};
    let highlightMsg;
    if (!isVisTypeAlias(visType.type) && visType.type.stage === 'experimental') {
      stage = {
        betaBadgeLabel: i18n.translate('visualizations.newVisWizard.experimentalTitle', {
          defaultMessage: '实验性',
        }),
        betaBadgeTooltipContent: i18n.translate('visualizations.newVisWizard.experimentalTooltip', {
          defaultMessage:
            '未来版本可能会更改或删除此可视化，其不受支持 SLA 的约束.',
        }),
      };
      highlightMsg = i18n.translate('visualizations.newVisWizard.experimentalDescription', {
        defaultMessage:
          '这是实验性可视化。与稳定的可视化相比，其设计和实现均不够成熟，可能会随时发生更改.',
      });
    } else if (isVisTypeAlias(visType.type) && visType.type.stage === 'beta') {
      const aliasDescription = i18n.translate('visualizations.newVisWizard.betaDescription', {
        defaultMessage:
          '此可视化为公测版，可能会进行更改。设计和代码相对于正式发行版功能还不够成熟，将按原样提供，且不提供任何保证。公测版功能不受正式发行版功能支持 SLA 的约束',
      });
      stage = {
        betaBadgeLabel: i18n.translate('visualizations.newVisWizard.betaTitle', {
          defaultMessage: '公测版',
        }),
        betaBadgeTooltipContent: aliasDescription,
      };
      highlightMsg = aliasDescription;
    }

    const isDisabled = this.state.query !== '' && !visType.highlighted;
    const onClick = () => this.props.onVisTypeSelected(visType.type);

    const highlightedType: HighlightedType = {
      title: visType.type.title,
      name: visType.type.name,
      description: visType.type.description,
      highlightMsg,
    };

    return (
      <EuiKeyPadMenuItem
        key={visType.type.name}
        label={<span data-test-subj="visTypeTitle">{visType.type.title}</span>}
        onClick={onClick}
        onFocus={() => this.setHighlightType(highlightedType)}
        onMouseEnter={() => this.setHighlightType(highlightedType)}
        onMouseLeave={() => this.setHighlightType(null)}
        onBlur={() => this.setHighlightType(null)}
        className="visNewVisDialog__type"
        data-test-subj={`visType-${visType.type.name}`}
        data-vis-stage={!isVisTypeAlias(visType.type) ? visType.type.stage : 'alias'}
        disabled={isDisabled}
        aria-describedby={`visTypeDescription-${visType.type.name}`}
        {...stage}
      >
        <VisTypeIcon
          icon={visType.type.icon}
          image={'image' in visType.type ? visType.type.image : undefined}
        />
      </EuiKeyPadMenuItem>
    );
  };

  private setHighlightType(highlightedType: HighlightedType | null) {
    this.setState({
      highlightedType,
    });
  }

  private onQueryChange = (ev: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      query: ev.target.value,
    });
  };
}

export { TypeSelection };
