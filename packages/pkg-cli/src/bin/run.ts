#!/usr/bin/env node

import * as oclif from '@oclif/core';

oclif.run().then(require('@oclif/core/flush')).catch(require('@oclif/core/handle'))
