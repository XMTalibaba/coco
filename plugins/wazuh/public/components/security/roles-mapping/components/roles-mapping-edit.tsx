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
  EuiBadge,
  EuiComboBox,
  EuiFieldText,
} from '@elastic/eui';
import { ErrorHandler } from '../../../../react-services/error-handler';
import { RuleEditor } from './rule-editor';
import RulesServices from '../../rules/services';
import RolesServices from '../../roles/services';
import { WzAPIUtils } from '../../../../react-services/wz-api-utils';

export const RolesMappingEdit = ({
  isAdminuser,
  rule,
  closeFlyout,
  rolesEquivalences,
  roles,
  internalUsers,
  onSave,
  currentPlatform,
}) => {
  const getEquivalences = roles => {
    const list = roles.map(item => {
      return { label: rolesEquivalences[item], id: item };
    });
    return list;
  };

  const [selectedRoles, setSelectedRoles] = useState<any[]>(getEquivalences(rule.roles));
  const [ruleName, setRuleName] = useState<string>(rule.name);
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

  const editRule = async toSaveRule => {
    try {
      setIsLoading(true);
      const formattedRoles = selectedRoles.map(item => {
        return item.id;
      });

      await RulesServices.UpdateRule(rule.id, {
        name: ruleName,
        rule: toSaveRule,
      });

      const toAdd = formattedRoles.filter(value => !rule.roles.includes(value));
      const toRemove = rule.roles.filter(value => !formattedRoles.includes(value));
      await Promise.all(
        toAdd.map(async role => {
          return RolesServices.AddRoleRules(role, [rule.id]);
        })
      );

      await Promise.all(
        toRemove.map(async role => {
          return RolesServices.RemoveRoleRules(role, [rule.id]);
        })
      );

      ErrorHandler.info('角色映射已成功更新');
    } catch (error) {
      ErrorHandler.handle(error, '有一个错误');
    }
    onSave();
    setIsLoading(false);
    closeFlyout(false);
  };

  return (
    <EuiFlyout className="wzApp" onClose={() => closeFlyout(false)}>
      <EuiFlyoutHeader hasBorder={false}>
        <EuiTitle size="m">
          <h2>
            编辑 <strong>{rule.name}&nbsp;&nbsp;</strong>
            {WzAPIUtils.isReservedID(rule.id) && <EuiBadge color="primary">保留</EuiBadge>}
          </h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiForm component="form" style={{ padding: 24 }}>
          <EuiFormRow
            label="角色名称"
            isInvalid={false}
            error={'请提供一个角色名称'}
            helpText="为该角色映射引入一个名称。"
          >
            <EuiFieldText
              placeholder=""
              disabled={WzAPIUtils.isReservedID(rule.id)}
              value={ruleName}
              onChange={e => setRuleName(e.target.value)}
              aria-label=""
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
              isDisabled={WzAPIUtils.isReservedID(rule.id)}
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
              save={rule => editRule(rule)}
              initialRule={rule.rule}
              isLoading={isLoading}
              isReserved={WzAPIUtils.isReservedID(rule.id)}
              internalUsers={internalUsers}
              currentPlatform={currentPlatform}
            ></RuleEditor>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
