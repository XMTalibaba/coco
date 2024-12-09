import React, { Component, Fragment } from 'react';
import { visualizations } from './visualizations';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiButtonIcon,
} from '@elastic/eui';
import { AppState } from '../../../react-services/app-state';
import KibanaVis from '../../../kibana-integrations/kibana-vis';
import { getDataPlugin, getUiSettings, getToasts } from '../../../kibana-services';
import WzReduxProvider from '../../../redux/wz-redux-provider';
import { VisHandlers } from '../../../factories/vis-handlers';
import { RawVisualizations } from '../../../factories/raw-visualizations';
import { VisFactoryHandler } from '../../../react-services/vis-factory-handler';
import domtoimage from 'dom-to-image';
 
const visHandler = new VisHandlers();
 
export class VulnVis extends Component {
  _isMount = false;
  constructor(props) {
  super(props);
  this.KibanaServices = getDataPlugin();
  this.timefilter = this.KibanaServices.query.timefilter.timefilter;
  this.state = {
    visualizations: visualizations,
    expandedVis: false,
    currentUserInfo: {},
    departmentAgents: [],
  }

  this.rawVisualizations = new RawVisualizations();
  this.visFactoryService = VisFactoryHandler;
  }
 
  async componentDidMount() {
    this._isMount = true;
    let currentUserInfo = await AppState.getCurrentUserInfo();
    this.setState({ currentUserInfo });
    if (currentUserInfo.department) {
			await AppState.setCurrentUserInfo()
      let departmentAgents = await AppState.getDepartmentAgents();
      this.setState({ departmentAgents })
    }

    visHandler.removeAll();
    await this.getAlerts()
  }
 
  componentWillUnmount() {
    this._isMount = false;
  }
 
  async componentDidUpdate(prevProps, prevState) {
    if (!this._isMount) { return; }
 
    if (this.props.tsUpdated !== prevProps.tsUpdated) {
      try {
        await this.getAlerts()
      } catch (err) {
        console.log(err);
      };
    }
  }
 
  getAlerts() {
		const { currentUserInfo, departmentAgents } = this.state;
    let searchSource = {};
    this.visFactoryService.clear();
    // 添加各图表过滤条件
    Object.keys(this.state.visualizations.workbench.searchSource).forEach(k => {
      searchSource[k] = [];
      this.state.visualizations.workbench.searchSource[k].forEach(s => {
        if (s.type === 'phraseFilter') { // 是类型
          searchSource[k].push({
            meta: {
              alias: null,
              disabled: false,
              key: s.params.name,
              negate: false,
              params: { query: s.params.params },
              type: 'phrase',
              index: AppState.getCurrentPattern()
            },
            query: { match: { [s.params.name]: {query: s.params.params, type: 'phrase'} } },
            $state: { store: 'appState', isImplicit: true }
          })
        }
        else if (s.type === 'phrasesFilter') { // 属于
          let should = [];
          s.params.params.forEach(p => {
            should.push({
              match_phrase: { [s.params.name]: p }
            })
          })
          searchSource[k].push({
            meta: {
              alias: null,
              disabled: false,
              key: s.params.name,
              negate: false,
              params: s.params.params,
              type: 'phrases',
              index: AppState.getCurrentPattern()
            },
            query: { bool: { minimum_should_match: 1, should } },
            $state: { store: 'appState' }
          })
        }
      })

      if (currentUserInfo.department) {
				let should = [], params = [];
				if (departmentAgents.length > 0) {
					departmentAgents.forEach(k => {
						params.push(k.id)
						should.push({
							match_phrase: { 'agent.id': k.id }
						})
					})
				}
				else {
					params.push('')
					should.push({
						match_phrase: { 'agent.id': '' }
					})
				}
				searchSource[k].push({
					meta: {
						alias: null,
						disabled: false,
						key: 'agent.id',
						negate: false,
						params,
						type: 'phrases',
						index: AppState.getCurrentPattern()
					},
					query: { bool: { minimum_should_match: 1, should } },
					$state: { store: 'appState' }
				})
			}
    })
    return this.visFactoryService.buildWorkbenchVisualizations(this.state.visualizations.workbench.rawVis, searchSource);
  }
 
  expand = id => {
    this.setState({ expandedVis: this.state.expandedVis === id ? false : id });
  };
 
  getImg = (id, title) => {
    const node = document.getElementById(`${id}-Warp`);
    domtoimage.toPng(node).then((defaultUrl) => {
      let link = document.createElement('a');
      link.download = `${title}.png`;
      link.href = defaultUrl;
      link.click();
    }).catch((e) => {
      console.log("error", e)
    })
  }
 
  render() {
    const { visualizations } = this.state;
    const renderVisualizations = vis => {
      return (
        <EuiFlexItem
          grow={parseInt((vis.width || 10) / 10)}
          key={vis.id}
          style={{ maxWidth: vis.width + '%', margin: 0, padding: 12 }}
        >
          <EuiPanel
            paddingSize="none"
            className={
              this.state.expandedVis === vis.id ? 'fullscreen h-100' : 'h-100'
            }
            id={`${vis.id}-Warp`}
          >
            <EuiFlexItem className="h-100">
              <EuiFlexGroup
                style={{ padding: '12px 12px 0px' }}
                className="embPanel__header"
              >
                <h2 className="embPanel__title wz-headline-title">
                  {vis.title}
                </h2>
                { this.state.expandedVis !== vis.id && (
                  <EuiButtonIcon
                    color="text"
                    style={{ padding: '0px 6px', height: 30 }}
                    onClick={() => this.getImg(vis.id, vis.title)}
                    iconType="save"
                    aria-label="保存"
                  />
                )}
                <EuiButtonIcon
                  color="text"
                  style={{ padding: '0px 6px', height: 30 }}
                  onClick={() => this.expand(vis.id)}
                  iconType={this.state.expandedVis !== vis.id ? "expand" : "minimize"}
                  aria-label="展开"
                />
              </EuiFlexGroup>
              <div style={{ height: '100%' }}>
                <WzReduxProvider>
                  <KibanaVis
                    visID={vis.id}
                    tab={"workbench"}
                  ></KibanaVis>
                </WzReduxProvider>
              </div>
            </EuiFlexItem>
          </EuiPanel>
        </EuiFlexItem>
      );
    };
 
    return (
      <div>
        {
          visualizations['workbench'].rows.map((row, i) => {
            return (
              <EuiFlexGroup
                key={i}
                style={{
                  display: row.hide && 'none',
                  height: row.height || 0 + 'px',
                  margin: 0,
                  maxWidth: '100%'
                }}
              >
                {row.vis.map((vis, n) => {
                  return renderVisualizations(vis)
                })}
              </EuiFlexGroup>
            );
          })
        }
      </div>
    )
  }
}