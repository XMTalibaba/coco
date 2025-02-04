/*
 *   Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */

import { Toast } from '@elastic/eui/src/components/toast/global_toast_list';
import { useState, useCallback } from 'react';

export function createErrorToast(id: string, title: string, text: string): Toast {
  return {
    id,
    color: 'danger',
    title,
    text,
  };
}

export function createUnknownErrorToast(id: string, failedAction: string): Toast {
  return createErrorToast(
    id,
    `Failed to ${failedAction}`,
    `Failed to ${failedAction}. You may refresh the page to retry or see browser console for more information.`
  );
}

export function useToastState(): [Toast[], (toAdd: Toast) => void, (toDelete: Toast) => void] {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((toastToAdd: Toast) => {
    setToasts((state) => state.concat(toastToAdd));
  }, []);
  const removeToast = (toastToDelete: Toast) => {
    setToasts(toasts.filter((toast) => toast.id !== toastToDelete.id));
  };
  return [toasts, addToast, removeToast];
}

export function getSuccessToastMessage(
  resourceType: string,
  action: string,
  userName: string
): string {
  switch (action) {
    case 'create':
    case 'duplicate':
      return `${resourceType} "${userName}" 成功创建`;
    case 'edit':
      return `${resourceType} "${userName}" 成功修改`;
    default:
      return '';
  }
}
