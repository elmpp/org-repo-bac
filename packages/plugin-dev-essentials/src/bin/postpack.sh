# commands resolution
jq '.oclif.commands="./src/commands"' package.json | sponge package.json
sed -i '' 's/.\/dist\//.\/src\//g' collection.json

# schematics files
pnpm cpy 'src/schematics/' '!src/schematics/*.ts' dist/schematics
