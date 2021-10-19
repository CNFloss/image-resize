import "@babel/polyfill";
import "isomorphic-fetch";
import dotenv from "dotenv";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import Shopify, { ApiVersion, DataType } from "@shopify/shopify-api";
import Koa from "koa";
import koaBody from "koa-body";
import next from "next";
import Router from "koa-router";
import jimp from "jimp";

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8081;
const dev = process.env.NODE_ENV !== "production";
const app = next({
  dev,
});
const handle = app.getRequestHandler();

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.October20,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {};

app.prepare().then(async () => {
  const server = new Koa();
  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];
  server.use(
    createShopifyAuth({
      async afterAuth(ctx) {
        // Access token and shop available in ctx.state.shopify
        const { shop, accessToken, scope } = ctx.state.shopify;
        const host = ctx.query.host;
        ACTIVE_SHOPIFY_SHOPS[shop] = scope;

        const response = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: "/webhooks",
          topic: "APP_UNINSTALLED",
          webhookHandler: async (topic, shop, body) =>
            delete ACTIVE_SHOPIFY_SHOPS[shop],
        });

        if (!response.success) {
          console.log(
            `Failed to register APP_UNINSTALLED webhook: ${response.result}`
          );
        }

        // Redirect to app with shop parameter upon auth
        ctx.redirect(`/?shop=${shop}&host=${host}`);
      },
    })
  );

  const handleRequest = async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };

  router.post("/webhooks", async (ctx) => {
    try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
    }
  });

  router.get("/products", verifyRequest(), async (ctx) => {
    const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    ctx.body = await client.get({
      path: "products/" + ctx.req._parsedUrl.query,
    });
    ctx.status = 200;
  });

  router.post(
    "/products",
    verifyRequest({ returnHeader: true }),
    async (ctx, next) => {
      const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);
      const client = new Shopify.Clients.Rest(
        session.shop,
        session.accessToken
      );
      const { id, url, width, height } = ctx.query;
      let src = await jimp
        .read(url)
        .then((image) => image.resize(parseInt(width), parseInt(height)))
        .then((resizedImage) => resizedImage.getBase64Async(jimp.AUTO));

      src = src.replace("data:", "").replace(/^.+,/, "");
      try {
        await client
          .post({
            path: "products/" + id + "/images",
            data: {
              image: {
                position: 1,
                attachment: src,
                filename: `${id}/d=${width}x${height}.png`,
              },
            },
            type: DataType.JSON,
          })
          .then((data) => {
            ctx.response.body = data.body;
            ctx.response.status = 200;
          });
      } catch (error) {
        console.log(error);
      }
    }
  );

  router.put("/products", async (ctx, next) => {
    const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    const { id, imageId } = ctx.query;

    try {
      console.log(ctx.query);
      await client
        .put({
          path: "products/" + id + "/images/" + imageId,
          data: {
            image: {
              id: imageId,
              position: 1,
            },
          },
          type: DataType.JSON,
        })
        .then((data) => {
          console.log("products image PUT called");
          console.log(data);
          ctx.response.body = data.body;
          ctx.response.status = 200;
        });
    } catch (error) {
      console.log(error);
    }
  });

  router.delete("/products", async (ctx, next) => {
    const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res);
    const client = new Shopify.Clients.Rest(session.shop, session.accessToken);
    const { id, imageId } = ctx.query;
    console.log("products/" + id + "/images/" + imageId);

    try {
      await client
        .delete({
          path: "products/" + id + "/images/" + imageId,
        })
        .then((data) => {
          console.log("products image DELETE called");
          console.log(data);
          ctx.response.body = ctx.request.body;
          ctx.response.status = 200;
        });
    } catch (error) {
      console.log(error);
    }
  });

  router.post(
    "/graphql",
    verifyRequest({ returnHeader: true }),
    async (ctx, next) => {
      await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
    }
  );

  router.get("(/_next/static/.*)", handleRequest); // Static content is clear
  router.get("/_next/webpack-hmr", handleRequest); // Webpack content is clear
  router.get("(.*)", async (ctx) => {
    const shop = ctx.query.shop;

    // This shop hasn't been seen yet, go through OAuth to create a session
    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
      ctx.redirect(`/auth?shop=${shop}`);
    } else {
      await handleRequest(ctx);
    }
  });

  server.use(koaBody());
  server.use(router.allowedMethods());
  server.use(router.routes());
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
