import { build } from 'esbuild';
await build({ entryPoints: ['monitoring-src/browser.js'], outfile: 'assets/monitoring/sentry.js',
  bundle: true, format: 'iife', platform: 'browser', target: ['es2022'], minify: true,
  legalComments: 'eof' });
