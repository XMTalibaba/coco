/*
 * Wazuh app - Integrity monitoring components
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import { FlyoutDetail } from '../../../components/agents/fim/inventory/flyout';
import { FlyoutTechnique } from '../../overview/mitre/components/techniques/components/flyout-technique';
import { AppNavigate } from '../../../react-services/app-navigate';

// Field to add to elements enchanced
const CUSTOM_ATTRIBUTE_ENHANCED_DISCOVER_FIELD = 'data-wazuh-discover-field-enhanced';

type TGetFlyoutProps = (content: string, rowData, options) => any;

// Set attributes (as object) in a HTML element
const addAttributesToElement = (element, attributes: any, ...options) => {
  Object.keys(attributes).forEach(attribute => {
    const attributeValue: ((...options) => (string | undefined)) | string | undefined = attributes[attribute];
    const attributeValueResult = typeof attributeValue === 'function' ? attributeValue(...options) : attributeValue;
    if(attributeValueResult){
      element.setAttribute(attribute, attributeValueResult);
    };
  });
}

// Enhance field: create an anchor HTML element that redirect to some URL
const createElementFieldURLRedirection = (attributes?: any) => (content: string, rowData, element, options) => {
  const container = document.createElement('a');
  addAttributesToElement(container, attributes, content, rowData, options);
  container.textContent = content;
  return container.getAttribute('href') ? container : undefined;
};

// Enhance field: create an anchor HTML element that open a flyout React component
const createElementFieldOpenFlyout = (FlyoutComponent, getFlyoutProps: TGetFlyoutProps) => (content: string, rowData, element, options) => {
  const container = document.createElement('a');
  container.onclick = () => {
    options.setFlyout({ component: FlyoutComponent, props: getFlyoutProps(content, rowData, options)});
  };
  container.textContent = content;
  return container;
}

// Enhance field: create a div HTML element with anchor HTML elements in the same cell to open a flyout React component with different data
const createElementFieldOpenFlyoutMultiple = (FlyoutComponent, getFlyoutProps: TGetFlyoutProps, containerOptions) => (content: string, rowData, element, options) => {
  const container = document.createElement(containerOptions.element || 'div');
  const formattedContent = content.match(containerOptions.contentRegex);
  if(!formattedContent){ return };
  const createElementFieldOpenFlyoutCreator = createElementFieldOpenFlyout(FlyoutComponent, getFlyoutProps);
  formattedContent.forEach((item, itemIndex) => {
    const itemElement = createElementFieldOpenFlyoutCreator(item, rowData, element, options);
    container.appendChild(itemElement);
    if(itemIndex < formattedContent.length - 1 ){
      const separatorElement = document.createElement(containerOptions.separatorElement || 'span');
      separatorElement.textContent = containerOptions.separator || ', ';
      container.appendChild(separatorElement);
    }
  });
  return container;
}

// Returns the style attribute value as string
const styleObjectToString = (obj: any) => Object.keys(obj).map(key => `${key}: ${obj[key]}`).join('; ');

// Styles for external links (as object)
const attributesExternalLink = {
  target: '__blank',
  rel: 'noreferrer'
};

// Define button styles
const buttonStyles = attributesExternalLink;

export const EventsEnhanceDiscoverCell = {
  // 'rule.id': createElementFieldURLRedirection({...buttonStyles, href: (content) => `#/manager/rules?tab=rules&redirectRule=${content}`}),
  // 'agent.id': createElementFieldURLRedirection({...buttonStyles, href: (content) => content !== '000' ? `#/agents?tab=welcome&agent=${content}` : undefined}),
  // 'agent.name': createElementFieldURLRedirection({...buttonStyles, href: (content, rowData) => {
  //   const agentId = (((rowData || {})._source || {}).agent || {}).id;
  //   return agentId !== '000' ? `#/agents?tab=welcome&agent=${agentId}` : undefined;
  // }}),
  'syscheck.path': createElementFieldOpenFlyout(FlyoutDetail, (content, rowData, options) => ({
    fileName: content,
    agentId: (((rowData || {})._source || {}).agent || {}).id,
    type:'file',
    view:'events',
    closeFlyout: options.closeFlyout
  })),
  'rule.mitre.id': createElementFieldOpenFlyoutMultiple(FlyoutTechnique, (content, rowData, options) => ({
    openDiscover(e, techniqueID) {
      AppNavigate.navigateToModule(e, 'overview', { "tab": 'mitre', "tabView": "discover", filters: { 'rule.mitre.id': techniqueID } })
    },
    openDashboard(e, techniqueID) {
      AppNavigate.navigateToModule(e, 'overview', { "tab": 'mitre', "tabView": "dashboard", filters: { 'rule.mitre.id': techniqueID } })
    },
    onChangeFlyout(isFlyoutVisible){
      isFlyoutVisible ? null : options.closeFlyout()
    },
    currentTechnique: content
  }), {
    contentRegex: /(\w+)/g,
    element: 'span'
  })
}

// Method to enhance a cell of discover table
export const enhanceDiscoverEventsCell = (field, content, rowData, element, options) => {
  if(!EventsEnhanceDiscoverCell[field] || !element || element.attributes[CUSTOM_ATTRIBUTE_ENHANCED_DISCOVER_FIELD]){ return };
  const elementCellEnhanced = EventsEnhanceDiscoverCell[field](content, rowData, element, options);
  if(elementCellEnhanced){
    elementCellEnhanced.setAttribute(CUSTOM_ATTRIBUTE_ENHANCED_DISCOVER_FIELD, ''); // Set a custom attribute to indentify that element was enhanced
    element.replaceWith(elementCellEnhanced);
  };
}
