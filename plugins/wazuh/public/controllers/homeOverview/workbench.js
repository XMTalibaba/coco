import React, { Component, Fragment } from 'react';
import { visualizations } from './visualizations';
import {
  EuiPage,
	EuiFlexGroup,
	EuiFlexItem,
	EuiPanel,
	EuiButtonIcon,
	EuiTitle,
	EuiPopover,
	EuiPopoverTitle,
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { KbnSearchBar } from '../../components/kbn-search-bar';
import { AppState } from '../../react-services/app-state';
import { WzRequest } from '../../react-services/wz-request';
import KibanaVis from '../../kibana-integrations/kibana-vis';
import { getDataPlugin, getUiSettings, getToasts } from '../../kibana-services';
import WzReduxProvider from '../../redux/wz-redux-provider';
import { VisHandlers } from '../../factories/vis-handlers';
import { RawVisualizations } from '../../factories/raw-visualizations';
import { VisFactoryHandler } from '../../react-services/vis-factory-handler';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import domtoimage from 'dom-to-image';

const visHandler = new VisHandlers();

export const Workbench = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '首页' }, { text: '控制台' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class Workbench extends Component {
	_isMount = false;
	constructor(props) {
		super(props);
    this.KibanaServices = getDataPlugin();
    this.timefilter = this.KibanaServices.query.timefilter.timefilter;
		this.state = {
      isDescPopoverOpen: false,
      visualizations: visualizations,
			expandedVis: false,
			dateRange: this.timefilter.getTime(),
			currentUserInfo: {},
      departmentAgents: [],
		}

    this.rawVisualizations = new RawVisualizations();
		this.visFactoryService = VisFactoryHandler;

		this.onQuerySubmit.bind(this);
    this.onFiltersUpdated.bind(this);
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
		try {
      await this.getIndexPattern();
    } catch (err) {
      console.log(err);
    }
	}

	componentWillUnmount() {
    this._isMount = false;
  }

	async componentDidUpdate(prevProps, prevState) {
    if (!this._isMount) { return; }

    if(!_.isEqual(this.state.dateRange, prevState.dateRange)){
      this.setState({ tsUpdated: Date.now()});
      return;
    };

    if (this.state.tsUpdated !== prevState.tsUpdated) {
      try {
				await this.getAlerts()
      } catch (err) {
        console.log(err);
      };
    }
  }
	
	async getIndexPattern () {
    this.indexPattern = {...await this.KibanaServices.indexPatterns.get(AppState.getCurrentPattern())};
    const fields = [];
    Object.keys(this.indexPattern.fields).forEach(item => {
      fields.push(this.indexPattern.fields[item]);
    })
    this.indexPattern.fields = fields;
  }

	getAlerts() {
		const { currentUserInfo, departmentAgents } = this.state;
		let searchSource = {};
		this.visFactoryService.clear();
		// 添加各图表过滤条件
		Object.keys(this.state.visualizations.workbench.searchSource).forEach(k => {
			searchSource[k] = [
				{
					meta: {
						alias: null,
						disabled: false,
						key: 'agent.id',
						negate: true, // 否定，置于 query 的 must_not 中
						params: { query: '000' },
						type: 'phrase',
						index: AppState.getCurrentPattern()
					},
					query: { match_phrase: { 'agent.id': '000' } },
					$state: { store: 'appState' }
				}
			];
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

	onQuerySubmit = (payload) => {
    this.setState({...payload, tsUpdated: Date.now()});
  }

  onFiltersUpdated = (filters) => {
    this.setState({ tsUpdated: Date.now()});
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

	renderTitle() {
		return (
      <EuiFlexGroup>
        <EuiFlexItem className="wz-module-header-agent-title">
          <EuiFlexGroup justifyContent={'spaceBetween'} alignItems="center">
            <EuiFlexItem grow={false}>
              <span style={{ display: 'inline-flex' }}>
                <EuiTitle size="s">
                  <h1>
                    <span>&nbsp;{WAZUH_MODULES['workbench'].title}&nbsp;&nbsp;</span>
                  </h1>
                </EuiTitle>
                <EuiPopover
                  button={
                    <EuiButtonIcon
                      iconType="iInCircle"
                      style={{marginTop: 3}}
                      color='primary'
                      aria-label='Open/close'
                      onClick={() => { this.setState({ isDescPopoverOpen: !this.state.isDescPopoverOpen }) }}
                    />
                  }
                  anchorPosition="rightUp"
                  isOpen={this.state.isDescPopoverOpen}
                  closePopover={() => { this.setState({ isDescPopoverOpen: false }) }}>
                  <EuiPopoverTitle>模块说明</EuiPopoverTitle>
                  <div style={{ width: '400px' }}>
                    {WAZUH_MODULES['workbench'].description}
                  </div>
                </EuiPopover>
              </span>
            </EuiFlexItem>
            <EuiFlexItem grow={false}></EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
	}

	render() {
    const { visualizations } = this.state;
    const title = this.renderTitle();
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
			<EuiFlexGroup direction="column">
				<EuiFlexItem grow={false}>
					<div className="wz-module">
						<div className='wz-module-header-agent-wrapper'>
							<div className='wz-module-header-agent'>
								{title}
							</div>
						</div>
						<div className='wz-module-body-notab'>
							<EuiPage style={{'display': 'block'}}>
								<KbnSearchBar
									indexPattern={this.indexPattern}
									onQuerySubmit={this.onQuerySubmit}
									onFiltersUpdated={this.onFiltersUpdated}
								/>
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
							</EuiPage>
						</div>
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
			
		);
	}
});