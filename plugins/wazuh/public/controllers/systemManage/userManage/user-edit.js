import React, { Component } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
  EuiSpacer,
  EuiButtonEmpty,
	EuiFieldText,
	EuiText,
  EuiButton,
  EuiSelect,
  EuiComboBox,
  EuiTextColor,
  EuiOverlayMask,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
} from '@elastic/eui';
import { getToasts, getHttp } from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';

export class UserEdit extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.state = {
      passwordrules: [],
      passwordLength: '8',
      labelList: [],
      formParams: {
        userName: '',
        password: '',
        repeatPassword: '',
        role: '',
        email:'',
        department: []
      },
      passwordHelp: '',
      currentPassword: '',
      isCurrentPasswordVisible: false,
      isCurrentPasswordInvalid: false,
    }
  }

  async componentDidMount() {
    this._isMount = true;
    await this.getPasswordRuld();
    await this.getTagList();
    // 如果是编辑，在这里赋值
    if (this.props.listType !== 'add') {
      let { detailsItem } = this.props;
      const { formParams, labelList } = this.state;
      formParams.userName = detailsItem.username;
      formParams.role = detailsItem.backend_roles[0];
      formParams.department = []
      if (detailsItem.backend_roles[0] === 'wazuh' && Object.keys(detailsItem.attributes).length > 0) {
        Object.keys(detailsItem.attributes).forEach(k => {
          let obj = labelList.find(l => String(l.id) === k)
          formParams.department.push(obj)
        })
      }
      this.setState({ formParams })
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

  onChangeValue(e, type) {
		let { formParams } = this.state;
    if (type === 'userName') {
      formParams[type] = e.target.value.replace(/[^\x00-\xff]/g, '').replace(/[\s+`~!@#$%^&*()_\-+=<>?:"{}|,.\\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/g, '').split(" ").join("");
    }
    // else if (type === 'email') {
    //   formParams[type] = e.target.value.replace(/^((([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6}\,))*(([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})))$/g, '').split(" ").join("");
    // }
    else if (type === 'password' || type === 'repeatPassword') {
      formParams[type] = e.target.value.split(" ").join("");
    }
    else {
      formParams[type] = e.target.value;
    }
    if (type === 'role') {
      formParams.department = []
    }
		this.setState({ formParams });
	}

  setGroupName(departments) {
    let { formParams } = this.state;
    formParams['department'] = departments
    this.setState({ formParams })
  }

  async getPasswordRuld() {
    try {
      const rawItems = await WzRequest.apiReq('GET', `/manager/webloggingconfig?pretty=true`, {});
			const params = (
        ((rawItems || {}).data || {}).data || {}
      ).affected_items[0];
      let passwordrules = params.passwordrules.split(',');
      let passwordLength = params.pwdlen;

      const passwordHelpOptions = {
        'upper': '大写字母',
        'lower': '小写字母',
        'num': '数字字符',
        'spechar': '特殊字符'
      };
      let helpText = `密码长度至少${passwordLength}位，`;
      if (passwordrules.length > 0) {
        helpText += `且必须包含`
      }
      passwordrules.map(k => {
        helpText += `${passwordHelpOptions[k]}、`
      })
      helpText = helpText.substring(0, helpText.length - 1);

      this.setState({ passwordrules, passwordLength, passwordHelp: helpText })
        
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '配置查询失败: ' + error,
        3000
      );
    }
  }

  async getTagList() {
    try {
      const tag1Items = await WzRequest.apiReq('GET', `/sys_labels?pretty=true`, {});
      let labelList = (
        ((tag1Items || {}).data || {}).data || {}
      ).affected_items.map(k => ({ id: k.id, label: k.show_name }))
 
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

  setPasswordModal(flag) {
    this.setState({isCurrentPasswordVisible: flag});
    if (!flag) this.setState({ currentPassword: '', isCurrentPasswordInvalid: false });
  }

  async validateCurrentPassword() {
    try {
      const { currentPassword } = this.state;
      const { currentUsername } = this.props;
      let password = Buffer.from(`${currentPassword}`).toString('base64');
      let params = {
        username: currentUsername,
        password
      }
      await getHttp().post(`/auth/login`, { body: JSON.stringify(params)});
      this.setPasswordModal(false);
      this.saveDate();
    } catch (error) {
      this.setState({ isCurrentPasswordInvalid: true });
    }
  }

  async saveDate() {
    try {
      const { formParams, passwordrules, passwordLength, labelList } = this.state;
      const { listType } = this.props;
      const userListRes = await getHttp().get('/api/v1/configuration/internalusers');
      const userList = Object.keys(userListRes.data)
      if (!formParams.userName) {
        this.showToast(
          'danger',
          '警告',
          '用户保存失败: 用户名为必填。',
          3000
        );
        return;
      }
      if (listType === 'add' && userList.indexOf(formParams.userName) !== -1) {
        this.showToast(
          'danger',
          '警告',
          '用户保存失败: 该用户已存在。',
          3000
        );
        return;
      }
      if (formParams.password !== formParams.repeatPassword) {
        this.showToast(
          'danger',
          '警告',
          '用户保存失败: 确认密码不匹配。',
          3000
        );
        return;
      }
      if (formParams.password === '' && listType === 'add') {
        this.showToast(
          'danger',
          '警告',
          '用户保存失败: 密码为必填。',
          3000
        );
        return;
      }
      if (!formParams.role) {
        this.showToast(
          'danger',
          '警告',
          '用户保存失败: 角色为必选。',
          3000
        );
        return;
      }
      if (formParams.role === 'wazuh' && formParams.department.length === 0) {
        this.showToast(
          'danger',
          '警告',
          '用户保存失败: 操作用户角色部门为必选。',
          3000
        );
        return;
      }

      let updateObject = {
        backend_roles: [formParams.role],
        attributes: {}
      }
      formParams.department.forEach(k => {
        updateObject.attributes[k.id] = true
      })

      // 密码规则验证
      const regexpOptions = {
        'upper': /[A-Z]/,
        'lower': /[a-z]/,
        'num': /[0-9]/,
        'spechar': new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？+-]")
      };
      let isCheck = true;
      passwordrules.map(k => {
        if (!regexpOptions[k].test(formParams.password)) {
          isCheck = false;
        }
      })

      if (formParams.password && (!isCheck || formParams.password.length < Number(passwordLength))) {
        this.showToast(
          'danger',
          '警告',
          '用户保存失败: 密码不符合规则。',
          3000
        );
        return
      }
      else if (formParams.password) {
        updateObject.password = formParams.password;
      }

      await getHttp().post(`/api/v1/configuration/internalusers/${formParams.userName}`, { body: JSON.stringify(updateObject)});
      const ssoData={
        password:formParams.password,
        userName:formParams.userName
      }
       await WzRequest.apiReq('POST', `/manager/sso`, {
      
          name:ssoData.userName,
          password:ssoData.password,
          action:listType === 'add'?1:0,
          keys:ssoData.userName,
          email:formParams.email,
          time:10
     
         
      });
      this.showToast(
        'success',
        '成功',
        '用户保存成功',
        3000
      );
      this.props.toList();

    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '用户保存失败: ' + error,
        3000
      );
    }
  }

  render() {
    const {
      formParams,
      passwordHelp,
      isCurrentPasswordVisible,
      isCurrentPasswordInvalid,
      labelList,
    } = this.state;
    const { listType } = this.props;
    const roleOptions = [
			{ value: '', text: '请选择角色'},
			// { value: 'adminuser', text: '用户管理员'},
			{ value: 'audit', text: '审计管理员'},
			{ value: 'system', text: '系统管理员'},
			{ value: 'wazuh', text: '操作用户'},
		];
    let currentPasswordModal;
    if (isCurrentPasswordVisible) {
      currentPasswordModal = (
        <EuiOverlayMask>
          <EuiModal onClose={() => this.setPasswordModal(false)} initialFocus="[name=popswitch]">
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <h1>验证用户</h1>
              </EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody>
              <div style={{ padding: '4px 0'}}>
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiText textAlign="right">当前密码:</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiFieldText
                      type="password"
                      onChange={(e) => {
                        this.setState({ isCurrentPasswordInvalid: false, currentPassword: e.target.value });
                      }}
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </div>
              {isCurrentPasswordInvalid && (
                <EuiText id="error" color="danger" textAlign="center">
                  <b>{'当前密码验证失败'}</b>
                </EuiText>
              )}
            </EuiModalBody>

            <EuiModalFooter>
              <EuiButtonEmpty onClick={() => this.setPasswordModal(false)}>取消</EuiButtonEmpty>
              <EuiButton onClick={() => this.validateCurrentPassword()} fill>确认</EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      );
    }
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTitle size="s">
              <h3>{listType === 'add' ? '新增用户' : '编辑用户'}</h3>
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
              用户名:
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 205 }}>
            <EuiFieldText
              value={formParams['userName']}
              disabled={listType !== 'add'}
              onChange={(e) => this.onChangeValue(e, 'userName')}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiTextColor color="subdued">{'指定唯一的用户名。一旦创建了用户，就不能编辑该名称'}</EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ minWidth: 105 }}>
            <EuiText textAlign="right">
              角色:
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 205 }}>
            <EuiSelect
              options={roleOptions}
              value={formParams['role']}
              onChange={(e) => this.onChangeValue(e, 'role')}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        { formParams['role'] === 'wazuh' && (
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ minWidth: 105 }}>
            <EuiText textAlign="right">
              部门:
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 205 }}>
            <EuiComboBox
              placeholder="选择部门"
              options={labelList}
              selectedOptions={formParams['department']}
              onChange={group => {
                this.setGroupName(group);
              }}
              noSuggestions={labelList.length === formParams['department'].length}
              isClearable={true}
              data-test-subj="demoComboBox"
            />
            {/* <EuiSelect
              options={labelList}
              value={formParams['department']}
              onChange={(e) => this.onChangeValue(e, 'department')}
            /> */}
          </EuiFlexItem>
        </EuiFlexGroup>
        )}
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ minWidth: 105 }}>
            <EuiText textAlign="right">
              密码:
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 205 }}>
            <EuiFieldText
              type="password"
              value={formParams['password']}
              onChange={(e) => this.onChangeValue(e, 'password')}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiTextColor color="subdued">{passwordHelp}</EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ minWidth: 105 }}>
            <EuiText textAlign="right">
              确认密码:
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 205 }}>
            <EuiFieldText
              type="password"
              value={formParams['repeatPassword']}
              onChange={(e) => this.onChangeValue(e, 'repeatPassword')}
            />
          </EuiFlexItem><EuiFlexItem grow={false}>
            <EuiTextColor color="subdued">{'两次密码输入必须一致'}</EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ minWidth: 105 }}>
            <EuiText textAlign="right">
              邮箱:
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 205 }}>
            <EuiFieldText
              type="email"
              value={formParams['email']}
              onChange={(e) => this.onChangeValue(e, 'email')}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
          <EuiTextColor color="subdued">{'指定用户名认证的邮箱'}</EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer></EuiSpacer>
        <EuiButton
          size="s"
          // onClick={() => this.setPasswordModal(true)}
          onClick={() => this.saveDate()}
        >
          保存
        </EuiButton>
        {currentPasswordModal}
      </div>
    )
  }

}