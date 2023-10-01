#!/usr/bin/env node

import * as oclif from '@oclif/core';
import { BaseCommand } from "@business-as-code/core";

// In dev mode, always show stack traces
oclif.settings.debug = true;

oclif
// .run()
.run(undefined, {root: __dirname})
// .then(() => oclif.flush())
.then(require('@oclif/core/flush'))
.catch(err => BaseCommand.handleError({err, exitProcess: true}));
// .catch(require('@oclif/core/handle'))
