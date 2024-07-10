import "dotenv/config";
import express from "express";
import { createAdminApiClient } from '@shopify/admin-api-client';
import { router as storeRoute } from './integrate-store.mjs';

const app = new express();
const port = process.env.PORT || 8888;

app.use(express.json());

function getClient() {
    const client = createAdminApiClient({
        apiVersion: '2024-07',
        storeDomain: process.env.CLIENT_STORE_DOMAIN,
        accessToken: process.env.CLIENT_ACCESS_TOKEN,
    });
    return client;
}


async function subscribeToBulkOperationWebhook(callbackUrl) {
    const operation = `
        mutation {
            webhookSubscriptionCreate(
                topic: BULK_OPERATIONS_FINISH
                webhookSubscription: {
                format: JSON,
                callbackUrl: "${callbackUrl}"}
            ) {
                userErrors {
                    field
                    message
                }
                webhookSubscription {
                    id
                }
            }
        }
    `
    const client = getClient();
    const res = await client.request(operation);
    return res;
}


async function getCustomerList() {
    const operation = `
    {
        customers(first: 250) {
            nodes {
                id
                firstName
                lastName
            }
            pageInfo{
                startCursor
                endCursor
            }
        }  
    }
`;
    const client = getClient();
    const res = await client.request(operation);
    console.log(res);
}

async function getAllCustomers() {
    const operation = `
        mutation {
            bulkOperationRunQuery(
            query: """
            {
            customers {
                edges {
                    node {
                            id
                            firstName
                            lastName
                            email
                            defaultAddress {
                            address1
                            address2
                            countryCodeV2
                            country
                            phone
                            }
                            phone
                            amountSpent {
                                amount
                            }
                            numberOfOrders
                        }
                    }
                }
            }
            """
            ) {
                bulkOperation {
                id
                status
                }
                userErrors {
                field
                message
                }
            }
        }
    `
    const client = getClient();
    const res = await client.request(operation);
    return res;
}

app.get("/", (_, res) => {
    return res.status(200).send("OK");
})

app.get("/foo", (req, res) => {
    return res.status(200).json({ bar: "baz" });
})

app.get("/customers", async (_, res) => {
    const data = await getAllCustomers();
    return res.status(200).json({
        data
    })
})

async function getBulkFileUrl(id) {
    const operation = `
        query {
            node(id: "${id}") {
                ... on BulkOperation {
                url
                partialDataUrl
                }
            }
        }
    `;
    const client = getClient();
    const res = await client.request(operation);
    console.log(res);
    return res;
}

app.post("/webhook", (req, res) => {
    console.log("webhook hit");
    console.log(req.body);
    const { admin_graphql_api_id } = req.body;
    getBulkFileUrl(admin_graphql_api_id);
    return res.status(200).send();
})

app.post("/setup-webhook", async (_, res) => {
    const webhookUrl = process.env.SHOPIFY_WEBHOOK_URL;
    const data = await subscribeToBulkOperationWebhook(webhookUrl);
    return res.status(200).json({ data });
})

app.use('/api', storeRoute);

app.listen(port, () => {
    console.info(`[shopify-app-integration]: listening on port ${port}`);
})

