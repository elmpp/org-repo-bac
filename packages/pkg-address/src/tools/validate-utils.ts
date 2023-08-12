import path from "path";
// @ts-ignore
import stringifyDeterministic from "json-stringify-deterministic";

// const isWindows = (opts: { windows?: boolean } = {}) =>
//   process.platform === "win32" || opts.windows === true;

export const isValidPath = (
  aPath: string,
  options: { extended?: boolean; file?: boolean; windows?: boolean } = {}
) => !isInvalidPath(aPath, options)

// is-invalid-path packages - https://tinyurl.com/2arlqpm7
const isInvalidPath = (
  aPath: string,
  options: { extended?: boolean; file?: boolean; windows?: boolean } = {}
) => {
  if (aPath === "" || typeof aPath !== "string") return true;

  const validateWindows = () => {
    // https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx#maxpath
    const MAX_PATH = options.extended ? 32767 : 260;
    if (typeof aPath !== "string" || aPath.length > MAX_PATH - 12) {
      return true;
    }

    const rootPath = path.parse(aPath).root;
    if (rootPath) aPath = aPath.slice(rootPath.length);

    // https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx#Naming_Conventions
    if (options.file) {
      return /[<>:"/\\|?]/.test(aPath);
    }
    return /[<>"|?]/.test(aPath);
  }

  const validatePosix = () => {
    // https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx#maxpath
    const MAX_PATH = options.extended ? 32767 : 260;
    if (typeof aPath !== "string" || aPath.length > MAX_PATH - 12) {
      return true;
    }

    const rootPath = path.parse(aPath).root;
    if (rootPath) aPath = aPath.slice(rootPath.length);

    // https://msdn.microsoft.com/en-us/library/windows/desktop/aa365247(v=vs.85).aspx#Naming_Conventions
    if (options.file) {
      return /[<>:"\\|?]/.test(aPath);
    }
    return /[<>:"|?]/.test(aPath);
  }

  return options.windows ? validateWindows() : validatePosix()
};
