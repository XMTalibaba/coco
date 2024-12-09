import React, { Component, Fragment } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSelect,
  EuiSpacer,
  EuiPage,
  EuiPanel,
  EuiBasicTable,
  EuiFieldSearch,
  EuiInMemoryTable,
  EuiText,
  EuiTitle,
  EuiButton,
  EuiFieldText,
  EuiComboBox,
  EuiButtonEmpty,
  EuiToolTip,
  EuiButtonIcon,
  EuiOverlayMask,
  EuiConfirmModal,
  EuiTextColor,
  EuiPopover,
  EuiPopoverTitle,
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { getToasts, getHttp } from '../../kibana-services';
import { WzRequest } from '../../react-services/wz-request';
import { formatUIDate } from '../../react-services/time-service';
import { AppState } from '../../react-services/app-state';

export const DepartmentManage = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '系统管理' }, { text: '部门管理' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class DepartmentManage extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.state = {
      totalItems: 0,
      listItems: [],
      isLoading:false,
      listType: 'list',
      selectItem: {},
      isDestroyModalVisible: false,
      formParams: {
        label_name: '',
        showname: '',
      },
    }
  }
 
  async componentDidMount() {
    this._isMount = true;
 
    await this.getItems();
  }
  componentWillUnmount() {
    this._isMount = false;
  }
 
  async getItems() {
    try {
      this._isMount && this.setState({ isLoading: true });
      const rawItems = await WzRequest.apiReq('GET', `/sys_labels?pretty=true`, {});
      let listItems = (
        ((rawItems || {}).data || {}).data || {}
      ).affected_items;
      let totalItems = listItems.length;
      this.setState({ listItems, totalItems, isLoading: false })
    } catch (error) {
      this.setState({ isLoading: false });
      console.log(error);
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
 
  columns() {
    return [
      {
        field: 'name',
        name: '名称',
      },
      {
        field: 'show_name',
        name: '显示名称',
      },
      {
        name: '操作',
        render: item => this.actionButtonsRender(item)
      }
    ]
  }
 
  actionButtonsRender(item) {
    return (
      <div className={'icon-box-action'}>
        <EuiToolTip
          content={`编辑部门`}
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              ev.stopPropagation();
              this.setState({ selectItem: item, listType: 'detail', formParams: { label_name: item.name, showname: item.show_name } });
            }}
            iconType="indexEdit"
            color={'primary'}
            aria-label="编辑部门"
          />
        </EuiToolTip>
        &nbsp;
        <EuiToolTip content={`删除部门`} position="left">
          <EuiButtonIcon
            onClick={ev => {
              ev.stopPropagation();
              this.toShowDestroyModal(item);
            }}
            color={'danger'}
            iconType="trash"
            aria-label="删除部门"
          />
        </EuiToolTip>
      </div>
    )
  }
 
  toShowDestroyModal(item) {
    this.setState({ selectItem: item });
    this.setDestroyModal(true);
  }
  setDestroyModal(type) {
    this.setState({isDestroyModalVisible: type});
    if (!type) this.setState({ selectItem: {} });
  }
 
  async toDelete() {
    try {
      const { selectItem } = this.state;

      let occupied = []
      const userListRes = await getHttp().get('/api/v1/configuration/internalusers');
      Object.keys(userListRes.data).forEach(k => {
        let user = userListRes.data[k]
        occupied = Array.from(new Set([...occupied, ...Object.keys(user.attributes)]))
      })
      if (occupied.indexOf(String(selectItem.id)) !== -1) {
        this.showToast(
          'danger',
          '警告',
          '部门删除失败: 该部门已被用户使用，不可删除',
          3000
        );
        this.setDestroyModal(false);
        return
      }

      const rawRules = await WzRequest.apiReq('DELETE', `/sys_labels?pretty=true&labels_list=${selectItem.id}`, {});
      const { message } = (rawRules || {}).data || {};
      if (message.includes('failed')) {
        this.showToast(
          'danger',
          '警告',
          '部门删除失败: 该部门已被主机分组使用，不可删除',
          3000
        );
      }
      else {
        this.showToast(
          'success',
          '成功',
          '部门删除成功',
          3000
        );
        this.getItems();
      }
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '部门删除失败: ' + error,
        3000
      );
    }
    this.setDestroyModal(false);
  }
 
  onChangeForm(e, type) {
    let { formParams } = this.state;
    formParams[type] = e.target.value;
    this.setState({ formParams });
  }
 
  onChangeValueChinese(e, type) {
    let { formParams } = this.state;
    formParams[type] = e.target.value.replace(/[^\x00-\xff]/g, '').replace(/[\s+`~!@#$%^&*()_\-+=<>?:"{}|,.\\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/g, '').split(" ").join("");
    this.setState({ formParams });
  }
 
  tableRender() {
    const {
      listItems,
      isLoading,
    } = this.state;
    const columns = this.columns();
    const message = isLoading ? false : '没有结果...';
    return (
      <EuiInMemoryTable
        itemId="id"
        items={listItems}
        loading={isLoading}
        columns={columns}
        pagination={{ pageSizeOptions: [10, 15] }}
        sorting={true}
        message={message}
        search={{ box: { incremental: true, placeholder: '过滤部门' } }}
      />
    )
  }
 
  headRender() {
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiTitle size={'s'} style={{ padding: '6px 0px' }}>
                  <h2>部门列表 ({this.state.totalItems})</h2>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              onClick={() => this.setState({ listType: 'add', formParams: { label_name: '', showname: '' } })}
            >
              新增部门
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="xs" />
      </div>
    );
  }

  renderTitle() {
		return (
      <EuiFlexGroup>
        <EuiFlexItem className="wz-module-header-agent-title">
          <EuiFlexGroup justifyContent={'spaceBetween'}>
            <EuiFlexItem grow={false}>
              <span style={{ display: 'inline-flex' }}>
                <EuiTitle size="s">
                  <h1>
                    <span>&nbsp;{WAZUH_MODULES['departmentManage'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['departmentManage'].description}
                  </div>
                </EuiPopover>
              </span>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
						</EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
	}
 
  editRender() {
    const { listType, formParams } = this.state;
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTitle size="s">
              <h3>{listType === 'add' ? `新增部门` : `编辑部门`}</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              size="s"
              onClick={() => this.toList()}
              iconType="cross"
            >
              关闭
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer></EuiSpacer>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 130 }}>
            <EuiText textAlign="right">
              部门名称:
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 300 }}>
            <EuiFieldText
              value={formParams.label_name}
              disabled={listType !== 'add'}
              onChange={(e) => this.onChangeValueChinese(e, 'label_name')}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiTextColor color="subdued">{'指定唯一的名称。一旦创建成功，就不能编辑该名称。名称不可输入中文、特殊字符、空格'}</EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 130 }}>
            <EuiText textAlign="right">
              显示名称:
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 300 }}>
            <EuiFieldText
              value={formParams.showname}
              onChange={(e) => this.onChangeForm(e, 'showname')}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer></EuiSpacer>
        <EuiButton
          size="s"
          onClick={() => this.toSave()}
        >
          保存
        </EuiButton>
      </div>
    )
  }
 
  toList() {
    this.setState({ listType: 'list', selectItem: {} });
    this.getItems();
  }
 
  async toSave() {
    try {
      const { formParams, listType, selectItem } = this.state;
 
      if (!formParams.label_name || !formParams.showname) {
        this.showToast(
          'danger',
          '警告',
          '部门保存失败: 部门名称和显示名称为必填',
          3000
        );
        return;
      }
      else {
        const rawRules = await WzRequest.apiReq(`${listType === 'add' ? 'POST' : 'PUT'}`, `/sys_labels?pretty=true&label_name=${encodeURIComponent(formParams.label_name)}&showname=${encodeURIComponent(formParams.showname)}${listType !== 'add' ? `&label_id=${selectItem.id}` : ''}`, {});
        const { message } = (rawRules || {}).data || {};
        if (message.includes('failed')) {
          this.showToast(
            'danger',
            '警告',
            '部门保存失败: 名称不可重复',
            3000
          );
        }
        else {
          this.showToast(
            'success',
            '成功',
            '部门保存成功',
            3000
          );
          this.toList()
        }
      }
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '部门保存失败: ' + error,
        3000
      );
    }
  }
 
  render() {
    const { listType, isDestroyModalVisible } = this.state;
    const title = this.renderTitle();
    const table = this.tableRender();
    const head = this.headRender();
    const edit = this.editRender();
    let destroyModal;
    if (isDestroyModalVisible) {
      destroyModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="确认删除该部门吗？"
            onCancel={() => this.setDestroyModal(false)}
            onConfirm={() => this.toDelete()}
            cancelButtonText="取消"
            confirmButtonText="确认"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          >
          </EuiConfirmModal>
        </EuiOverlayMask>
      );
    }

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
            <EuiPage>
              <EuiPanel paddingSize="m">
                { listType === 'list' && (
                  <div>
                    {head}
                    {table}
                  </div>
                )}
                { listType !== 'list' && edit}
              </EuiPanel>
            </EuiPage>
						</div>
            {destroyModal}
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
		);
  }
})