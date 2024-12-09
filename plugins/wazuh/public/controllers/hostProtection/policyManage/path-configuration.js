import React, { Component, Fragment } from 'react';
import {
  EuiPage,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiPopover,
	EuiButtonIcon,
	EuiPopoverTitle,
	EuiPanel,
	EuiBasicTable,
	EuiText,
  EuiButtonEmpty,
	EuiFieldText,
	EuiSwitch,
  EuiSpacer,
  EuiTextColor,
  EuiTextArea,
  EuiButton,
  EuiToolTip
} from '@elastic/eui';
import GroupsHandler from '../../management/components/management/groups/utils/groups-handler';
import { getToasts }  from '../../../kibana-services';
import { WzButtonPermissions } from '../../../components/common/permissions/button';
import { WzRequest } from '../../../react-services/wz-request';

export class PathConfiguration extends Component {
	constructor(props) {
		super(props);
		this.state = {
      isDescPopoverOpen: false,
      detailsItem: '',
			protectionSaveParams: {
				url: ''
			},
      trustSaveParams: {
				url: ''
			}
    };
    this.groupsHandler = GroupsHandler;
	}

	async componentDidMount() {
    this._isMount = true;
    this.setState({detailsItem: this.props.policyManageType});
		if (this.props.policyManageType) {
      this.toSearchProtectionConfig(this.props.policyManageType)
      this.toSearchTrustConfig(this.props.policyManageType)
    }
  }
  componentWillUnmount() {
    this._isMount = false;
  }
  async componentDidUpdate(prevProps, prevState) {
    if (this.props.selectView === 'pathConfiguration' && prevProps.policyManageType !== this.props.policyManageType) {
      this.setState({detailsItem: this.props.policyManageType});
      this.toSearchProtectionConfig(this.props.policyManageType)
      this.toSearchTrustConfig(this.props.policyManageType)
    }
  }

  setProtectionUpdateDate(e, type) {
		let { protectionSaveParams } = this.state;
    protectionSaveParams[type] = e.target.value
		// protectionSaveParams[type] = e.target.value.replace(/[^\x00-\xff]/g, '').replace(/[\s+`~!@#$%^&*()+=<>?:"{}|,.\\;'\\[\]·~！@#￥%……&*（）——\+={}|《》？：“”【】、；‘’，。、]/g, '').split(" ").join("");
    // 不可输入中文、空格、特殊符号(特殊符号只可以输入/、-、_)
		this.setState({ protectionSaveParams });
	}

  setTrustUpdateDate(e, type) {
		let { trustSaveParams } = this.state;
    trustSaveParams[type] = e.target.value
		// trustSaveParams[type] = e.target.value.replace(/[^\x00-\xff]/g, '').replace(/[\s+`~!@#$%^&*()+=<>?:"{}|,.\\;'\\[\]·~！@#￥%……&*（）——\+={}|《》？：“”【】、；‘’，。、]/g, '').split(" ").join("");
		// 不可输入中文、空格、特殊符号(特殊符号只可以输入/、-、_)
    this.setState({ trustSaveParams });
	}

  async toSearchProtectionConfig(detailsItem) {
    try {
			const rawItems = await WzRequest.apiReq('GET', `/groups/${detailsItem}/monitor_directories?pretty=true`, {});
			const url = ((rawItems || {}).data || {}).message;
      const protectionSaveParams = { url: url === 'no directories monitor' ? '' : url };
      this.setState({ protectionSaveParams, detailsItem });
    } catch (error) {
      console.log(error)
    }
  }

  async toSearchTrustConfig(detailsItem) {
    try {
			const rawItems = await WzRequest.apiReq('GET', `/groups/${detailsItem}/ignore_directories?pretty=true`, {});
			const url = ((rawItems || {}).data || {}).message;
      const trustSaveParams = { url: url === 'no directories ignore' ? '' : url };
      this.setState({ trustSaveParams, detailsItem });
    } catch (error) {
      console.log(error)
    }
  }

