import React, { Component, Fragment } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
  EuiPanel,
  EuiTextColor,
  EuiSpacer,
  EuiRadioGroup,
  EuiButton,
  EuiOverlayMask,
  EuiConfirmModal,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiButtonEmpty,
  EuiProgress,
} from '@elastic/eui';
import { getToasts }  from '../../../kibana-services';
import { formatUIDate } from '../../../react-services/time-service';
import { WzRequest } from '../../../react-services/wz-request';
import WzRestartClusterManagerCallout from '../../../components/common/restart-cluster-manager-callout';
import { CDBList } from './CDB-list';
import * as echarts from 'echarts';

export class Deduction extends Component {
  _isMount = false;
  constructor(props) {
		super(props);
    this.myScoreChart = null;
    this.myLineChart = null;
		this.state = {
      score: '',
      deductionTime: '',
      advice: '',
      planSelect: '',
      configModalVisible: false,
      editList: React.createRef(),
      showWarningRestart: false,
      showWarningRestartBackup: false
    };
	}

  async componentDidMount() {
    this._isMount = true;
    this.toSearch();
    window.addEventListener('resize', this.updateHeight);
  }

  componentWillUnmount() {
    this._isMount = false;
    window.removeEventListener('resize', this.updateHeight);
  }

  updateHeight = () => {
    this.myScoreChart && this.myScoreChart.resize();
    this.myLineChart && this.myLineChart.resize();
  };

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  async toSearch() {
    try {
      // 查询上次推演分数、时间、选择方案
      const { deductionUtl } = this.props;
      const rawItems = await WzRequest.apiReq('GET', deductionUtl, {});
      let score = Math.round(((rawItems || {}).data || {}).score);
      let planSelect = ((rawItems || {}).data || {}).plan.toString();
      let time = ((rawItems || {}).data || {}).score_time;
      this.setState({ planSelect, advice: '', score, deductionTime: time });
      this.buildChart(score, time);
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '上次推演数据查询失败: ' + error,
        3000
      );
    }
  }

  async toDeduction() {
    try {
      // 推演分数、时间、建议方案
      const { deductionUtl } = this.props;
      this.setState({ isLoading: true });
      const rawItems = await WzRequest.apiReq('POST', deductionUtl, {});
      let msg = ((rawItems || {}).data || {}).message;
      if (msg.includes('success')) {
        let score = Math.round(((rawItems || {}).data || {}).score);
        let advice = ((rawItems || {}).data || {}).plan.toString();
        let time = new Date();
        this.setState({ advice, score, deductionTime: '' });
        this.buildChart(score, time);
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '推演失败',
          3000
        );
      }
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '推演失败: ' + error,
        3000
      );
    }
    this.setState({ isLoading: false });
  }

  buildChart(score, deductionTime) {

    let option = {
      series: [
        {
          type: 'gauge',
          progress: {
            show: true,
            width: 18
          },
          axisLine: {
            lineStyle: {
              width: 18
            }
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              width: 2,
              color: '#999'
            }
          },
          axisLabel: {
            distance: 25,
            color: '#999',
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 25,
            itemStyle: {
              borderWidth: 10
            }
          },
          title: {
            show: false
          },
          detail: {
            valueAnimation: true,
            fontSize: 80,
            offsetCenter: [0, '90%']
          },
          data: [
            {
              value: score
            }
          ]
        }
      ]
    }

    let timer = setInterval(() => {
      let chartDom = document.getElementById('scoreChartsBox');
      if (chartDom) {
        clearInterval(timer);
        this.myScoreChart = echarts.init(document.getElementById('scoreChartsBox'));
        this.myScoreChart.setOption(option);
      }
    }, 200);

    if (score && score !== 0) this.buildLine(score, deductionTime)
    
  }

  buildLine(score, deductionTime) {
    let xAxisData = [], seriesData = [];
    let timestamp = new Date(deductionTime).getTime()
    for (let i = 0; i < 7; i ++, timestamp += 86400000) {
      xAxisData.push(this.formatTime(timestamp))
      if (i === 0) {
        seriesData.push(100 - score)
      }
      else {
        let lastScore = seriesData[seriesData.length -1];
        let add = 0;
        if (score < 60) {
          if (lastScore < 80) {
            add = 10;
          }
          else if (lastScore < 95) {
            add = 5;
          }
          else {
            add = 0;
          }
        }
        else if (score < 80) {
          if (lastScore < 70) {
            add = 8;
          }
          else if (lastScore < 80) {
            add = 4;
          }
          else {
            add = 0;
          }
        }
        else {
          if (lastScore < 60) {
            add = 6;
          }
          else {
            add = 0;
          }
        }
        seriesData.push(lastScore + add)
      }
    }
    let option = {
      title: {
        left: 'center',
        text: '事件概率趋势预测图'
      },
      visualMap: {
        show: false,
        type: 'continuous',
        min: 0,
        max: 100,
        inRange: {
          color: ['#91CC75', '#73C0DE', '#EE6666']
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        name: '时间',
        type: 'category',
        boundaryGap: false,
        data: xAxisData
      },
      yAxis: {
        name: '概率',
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        {
          name: '事件概率',
          type: 'line',
          data: seriesData,
          smooth: true,
          tooltip: {
            valueFormatter: value => `${value}%`
          }
        }
      ]
    };

    let timer = setInterval(() => {
      let chartDom = document.getElementById('lineChartsBox');
      if (chartDom) {
        clearInterval(timer);
        this.myLineChart = echarts.init(document.getElementById('lineChartsBox'));
        this.myLineChart.setOption(option);
      }
    }, 200);
  }

  formatTime(timestamp) {
    let date = new Date(timestamp);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (month < 10) {
      month = "0" + month;
    }
    if (day < 10) {
      day = "0" + day;
    }
    let resDate = year + "-" + month + "-" + day;
    return resDate
  }

  toConfig() {
    const { planSelect } = this.state;
    if (!planSelect || planSelect === '0') {
      this.showToast(
				'danger',
				'警告',
				'配置失败: 请先选择方案',
				3000
			);
    }
    else {
      this.setConfigModal(true)
    }
  }

  setConfigModal(flag) {
    this.setState({ configModalVisible: flag});
  }

  scoreRender() {
    const { deductionTime, advice, isLoading, score } = this.state;
    const adviceText = {
      '1': '方案一',
      '2': '方案二',
      '3': '方案三',
    };

    return (
      <div>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiTitle size={'s'} style={{ padding: '6px 0px' }}>
              <h2>推演分数</h2>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTextColor color="subdued">{ deductionTime && deductionTime !== '0' ? `上次推演时间: ${formatUIDate(deductionTime)}` : '' }{ advice && deductionTime ? `，建议选择${adviceText[advice]}` : advice ? `建议选择${adviceText[advice]}` : ''}</EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup>
        <div style={ isLoading ? { padding: '5px 0'} : { padding: '6px 0' }}>
          { isLoading && (
          <EuiProgress size="xs" color="primary" />
          )}
        </div>
        <EuiSpacer size="xs" />
        <EuiFlexGroup justifyContent="center">
          <EuiFlexItem style={{ width: '400px' }} grow={false}>
            <div id="scoreChartsBox" style={{ height: '300px', width: '100%' }}></div>
          </EuiFlexItem>
          { score !== 0 && (
            <EuiFlexItem>
              <div id="lineChartsBox" style={{ height: '300px', width: '100%' }}></div>
            </EuiFlexItem>
          )}
          
        </EuiFlexGroup>
        <EuiSpacer size="m" />
        <EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
        <EuiSpacer size="m" />
      </div>
    );
  }

  planRender() {
    const { planSelect, showWarningRestartBackup } = this.state;
    const { planOptions } = this.props;
    return (
      <div>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiTitle size={'s'} style={{ padding: '6px 0px' }}>
              <h2>推演方案</h2>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTextColor color="subdued">{'选择方案后，配置相关参数进行保存'}</EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup>
        {showWarningRestartBackup && (
          <Fragment>
            <EuiSpacer size='s'/>
            <WzRestartClusterManagerCallout
              onRestart={() => this.setState({showWarningRestartBackup: true})}
              onRestarted={() => this.setState({showWarningRestartBackup: false})}
              onRestartedError={() => this.setState({showWarningRestartBackup: true})}
            />
          </Fragment>
        )}
        <EuiSpacer size="xs" />
        <div style={{ padding: '0 16px' }}>
          <EuiRadioGroup
            options={planOptions}
            idSelected={planSelect}
            onChange={(id) => this.setState({ planSelect: id }) }
            name="radio group"
          />
        </div>
        <EuiSpacer size="m" />
        <EuiButton
          size="s"
          onClick={() => this.toConfig()}
        >
          配置
        </EuiButton>
      </div>
    );
  }

  async toSaveConfig() {
    this.state.editList.current.state.editList.current.saveList();
  }

  async toSavePlan(list) {
    try {
      const { planSelect } = this.state;
      const { planSaveUrl } = this.props;
      const rawItems = await WzRequest.apiReq('POST', `${planSaveUrl}${planSelect}${list ? `?black_list=${list}` : ''}`, {});
      
      let msg = ((rawItems || {}).data || {}).message;
      if (msg.includes('success')) {
        this.showToast('success', '成功', '推演方案保存成功', 3000);
        this.toSearch();
        this.setState({ showWarningRestartBackup: true });
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '推演方案保存失败',
          3000
        );
      }
      
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '推演方案保存失败: ' + error,
        3000
      );
    }
    this.setConfigModal(false);
  }

  render() {
    const { score, planSelect, configModalVisible, editList } = this.state;
    const { type, configPlan, noConfigMess } = this.props;
    const scoreItem = this.scoreRender();
    const planImtem = this.planRender();
    let configModal;
    if (configModalVisible && configPlan.indexOf(planSelect) === -1) {
      configModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title={`${noConfigMess ? noConfigMess : "该方案不需要配置，确认保存吗？"}`}
            onCancel={() => this.setConfigModal(false)}
            onConfirm={() => this.toSavePlan('')}
            cancelButtonText="取消"
            confirmButtonText="确认"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          >
          </EuiConfirmModal>
        </EuiOverlayMask>
      );
    }
    else if (configModalVisible) {
      configModal = (
        <EuiOverlayMask>
          <EuiModal onClose={() => this.setConfigModal(false)} initialFocus="[name=popswitch]">
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <h1>配置参数</h1>
              </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
              <CDBList filename={type} ref={editList} toSavePlan={(list) => this.toSavePlan(list)}></CDBList>
            </EuiModalBody>
            <EuiModalFooter>
              <EuiButtonEmpty onClick={() => this.setConfigModal(false)}>取消</EuiButtonEmpty>
              <EuiButton onClick={() => this.toSaveConfig()} fill>保存</EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      );
    }
    
    return (
      <EuiPanel paddingSize="m">
        { score !== '' && scoreItem}
        {planImtem}
        {configModal}
      </EuiPanel>
    )
  }
}