# commands resolution
jq '.oclif.commands="./dist/commands"' package.json | sponge package.json
sed -i '' 's/.\/src\//.\/dist\//g' collection.json

