const assert = require('assert')
const {describe, it, before} = require('mocha')

const Site = require('../src/trackers/classes/site')
const crawl = require('../src/trackers/classes/crawl.js')

const mockSiteData = require('./fixtures/example.com.json')

describe('Process Crawl', () => {

    let site
    const expectedDomains = [
        "google-analytics.com",
        "tracker.com"
    ]
    
    before(async () => {
        site = new Site(mockSiteData)
        for (const request of mockSiteData.data.requests) {
            await site.processRequest(request)
            crawl.stats.requests++
        }
        crawl.processSite(site)
    })

    describe('site', () => {
        it('parses the host and etld+1', () => {
            assert.strictEqual(site.domain, 'example.com')
            assert.strictEqual(site.host, 'test.example.com')
            assert.strictEqual(site.subdomain, 'test')
        })

        it('extracts 3p domains', () => {
            assert.deepStrictEqual(Object.keys(site.uniqueDomains), expectedDomains)
        })

        it('extracts 3p entities', () => {
            assert.deepStrictEqual(site.uniqueEntities, {
                "Google LLC": {
                    "tracking": true
                },
                undefined: {
                    "tracking": true
                }
            })
        })
    })

    describe('crawl', () => {
        it('extracts domain prevalence', () => {
            assert.deepStrictEqual(crawl.domainPrevalence, {
                "google-analytics.com": 1,
                "tracker.com": 1,
            })
        })

        it('extracts domain fingerprinting', () => {
            assert.deepStrictEqual(Object.keys(crawl.domainFingerprinting), expectedDomains)
        })

        it('extracts domain cookies', () => {
            assert.deepStrictEqual(crawl.domainCookies, {
                'tracker.com': 1,
            })
        })

        it('extracts common requests', () => {
            // test some aspects of common request data
            assert.strictEqual(crawl.commonRequests['google-analytics.com/analytics.js - Script'].apis['Navigator.prototype.userAgent'], 1)
            assert.notDeepStrictEqual(crawl.commonRequests["tracker.com/collect - XHR"], {
                apis: {},
                cnames: [],
                cookies: 0, // why is this 0? This request set a cookie
                cookiesOn: 1,
                fpAvg: 0,
                fpPerSite: [0],
                fpStd: 0,
                host: "tracker.com",
                pages: new Set(['example.com']),
                prevalence: 0,
                responseHashes: [],
                rule: "tracker\\.com\\/collect",
                sites: 1,
                subdomains: new Set(['dummy']),
                type: "XHR",
            })
        })

        it('extracts domain cloaks', () => {
            assert.deepStrictEqual(crawl.domainCloaks, {})
        })
    })

})
