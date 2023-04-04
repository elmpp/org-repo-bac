import {
  empty,
  mergeWith,
  Rule,
  SchematicContext,
  TaskConfigurationGenerator,
  TaskId,
  Tree,
} from "@angular-devkit/schematics";

export function wrapTaskAsRule(
    task: TaskConfigurationGenerator<object>,
    dependencies?: TaskId[] | undefined
  ) {
    return (_tree: Tree, context: SchematicContext): Rule => {
      const emptySource = empty();
      context.addTask(task);
      return mergeWith(emptySource);
    };
  }