  async saveProtectionConfig() {
    const { protectionSaveParams, detailsItem } = this.state;
    // let urlRegex = /^((\/([\w\-]+\/?)+([\w\-]+\.\w+)?)+,?)+$/; // 可以指向文件夹，也可以指向文件名。/开头，字符串为数字字母_-

    // if (protectionSaveParams.url && !urlRegex.test(protectionSaveParams.url)) {
    //   this.showToast(
		// 		'danger',
		// 		'警告',
		// 		'保护路径保存失败: 路径格式不合法，路径须以/开头，路径字符串只可以包含数字、字母、_、-',
		// 		3000
		// 	);
    //   return;
    // }
    
    const rawItems = await WzRequest.apiReq('PUT', `/groups/${detailsItem}/monitor_directories?monitor_dir=${protectionSaveParams.url ? encodeURIComponent(protectionSaveParams.url) : 'nodirectories'}`, {});
    const items_message = ((rawItems || {}).data || {}).message;
    if (items_message.includes('success')) {
      this.showToast(
        'success',
        '成功',
        '保护路径配置保存成功',
        3000
      );
      this.toSearchProtectionConfig(detailsItem)
    }
    else {
      this.showToast(
        'danger',
        '警告',
        '保护路径配置保存失败',
        3000
      );
    }
  }

  async saveTrustConfig() {
    const { trustSaveParams, detailsItem } = this.state;
    // let urlRegex = /^((\/([\w\-]+\/?)+([\w\-]+\.\w+)?)+,?)+$/; // 可以指向文件夹，也可以指向文件名。/开头，字符串为数字字母_-

    // if (trustSaveParams.url && !urlRegex.test(trustSaveParams.url)) {
    //   this.showToast(
		// 		'danger',
		// 		'警告',
		// 		'信任路径保存失败: 路径格式不合法，路径须以/开头，路径字符串只可以包含数字、字母、_、-',
		// 		3000
		// 	);
    //   return;
    // }
    
    const rawItems = await WzRequest.apiReq('PUT', `/groups/${detailsItem}/ignore_directories?ignore_dir=${trustSaveParams.url ? encodeURIComponent(trustSaveParams.url) : 'nodirectories'}`, {});
    const items_message = ((rawItems || {}).data || {}).message;
    if (items_message.includes('success')) {
      this.showToast(
        'success',
        '成功',
        '信任路径配置保存成功',
        3000
      );
      this.toSearchTrustConfig(detailsItem)
    }
    else {
      this.showToast(
        'danger',
        '警告',
        '信任路径配置保存失败',
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

	render() {
		const { detailsItem, protectionSaveParams, trustSaveParams } = this.state;

		return (
			<div>
        <EuiSpacer size="m"></EuiSpacer>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiTitle size={'xs'} style={{ padding: '6px 0px' }}>
              <h4>{`${detailsItem}组保护路径配置`}</h4>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>
						<EuiTextColor color="subdued">实时扫描保护区内的文件是否被删除、被修改或者为恶意文件</EuiTextColor>
					</EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem grow={false} style={{ width: 100 }}>
            <EuiText textAlign="right" style={{ lineHeight: '40px' }}>保护路径:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 205 }}>
            <EuiTextArea
              value={protectionSaveParams['url']}
              onChange={(e) => this.setProtectionUpdateDate(e, 'url')}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <p>
              <EuiTextColor color="subdued" style={{ lineHeight: '40px' }}>路径可指向文件夹或文件名；多条路径以英文逗号分隔</EuiTextColor>
            </p>
            {/* <p>
              <EuiTextColor color="subdued">路径须以/开头，路径字符串只可以包含数字、字母、_、-</EuiTextColor>
            </p> */}
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer></EuiSpacer>
        <EuiButton
          size="s"
          onClick={() => this.saveProtectionConfig()}
        >
          保存
        </EuiButton>
				<EuiSpacer size="xl" />
				<EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
				<EuiSpacer size="xl" />
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiTitle size={'xs'} style={{ padding: '6px 0px' }}>
              <h4>{`${detailsItem}组信任路径配置`}</h4>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>
						<EuiTextColor color="subdued">文件扫描和病毒实时查杀自动跳过信任路径，添加到信任区的文件不做检测</EuiTextColor>
					</EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem grow={false} style={{ width: 100 }}>
            <EuiText textAlign="right" style={{ lineHeight: '40px' }}>信任路径:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 205 }}>
            <EuiTextArea
              value={trustSaveParams['url']}
              onChange={(e) => this.setTrustUpdateDate(e, 'url')}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <p>
              <EuiTextColor color="subdued" style={{ lineHeight: '40px' }}>路径可指向文件夹或文件名；多条路径以英文逗号分隔</EuiTextColor>
            </p>
            {/* <p>
              <EuiTextColor color="subdued">路径须以/开头，路径字符串只可以包含数字、字母、_、-</EuiTextColor>
            </p> */}
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer></EuiSpacer>
        <EuiButton
          size="s"
          onClick={() => this.saveTrustConfig()}
        >
          保存
        </EuiButton>
      </div>
		);
	}
};