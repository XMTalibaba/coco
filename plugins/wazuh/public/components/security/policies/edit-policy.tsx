
import React, { useState, useEffect } from 'react';
import {
    EuiButton,
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
    EuiSuperSelect,
    EuiText,
    EuiInMemoryTable,
    EuiFieldText,
} from '@elastic/eui';
import { WzRequest } from '../../../react-services/wz-request';
import { ErrorHandler } from '../../../react-services/error-handler';
import { WzAPIUtils } from '../../../react-services/wz-api-utils';


export const EditPolicyFlyout = ({ policy, closeFlyout }) => {
    const isReserved = WzAPIUtils.isReservedID(policy.id);
    const [actionValue, setActionValue] = useState('');
    const [addedActions, setAddedActions] = useState([]);
    const [availableResources, setAvailableResources] = useState([]);
    const [availableActions, setAvailableActions] = useState([]);
    const [actions, setActions] = useState([]);
    const [addedResources, setAddedResources] = useState([]);
    const [resources, setResources] = useState([]);
    const [resourceValue, setResourceValue] = useState('');
    const [resourceIdentifierValue, setResourceIdentifierValue] = useState('');
    const [effectValue, setEffectValue] = useState();

    useEffect(() => {
        getData();
        initData();
    }, []);
    
    useEffect(() => { loadResources() }, [addedActions,availableActions]);

    const updatePolicy = async() => {
        try{
            const actions = addedActions.map(item => item.action)
            const resources = addedResources.map(item => item.resource)
            const response = await WzRequest.apiReq(
                'PUT',
                `/security/policies/${policy.id}`,
                {
                    "policy": {
                      "actions": actions,
                      "resources": resources,
                      "effect": effectValue
                    }
                }
            );

            const data = (response.data || {}).data;
            if (data.failed_items && data.failed_items.length) {
                return;
            }
            ErrorHandler.info('已成功使用所选策略更新角色');
            closeFlyout();
        }catch(error){ 
            ErrorHandler.handle(error, 'Unexpected error');
         }
    }


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
        const resources_data = ((resources_request || {}).data || {}).data || {};
        setAvailableResources(resources_data);
        
        const actions_data = ((actions_request || {}).data || {}).data || {};
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
                                {(availableResources[x] || {}).description}
                            </p>
                        </EuiText>
                    </>
                )
            }
        });
        setResources(resources);
    }

    const initData = () => {
        const policies = ((policy || {}).policy || {}).actions || [];
        const initPolicies = policies.map(item => {
            return {action: item}
        })
        setAddedActions(initPolicies)

        const resources = ((policy || {}).policy || {}).resources || [];
        const initResources = resources.map(item => {
            return {resource: item}
        })
        setAddedResources(initResources)

        setEffectValue(policy.policy.effect)
    };


    const onEffectValueChange = value => {
        setEffectValue(value);
    };

    const effectOptions = [
        {
            value: 'allow',
            inputDisplay: 'Allow'
        },
        {
            value: 'deny',
            inputDisplay: 'Deny'
        },
    ];




    const onChangeActionValue = async (value) => {
        setActionValue(value);
    };

    const addAction = () => {
        if (!addedActions.filter(x => x.action === actionValue).length) {
            setAddedActions(addedActions =>
                [...addedActions,
                { action: actionValue }
                ])
        }
        setActionValue('');
    };

    const removeAction = (action) => {
        setAddedActions(addedActions.filter(x => x !== action));
    };

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
                    enabled: () => !isReserved,
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
                    enabled: () => !isReserved,
                    icon: 'trash',
                    onClick: (resource) => removeResource(resource),
                },
            ],
        }
    ];


    const onChangeResourceValue = async (value) => {
        setResourceValue(value);
        setResourceIdentifierValue('');
    };

    const getIdentifier = () => {
        const keys = (Object.keys(availableResources) || []);
        return (keys[resourceValue] || ':').split(':')[1];
    }

    const onChangeResourceIdentifierValue = async (e) => {
        setResourceIdentifierValue(e.target.value);
    };

    const removeResource = (resource) => {
        setAddedResources(addedResources.filter(x => x !== resource));
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

    return (
        <EuiFlyout className="wzApp"
            onClose={() => closeFlyout(false)}>
            <EuiFlyoutHeader hasBorder={false}>
                <EuiTitle size="m">
                    <h2>
                        编辑策略 {policy.name}&nbsp;&nbsp;
                        {isReserved &&
                            <EuiBadge color='primary'>保留</EuiBadge>
                        }
                    </h2>
                </EuiTitle>
            </EuiFlyoutHeader>
            <EuiFlyoutBody><EuiForm component="form" style={{ padding: 24 }}>
                <EuiFormRow label="策略名称"
                    helpText="为这个新策略引入一个名称。">
                    <EuiFieldText
                        placeholder=""
                        disabled={isReserved}
                        value={policy.name}
                        readOnly={true}
                        onChange={() => { }}
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
                                disabled={isReserved}
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
                                disabled={!actionValue || isReserved}
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
                            helpText="选择此策略所指向的资源。">
                            <EuiSuperSelect
                                options={resources}
                                valueOfSelected={resourceValue}
                                onChange={value => onChangeResourceValue(value)}
                                itemLayoutAlign="top"
                                hasDividers
                                disabled={!addedActions.length || isReserved}
                            />
                        </EuiFormRow>
                    </EuiFlexItem>
                    <EuiFlexItem>
                        <EuiFormRow label="资源标识符"
                            helpText="引入资源标识符。键入*表示所有。">
                            <EuiFieldText
                                placeholder={getIdentifier()}
                                value={resourceIdentifierValue}
                                onChange={e => onChangeResourceIdentifierValue(e)}
                                disabled={!resourceValue || isReserved}
                            />
                        </EuiFormRow>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                        <EuiFormRow hasEmptyLabelSpace>
                            <EuiButton
                                onClick={() => addResource()}
                                iconType="plusInCircle"
                                disabled={!resourceIdentifierValue || isReserved}
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
                    disabled={isReserved}
                    onClick={updatePolicy}
                    fill>
                    应用
                </EuiButton>
            </EuiForm>
            </EuiFlyoutBody>
        </EuiFlyout>)
};