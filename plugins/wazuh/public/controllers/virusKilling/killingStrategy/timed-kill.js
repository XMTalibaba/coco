import React, { Component } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiTextColor,
	EuiPanel,
	EuiSpacer,
	EuiButton,
  EuiText,
  EuiFieldText,
  EuiSwitch,
  EuiSelect,
  EuiRadioGroup,
  EuiDatePicker,
  EuiFieldNumber,
} from '@elastic/eui';
import { getToasts }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';
import moment from 'moment';
import { AppState } from '../../../react-services/app-state';
import '../../safetyCheckup/checkupPolicy/row-details.scss';

export class TimedKill extends Component {
  _isMount = false;
	constructor(props) {
    super(props);
		this.state = {
			groupsOptions: [],
			groupSelect: '',
      saveParams: {
        disable: false,
        scan_mode: '',
        frequency: 'day',
        time: null,
        wday: '',
        day: '',
        exclude_dir: '',
        clamscan_action: '',
        store_dir: ''
      },
      isCluster: false,
    };
  }
  async componentDidMount() {
    this._isMount = true;
    const isCluster = (AppState.getClusterInfo() || {}).status === 'enabled';
    this.setState({ isCluster });
		await this.getOptions()
    await this.getItems();
  }
  componentWillUnmount() {
    this._isMount = false;
  }
  async componentDidUpdate(prevProps, prevState) {
  }

  async getOptions() {
		try {
			let departmentGroups = await AppState.getDepartmentGroups();
			let groupsOptions = departmentGroups.map(k => {
				let item = {
					value: k.name,
					text: k.name
				}
				return item;
			})
			let groupSelect = groupsOptions.length > 0 ? groupsOptions[0].value : '';

      this.setState({
				groupsOptions,
				groupSelect
			});
    } catch (error) {
      console.log(error)
    }
	}

