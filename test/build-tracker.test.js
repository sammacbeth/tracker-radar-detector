const assert = require('assert')
const {describe, it, before} = require('mocha')

const Tracker = require('../src/trackers/classes/tracker')
const Rule = require('../src/trackers/classes/rule')
const sharedData = require('../src/trackers/helpers/sharedData')

const commonRequestData = {
    apis: {},
    cnames: [],
    cookies: 0,
    cookiesOn: 1,
    fpAvg: 0,
    fpPerSite: [
        0
    ],
    fpStd: 0,
    host: "tracker.com",
    pages: new Set(['example.com']),
    prevalence: 0,
    responseHashes: [],
    rule: "tracker\\.com\\/collect",
    sites: 1,
    subdomains: new Set(['dummy']),
    type: "XHR",
}
const crawlSiteCount = 1

describe('Tracker', () => {

    let tracker
    let rule

    before(() => {
        // TODO - this domain summary data should be explicitly provided rather than loaded by sharedData.
        sharedData.domains['tracker.com'] = {
            prevalence: 0.01,
        }
        rule = new Rule(commonRequestData, crawlSiteCount)
        tracker = new Tracker(commonRequestData, crawlSiteCount)

        tracker.addRule(rule)
        tracker.addTypes(commonRequestData.type, commonRequestData.sites)
    })

    it('has a domain', () => {
        assert.strictEqual(tracker.domain, 'tracker.com')
    })

    it('has cookies', () => {
        assert.strictEqual(tracker.cookies, 0) // TODO: should this consider cookiesOn too?
    })

    it('has prevalence from sharedData', () => {
        assert.strictEqual(tracker.prevalence, 0.01)
    })

    it('has resources', () => {
        assert.strictEqual(tracker.resources.length, 1)
    })

    it('resource has prevalence and sites', () => {
        const resource = tracker.resources[0]
        assert.strictEqual(resource.prevalence, 1)
        assert.strictEqual(resource.sites, 1)
    })
})
