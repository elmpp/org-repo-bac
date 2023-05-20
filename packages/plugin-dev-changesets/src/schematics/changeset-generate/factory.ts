import { strings } from "@angular-devkit/core";
import {
  apply,
  chain,
  mergeWith,
  move,
  Rule,
  template,
  url
} from "@angular-devkit/schematics";
import { schematicUtils } from "@business-as-code/core";
import fs from "fs";
import path from "path";
import { Schema } from "./schema";

function getRandomInt(max: number, min: number = 0) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function (options: Schema): Rule {
  return (tree, schematicContext) => {
    const changesetsFolder = ".changeset";
    const changesetsPath = path.join(
      schematicUtils.getHostRoot(schematicContext).original,
      changesetsFolder
    );
    const changesetFilename = `changeset-${getRandomInt(99999)}.md`;

    if (!fs.existsSync(changesetsPath)) {
      throw new Error(
        `@business-as-code/plugin-dev-changesets#namespace=changeset-generate: can only be performed on a changeset workspace (missing '${changesetsPath}'). Perhaps you need to run 'changeset init'?`
      );
    }

    const templateSource = apply(url("./files"), [
      template({
        ...options,
        dot: ".",
        dasherize: strings.dasherize,
      }),
      move(changesetsFolder),
      move(
        `${changesetsFolder}/changeset.md`,
        `${changesetsFolder}/${changesetFilename}`
      ),
    ]);

    // console.log(`schematicTestUtils.getFiles(tree) :>> `, schematicTestUtils.getFiles(tree))

    return chain([mergeWith(templateSource)]);
  };
}
