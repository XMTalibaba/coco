import React, { useState, useEffect } from 'react';
import {
  EuiPageContent,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiPageContentBody,
  EuiButton,
  EuiTitle,
  EuiFlyout,
  EuiOverlayMask,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiForm,
  EuiFormRow,
  EuiSpacer,
  EuiSuperSelect,
  EuiText,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable
} from '@elastic/eui';
import { PoliciesTable } from './policies-table';
import { WzRequest } from '../../../react-services/wz-request';
import { WazuhSecurity } from '../../../factories/wazuh-security'
import { ErrorHandler } from '../../../react-services/error-handler';
import { EditPolicyFlyout } from './edit-policy';

export const Policies = () => {
  const [isFlyoutVisible, setIsFlyoutVisible] = useState(false);
  const [resources, setResources] = useState([]);
  const [resourceValue, setResourceValue] = useState('');
  const [resourceIdentifierValue, setResourceIdentifierValue] = useState('');
  const [availableResources, setAvailableResources] = useState([]);
  const [availableActions, setAvailableActions] = useState([]);
  const [addedActions, setAddedActions] = useState([]);
  const [addedResources, setAddedResources] = useState([]);
  const [actions, setActions] = useState([]);
  const [actionValue, setActionValue] = useState('');
  const [policyName, setPolicyName] = useState('');
  const [policies, setPolicies] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditingPolicy, setIsEditingPolicy] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState('');

  useEffect(() => { loadResources() }, [addedActions]);

  const getPolicies = async () => {
    setLoading(true);
    const request = await WzRequest.apiReq(
      'GET',
      '/security/policies',
      {}
    );
    const policies = (((request || {}).data || {}).data || {}).affected_items || [];
    setPolicies(policies);
    setLoading(false);
  }

  useEffect(() => {
    getPolicies();
  }, []);

  const editPolicy = (item) => {
    setEditingPolicy(item);
    setIsEditingPolicy(true);
  }


  const createPolicy = async () => {
    try {
      const result = await WzRequest.apiReq(
        'POST',
        '/security/policies',

        {
          name: policyName,
          policy: {
            actions: addedActions.map(x => x.action),
            resources: addedResources.map(x => x.resource),
            effect: effectValue
          }
        }
      );
      const resultData = (result.data || {}).data;
      if (resultData.failed_items && resultData.failed_items.length) {
        return;
      }
      ErrorHandler.info('策略已成功创建', '');
      await getPolicies();
      setPolicyName("");
      setAddedActions([]);
      setAddedResources([]);
      setEffectValue(null);
    } catch (error) {
      ErrorHandler.handle(error, '创建策略错误');
      return;
    }
    setIsFlyoutVisible(false);
  }

  const onChangePolicyName = e => {
    setPolicyName(e.target.value);
  };

  const onChangeResourceValue = async (value) => {
    setResourceValue(value);
    setResourceIdentifierValue('');
  };

  const onChangeResourceIdentifierValue = async (e) => {
    setResourceIdentifierValue(e.target.value);
  };

  const loadResources = () => {
    let allResources = [];
    addedActions.forEach(x => {
      const res = (availableActions[x.action] || {})['resources'];
      allResources = allResources.concat(res);
    });
    const allResourcesSet = new Set(allResources);
    const resources = Array.from(allResourcesSet).map((x, idx) => {
      return {
        id: idx,
        value: x,
        inputDisplay: x,
        dropdownDisplay: (
          <>
            <strong>{x}</strong>
            <EuiText size="s" color="subdued">
              <p className="euiTextColor--subdued">
                {availableResources[x].description}
              </p>
            </EuiText>
          </>
        )
      }
    });
    setResources(resources);
  }

  const onChangeActionValue = async (value) => {
    setActionValue(value);
  };
  async function getData() {
    const resources_request = await WzRequest.apiReq(
      'GET',
      '/security/resources',
      {}
    );
    const actions_request = await WzRequest.apiReq(
      'GET',
      '/security/actions',
      {}
    );
    const resources_data = ((resources_request || {}).data || []).data || {};
    setAvailableResources(resources_data);

    const actions_data = ((actions_request || {}).data || []).data || {};
    setAvailableActions(actions_data);
    const actions = Object.keys(actions_data)
      .map((x, idx) => {
        return {
          id: idx,
          value: x,
          inputDisplay: x,
          dropdownDisplay: (
            <>
              <strong>{x}</strong>
              <EuiText size="s" color="subdued">
                <p className="euiTextColor--subdued">
                  {actions_data[x].description}
                </p>
              </EuiText>
            </>
          )
        }
      });
    setActions(actions);
  }

  useEffect(() => {
    getData();
  }, []);

  const effectOptions = [
    {
      value: 'allow',
      inputDisplay: '允许'
    },
    {
      value: 'deny',
      inputDisplay: '拒绝'
    },
  ];

  const [effectValue, setEffectValue] = useState();

  const onEffectValueChange = value => {
    setEffectValue(value);
  };

  const getIdentifier = () => {
    const keys = (Object.keys(availableResources) || []);
    return (keys[resourceValue] || ':').split(':')[1];
  }

  const addResource = () => {
    if (!addedResources.filter(x => x.resource === `${resourceValue}:${resourceIdentifierValue}`).length) {
      setAddedResources(addedResources =>
        [...addedResources,
        { resource: `${resourceValue}:${resourceIdentifierValue}` }
        ])
    }
    setResourceIdentifierValue('');
  }

  const addAction = () => {
    if (!addedActions.filter(x => x.action === actionValue).length) {
      setAddedActions(addedActions =>
        [...addedActions,
        { action: actionValue }
        ])
    }
    setActionValue('');
  }

  const removeAction = (action) => {
    setAddedActions(addedActions.filter(x => x !== action));
  }

  const removeResource = (resource) => {
    setAddedResources(addedResources.filter(x => x !== resource));
  }

  const actions_columns = [
    {
      field: 'action',
      name: '操作',
      sortable: true,
      truncateText: true,
    },
    {
      name: '',
      actions: [
        {
          name: '移除',
          description: '移除该操作',
          type: 'icon',
          color: 'danger',
          icon: 'trash',
          onClick: (action) => removeAction(action),
        },
      ],
    }
  ];

  const resources_columns = [
    {
      field: 'resource',
      name: '资源',
      sortable: true,
      truncateText: true,
    },
    {
      name: '',
      actions: [
        {
          name: '移除',
          description: '移除该资源',
          type: 'icon',
          color: 'danger',
          icon: 'trash',
          onClick: (resource) => removeResource(resource),
        },
      ],
    }
  ];

  const closeEditingFlyout = async () => {
    setIsEditingPolicy(false);
    await getPolicies();
  };


  let editFlyout;
  if (isEditingPolicy) {
    editFlyout = (<EuiOverlayMask
      headerZindexLocation="below"
      onClick={() => { closeEditingFlyout() }} >
      <EditPolicyFlyout closeFlyout={closeEditingFlyout} policy={editingPolicy} />
    </EuiOverlayMask>)
  }
  let flyout;
  if (isFlyoutVisible) {
    flyout = (
      <EuiOverlayMask
        headerZindexLocation="below"
        onClick={() => { setIsFlyoutVisible(false) }}>
        <EuiFlyout className="wzApp"
          onClose={() => setIsFlyoutVisible(false)}>
          <EuiFlyoutHeader hasBorder={false}>
            <EuiTitle size="m">
              <h2>新策略</h2>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            <EuiForm component="form" style={{ padding: 24 }}>
              <EuiFormRow label="策略名称"
                helpText="为这个新策略引入一个名称。">
                <EuiFieldText
                  placeholder=""
                  value={policyName}
                  onChange={e => onChangePolicyName(e)}
                  aria-label=""
                />
              </EuiFormRow>
              <EuiSpacer></EuiSpacer>
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiFormRow label="操作"
                    helpText="在执行策略的地方设置一个操作。">
                    <EuiSuperSelect
                      options={actions}
                      valueOfSelected={actionValue}
                      onChange={value => onChangeActionValue(value)}
                      itemLayoutAlign="top"
                      hasDividers
                    />
                  </EuiFormRow>
                </EuiFlexItem>
                <EuiFlexItem></EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiFormRow hasEmptyLabelSpace>
                    <EuiButton
                      onClick={() => addAction()}
                      iconType="plusInCircle"
                      disabled={!actionValue}
                    >添加</EuiButton>
                  </EuiFormRow>
                </EuiFlexItem>
              </EuiFlexGroup>
              {!!addedActions.length &&
                <>
                  <EuiSpacer size='s'></EuiSpacer>
                  <EuiFlexGroup>
                    <EuiFlexItem>
                      <EuiInMemoryTable
                        items={addedActions}
                        columns={actions_columns}
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </>
              }
              <EuiSpacer></EuiSpacer>
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiFormRow label="资源"
                    helpText="选择此策略定向到的资源。">
                    <EuiSuperSelect
                      options={resources}
                      valueOfSelected={resourceValue}
                      onChange={value => onChangeResourceValue(value)}
                      itemLayoutAlign="top"
                      hasDividers
                      disabled={!addedActions.length}
                    />
                  </EuiFormRow>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiFormRow label="资源标识符"
                    helpText="介绍资源标识符。 *表示全部。">
                    <EuiFieldText
                      placeholder={getIdentifier()}
                      value={resourceIdentifierValue}
                      onChange={e => onChangeResourceIdentifierValue(e)}
                      disabled={!resourceValue}
                    />
                  </EuiFormRow>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiFormRow hasEmptyLabelSpace>
                    <EuiButton
                      onClick={() => addResource()}
                      iconType="plusInCircle"
                      disabled={!resourceIdentifierValue}
                    >添加</EuiButton>
                  </EuiFormRow>
                </EuiFlexItem>
              </EuiFlexGroup>
              {!!addedResources.length &&
                <>
                  <EuiSpacer size='s'></EuiSpacer>
                  <EuiFlexGroup>
                    <EuiFlexItem>
                      <EuiInMemoryTable
                        items={addedResources}
                        columns={resources_columns}
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </>
              }
              <EuiSpacer></EuiSpacer>
              <EuiFormRow label="选择一个效果"
                helpText="选择一个效果。">
                <EuiSuperSelect
                  options={effectOptions}
                  valueOfSelected={effectValue}
                  onChange={value => onEffectValueChange(value)}
                />
              </EuiFormRow>
              <EuiSpacer />
              <EuiButton
                disabled={!policyName || !addedActions.length || !addedResources.length || !effectValue}
                onClick={() => createPolicy()}
                fill>
                创建策略
              </EuiButton>
            </EuiForm>
          </EuiFlyoutBody>
        </EuiFlyout>
      </EuiOverlayMask >
    );
  }

  return (
    <EuiPageContent>
      <EuiPageContentHeader>
        <EuiPageContentHeaderSection>
          <EuiTitle>
            <h2>策略</h2>
          </EuiTitle>
        </EuiPageContentHeaderSection>
        <EuiPageContentHeaderSection>
         { 
          !loading
          &&
          <div>
            <EuiButton
              onClick={() => setIsFlyoutVisible(true)}>
              创建策略
            </EuiButton>
            {flyout}
            {editFlyout}
          </div>          
        }
        </EuiPageContentHeaderSection>
      </EuiPageContentHeader>
      <EuiPageContentBody>
        <PoliciesTable loading={loading} policies={policies} editPolicy={editPolicy} updatePolicies={getPolicies}></PoliciesTable>
      </EuiPageContentBody>
    </EuiPageContent>
  );
};