/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { Observable, ReplaySubject, fromEventPattern, merge, timer } from 'rxjs';
import { map, switchMap, filter, debounce } from 'rxjs/operators';
import { View, Runtime, Spec } from 'vega';
import { i18n } from '@kbn/i18n';
import { Assign } from '@kbn/utility-types';

interface DebugValues {
  view: View;
  spec: Spec;
}

export interface VegaRuntimeData {
  columns: Array<{
    id: string;
  }>;
  data: Array<Record<string, string>>;
}

export type InspectDataSets = Assign<VegaRuntimeData, { id: string }>;
export type InspectSignalsSets = VegaRuntimeData;

const vegaAdapterSignalLabel = i18n.translate('visTypeVega.inspector.vegaAdapter.signal', {
  defaultMessage: '信号',
});

const vegaAdapterValueLabel = i18n.translate('visTypeVega.inspector.vegaAdapter.value', {
  defaultMessage: '值',
});

/** Get Runtime Scope for Vega View
 * @link https://vega.github.io/vega/docs/api/debugging/#scope
 **/
const getVegaRuntimeScope = (debugValues: DebugValues) =>
  (debugValues.view as any)._runtime as Runtime;

const serializeColumns = (item: Record<string, unknown>, columns: string[]) => {
  const nonSerializableFieldLabel = '(..)';

  return columns.reduce((row: Record<string, string>, column) => {
    try {
      const cell = item[column];
      row[column] = typeof cell === 'object' ? JSON.stringify(cell) : `${cell}`;
    } catch (e) {
      row[column] = nonSerializableFieldLabel;
    }
    return row;
  }, {});
};

export class VegaAdapter {
  private debugValuesSubject = new ReplaySubject<DebugValues>();

  bindInspectValues(debugValues: DebugValues) {
    this.debugValuesSubject.next(debugValues);
  }

  getDataSetsSubscription(): Observable<InspectDataSets[]> {
    return this.debugValuesSubject.pipe(
      filter((debugValues) => Boolean(debugValues)),
      map((debugValues) => {
        const runtimeScope = getVegaRuntimeScope(debugValues);

        return Object.keys(runtimeScope.data || []).reduce((acc: InspectDataSets[], key) => {
          const value = runtimeScope.data[key].values.value;

          if (value && value[0]) {
            const columns = Object.keys(value[0]);
            acc.push({
              id: key,
              columns: columns.map((column) => ({ id: column, schema: 'json' })),
              data: value.map((item: Record<string, unknown>) => serializeColumns(item, columns)),
            });
          }
          return acc;
        }, []);
      })
    );
  }

  getSignalsSetsSubscription(): Observable<InspectSignalsSets> {
    const signalsListener = this.debugValuesSubject.pipe(
      filter((debugValues) => Boolean(debugValues)),
      switchMap((debugValues) => {
        const runtimeScope = getVegaRuntimeScope(debugValues);

        return merge(
          ...Object.keys(runtimeScope.signals).map((key: string) =>
            fromEventPattern(
              (handler) => debugValues.view.addSignalListener(key, handler),
              (handler) => debugValues.view.removeSignalListener(key, handler)
            )
          )
        ).pipe(
          debounce((val) => timer(350)),
          map(() => debugValues)
        );
      })
    );

    return merge(this.debugValuesSubject, signalsListener).pipe(
      filter((debugValues) => Boolean(debugValues)),
      map((debugValues) => {
        const runtimeScope = getVegaRuntimeScope(debugValues);

        return {
          columns: [
            { id: vegaAdapterSignalLabel, schema: 'text' },
            { id: vegaAdapterValueLabel, schema: 'json' },
          ],
          data: Object.keys(runtimeScope.signals).map((key: string) =>
            serializeColumns(
              {
                [vegaAdapterSignalLabel]: key,
                [vegaAdapterValueLabel]: runtimeScope.signals[key].value,
              },
              [vegaAdapterSignalLabel, vegaAdapterValueLabel]
            )
          ),
        };
      })
    );
  }

  getSpecSubscription(): Observable<string> {
    return this.debugValuesSubject.pipe(
      filter((debugValues) => Boolean(debugValues)),
      map((debugValues) => JSON.stringify(debugValues.spec, null, 2))
    );
  }
}
