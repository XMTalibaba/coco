import React, { useState, useEffect } from 'react';
import {
  EuiPageContent,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiPageContentBody,
  EuiButton,
  EuiTitle,
  EuiOverlayMask,
} from '@elastic/eui';
import { RolesMappingTable } from './components/roles-mapping-table';
import { RolesMappingEdit } from './components/roles-mapping-edit';
import { RolesMappingCreate } from './components/roles-mapping-create';
import { ErrorHandler } from '../../../react-services/error-handler';
import { WazuhSecurity } from '../../../factories/wazuh-security';
import { useApiService } from '../../common/hooks/useApiService';
import { Rule } from '../rules/types/rule.type';
import { Role } from '../roles/types/role.type';
import RolesServices from '../roles/services';
import RulesServices from '../rules/services';
import { useSelector } from 'react-redux';
import { getHttp } from '../../../kibana-services';

export const RolesMapping = () => {
  const [isEditingRule, setIsEditingRule] = useState(false);
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [selectedRule, setSelectedRule] = useState({});
  const [rolesEquivalences, setRolesEquivalences] = useState({});
  const [rolesLoading, roles, rolesError] = useApiService<Role[]>(RolesServices.GetRoles, {});
  const [internalUsers, setInternalUsers] = useState([]);
  const currentPlatform = useSelector((state: any) => state.appStateReducers.currentPlatform);
  const [isAdminuser, setIsAdminuser] = useState(false);

  useEffect(() => {
    initData();    
    initUserType();
  }, []);

  const initUserType = async () => {
    let res = await getHttp().get('/api/v1/configuration/account');
    if (res.data.backend_roles.indexOf('adminuser') !== -1) { // 用户管理员
      setIsAdminuser(true);
    }
  };

  useEffect(() => {
    if (!rolesLoading && (roles || [])) {
      const _rolesObject = (roles || []).reduce(
        (rolesObj, role) => ({ ...rolesObj, [role.id]: role.name }),
        {}
      );
      setRolesEquivalences(_rolesObject);
    }
    if (rolesError) {
      ErrorHandler.handle('加载角色时出错');
    }
  }, [rolesLoading]);

  const getInternalUsers = async () => {
    try {
      const wazuhSecurity = new WazuhSecurity();
      const users = await wazuhSecurity.security.getUsers();
      const _users = users.map((item, idx) => {
        return {
          id: idx,
          user: item.username,
          roles: [],
          full_name: item.full_name,
          email: item.email,
        };
      }).sort((a, b) => (a.user > b.user) ? 1 : (a.user < b.user) ? -1 : 0);      
      setInternalUsers(_users);
    } catch (error) {
      ErrorHandler.handle('加载内部用户时出错');
    }
  };

  const getRules = async () => {
    try {
      const _rules = await RulesServices.GetRules();
      setRules(_rules);
    } catch (error) {
      ErrorHandler.handle('加载规则时出错');
    }
  };

  const initData = async () => {
    setLoadingTable(true);
    await getRules();
    if(currentPlatform){
      await getInternalUsers();
    };
    setLoadingTable(false);
  };

  const updateRoles = async () => {
    await getRules();
  };

  let editFlyout;
  if (isEditingRule) {
    editFlyout = (
      <EuiOverlayMask
        headerZindexLocation="below"
        onClick={() => {
          setIsEditingRule(false);
        }}
      >
        <RolesMappingEdit
          isAdminuser={isAdminuser}
          rule={selectedRule}
          closeFlyout={isVisible => {
            setIsEditingRule(isVisible);
            initData();
          }}
          rolesEquivalences={rolesEquivalences}
          roles={roles}
          internalUsers={internalUsers}
          onSave={async () => await updateRoles()}
          currentPlatform={currentPlatform}
        />
      </EuiOverlayMask>
    );
  }
  let createFlyout;
  if (isCreatingRule) {
    editFlyout = (
      <EuiOverlayMask
        headerZindexLocation="below"
        onClick={() => {
          setIsCreatingRule(false);
        }}
      >
        <RolesMappingCreate
          isAdminuser={isAdminuser}
          closeFlyout={isVisible => {
            setIsCreatingRule(isVisible);
            initData();
          }}
          rolesEquivalences={rolesEquivalences}
          roles={roles}
          internalUsers={internalUsers}
          onSave={async () => await updateRoles()}
          currentPlatform={currentPlatform}
        />
      </EuiOverlayMask>
    );
  }

  return (
    <EuiPageContent>
      <EuiPageContentHeader>
        <EuiPageContentHeaderSection>
          <EuiTitle size="s">
            <h3>角色映射列表</h3>
          </EuiTitle>
        </EuiPageContentHeaderSection>
        <EuiPageContentHeaderSection>
          {
            !loadingTable
            &&
            <div>
              <EuiButton size="s" onClick={() => setIsCreatingRule(true)}>创建角色映射</EuiButton>
              {createFlyout}
              {editFlyout}
            </div>
          }
        </EuiPageContentHeaderSection>
      </EuiPageContentHeader>
      <EuiPageContentBody>
        <RolesMappingTable
          rolesEquivalences={rolesEquivalences}
          loading={loadingTable || rolesLoading}
          rules={rules}
          editRule={item => {
            if (isAdminuser && item.roles.indexOf(1) !== -1) {
              ErrorHandler.handle('不可修改该数据');
              return;
            }
            setSelectedRule(item);
            setIsEditingRule(true);
          }}
          updateRules={async () => await updateRoles()}
        ></RolesMappingTable>
      </EuiPageContentBody>
    </EuiPageContent>
  );
};
