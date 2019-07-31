import {
    runDifferentContextRouteTests,
    runDifferentParametersTests
} from "./helpers/test-runner";

// test simple cases

runDifferentParametersTests(
    "Simple tests",
    {
        baseUrl: "",
        host: "example.org",
        ports: {
            http: 80,
            https: 443,
        },
        scheme: "https",
    },
    {
        host: [],
        path: [["text", "/test"]],
        schemes: [],
        variables: [],
    },
    [
        {
            params: [],
            expected: "/test",
        },
        // Reference type => ABSOLUTE_URL
        {
            params: [{}, 0],
            expected: "https://example.org/test",
        },
        // Reference type => ABSOLUTE_PATH
        {
            params: [{}, 1],
            expected: "/test",
        },
        // Reference type => NETWORK_PATH
        {
            params: [{}, 3],
            expected: "//example.org/test",
        },
        // Fragment variations
        {
            params: [{_fragment: "abc"}],
            expected: "/test#abc",
        },
        {
            params: [{_fragment: 123}],
            expected: "/test#123",
        },
        {
            params: [{_fragment: true}],
            expected: "/test#1",
        },
        {
            params: [{_fragment: false}],
            expected: "/test",
        },
        {
            params: [{_fragment: null}],
            expected: "/test",
        },
        {
            params: [{_fragment: undefined}],
            expected: "/test",
        },
    ]
);

// test fully featured
runDifferentParametersTests(
    "Fully featured test",
    {
        baseUrl: "",
        host: "example.org",
        ports: {
            http: 80,
            https: 443,
        },
        scheme: "https",
    },
    {
        host: [],
        path: [
            ["text", "/suffix"],
            ["variable", "/", ".*", "test"],
            ["text", "/prefix"],
        ],
        schemes: [],
        variables: ["test"],
    },
    [
        {
            params: [{test: 123}],
            expected: "/prefix/123/suffix",
        },
        {
            params: [{test: 123, q1: "abc", q2: 123, q3: true, q4: false, q5: null, q6: undefined}],
            expected: "/prefix/123/suffix?q1=abc&q2=123&q3=1&q4=0",
        },
    ]
);


runDifferentContextRouteTests(
    "Differences between definition and context",
    [
        // #1 base example
        {
            context: {
                baseUrl: "",
                host: "example.org",
                ports: {
                    http: 80,
                    https: 443,
                },
                scheme: "http",
            },
            route: {
                host: [],
                path: [
                    ["text", "/test"],
                ],
                schemes: [],
                variables: [],
            },
            expected: "/test",
        },
        // #2 different host
        {
            context: {
                baseUrl: "",
                host: "example.org",
                ports: {
                    http: 80,
                    https: 443,
                },
                scheme: "http",
            },
            route: {
                host: [
                    ["text", "other.example.org"],
                ],
                path: [
                    ["text", "/test"],
                ],
                schemes: [],
                variables: [],
            },
            expected: "//other.example.org/test",
        },
        // #3 different scheme (use first in list 1/2)
        {
            context: {
                baseUrl: "",
                host: "example.org",
                ports: {
                    http: 80,
                    https: 443,
                },
                scheme: "http",
            },
            route: {
                host: [],
                path: [
                    ["text", "/test"],
                ],
                schemes: ["https", "ftp"],
                variables: [],
            },
            expected: "https://example.org/test",
        },
        // #4 different scheme (use first in list 2/2)
        {
            context: {
                baseUrl: "",
                host: "example.org",
                ports: {
                    http: 80,
                    https: 443,
                },
                scheme: "http",
            },
            route: {
                host: [],
                path: [
                    ["text", "/test"],
                ],
                schemes: ["ftp", "https"],
                variables: [],
            },
            expected: "ftp://example.org/test",
        },
        // #5 different scheme + port
        {
            context: {
                baseUrl: "",
                host: "example.org",
                ports: {
                    http: 80,
                    https: 1443,
                },
                scheme: "http",
            },
            route: {
                host: [],
                path: [
                    ["text", "/test"],
                ],
                schemes: ["https"],
                variables: [],
            },
            expected: "https://example.org:1443/test",
        },
        // #5 different port
        {
            context: {
                baseUrl: "",
                host: "example.org",
                ports: {
                    http: 80,
                    https: 1443,
                },
                scheme: "https",
            },
            route: {
                host: [],
                path: [
                    ["text", "/test"],
                ],
                schemes: ["https"],
                variables: [],
            },
            expected: "//example.org:1443/test",
        },
    ],
    [],
);
