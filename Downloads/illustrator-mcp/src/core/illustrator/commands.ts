illustrator-mcp
├── src
│   ├── core
│   │   ├── mcp
│   │   │   ├── context.ts
│   │   │   ├── handlers.ts
│   │   │   └── server.ts
│   │   ├── illustrator
│   │   │   ├── commands.ts
│   │   │   ├── connection.ts
│   │   │   └── types.ts 
│   │   └── utils
│   │       ├── logger.ts
│   │       └── validators.ts
│   ├── handlers
│   │   ├── document.ts
│   │   ├── layers.ts
│   │   ├── objects.ts
│   │   └── tools.ts
│   ├── prompts
│   │   └── strategies.ts
│   ├── types
│   │   ├── commands.ts
│   │   ├── config.ts
│   │   └── responses.ts
│   ├── config.ts
│   └── index.ts
├── tests
│   ├── core
│   │   └── mcp.test.ts
│   ├── handlers
│   │   └── objects.test.ts
│   └── utils
│       └── validators.test.ts
├── package.json
├── tsconfig.json
└── README.md