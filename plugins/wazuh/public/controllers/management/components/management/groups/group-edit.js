import React, { Component } from 'react';
import {
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiSpacer,
  EuiButtonEmpty,
  EuiFieldText,
  EuiText,
  EuiButton,
  EuiSelect,
  EuiTextColor,
} from '@elastic/eui';
import { getToasts, getHttp } from '../../../../../kibana-services';
import { WzRequest } from '../../../../../react-services/wz-request';
import { AppState } from '../../../../../react-services/app-state';
 
export class GroupEdit extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.state = {
      labelList: [],
      formParams: {
        group_id: '',
        label_id: '',
      },
      currentUserInfo: {},
    }
  }
 
  async componentDidMount() {
    this._isMount = true;

    await this.getTagList();

    const { formParams } = this.state;

    let currentUserInfo = await AppState.getCurrentUserInfo();
    if (currentUserInfo.department) {
      formParams.label_id = currentUserInfo.department;
    }
    // 如果是编辑，在这里赋值
    if (this.props.listType !== 'add') {
      let { detailsItem } = this.props;
      formParams.group_id = detailsItem.name;
      formParams.label_id = detailsItem.label;
    }
    this.setState({ formParams, currentUserInfo })
  }
 
  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  }
 
  onChangeValue(e, type) {
    let { formParams } = this.state;
    formParams[type] = e.target.value;
    this.setState({ formParams });
  }
 
  onChangeValueChinese(e, type) {
    let { formParams } = this.state;
    formParams[type] = e.target.value.replace(/[^\x00-\xff]/g, '').replace(/[\s+`~!@#$%^&*()_\-+=<>?:"{}|,.\\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/g, '').split(" ").join("");
    this.setState({ formParams });
  }
 
  async getTagList() {
    try {
      const tag1Items = await WzRequest.apiReq('GET', `/sys_labels?pretty=true`, {});
      let labelList = (
        ((tag1Items || {}).data || {}).data || {}
      ).affected_items.map(k => ({ value: k.id, text: k.show_name }))
      labelList.unshift({ value: '', text: '请选择' })
 
      this.setState({ labelList })
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '部门列表查询失败: ' + error,
        3000
      );
    }
  }
 
  async saveDate() {
    try {
      const { formParams } = this.state;
      const { listType } = this.props;
      if (!formParams.group_id) {
        this.showToast(
          'danger',
          '警告',
          '工作组保存失败: 名称为必填',
          3000
        );
        return;
      }
      else {
        await WzRequest.apiReq(`${listType === 'add' ? 'POST' : 'PUT'}`, `/groups?pretty=true&group_id=${encodeURIComponent(formParams.group_id)}${formParams.label_id ? `&label_id=${encodeURIComponent(formParams.label_id)}` : ''}`, {});
        this.showToast(
          'success',
          '成功',
          '工作组保存成功',
          3000
        );
        this.props.toList();
      }
 
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '工作组保存失败: ' + error,
        3000
      );
    }
  }
 
  render() {
    const {
      formParams,
      labelList,
      currentUserInfo,
    } = this.state;
    const { listType } = this.props;
 
    return (
      <EuiPanel>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTitle size="s">
              <h3>{listType === 'add' ? '新增工作组' : '编辑工作组'}</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              size="s"
              onClick={() => this.props.toList()}
              iconType="cross"
            >
              关闭
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer></EuiSpacer>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ minWidth: 105 }}>
            <EuiText textAlign="right">
              名称:
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 270 }}>
            <EuiFieldText
              value={formParams['group_id']}
              disabled={listType !== 'add'}
              onChange={(e) => this.onChangeValueChinese(e, 'group_id')}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiTextColor color="subdued">{'指定唯一的名称。一旦创建成功，就不能编辑该名称。名称不可输入中文、特殊字符、空格'}</EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ minWidth: 105 }}>
            <EuiText textAlign="right">
              部门:
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 270 }}>
            <EuiSelect
              options={labelList}
              disabled={currentUserInfo.department }
              value={formParams['label_id']}
              onChange={(e) => this.onChangeValue(e, 'label_id')}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer></EuiSpacer>
        <EuiButton
          size="s"
          onClick={() => this.saveDate()}
        >
          保存
        </EuiButton>
      </EuiPanel>
    )
  }
 
}