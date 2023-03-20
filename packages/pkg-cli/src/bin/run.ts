#!/usr/bin/env node

import oclif from '@oclif/core'

oclif.run().then(require('@oclif/core/flush')).catch(require('@oclif/core/handle'))
