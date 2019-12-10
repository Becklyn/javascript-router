import test from "ava";
import {Router} from "../src/index";


test("Test that parameters are not modified", t => {
    let params = {
        a: 1,
        b: 2,
        test: 123,
    };

    let router = new Router();
    router.init({
        context: {
            baseUrl: "",
            host: "example.org",
            ports: {
                http: 80,
                https: 443,
            },
            scheme: "https",
        },
        routes: {
            test: {
                host: [],
                path: [
                    ["variable", "/", ".*", "test"],
                    ["text", "/suffix"],
                ],
                schemes: [],
                variables: ["test"],
            }
        }
    });

    let url = router.generate("test", params);
    t.is(url, "/suffix/123?a=1&b=2");
    t.is(params.a, 1);
    t.is(params.b, 2);
    t.is(params.test, 123);
});
