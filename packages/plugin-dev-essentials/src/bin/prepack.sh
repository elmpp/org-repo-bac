# commands resolution
jq '.oclif.commands="./dist/commands"' package.json | sponge package.json
if [ -f "collection.json" ]; then
  sed -i '' 's/.\/src\//.\/dist\//g' collection.json
fi

if [ -d "src/schematics" ]; then
  mkdir -p "dist/schematics" || true
  # cp -R "src/schematics/." "dist/schematics" # copy-files, cpy etc etc all don't copy a simple directory. Fucking shambles
  rsync -avh "src/schematics/" "dist/schematics/" # copy-files, cpy etc etc all don't copy a simple directory. Fucking shambles
fi

# schematics files
# pnpm cpy -h

# echo "copying schematic files. cwd: '${CURRENT_DIR}'. cmd: copyfiles --all "${CURRENT_DIR}/src/schematics/*" "${CURRENT_DIR}/dist/schematics""
# echo "copying schematic files. cwd: '${CURRENT_DIR}'. cmd: 'cpy 'src/schematics/*' '!src/schematics/*.ts' dist/schematics --cwd=${CURRENT_DIR}'"

# mkdir -p "dist/schematics" || true
# # cp -R "src/schematics/." "dist/schematics" # copy-files, cpy etc etc all don't copy a simple directory. Fucking shambles
# rsync -avh "src/schematics/" "dist/schematics/" # copy-files, cpy etc etc all don't copy a simple directory. Fucking shambles

# cd "${DEV_ESSENTIALS_DIR}" || exit 1
# mkdir "${CURRENT_DIR}/dist/schematics" || true
# pnpm copyfiles -u 2 --exclude "**/*.ts" --all "src/schematics/**/*" "dist/schematics"
# pnpm cpy 'src/schematics/*' '!src/schematics/*.ts' dist/schematics --cwd="${CURRENT_DIR}"