import fs from 'fs/promises';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import expressSitemapXml from 'express-sitemap-xml';
import promMid from 'express-prometheus-middleware';
import { generateURLs } from './src/utils.js';
import api from './src/api/index.js';
import { download } from './src/download.js';
import { getMetaData } from './src/meta.js';
import { metaToString } from './src/utils.js';
import { PORT as port, BASE as base } from './src/config.js';

dotenv.config();

// Constants
const isProduction = process.env.NODE_ENV === 'production';

(async () => {
  // Cached production assets
  const templateHtml = isProduction
    ? await fs.readFile('./dist/client/index.html', 'utf-8')
    : '';
  const ssrManifest = isProduction
    ? await fs.readFile('./dist/client/ssr-manifest.json', 'utf-8')
    : undefined;
    
  const app: express.Application = express();

  app.use(cors());
  app.use('/api', api);
  
  app.use(expressSitemapXml(generateURLs, 'https://www.globalfootballrankings.com'));
  app.use(promMid({
    metricsPath: '/metrics',
    collectDefaultMetrics: true,
    requestDurationBuckets: [0.1, 0.5, 1, 1.5],
    requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
    responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
  }));

  app.use(express.static('./public'));

  // Add Vite or respective production middlewares
  let vite: any;
  if (!isProduction) {
    const { createServer } = await import('vite')
    vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
      base
    })
    app.use(vite.middlewares)
  } else {
    const compression = (await import('compression')).default;
    const sirv = (await import('sirv')).default;
    app.use(compression())
    app.use(base, sirv('./dist/client', { extensions: [] }))
  }

  // Serve HTML
  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl.replace(base, '')

      let template
      let render
      if (!isProduction) {
        // Always read fresh template in development
        template = await fs.readFile('../index.html', 'utf-8')
        template = await vite.transformIndexHtml(url, template)
        render = (await vite.ssrLoadModule('../src/entry-server.ts')).render
      } else {
        template = templateHtml;
        const entryPath = './public/entry-server.js';
        render = (await import(entryPath)).render
      }

      const rendered = await render(url, ssrManifest)
      const metaData = getMetaData(req);

      const html = template
        .replace(`<!--app-head-->`, metaToString(metaData))
        .replace(`<!--app-html-->`, rendered.html ?? '')

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e: any) {
      vite?.ssrFixStacktrace(e)
      console.log(e.stack)
      res.status(500).end(e.stack)
    }
  })

  // Start http server
  app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`)
  })
})();

(function interval() {
  download();
  setTimeout(interval, 3600000);
})();