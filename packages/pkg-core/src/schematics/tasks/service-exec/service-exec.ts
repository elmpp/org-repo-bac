import { TaskConfiguration, TaskConfigurationGenerator } from '@angular-devkit/schematics';
import { Services } from '../../../__types__';
import { ServiceExecName, ServiceExecTaskOptions } from './options';

export class ServiceExecTask<SName extends keyof Services>
  implements TaskConfigurationGenerator<ServiceExecTaskOptions<SName>>
{
  // constructor(public workingDirectory: string, public options: Options<keyof ServicesStatic>) {}
  constructor(public options: ServiceExecTaskOptions<SName>) {}

  toConfiguration(): TaskConfiguration<ServiceExecTaskOptions<SName>> {
    return {
      name: ServiceExecName,
      options: this.options,
    };
  }
}
