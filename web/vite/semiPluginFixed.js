import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';

const require = createRequire(import.meta.url);
const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sass = require(
  require.resolve('sass', {
    paths: [
      path.resolve(webRoot, 'node_modules/@douyinfe/vite-plugin-semi'),
      path.resolve(webRoot, 'node_modules/.pnpm/node_modules'),
      path.resolve(webRoot, 'node_modules'),
    ],
  }),
);
const { compileString, Logger } = sass;
const { semiThemeLoader } = require(
  '@douyinfe/vite-plugin-semi/lib/semi-theme-loader.js',
);

const transformPath = (filePath) =>
  os.platform() === 'win32' ? filePath.replace(/[\\]+/g, '/') : filePath;

const convertMapToString = (map) =>
  Object.keys(map).reduce(
    (prev, curr) => prev + `${curr}: ${map[curr]};\n`,
    '',
  );

const resolveTildeImport = (request, scssFilePath) => {
  const searchPaths = [
    path.dirname(scssFilePath),
    path.resolve(webRoot, 'node_modules/.pnpm/node_modules'),
    path.resolve(webRoot, 'node_modules'),
  ];

  try {
    return pathToFileURL(
      require.resolve(request, {
        paths: searchPaths,
      }),
    );
  } catch {
    return null;
  }
};

export const vitePluginSemiFixed = (options = {}) => ({
  name: 'vite-plugin-semi-fixed',
  load(id) {
    const filePath = transformPath(id);
    const includePath = options.include
      ? transformPath(options.include)
      : undefined;

    if (!/@douyinfe\/semi-(ui|icons|foundation)\/lib\/.+\.css$/.test(filePath)) {
      return null;
    }

    const scssFilePath = filePath.replace(/\.css$/, '.scss');
    const originalScssRaw = fs.readFileSync(scssFilePath, 'utf-8');
    const newScssRaw = semiThemeLoader(originalScssRaw, {
      name: typeof options.theme === 'string' ? options.theme : options.theme?.name,
      cssLayer: options.cssLayer,
      variables: convertMapToString(options.variables || {}),
      prefixCls: options.prefixCls,
      include: includePath,
    });

    return compileString(newScssRaw, {
      importers: [
        {
          findFileUrl(url) {
            if (url.startsWith('~')) {
              return resolveTildeImport(url.substring(1), scssFilePath);
            }

            const resolvedPath = path.resolve(path.dirname(scssFilePath), url);
            return fs.existsSync(resolvedPath)
              ? pathToFileURL(resolvedPath)
              : null;
          },
        },
      ],
      logger: Logger.silent,
    }).css;
  },
});

export default vitePluginSemiFixed;
