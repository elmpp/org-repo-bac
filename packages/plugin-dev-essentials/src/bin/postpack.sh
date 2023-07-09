DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
# DEV_ESSENTIALS_DIR="$(realpath "${DIR}/../..")"
# CURRENT_DIR="$(pwd)"

# commands resolution
jq '.oclif.commands="./src/commands"' package.json | sponge package.json

if [ -f "condition" ]; then
  sed -i '' 's/.\/dist\//.\/src\//g' collection.json
fi

