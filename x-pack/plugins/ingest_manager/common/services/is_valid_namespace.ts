/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { i18n } from '@kbn/i18n';

// Namespace string eventually becomes part of an index name. This method partially implements index name rules from
// https://github.com/elastic/elasticsearch/blob/master/docs/reference/indices/create-index.asciidoc
// and implements a limit based on https://github.com/elastic/kibana/issues/75846
export function isValidNamespace(namespace: string): { valid: boolean; error?: string } {
  if (!namespace.trim()) {
    return {
      valid: false,
      error: i18n.translate('xpack.ingestManager.namespaceValidation.requiredErrorMessage', {
        defaultMessage: '“命名空间”必填',
      }),
    };
  } else if (namespace !== namespace.toLowerCase()) {
    return {
      valid: false,
      error: i18n.translate('xpack.ingestManager.namespaceValidation.lowercaseErrorMessage', {
        defaultMessage: '命名空间”必须小写',
      }),
    };
  } else if (/[\*\\/\?"<>|\s,#:-]+/.test(namespace)) {
    return {
      valid: false,
      error: i18n.translate(
        'xpack.ingestManager.namespaceValidation.invalidCharactersErrorMessage',
        {
          defaultMessage: '“命名空间” 包含无效字符',
        }
      ),
    };
  }
  // Node.js doesn't have Blob, and browser doesn't have Buffer :)
  else if (
    (typeof Blob === 'function' && new Blob([namespace]).size > 100) ||
    (typeof Buffer === 'function' && Buffer.from(namespace).length > 100)
  ) {
    return {
      valid: false,
      error: i18n.translate('xpack.ingestManager.namespaceValidation.tooLongErrorMessage', {
        defaultMessage: '“命名空间” 不能超过100个字节',
      }),
    };
  }

  return { valid: true };
}
