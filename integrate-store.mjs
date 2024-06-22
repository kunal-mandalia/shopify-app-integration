import "dotenv/config";
import shopifyAPI from 'shopify-node-api';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = new express.Router();

router.get("/test", (req, res) => {
    return res.status(200).json({ message: "ok" });
})

router.get("/auth", (req, res) => {
    const clientShop = process.env.CLIENT_STORE_DOMAIN; // todo: dynamic MYSHOP.myshopify.com
    const Shopify = new shopifyAPI({
        shop: clientShop,
        shopify_api_key: process.env.SHOPIFY_API_KEY, // Your API key
        shopify_shared_secret: process.env.SHOPIFY_API_SECRET, // Your Shared Secret
        shopify_scope: 'read_customers',
        redirect_uri: process.env.SHOPIFY_REDIRECT_URI,
        nonce: uuidv4() // you must provide a randomly selected value unique for each authorization request
      });
    const authURL = Shopify.buildAuthURL();
    return res.status(200).json({
        authURL
    })
})

router.get("/finish_auth", (req, res) => {
    // todo: verify hmac?
    const query_params = req.query;
    const { hmac, host, shop, state, timestamp, code } = query_params;

    const Shopify = new shopifyAPI({
        shop,
        shopify_api_key: process.env.SHOPIFY_API_KEY,
        shopify_shared_secret: process.env.SHOPIFY_API_SECRET,
        shopify_scope: 'read_customers',
        redirect_uri: process.env.SHOPIFY_REDIRECT_URI,
        nonce: state,
      });

    Shopify.exchange_temporary_token(query_params, function(err, data){
        // This will return successful if the request was authentic from Shopify
        // Otherwise err will be non-null.
        // The module will automatically update your config with the new access token
        // It is also available here as data['access_token']

        console.info({ err, data });
        // todo: persist store, access token
        // redirect to "integration successful" page
        return res.status(200).json({ err, data });
    });
})

export { router };
