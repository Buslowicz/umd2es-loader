const __filename = new Set(new Error().stack.match(/https?:\/\/.*?\.(js|html)/g)).values().next().value;
const cache = {};
class Module {
  set exports(exports) {
    const path = getFilePath();
    cache[path] = exports;
  }
  get exports() {
    const path = getFilePath();
    if (!cache[path]) {
      cache[path] = {};
    }
    return cache[path];
  }
}
const module = new Module();

Object.defineProperty(window, 'module', { get() { return module; }});

function dirname(filePath) {
  const match = filePath.match(/^(.*\/)[^\/]/);
  return match && match[1];
}

export function getFilePath() {
  const stack = new Set(new Error().stack.match(/https?:\/\/.*?\.(js|html)/g));
  stack.delete(__filename);
  return Array.from(stack).pop();
}

export function load(filePath) {
  if (/^\w/.test(filePath)) {
    return cache[filePath];
  }

  const path = getFilePath();
  const pathIndex = path.indexOf("//") + 2;
  const protocol = path.substr(0, pathIndex);
  const dir = dirname(path).slice(pathIndex, -1).split("/");
  const filePathChunks = filePath.split("/");
  const relative = filePathChunks.reduce((p, chunk) => {
    if (chunk === "..") {
      dir.pop();
      return "";
    }
    if (chunk === ".") {
      return "";
    }
    return p + "/" + chunk;
  }, "");
  const finalPath = protocol + dir.join("/") + relative;
  return cache[finalPath];
}
