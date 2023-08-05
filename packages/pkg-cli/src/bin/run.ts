#!/usr/bin/env node

import * as oclif from '@oclif/core';
import { BaseCommand } from "@business-as-code/core";

oclif
.run()
.then(require('@oclif/core/flush'))
.catch(err => BaseCommand.handleError({err, exitProcess: true}));
// .catch(require('@oclif/core/handle'))
