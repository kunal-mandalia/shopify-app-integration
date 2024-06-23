# shopify-app-integration

## Concepts
- [x] Allow shopify customers to grant access to their store with limited permissions
- [x] Use credentials (access token) to request customer list
- [ ] Distribution options: pros/cons
    - [ ] Public App
        - [ ] Listed
        - [ ] Unlisted
    - [ ] Custom App
    - [ ] Company App

## Todo
- [ ] UI to integrate store, success message
- [ ] Direct install from Shopify
- [ ] Verify access token lifetime (> 24h, 48h)
- [ ] Uninstall app (token revoked)
- [ ] Reinstall app (token reinstated)

## App Distribution options

* Public (Multi-company)
    * Listed
        - summary: not a good fit as unknown companies / non-clients can integrate
    * Unlisted:
        - pros: best user experience (single click integrate)
        - cons: high bar to get app approved, see https://shopify.dev/docs/apps/launch/app-requirements-checklist
            - and ongoing compliance needs
        - summary: long-term solution
* Custom (Single company):
    - pros: no compliance / shopify approval needed
    - cons: each customer needs separate app - we need to know shopify store url
    - summary: short / mediym term solution
* Company (Single company):
    - summary: client needs to create app / share token, too much friction


## Recommendation
* Short / medium term: custom app (one per company integration)
    - flow:
        - user provides their shopify store url
        - we create custom app (15mins)
        - user sent a link to integrate with our app
        - user asked to approve integration with permissions
        - user taken back to app
        - we can use user's token to make requests e.g. customer list
    - once pattern is known / integration pattern is solid, create unlisted app (below)
*  Long term: unlisted app
    - flow:
        - user clicks button to integrate with our app
        - user asked to approve integration with permissions
        - user taken back to app
        - we can use user's token to make requests e.g. customer list