  async getItems() {
    try {
      const { groupSelect } = this.state;
      if (!groupSelect) {
        this.showToast(
          'danger',
          '警告',
          '定时查杀策略查询失败: 请先创建主机分组',
          3000
        );
        return;
      }
      let saveParams = {
        disable: false,
        scan_mode: '',
        frequency: 'day',
        time: null,
        wday: '',
        day: '',
        exclude_dir: '',
        clamscan_action: '',
        store_dir: '',
      }
      const rawItems = await WzRequest.apiReq( 'GET', `/groups/${groupSelect}/clamscan?pretty=true`, {} );
      const message = ((rawItems || {}).data || {}).message;
      if (!message || message !== 'no clamscan policy') {
        const result = (rawItems || {}).data || {};
        saveParams.disable = result.disable === 'yes' ? false : true;
        saveParams.scan_mode = result.scan_mode;
        saveParams.time = moment(result.time, 'HH:mm');
        saveParams.wday = result.wday !== 'empty' ? result.wday : '';
        saveParams.day = result.day !== 'empty' ? result.day : '';
        saveParams.exclude_dir = result.exclude_dir !== 'empty' ? result.exclude_dir : '';
        saveParams.clamscan_action = result.clamscan_action;
        saveParams.store_dir = result.store_dir !== 'empty' ? result.store_dir : '';
        if (saveParams.day) {
          saveParams.frequency = 'month'
        }
        else if (saveParams.wday) {
          saveParams.frequency = 'week'
        }
      }
      this.setState({ saveParams });
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '定时查杀策略查询失败: ' + error,
        3000
      );
    }
  }

  async saveData() {
    try {
      const { saveParams, isCluster, groupSelect } = this.state;
      console.log(saveParams)
      if (!saveParams.scan_mode || !saveParams.clamscan_action) {
        this.showToast(
          'danger',
          '警告',
          '定时查杀策略保存失败: 杀毒模式和病毒处理方式为必填',
          3000
        );
        return;
      }
      if(saveParams.frequency === 'day' && !saveParams.time) {
        this.showToast(
          'danger',
          '警告',
          '定时查杀策略保存失败: 每日扫描时间为必填',
          3000
        );
        return;
      }
      else if (saveParams.frequency === 'week' && (!saveParams.time || !saveParams.wday)) {
        this.showToast(
          'danger',
          '警告',
          '定时查杀策略保存失败: 每周扫描时间和每日扫描时间为必填',
          3000
        );
        return;
      }
      else if (saveParams.frequency === 'month' && (!saveParams.time || !saveParams.day)) {
        this.showToast(
          'danger',
          '警告',
          '定时查杀策略保存失败: 每月扫描时间和每日扫描时间为必填',
          3000
        );
        return;
      }
      if (saveParams.day && (saveParams.day < 1 || saveParams.day > 31)) {
        this.showToast(
          'danger',
          '警告',
          '定时查杀策略保存失败: 每月扫描时间范围须在 1-31 之间',
          3000
        );
        return;
      }
      // let urlRegex = /^\/.*/; // /开头
      // if (saveParams.exclude_dir && !urlRegex.test(saveParams.exclude_dir)) {
      //   this.showToast(
      //     'danger',
      //     '警告',
      //     '定时查杀策略保存失败: 信任路径不合法',
      //     3000
      //   );
      //   return;
      // }
      if ((saveParams.clamscan_action === 'copy' || saveParams.clamscan_action === 'move') && !saveParams.store_dir) {
        this.showToast(
          'danger',
          '警告',
          '定时查杀策略保存失败: 隔离路径为必填',
          3000
        );
        return;
      }
      // if (saveParams.store_dir && !urlRegex.test(saveParams.store_dir)) {
      //   this.showToast(
      //     'danger',
      //     '警告',
      //     '定时查杀策略保存失败: 隔离路径不合法',
      //     3000
      //   );
      //   return;
      // }

      let params = {
        clamscan_disable: saveParams.disable ? 'no' : 'yes',
        clamscan_mode: saveParams.scan_mode,
        command_time: saveParams.time.format('HH:mm'),
        command_wday: saveParams.wday,
        command_day: saveParams.day,
        exclude_dir: encodeURIComponent(saveParams.exclude_dir),
        clamscan_action: saveParams.clamscan_action,
        store_dir: encodeURIComponent(saveParams.store_dir),
      }
      let url = `${isCluster ? '/cluster' : '/groups'}/${groupSelect}/clamscan?pretty=true`;
      Object.keys(params).forEach(k => {
        if (params[k]) {
          url += `&${k}=${params[k]}`
        }
      })
      await WzRequest.apiReq( 'PUT', url, {} );
      this.showToast(
				'success',
				'成功',
				'定时查杀策略保存成功',
				3000
			);
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '定时查杀策略保存失败: ' + error,
        3000
      );
    }
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  onSelectGroupChanged(value) {
		this.setState({ groupSelect: value }, this.getItems)
	}

  setUpdateSwitchData(e, type) {
    let { saveParams } = this.state;
		saveParams[type] = e.target.checked;
		this.setState({ saveParams });
  }

  setUpdateData(e, type) {
		let { saveParams } = this.state;
		saveParams[type] = e.target.value;
    if (type === 'clamscan_action') saveParams['store_dir'] = ''
		this.setState({ saveParams });
	}

  changeFrequency(type) {
    const { saveParams } = this.state;
    saveParams['frequency'] = type;
    saveParams['time'] = null;
    saveParams['wday'] = '';
    saveParams['day'] = '';
    this.setState({ saveParams })
  }

  changeDate(date) {
    const { saveParams } = this.state;
    saveParams['time'] = date;
    this.setState({ saveParams })
  }

  changeDir(e, type) {
    const { saveParams } = this.state;
    saveParams[type] = e.target.value;
    
    this.setState({ saveParams })
  }

  render() {
    const { saveParams, groupsOptions, groupSelect } = this.state;
    const modeOptions = [
      { value: '', text: '请选择'},
      { value: 'all', text: '全盘扫描'},
      { value: 'quick', text: '快速扫描'},
    ];
    const actionOptions = [
      { value: '', text: '请选择'},
      { value: 'empty', text: '不处理'},
      { value: 'remove', text: '删除病毒'},
      { value: 'copy', text: '将感染文件复制到隔离路径'},
      { value: 'move', text: '将感染文件移动到隔离路径'},
    ];
    const frequencyOptions = [
      { id: 'day', label: '每天' },
      { id: 'week', label: '每周' },
      { id: 'month', label: '每月' },
    ];
    const weekOptions = [
      { value: '', text: '请选择'},
      { value: 'monday', text: '星期一'},
      { value: 'tuesday', text: '星期二'},
      { value: 'wednesday', text: '星期三'},
      { value: 'thursday', text: '星期四'},
      { value: 'friday', text: '星期五'},
      { value: 'saturday', text: '星期六'},
      { value: 'sunday', text: '星期日'},
    ];
    return (
      <EuiPanel>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiTitle size="s">
              <h3>{'定时查杀'}</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTextColor color="subdued">{'配置分组下代理定时病毒查杀策略'}</EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 130 }}>
            <EuiText textAlign="right">{'扫描分组'}:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 220 }}>
            <EuiSelect
              options={groupsOptions}
              value={groupSelect}
              onChange={(e) => this.onSelectGroupChanged(e.target.value)}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="m" />
        <EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
        <EuiSpacer size="m" />
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 130 }}>
            <EuiText textAlign="right">{'定时扫描'}:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 220 }}>
            <EuiSwitch
              label=""
              checked={saveParams['disable']}
              onChange={(e) => this.setUpdateSwitchData(e, 'disable')}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 130 }}>
            <EuiText textAlign="right">{'杀毒模式'}:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 220 }}>
            <EuiSelect
              options={modeOptions}
              value={saveParams['scan_mode']}
              onChange={(e) => this.setUpdateData(e, 'scan_mode')}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 130 }}>
            <EuiText textAlign="right">{'扫描频率'}:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiRadioGroup
              className='planTask_vuldetScan_radioGroup'
              options={frequencyOptions}
              idSelected={saveParams['frequency']}
              onChange={(id) => this.changeFrequency(id)}
              name="frequencyRadio"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        { saveParams['frequency'] === 'week' && (
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false} style={{ width: 130 }}>
              <EuiText textAlign="right">{'每周扫描时间'}:</EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false} style={{ width: 220 }}>
              <EuiSelect
                options={weekOptions}
                value={saveParams['wday']}
                onChange={(e) => this.setUpdateData(e, 'wday')}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
        { saveParams['frequency'] === 'month' && (
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false} style={{ width: 130 }}>
              <EuiText textAlign="right">{'每月扫描时间'}:</EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false} style={{ width: 220 }}>
              <EuiFieldNumber
                value={saveParams['day']}
                onChange={(e) => this.setUpdateData(e, 'day')}
                min={1}
                max={31}
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiTextColor color="subdued">{'日'}</EuiTextColor>
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 130 }}>
            <EuiText textAlign="right">{'每日扫描时间'}:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 220 }}>
            <EuiDatePicker
              showTimeSelect
              showTimeSelectOnly
              selected={saveParams['time']}
              onChange={(date) => this.changeDate(date)}
              dateFormat="HH:mm"
              timeFormat="HH:mm"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 130, marginTop: '20px' }}>
            <EuiText textAlign="right">{'信任路径'}:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 220 }}>
            <EuiFieldText
              value={saveParams['exclude_dir']}
              onChange={(e) => this.changeDir(e, 'exclude_dir')}
            />
            {/* 不可输入空格 */}
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            {/* <EuiTextColor color="subdued" style={{ lineHeight: '40px' }}>路径须以/开头，不可输入空格</EuiTextColor> */}
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 130 }}>
            <EuiText textAlign="right">{'病毒处理方式'}:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 220 }}>
            <EuiSelect
              options={actionOptions}
              value={saveParams['clamscan_action']}
              onChange={(e) => this.setUpdateData(e, 'clamscan_action')}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        { (saveParams['clamscan_action'] === 'copy' || saveParams['clamscan_action'] === 'move') && (
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false} style={{ width: 130, marginTop: '20px' }}>
              <EuiText textAlign="right">{'隔离路径'}:</EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false} style={{ width: 220 }}>
              <EuiFieldText
                value={saveParams['store_dir']}
                onChange={(e) => this.changeDir(e, 'store_dir')}
              />
              {/* 不可输入空格 */}
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              {/* <EuiTextColor color="subdued" style={{ lineHeight: '40px' }}>路径须以/开头，不可输入空格</EuiTextColor> */}
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
        <EuiSpacer></EuiSpacer>
        <EuiButton
          size="s"
          onClick={() => this.saveData(true)}
        >
          保存策略
        </EuiButton>
      </EuiPanel>
    );
  }
}