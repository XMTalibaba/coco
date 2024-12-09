import React, { useState } from 'react';
import {
  EuiTitle,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiComboBox,
  EuiFieldText,
} from '@elastic/eui';
import { ErrorHandler } from '../../../../react-services/error-handler';
import { RuleEditor } from './rule-editor';
import RulesServices from '../../rules/services';
import RolesServices from '../../roles/services';

export const RolesMappingCreate = ({
  isAdminuser,
  closeFlyout,
  rolesEquivalences,
  roles,
  internalUsers,
  onSave,
  currentPlatform,
}) => {
  const [selectedRoles, setSelectedRoles] = useState<any[]>([]);
  const [ruleName, setRuleName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getRolesList = roles => {
    let list = roles.map(item => {
      return { label: rolesEquivalences[item.id], id: item.id };
    });
    if (isAdminuser) {
      list = list.filter(k => k.label !== 'administrator')
    }
    return list;
  };

  const createRule = async toSaveRule => {
    try {
      setIsLoading(true);
      const formattedRoles = selectedRoles.map(item => {
        return item.id;
      });
      const newRule = await RulesServices.CreateRule({
        name: ruleName,
        rule: toSaveRule,
      });
      await Promise.all(
        formattedRoles.map(async role => await RolesServices.AddRoleRules(role, [newRule.id]))
      );
      ErrorHandler.info('角色映射已成功创建');
    } catch (error) {
      ErrorHandler.handle(error, '有一个错误');
    }
    onSave();
    closeFlyout(false);
  };

  return (
    <EuiFlyout className="wzApp" onClose={() => closeFlyout(false)}>
      <EuiFlyoutHeader hasBorder={false}>
        <EuiTitle size="m">
          <h2>创建新的角色映射 &nbsp;</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form" style={{ padding: 24 }}>
          <EuiFormRow
            label="角色映射名称"
            isInvalid={false}
            error={'请提供角色映射名称'}
            helpText="为该角色映射引入一个名称。"
          >
            <EuiFieldText
              placeholder="角色名称"
              value={ruleName}
              onChange={e => setRuleName(e.target.value)}
            />
          </EuiFormRow>
          <EuiFormRow
            label="角色"
            isInvalid={false}
            error={'至少选择一个角色。'}
            helpText="为您的用户分配角色。"
          >
            <EuiComboBox
              placeholder="选择角色"
              options={getRolesList(roles)}
              isDisabled={false}
              selectedOptions={selectedRoles}
              onChange={roles => {
                setSelectedRoles(roles);
              }}
              isClearable={true}
              data-test-subj="demoComboBox"
            />
          </EuiFormRow>
          <EuiSpacer />
        </EuiForm>
        <EuiFlexGroup style={{ padding: '0px 24px 24px 24px' }}>
          <EuiFlexItem>
            <RuleEditor
              save={rule => createRule(rule)}
              initialRule={false}
              isReserved={false}
              isLoading={isLoading}
              internalUsers={internalUsers}
              currentPlatform={currentPlatform}
            ></RuleEditor>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
