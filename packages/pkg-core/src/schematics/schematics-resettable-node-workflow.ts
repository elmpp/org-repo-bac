/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Sink, UnsuccessfulWorkflowExecution } from "@angular-devkit/schematics";
import { NodeWorkflow } from "@angular-devkit/schematics/tools";
import { Observable, of, Subject, throwError } from "rxjs";
import { SchematicResettableScopedNodeJsSyncHost } from "./schematic-resettable-scoped-node-js-sync-host";
import { ResettableDryRunEvent, SchematicResettableDryRunSink } from "./schematics-resettable-dry-run-sink";
import { SchematicResettableHostSink } from "./schematics-resettable-host-sink";

/**
 * A workflow specifically for Node tools.
 */
export class SchematicResettableNodeWorkflow extends NodeWorkflow {
  // @ts-ignore
  protected override _reporter: Subject<ResettableDryRunEvent> = new Subject();
  // @ts-ignore
  override get reporter(): Observable<ResettableDryRunEvent> {
    return this._reporter.asObservable();
  }

  /** @todo this is the same as in SchematicService */
  protected override _createSinks(): Sink[] {
    let error = false;

    const dryRunSink = new SchematicResettableDryRunSink(this._host, this._force);
    const dryRunSubscriber = dryRunSink.reporter.subscribe((event) => {
      this._reporter.next(event);
      error = error || event.kind == 'error';
    });

    // We need two sinks if we want to output what will happen, and actually do the work.
    return [
      dryRunSink,
      // Add a custom sink that clean ourselves and throws an error if an error happened.
      {
        commit() {
          dryRunSubscriber.unsubscribe();
          if (error) {
            return throwError(new UnsuccessfulWorkflowExecution());
          }

          return of();
        },
      },

      // Only add a HostSink if this is not a dryRun.
      ...(!this._dryRun ? [new SchematicResettableHostSink(this._host as SchematicResettableScopedNodeJsSyncHost, this._force)] : []),
    ];
  }
}
