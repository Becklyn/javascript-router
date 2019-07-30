import test from "ava";
import {Router} from "../../src/index";


/**
 * Runs a suite of tests, with different params / reference type combinations.
 *
 * Will create a route named `test` with the given route config and
 * call the router with the params in the tests and match it against
 * the expected value in the params
 *
 * @param {string} description
 * @param {BecklynJavaScriptRouter.Context} context
 * @param {BecklynJavaScriptRouter.Route} routeConfig
 * @param {Array<{params: Array<*>, expected: string}>} tests
 */
export function runDifferentParametersTests (description, context, routeConfig, tests)
{
    tests.forEach((testData, index) => {
        let router = new Router();
        router.init({
            context: context,
            routes: {
                test: routeConfig
            },
        });

        test(`test '${description}', #${index + 1}`, t => {
            let params = testData.params;
            t.is(router.generate("test", ...params), testData.expected);
        });
    });
}

/**
 * Runs a suite of tests, with different context / route combinations.
 *
 * @param {string} description
 * @param {Array<{context: BecklynJavaScriptRouter.Context, route: BecklynJavaScriptRouter.Route, expected: string}>} tests
 * @param {Array<*>} params
 */
export function runDifferentContextRouteTests (description, tests, params)
{
    tests.forEach((testData, index) => {
        let router = new Router();
        router.init({
            context: testData.context,
            routes: {
                test: testData.route
            },
        });

        test(`test '${description}', #${index + 1}`, t => {
            t.is(router.generate("test", ...params), testData.expected);
        });
    });
}
